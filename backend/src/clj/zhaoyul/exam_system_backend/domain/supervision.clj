(ns zhaoyul.exam-system-backend.domain.supervision
  "督导专家管理 — 专家/聘用/培训/派遣/表单/统计"
  (:require
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->expert [row]
  (when row
    (-> row
        (assoc :unitName (:unit_name row)
               :skillType (:skill_type row)
               :skillProject (:skill_project row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :unit_name :skill_type :skill_project :created_at :updated_at))))

(defn- row->employ [row]
  (when row
    (-> row
        (assoc :expertId (:expert_id row)
               :planId (:plan_id row)
               :startDate (:start_date row)
               :endDate (:end_date row)
               :employType (:employ_type row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :expert_id :plan_id :start_date :end_date :employ_type :created_at :updated_at))))

(defn- row->training [row]
  (when row
    (-> row
        (assoc :trainType (:train_type row)
               :startDate (:start_date row)
               :endDate (:end_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :train_type :start_date :end_date :created_at :updated_at))))

(defn- row->dispatch [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :expertId (:expert_id row)
               :dispatchType (:dispatch_type row)
               :dispatchDate (:dispatch_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :expert_id :dispatch_type :dispatch_date :created_at :updated_at))))

(defn- row->form [row]
  (when row
    (-> row
        (assoc :formType (:form_type row)
               :contentJson (db/parse-json (:content_json row))
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :form_type :content_json :created_at :updated_at))))

;; ─── 专家信息 ───

(defn list-experts [ds {:keys [q status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR phone LIKE ? OR unit_name LIKE ?)")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_qa_expert WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->expert (db/query ds (into [sql] args)))}))

(defn get-expert [ds id]
  (row->expert (db/execute-one! ds ["SELECT * FROM cgn_qa_expert WHERE id = ?" id])))

(defn create-expert! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_qa_expert (id, org_id, code, name, phone, unit_name, skill_type, skill_project, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:phone body) (:unitName body) (:skillType body)
       (:skillProject body) (or (:status body) "active")])
    (get-expert ds id)))

(defn update-expert! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_qa_expert WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_qa_expert
          SET code = ?, name = ?, phone = ?, unit_name = ?, skill_type = ?, skill_project = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:phone body) (:phone current))
         (or (:unitName body) (:unit_name current))
         (or (:skillType body) (:skill_type current))
         (or (:skillProject body) (:skill_project current))
         (or (:status body) (:status current))
         id])
      (get-expert ds id))))

(defn delete-expert! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_qa_expert WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_qa_expert WHERE id = ?" id])
    true))

;; ─── 专家聘用 ───

(defn list-employments [ds {:keys [q expert-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq expert-id) (conj "expert_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq expert-id) (conj expert-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_qa_expert_employ WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->employ (db/query ds (into [sql] args)))}))

(defn get-employment [ds id]
  (row->employ (db/execute-one! ds ["SELECT * FROM cgn_qa_expert_employ WHERE id = ?" id])))

(defn create-employment! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_qa_expert_employ (id, org_id, code, expert_id, plan_id, start_date, end_date, employ_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:expertId body)
       (:planId body) (:startDate body) (:endDate body)
       (:employType body) (or (:status body) "active")])
    (get-employment ds id)))

(defn update-employment! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_qa_expert_employ WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_qa_expert_employ
          SET code = ?, expert_id = ?, plan_id = ?, start_date = ?, end_date = ?, employ_type = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:expertId body) (:expert_id current))
         (or (:planId body) (:plan_id current))
         (or (:startDate body) (:start_date current))
         (or (:endDate body) (:end_date current))
         (or (:employType body) (:employ_type current))
         (or (:status body) (:status current))
         id])
      (get-employment ds id))))

(defn delete-employment! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_qa_expert_employ WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_qa_expert_employ WHERE id = ?" id])
    true))

;; ─── 培训 ───

