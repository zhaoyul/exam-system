(ns zhaoyul.exam-system-backend.domain.candidates
  "考生管理 — 考生档案/报名记录"
  (:require
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->candidate [row]
  (when row
    (-> row
        (assoc :idCard (:id_card row)
               :orgName (:org_name row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :id_card :org_name :created_at :updated_at))))

(defn- row->registration [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :candidateId (:candidate_id row)
               :regOrgId (:reg_org_id row)
               :examRoomId (:exam_room_id row)
               :seatNo (:seat_no row)
               :admissionTicketNo (:admission_ticket_no row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :candidate_id :reg_org_id :exam_room_id :seat_no :admission_ticket_no :created_at :updated_at))))

;; ─── 考生档案 ───

(defn list-candidates [ds {:keys [q id-card gender occupation level status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR phone LIKE ? OR id_card LIKE ?)")
                  (seq id-card) (conj "id_card = ?")
                  (seq gender) (conj "gender = ?")
                  (seq occupation) (conj "occupation = ?")
                  (seq level) (conj "level = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq id-card) (conj id-card)
               (seq gender) (conj gender)
               (seq occupation) (conj occupation)
               (seq level) (conj level)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_candidate WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->candidate (db/query ds (into [sql] args)))}))

(defn get-candidate [ds id]
  (row->candidate (db/execute-one! ds ["SELECT * FROM cgn_candidate WHERE id = ?" id])))

(defn create-candidate! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, gender, phone, org_name, occupation, level, education, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:idCard body) (:gender body) (:phone body)
       (:orgName body) (:occupation body) (:level body)
       (:education body) (or (:status body) "active")])
    (get-candidate ds id)))

(defn update-candidate! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_candidate WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_candidate
          SET code = ?, name = ?, id_card = ?, gender = ?, phone = ?, org_name = ?,
              occupation = ?, level = ?, education = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:idCard body) (:id_card current))
         (or (:gender body) (:gender current))
         (or (:phone body) (:phone current))
         (or (:orgName body) (:org_name current))
         (or (:occupation body) (:occupation current))
         (or (:level body) (:level current))
         (or (:education body) (:education current))
         (or (:status body) (:status current))
         id])
      (get-candidate ds id))))

(defn delete-candidate! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_candidate WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_candidate WHERE id = ?" id])
    true))

;; ─── 报名记录 ───

(defn list-registrations [ds {:keys [q plan-id candidate-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(code LIKE ?)")
                  (seq plan-id) (conj "plan_id = ?")
                  (seq candidate-id) (conj "candidate_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq plan-id) (conj plan-id)
               (seq candidate-id) (conj candidate-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_candidate_reg WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->registration (db/query ds (into [sql] args)))}))

(defn get-registration [ds id]
  (row->registration (db/execute-one! ds ["SELECT * FROM cgn_candidate_reg WHERE id = ?" id])))

(defn create-registration! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, reg_org_id, exam_room_id, seat_no, admission_ticket_no, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:planId body)
       (:candidateId body) (:regOrgId body) (:examRoomId body)
       (:seatNo body) (:admissionTicketNo body) (or (:status body) "submitted")])
    (get-registration ds id)))

(defn update-registration! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_candidate_reg WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_candidate_reg
          SET code = ?, plan_id = ?, candidate_id = ?, reg_org_id = ?, exam_room_id = ?,
              seat_no = ?, admission_ticket_no = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:planId body) (:plan_id current))
         (or (:candidateId body) (:candidate_id current))
         (or (:regOrgId body) (:reg_org_id current))
         (or (:examRoomId body) (:exam_room_id current))
         (or (:seatNo body) (:seat_no current))
         (or (:admissionTicketNo body) (:admission_ticket_no current))
         (or (:status body) (:status current))
         id])
      (get-registration ds id))))

(defn delete-registration! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_candidate_reg WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_candidate_reg WHERE id = ?" id])
    true))
