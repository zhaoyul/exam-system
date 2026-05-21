(ns zhaoyul.exam-system-backend.domain.personal
  "个人中心 — 个人报名/成绩查询/证书查询/准考证"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

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

;; ─── 个人报名 (resource_item: personal-registrations) ───

(def list-registrations
  (fn [ds params]
    (resources/list-items ds "personal-registrations" params)))

(def get-registration
  (fn [ds id]
    (resources/get-item ds "personal-registrations" id)))

(def create-registration!
  (fn [ds body]
    (resources/create-item! ds "personal-registrations" body)))

(def update-registration!
  (fn [ds id body]
    (resources/update-item! ds "personal-registrations" id body)))

(def delete-registration!
  (fn [ds id]
    (resources/delete-item! ds "personal-registrations" id)))

;; ─── 成绩查询 (resource_item: personal-scores, 只读) ───

(def list-scores
  (fn [ds params]
    (resources/list-items ds "personal-scores" params)))

(def get-score
  (fn [ds id]
    (resources/get-item ds "personal-scores" id)))

;; ─── 证书查询 (cgn_certificate 表, 只读) ───

(defn list-certificates [ds {:keys [q cert-no candidate-name id-card status]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(cert_no LIKE ? OR candidate_name LIKE ?)")
                  (seq cert-no) (conj "cert_no = ?")
                  (seq candidate-name) (conj "candidate_name LIKE ?")
                  (seq id-card) (conj "id_card = ?")
                  (seq status) (conj "status = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq cert-no) (conj cert-no)
               (seq candidate-name) (conj (str "%" candidate-name "%"))
               (seq id-card) (conj id-card)
               (seq status) (conj status))
        sql (str "SELECT * FROM cgn_certificate WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->certificate (db/query ds (into [sql] args)))}))

(defn get-certificate [ds id]
  (row->certificate (db/execute-one! ds ["SELECT * FROM cgn_certificate WHERE id = ?" id])))

;; ─── 准考证 (resource_item: admission-tickets, 只读) ───

(def list-tickets
  (fn [ds params]
    (resources/list-items ds "admission-tickets" params)))

(def get-ticket
  (fn [ds id]
    (resources/get-item ds "admission-tickets" id)))