(defn list-trainings [ds {:keys [q train-type status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq train-type) (conj "train_type = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq train-type) (conj train-type)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_qa_train_plan WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->training (db/query ds (into [sql] args)))}))

(defn get-training [ds id]
  (row->training (db/execute-one! ds ["SELECT * FROM cgn_qa_train_plan WHERE id = ?" id])))

(defn create-training! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_qa_train_plan (id, org_id, code, name, train_type, hours, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:trainType body) (:hours body) (:startDate body)
       (:endDate body) (or (:status body) "draft")])
    (get-training ds id)))

(defn update-training! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_qa_train_plan WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_qa_train_plan
          SET code = ?, name = ?, train_type = ?, hours = ?, start_date = ?, end_date = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:trainType body) (:train_type current))
         (or (:hours body) (:hours current))
         (or (:startDate body) (:start_date current))
         (or (:endDate body) (:end_date current))
         (or (:status body) (:status current))
         id])
      (get-training ds id))))

(defn delete-training! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_qa_train_plan WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_qa_train_plan WHERE id = ?" id])
    true))

;; ─── 派遣 ───

(defn list-dispatches [ds {:keys [q plan-id expert-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq plan-id) (conj "plan_id = ?")
                  (seq expert-id) (conj "expert_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq plan-id) (conj plan-id)
               (seq expert-id) (conj expert-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_qa_dispatch WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->dispatch (db/query ds (into [sql] args)))}))

(defn get-dispatch [ds id]
  (row->dispatch (db/execute-one! ds ["SELECT * FROM cgn_qa_dispatch WHERE id = ?" id])))

(defn create-dispatch! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_qa_dispatch (id, org_id, code, plan_id, expert_id, dispatch_type, dispatch_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:planId body)
       (:expertId body) (:dispatchType body) (:dispatchDate body)
       (or (:status body) "pending")])
    (get-dispatch ds id)))

(defn update-dispatch! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_qa_dispatch WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_qa_dispatch
          SET code = ?, plan_id = ?, expert_id = ?, dispatch_type = ?, dispatch_date = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:planId body) (:plan_id current))
         (or (:expertId body) (:expert_id current))
         (or (:dispatchType body) (:dispatch_type current))
         (or (:dispatchDate body) (:dispatch_date current))
         (or (:status body) (:status current))
         id])
      (get-dispatch ds id))))

(defn delete-dispatch! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_qa_dispatch WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_qa_dispatch WHERE id = ?" id])
    true))

;; ─── 表单 ───

(defn list-forms [ds {:keys [q form-type status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq form-type) (conj "form_type = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq form-type) (conj form-type)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_qa_form WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->form (db/query ds (into [sql] args)))}))

(defn get-form [ds id]
  (row->form (db/execute-one! ds ["SELECT * FROM cgn_qa_form WHERE id = ?" id])))

(defn create-form! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_qa_form (id, org_id, code, name, form_type, content_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:formType body) (db/json-str (:contentJson body))
       (or (:status body) "active")])
    (get-form ds id)))

(defn update-form! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_qa_form WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_qa_form
          SET code = ?, name = ?, form_type = ?, content_json = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:formType body) (:form_type current))
         (if (contains? body :contentJson)
           (db/json-str (:contentJson body))
           (:content_json current))
         (or (:status body) (:status current))
         id])
      (get-form ds id))))

(defn delete-form! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_qa_form WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_qa_form WHERE id = ?" id])
    true))

;; ─── 人员统计 ───
;; 聚合查询，返回专家数量统计

(defn get-statistics [ds {:keys [org-id]}]
  (let [total (db/execute-one! ds (into ["SELECT COUNT(*) AS total FROM cgn_qa_expert WHERE 1 = 1"]
                                        (when (seq org-id) [" AND org_id = ?" org-id])))
        active (db/execute-one! ds (into ["SELECT COUNT(*) AS cnt FROM cgn_qa_expert WHERE status = 'active'"]
                                         (when (seq org-id) [" AND org_id = ?" org-id])))
        by-type (db/query ds (into ["SELECT skill_type AS type, COUNT(*) AS cnt FROM cgn_qa_expert WHERE 1 = 1 GROUP BY skill_type"]
                                   (when (seq org-id) [[" AND org_id = ?" org-id]])))]
    {:total (:total total)
     :active (:cnt active)
     :bySkillType (mapv (fn [r] {:skillType (:type r) :count (:cnt r)}) by-type)}))
