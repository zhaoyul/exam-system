(ns zhaoyul.exam-system-backend.domain.paper-demand
  "试卷需求管理 — 业务逻辑层
   按工种创建需求项、组卷方式枚举、推送接口"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ============================================================
;; 组卷方式枚举
;; ============================================================
(def assembly-methods
  "组卷方式定义"
  [{:key "question_bank_random" :label "题库组卷" :desc "千人千卷"}
   {:key "paper_library_uniform" :label "卷库" :desc "统一卷"}
   {:key "manual_upload" :label "非题库组卷" :desc "上传附件"}
   {:key "no_paper" :label "不传试卷" :desc ""}])

(def valid-assembly-methods
  (set (map :key assembly-methods)))

;; ============================================================
;; 行 → API 响应
;; ============================================================
(defn- inflate-demand [row]
  (when row
    {:id (:id row)
     :orgId (:org_id row)
     :code (:code row)
     :planId (:plan_id row)
     :planItemId (:plan_item_id row)
     :sessionId (:session_id row)
     :paperRuleId (:paper_rule_id row)
     :occupation (:occupation row)
     :level (:level row)
     :assemblyMethod (:assembly_method row)
     :quantity (:quantity row)
     :paperType (:paper_type row)
     :status (:status row)
     :pushStatus (:push_status row)
     :pushTime (:push_time row)
     :assignedCount (:assigned_count row)
     :returnedCount (:returned_count row)
     :createdAt (:created_at row)
     :updatedAt (:updated_at row)}))

(defn- inflate-push-result [row]
  (when row
    {:id (:id row)
     :orgId (:org_id row)
     :code (:code row)
     :planId (:plan_id row)
     :demandItemId (:demand_item_id row)
     :candidateId (:candidate_id row)
     :candidateName (:candidate_name row)
     :occupation (:occupation row)
     :level (:level row)
     :paperId (:paper_id row)
     :paperScore (:paper_score row)
     :assemblyMethod (:assembly_method row)
     :pushStatus (:push_status row)
     :pushTime (:push_time row)
     :errorMessage (:error_message row)
     :createdAt (:created_at row)
     :updatedAt (:updated_at row)}))

;; ============================================================
;; 试卷需求项 CRUD
;; ============================================================

(defn list-demands
  "查询试卷需求项列表，支持筛选"
  [ds {:keys [plan-id occupation level assembly-method q status org-id limit offset]
       :or {limit 50 offset 0}}]
  (let [limit (min 200 (max 1 (int limit)))
        offset (max 0 (int offset))
        filters ["1 = 1"]
        args []]
    (cond-> [filters args]
      (seq plan-id)    (-> (first) (conj "plan_id = ?") (-> (second) (conj plan-id)))
      (seq occupation) (-> (first) (conj "occupation = ?") (-> (second) (conj occupation)))
      (seq level)      (-> (first) (conj "level = ?") (-> (second) (conj level)))
      (seq assembly-method) (-> (first) (conj "assembly_method = ?") (-> (second) (conj assembly-method)))
      (seq q)          (-> (first) (conj "(name LIKE ? OR code LIKE ? OR occupation LIKE ?)")
                           (-> (second) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])))
      (seq status)     (-> (first) (conj "status = ?") (-> (second) (conj status)))
      (seq org-id)     (-> (first) (conj "org_id = ?") (-> (second) (conj org-id)))
      true identity)
    (let [where (str/join " AND " filters)
          sql (str "SELECT * FROM cgn_paper_demand_item WHERE " where " ORDER BY updated_at DESC LIMIT ? OFFSET ?")
          count-sql (str "SELECT COUNT(*) AS total FROM cgn_paper_demand_item WHERE " where)
          items (mapv inflate-demand (db/query ds (into [sql] (conj (vec args) limit offset))))
          total-row (db/execute-one! ds (into [count-sql] (vec args)))]
      {:items items :total (:total total-row) :limit limit :offset offset})))

(defn get-demand [ds id]
  (inflate-demand
   (db/execute-one! ds ["SELECT * FROM cgn_paper_demand_item WHERE id = ?" id])))

