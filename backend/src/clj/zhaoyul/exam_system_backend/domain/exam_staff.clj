(ns zhaoyul.exam-system-backend.domain.exam-staff
  "考务/监考/考评统一人员管理 — 共用 cgn_exam_staff 表
   staff_type: exam_staff | proctor | evaluator"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->staff [row]
  (when row
    (-> row
        (assoc :loginName (:login_name row)
               :idCard (:id_card row)
               :staffType (:staff_type row)
               :unitName (:unit_name row)
               :photoUrl (:photo_url row)
               :evalOccupations (:eval_occupations row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :login_name :id_card :staff_type :unit_name :photo_url :eval_occupations :created_at :updated_at))))

;; ─── ID card parsing ───

(defn parse-id-card
  "Parse a Chinese 18-digit ID card and return {:gender :birthDate}. Returns nil if invalid."
  [id-card]
  (when (and id-card (re-matches #"\d{17}[\dXx]" (str id-card)))
    (let [birth-str (subs id-card 6 14)
          birth-date (str (subs birth-str 0 4) "-" (subs birth-str 4 6) "-" (subs birth-str 6 8))
          gender-code (Integer/parseInt (subs id-card 16 17))]
      {:gender (if (even? gender-code) "女" "男")
       :birthDate birth-date})))

;; ─── CRUD ───

(defn list-staff [ds params]
  (let [q (some-> (or (:q params) (get params "q")) str str/trim)
        staff-type (some-> (or (:staff-type params) (:staffType params)
                              (get params "staff-type") (get params "staffType")) str/trim)
        status (some-> (or (:status params) (get params "status")) str/trim)
        org-id (some-> (or (:org-id params) (:orgId params)
                            (get params "org-id") (get params "orgId")) str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR login_name LIKE ? OR id_card LIKE ? OR phone LIKE ?)")
                  (seq staff-type) (conj "staff_type = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq staff-type) (conj staff-type)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_exam_staff WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->staff (db/query ds (into [sql] args)))}))

(defn get-staff [ds id]
  (row->staff (db/execute-one! ds ["SELECT * FROM cgn_exam_staff WHERE id = ?" id])))

(defn create-staff! [ds body]
  (let [id (or (:id body) (db/uuid))
        id-card (:idCard body)
        parsed (parse-id-card id-card)
        login-name (or (:loginName body) id-card)
        gender (or (:gender body) (:gender parsed))
        password-hint (when id-card (subs id-card (max 0 (- (count id-card) 6))))
        name (or (:name body) "未命名")
        staff-type (or (:staffType body) "exam_staff")
        status (or (:status body) "active")
        org-id (or (:orgId body) (:org_id body) "")]
    (db/execute-one!
     ds
     ["INSERT INTO cgn_exam_staff (id, org_id, code, name, login_name, phone, gender, staff_type, unit_name, id_card, photo_url, position, eval_occupations, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      id org-id (or (:code body) "") name login-name
      (:phone body) gender staff-type (:unitName body)
      id-card (:photoUrl body) (:position body) (:evalOccupations body) status])
    (get-staff ds id)))

(defn update-staff! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_exam_staff WHERE id = ?" id])]
    (when current
      (let [id-card (or (:idCard body) (:id_card current))
            parsed (parse-id-card id-card)]
        (db/execute!
         ds
         ["UPDATE cgn_exam_staff
           SET code = ?, name = ?, login_name = ?, phone = ?, gender = ?,
               staff_type = ?, unit_name = ?, id_card = ?, photo_url = ?, position = ?,
               eval_occupations = ?, status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?"
          (or (:code body) (:code current))
          (or (:name body) (:name current))
          (or (:loginName body) (:login_name current))
          (or (:phone body) (:phone current))
          (or (:gender body) (:gender parsed) (:gender current))
          (or (:staffType body) (:staff_type current))
          (or (:unitName body) (:unit_name current))
          id-card
          (or (:photoUrl body) (:photo_url current))
          (or (:position body) (:position current))
          (or (:evalOccupations body) (:eval_occupations current))
          (or (:status body) (:status current))
          id])
        (get-staff ds id)))))

(defn delete-staff! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_exam_staff WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_exam_staff WHERE id = ?" id])
    true))

;; ─── Password management ───

(defn get-password-hint [ds id]
  "Returns the last 6 digits of the staff's ID card as password hint."
  (when-let [staff (db/execute-one! ds ["SELECT id_card FROM cgn_exam_staff WHERE id = ?" id])]
    (let [id-card (:id_card staff)]
      {:id id
       :passwordHint (when id-card (subs id-card (max 0 (- (count id-card) 6))))
       :idCard id-card})))
