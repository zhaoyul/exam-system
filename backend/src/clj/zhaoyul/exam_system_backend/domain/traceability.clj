(ns zhaoyul.exam-system-backend.domain.traceability
  "溯源中心 — 溯源案例/溯源预警"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->warning [row]
  (when row
    (-> row
        (assoc :traceNo (:trace_no row)
               :candidateName (:candidate_name row)
               :orgName (:org_name row)
               :planId (:plan_id row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :trace_no :candidate_name :org_name :plan_id :created_at :updated_at))))

;; ─── 溯源案例 (复用 resources 域，resource = trace-cases) ───

(def list-cases
  "列出溯源案例 — 委托给 resources/list-items"
  (fn [ds params]
    (resources/list-items ds "trace-cases" params)))

(def get-case
  "获取单个溯源案例"
  (fn [ds id]
    (resources/get-item ds "trace-cases" id)))

(def create-case!
  "创建溯源案例"
  (fn [ds body]
    (resources/create-item! ds "trace-cases" body)))

(def update-case!
  "更新溯源案例"
  (fn [ds id body]
    (resources/update-item! ds "trace-cases" id body)))

(def delete-case!
  "删除溯源案例"
  (fn [ds id]
    (resources/delete-item! ds "trace-cases" id)))

;; ─── 溯源预警 (使用 cgn_warning_record 表) ───

(defn list-alerts [ds {:keys [q candidate-name status level org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(trace_no LIKE ? OR candidate_name LIKE ?)")
                  (seq candidate-name) (conj "candidate_name LIKE ?")
                  (seq status) (conj "status = ?")
                  (seq level) (conj "level = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq candidate-name) (conj (str "%" candidate-name "%"))
               (seq status) (conj status)
               (seq level) (conj level)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_warning_record WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->warning (db/query ds (into [sql] args)))}))

(defn get-alert [ds id]
  (row->warning (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])))

(defn create-alert! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_warning_record (id, org_id, code, trace_no, candidate_name, org_name, stage, level, problem, plan_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:traceNo body)
       (:candidateName body) (:orgName body) (:stage body)
       (:level body) (:problem body) (:planId body)
       (or (:status body) "processing")])
    (get-alert ds id)))

(defn update-alert! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_warning_record
          SET code = ?, trace_no = ?, candidate_name = ?, org_name = ?, stage = ?, level = ?,
              problem = ?, plan_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:traceNo body) (:trace_no current))
         (or (:candidateName body) (:candidate_name current))
         (or (:orgName body) (:org_name current))
         (or (:stage body) (:stage current))
         (or (:level body) (:level current))
         (or (:problem body) (:problem current))
         (or (:planId body) (:plan_id current))
         (or (:status body) (:status current))
         id])
      (get-alert ds id))))

(defn delete-alert! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_warning_record WHERE id = ?" id])
    true))