(defn create-demand!
  "按工种创建试卷需求项"
  [ds body]
  (let [id (or (:id body) (db/uuid))
        code (or (:code body) "PAP-DEMAND")
        plan-id (:planId body)
        plan-item-id (:planItemId body)
        session-id (:sessionId body)
        paper-rule-id (:paperRuleId body)
        occupation (:occupation body)
        level (:level body)
        assembly-method (or (:assemblyMethod body) "question_bank_random")
        quantity (or (:quantity body) 1)
        paper-type (or (:paperType body) "A")
        status (or (:status body) "draft")
        org-id (or (:orgId body) "")]
    (when (and assembly-method (not (valid-assembly-methods assembly-method)))
      (throw (ex-info (str "无效的组卷方式: " assembly-method)
                      {:assemblyMethod assembly-method :valid (vec valid-assembly-methods)})))
    (db/execute-one!
     ds
     ["INSERT INTO cgn_paper_demand_item
       (id, org_id, code, plan_id, plan_item_id, session_id, paper_rule_id,
        occupation, level, assembly_method, quantity, paper_type, status, push_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
      id org-id code plan-id plan-item-id session-id paper-rule-id
      occupation level assembly-method quantity paper-type status])
    (get-demand ds id)))

(defn update-demand! [ds id body]
  (let [current (get-demand ds id)]
    (when-not current
      (throw (ex-info "试卷需求项不存在" {:id id})))
    (let [merged (merge current body)
          assembly-method (:assemblyMethod merged)
          plan-id (:planId merged)
          plan-item-id (:planItemId merged)
          session-id (:sessionId merged)
          paper-rule-id (:paperRuleId merged)
          occupation (:occupation merged)
          level (:level merged)
          quantity (:quantity merged)
          paper-type (:paperType merged)
          status (:status merged)
          org-id (:orgId merged)]
      (when (and assembly-method (not (valid-assembly-methods assembly-method)))
        (throw (ex-info (str "无效的组卷方式: " assembly-method)
                        {:assemblyMethod assembly-method :valid (vec valid-assembly-methods)})))
      (db/execute!
       ds
       ["UPDATE cgn_paper_demand_item
         SET plan_id = ?, plan_item_id = ?, session_id = ?, paper_rule_id = ?,
             occupation = ?, level = ?, assembly_method = ?, quantity = ?,
             paper_type = ?, status = ?, org_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        plan-id plan-item-id session-id paper-rule-id
        occupation level assembly-method quantity
        paper-type status org-id id])
      (get-demand ds id))))

(defn delete-demand! [ds id]
  (let [current (get-demand ds id)]
    (when current
      (db/execute! ds ["DELETE FROM cgn_paper_demand_item WHERE id = ?" id])
      current)))

;; ============================================================
;; 推送接口 — 试卷完成回推
;; ============================================================

(defn list-push-results
  "查询推送结果列表"
  [ds {:keys [demand-item-id plan-id candidate-id push-status org-id limit offset]
       :or {limit 50 offset 0}}]
  (let [limit (min 200 (max 1 (int limit)))
        offset (max 0 (int offset))
        filters ["1 = 1"]
        args []]
    (cond-> [filters args]
      (seq demand-item-id) (-> (first) (conj "demand_item_id = ?") (-> (second) (conj demand-item-id)))
      (seq plan-id)        (-> (first) (conj "plan_id = ?") (-> (second) (conj plan-id)))
      (seq candidate-id)   (-> (first) (conj "candidate_id = ?") (-> (second) (conj candidate-id)))
      (seq push-status)    (-> (first) (conj "push_status = ?") (-> (second) (conj push-status)))
      (seq org-id)         (-> (first) (conj "org_id = ?") (-> (second) (conj org-id)))
      true identity)
    (let [where (str/join " AND " filters)
          sql (str "SELECT * FROM cgn_paper_push_result WHERE " where " ORDER BY updated_at DESC LIMIT ? OFFSET ?")
          count-sql (str "SELECT COUNT(*) AS total FROM cgn_paper_push_result WHERE " where)
          items (mapv inflate-push-result (db/query ds (into [sql] (conj (vec args) limit offset))))
          total-row (db/execute-one! ds (into [count-sql] (vec args)))]
      {:items items :total (:total total-row) :limit limit :offset offset})))

(defn batch-push!
  "批量推送 — 接收试卷完成结果回推。支持单条或批量。
   body结构: {:results [{:candidateId ... :paperId ... :paperScore ...} ...]
              :planId ... :demandItemId ...}"
  [ds body]
  (let [plan-id (:planId body)
        demand-item-id (:demandItemId body)
        results (:results body)
        org-id (or (:orgId body) "")]
    (if (seq results)
      ;; 批量推送
      (let [pushed (mapv (fn [r]
                           (let [id (db/uuid)
                                 candidate-id (:candidateId r)
                                 candidate-name (:candidateName r)
                                 paper-id (:paperId r)
                                 paper-score (:paperScore r)
                                 occupation (:occupation r)
                                 level (:level r)
                                 assembly-method (:assemblyMethod r)
                                 error-message (:errorMessage r)
                                 push-status (if error-message "failed" "success")
                                 push-time (.toString (java.time.LocalDateTime/now))]
                             (db/execute!
                              ds
                              ["INSERT INTO cgn_paper_push_result
                                (id, org_id, code, plan_id, demand_item_id, candidate_id,
                                 candidate_name, occupation, level, paper_id, paper_score,
                                 assembly_method, push_status, push_time, error_message)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                               id org-id "PUSH-RESULT" plan-id demand-item-id candidate-id
                               candidate-name occupation level paper-id paper-score
                               assembly-method push-status push-time error-message])
                             {:id id :candidateId candidate-id :paperId paper-id
                              :pushStatus push-status :errorMessage error-message}))
                         results)]
        ;; 更新需求项的推送统计
        (when demand-item-id
          (let [total-count (count pushed)
                success-count (count (filter #(= "success" (:pushStatus %)) pushed))]
            (db/execute!
             ds
             ["UPDATE cgn_paper_demand_item
               SET returned_count = returned_count + ?,
                   push_status = CASE WHEN assigned_count <= returned_count + ? THEN 'completed' ELSE push_status END,
                   push_time = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?"
              success-count success-count demand-item-id])))
        {:results pushed
         :total (count pushed)
         :succeeded (count (filter #(= "success" (:pushStatus %)) pushed))
         :failed (count (filter #(= "failed" (:pushStatus %)) pushed))})
      ;; 单条推送
      (let [candidate-id (:candidateId body)
            candidate-name (:candidateName body)
            paper-id (:paperId body)
            paper-score (:paperScore body)
            occupation (:occupation body)
            level (:level body)
            assembly-method (:assemblyMethod body)
            error-message (:errorMessage body)
            push-status (if error-message "failed" "success")
            id (db/uuid)
            push-time (.toString (java.time.LocalDateTime/now))]
        (db/execute!
         ds
         ["INSERT INTO cgn_paper_push_result
           (id, org_id, code, plan_id, demand_item_id, candidate_id,
            candidate_name, occupation, level, paper_id, paper_score,
            assembly_method, push_status, push_time, error_message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
          id org-id "PUSH-RESULT" plan-id demand-item-id candidate-id
          candidate-name occupation level paper-id paper-score
          assembly-method push-status push-time error-message])
        (let [result {:id id :candidateId candidate-id :paperId paper-id
                      :pushStatus push-status :errorMessage error-message}]
          (when demand-item-id
            (db/execute!
             ds
             ["UPDATE cgn_paper_demand_item
               SET returned_count = returned_count + 1,
                   push_status = CASE WHEN assigned_count <= returned_count + 1 THEN 'completed' ELSE push_status END,
                   push_time = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?"
              demand-item-id]))
          result)))))

;; ============================================================
;; 需求项状态流转
;; ============================================================

(def demand-action-status
  {"submit" "submitted"
   "confirm" "confirmed"
   "assign" "assigned"
   "complete" "completed"
   "cancel" "cancelled"})

(defn apply-demand-action! [ds id action body]
  (let [current (get-demand ds id)]
    (when-not current
      (throw (ex-info "试卷需求项不存在" {:id id})))
    (let [new-status (get demand-action-status action)
          assigned-count (:assignedCount body)]
      (when new-status
        (db/execute!
         ds
         (cond-> ["UPDATE cgn_paper_demand_item SET status = ?, updated_at = CURRENT_TIMESTAMP"
                  new-status]
           assigned-count (conj ", assigned_count = ?" assigned-count)
           true (conj "WHERE id = ?" id))))
      (get-demand ds id))))
