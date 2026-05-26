(ns zhaoyul.exam-system-backend.domain.personal
  "个人中心 — 个人报名/成绩查询/证书查询/准考证"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->registration [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :planName (:plan_name row)
               :planNo (:plan_no row)
               :candidateId (:candidate_id row)
               :candidateName (:candidate_name row)
               :idCard (:id_card row)
               :phone (:phone row)
               :occupation (:occupation row)
               :level (:level row)
               :education (:education row)
               :workYears (:work_years row)
               :regOrgId (:reg_org_id row)
               :examRoomId (:exam_room_id row)
               :seatNo (:seat_no row)
               :admissionTicketNo (:admission_ticket_no row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :plan_name :plan_no :candidate_id :candidate_name :id_card :work_years
                :reg_org_id :exam_room_id :seat_no :admission_ticket_no :created_at :updated_at))))

(defn- row->certificate [row]
  (when row
    (-> row
        (assoc :certNo (:cert_no row)
               :candidateName (:candidate_name row)
               :idCard (:id_card row)
               :planId (:plan_id row)
               :issueDate (:issue_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :cert_no :candidate_name :id_card :plan_id :issue_date :created_at :updated_at))))

(defn- row->score [row]
  (when row
    {:id (:id row)
     :planId (:plan_id row)
     :planName (:plan_name row)
     :candidateId (:candidate_id row)
     :candidateName (:candidate_name row)
     :idCard (:id_card row)
     :occupation (:occupation row)
     :level (:level row)
     :theoryScore (:theory_score row)
     :skillScore (:skill_score row)
     :totalScore (:total_score row)
     :status (:status row)
     :createdAt (:created_at row)
     :updatedAt (:updated_at row)}))

(defn- row->ticket [row]
  (when row
    {:id (:id row)
     :planId (:plan_id row)
     :planName (:plan_name row)
     :candidateId (:candidate_id row)
     :candidateName (:candidate_name row)
     :idCard (:id_card row)
     :occupation (:occupation row)
     :level (:level row)
     :admissionTicketNo (:admission_ticket_no row)
     :seatNo (:seat_no row)
     :examRoom (:exam_room row)
     :examAddress (:exam_address row)
     :examAt (:exam_at row)
     :status (:status row)
     :createdAt (:created_at row)
     :updatedAt (:updated_at row)}))

(defn- query-param [params key]
  (or (get params key) (get params (keyword key))))

(defn- write-audit! [ds action resource resource-id payload]
  (try
    (db/execute! ds
                 ["INSERT INTO audit_log (id, action, resource, resource_id, payload)
                   VALUES (?, ?, ?, ?, ?)"
                  (db/uuid) action resource resource-id (db/json-str payload)])
    (catch Exception _ nil)))

;; ─── 个人报名 ───

(defn list-registrations [ds params]
  (let [q (some-> (query-param params "q") str/trim)
        id-card (some-> (or (query-param params "idCard") (query-param params "id-card")) str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(ca.name LIKE ? OR ca.id_card LIKE ? OR p.name LIKE ?)")
                  (seq id-card) (conj "ca.id_card = ?"))
        args (cond-> []
               (seq q) (into (repeat 3 (str "%" q "%")))
               (seq id-card) (conj id-card))
        sql (str "SELECT r.*, p.name AS plan_name, p.code AS plan_no,"
                 " ca.name AS candidate_name, ca.id_card, ca.phone, ca.occupation, ca.level, ca.education, ca.work_years"
                 " FROM cgn_candidate_reg r"
                 " INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id"
                 " LEFT JOIN cgn_recog_plan p ON p.id = r.plan_id"
                 " WHERE " (str/join " AND " filters)
                 " ORDER BY r.created_at DESC")]
    {:items (mapv row->registration (db/query ds (into [sql] args)))}))

(defn get-registration [ds id]
  (row->registration
   (db/execute-one! ds
                    ["SELECT r.*, p.name AS plan_name, p.code AS plan_no,
                             ca.name AS candidate_name, ca.id_card, ca.phone, ca.occupation, ca.level, ca.education, ca.work_years
                        FROM cgn_candidate_reg r
                        INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id
                        LEFT JOIN cgn_recog_plan p ON p.id = r.plan_id
                       WHERE r.id = ?" id])))

(defn- resolve-plan-id [ds body]
  (or (:planId body)
      (:plan-id body)
      (when-let [plan-name (:plan body)]
        (:id (db/execute-one! ds ["SELECT id FROM cgn_recog_plan WHERE name = ? OR code = ? ORDER BY created_at DESC LIMIT 1"
                                  plan-name plan-name])))
      (:id (db/execute-one! ds ["SELECT id FROM cgn_recog_plan ORDER BY created_at DESC LIMIT 1"]))))

(defn create-registration! [ds body]
  (let [plan-id (resolve-plan-id ds body)
        id-card (or (:idCard body) (:id-card body) (:id_card body))
        existing-candidate (when (seq id-card)
                             (db/execute-one! ds ["SELECT id FROM cgn_candidate WHERE id_card = ? LIMIT 1" id-card]))
        candidate-id (or (:id existing-candidate) (db/uuid))
        reg-id (db/uuid)
        candidate-name (or (:name body) (:candidateName body))
        occupation (or (:occupation body) (:profession body))
        level (:level body)
        org-name (or (:org body) (:orgName body) "")
        phone (or (:phone body) "")
        education (or (:edu body) (:education body) "")
        work-years (try
                     (Integer/parseInt (str (or (:workYears body) (:work-years body) 0)))
                     (catch Exception _ 0))]
    (when-not plan-id
      (throw (ex-info "No recognition plan available for registration" {:type :validation})))
    (if existing-candidate
      (db/execute! ds ["UPDATE cgn_candidate
                        SET name = ?, phone = ?, org_name = ?, occupation = ?, profession = ?, level = ?,
                            education = ?, work_years = ?, candidate_type = 'self', updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?"
                       candidate-name phone org-name occupation occupation level education work-years candidate-id])
      (db/execute! ds ["INSERT INTO cgn_candidate
                        (id, org_id, code, name, id_card, phone, org_name, occupation, profession, level, education, work_years, candidate_type, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'self', 'pending')"
                       candidate-id "" (str "SELF-" (subs candidate-id 0 8)) candidate-name id-card phone org-name
                       occupation occupation level education work-years]))
    (if-let [existing-reg (db/execute-one! ds ["SELECT id FROM cgn_candidate_reg WHERE plan_id = ? AND candidate_id = ? LIMIT 1"
                                               plan-id candidate-id])]
      (do
        (write-audit! ds "personal-register-repeat" "cgn_candidate_reg" (:id existing-reg)
                      {:planId plan-id :candidateId candidate-id :candidateName candidate-name})
        (get-registration ds (:id existing-reg)))
      (do
        (db/execute! ds ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, status)
                          VALUES (?, ?, ?, ?, ?, 'submitted')"
                         reg-id "" (str "REG-" (subs reg-id 0 8)) plan-id candidate-id])
        (write-audit! ds "personal-register-submit" "cgn_candidate_reg" reg-id
                      {:planId plan-id :candidateId candidate-id :candidateName candidate-name})
        (get-registration ds reg-id)))))

(defn update-registration! [ds id body]
  (when-let [current (get-registration ds id)]
    (let [candidate-id (:candidateId current)]
      (db/execute! ds ["UPDATE cgn_candidate
                        SET phone = ?, org_name = ?, occupation = ?, profession = ?, level = ?,
                            education = ?, work_years = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?"
                       (or (:phone body) (:phone current))
                       (or (:org body) (:orgName body) (:org_name body) "")
                       (or (:occupation body) (:occupation current))
                       (or (:occupation body) (:profession body) (:occupation current))
                       (or (:level body) (:level current))
                       (or (:edu body) (:education body) (:education current))
                       (or (:workYears body) (:work-years body) (:workYears current) 0)
                       candidate-id])
      (write-audit! ds "personal-register-update" "cgn_candidate_reg" id {:candidateId candidate-id})
      (get-registration ds id))))

(defn delete-registration! [ds id]
  (when (get-registration ds id)
    (db/execute! ds ["UPDATE cgn_candidate_reg SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?" id])
    (write-audit! ds "personal-register-cancel" "cgn_candidate_reg" id {})
    true))

;; ─── 成绩查询 ───

(defn list-scores [ds params]
  (let [q (some-> (query-param params "q") str/trim)
        id-card (some-> (or (query-param params "idCard") (query-param params "id-card")) str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(s.candidate_name LIKE ? OR ca.id_card LIKE ? OR p.name LIKE ?)")
                  (seq id-card) (conj "ca.id_card = ?"))
        args (cond-> []
               (seq q) (into (repeat 3 (str "%" q "%")))
               (seq id-card) (conj id-card))
        sql (str "SELECT s.*, p.name AS plan_name, ca.id_card, ca.occupation, ca.level"
                 " FROM cgn_score s"
                 " LEFT JOIN cgn_candidate ca ON ca.id = s.candidate_id"
                 " LEFT JOIN cgn_recog_plan p ON p.id = s.plan_id"
                 " WHERE " (str/join " AND " filters)
                 " ORDER BY s.updated_at DESC")]
    {:items (mapv row->score (db/query ds (into [sql] args)))}))

(defn get-score [ds id]
  (row->score
   (db/execute-one! ds
                    ["SELECT s.*, p.name AS plan_name, ca.id_card, ca.occupation, ca.level
                        FROM cgn_score s
                        LEFT JOIN cgn_candidate ca ON ca.id = s.candidate_id
                        LEFT JOIN cgn_recog_plan p ON p.id = s.plan_id
                       WHERE s.id = ?" id])))

;; ─── 证书查询 (cgn_certificate 表, 只读) ───

(defn list-certificates [ds params]
  (let [q (some-> (query-param params "q") str/trim)
        cert-no (or (query-param params "certNo") (query-param params "cert-no"))
        candidate-name (or (query-param params "candidateName") (query-param params "candidate-name"))
        id-card (or (query-param params "idCard") (query-param params "id-card"))
        status (query-param params "status")
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(cert_no LIKE ? OR candidate_name LIKE ? OR id_card LIKE ?)")
                  (seq cert-no) (conj "cert_no = ?")
                  (seq candidate-name) (conj "candidate_name LIKE ?")
                  (seq id-card) (conj "id_card = ?")
                  (seq status) (conj "status = ?"))
        args (cond-> []
               (seq q) (into (repeat 3 (str "%" q "%")))
               (seq cert-no) (conj cert-no)
               (seq candidate-name) (conj (str "%" candidate-name "%"))
               (seq id-card) (conj id-card)
               (seq status) (conj status))
        sql (str "SELECT * FROM cgn_certificate WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->certificate (db/query ds (into [sql] args)))}))

(defn get-certificate [ds id]
  (row->certificate (db/execute-one! ds ["SELECT * FROM cgn_certificate WHERE id = ?" id])))

;; ─── 准考证 ───

(defn list-tickets [ds params]
  (let [q (some-> (query-param params "q") str/trim)
        id-card (some-> (or (query-param params "idCard") (query-param params "id-card")) str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(ca.name LIKE ? OR ca.id_card LIKE ? OR r.admission_ticket_no LIKE ? OR p.name LIKE ?)")
                  (seq id-card) (conj "ca.id_card = ?"))
        args (cond-> []
               (seq q) (into (repeat 4 (str "%" q "%")))
               (seq id-card) (conj id-card))
        sql (str "SELECT r.*, p.name AS plan_name, ca.name AS candidate_name, ca.id_card, ca.occupation, ca.level,"
                 " er.name AS exam_room, er.address AS exam_address, s.start_at AS exam_at"
                 " FROM cgn_candidate_reg r"
                 " INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id"
                 " LEFT JOIN cgn_recog_plan p ON p.id = r.plan_id"
                 " LEFT JOIN cgn_exam_room er ON er.id = r.exam_room_id"
                 " LEFT JOIN cgn_exam_session s ON s.plan_id = r.plan_id AND s.exam_room_id = r.exam_room_id"
                 " WHERE " (str/join " AND " filters)
                 " ORDER BY r.updated_at DESC")]
    {:items (mapv row->ticket (db/query ds (into [sql] args)))}))

(defn get-ticket [ds id]
  (row->ticket
   (db/execute-one! ds
                    ["SELECT r.*, p.name AS plan_name, ca.name AS candidate_name, ca.id_card, ca.occupation, ca.level,
                             er.name AS exam_room, er.address AS exam_address, s.start_at AS exam_at
                        FROM cgn_candidate_reg r
                        INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id
                        LEFT JOIN cgn_recog_plan p ON p.id = r.plan_id
                        LEFT JOIN cgn_exam_room er ON er.id = r.exam_room_id
                        LEFT JOIN cgn_exam_session s ON s.plan_id = r.plan_id AND s.exam_room_id = r.exam_room_id
                       WHERE r.id = ?" id])))
