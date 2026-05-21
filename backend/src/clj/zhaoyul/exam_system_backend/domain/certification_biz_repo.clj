(ns zhaoyul.exam-system-backend.domain.certification-biz-repo
  "等级认定业务审核 — 数据访问层
   从 resource_item 表查询各模块待审核数据，以及 audit_log 审核历史。"
  (:require
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ----------------------------------------------------------------
;; 覆盖的 11 个业务模块（resource 名称）
;; ----------------------------------------------------------------
(def review-resources
  ["exam-registration" "exam-arrangement" "exam-sessions"
   "certificates" "certificate-print-jobs"
   "approval-settings" "approvals" "certificate-reports"
   "trace-alerts" "special-applications" "historical-certifications"])

;; ----------------------------------------------------------------
;; 审核状态集
;; ----------------------------------------------------------------
(def pending-statuses ["待审核" "submitted" "pending" "processing"])

;; ----------------------------------------------------------------
;; 待审核列表
;; ----------------------------------------------------------------
(defn list-pending-items
  "分页查询待审核记录，支持按模块、状态、关键词筛选。"
  [ds {:keys [resource status q org-id limit offset]
       :or {limit 20 offset 0}}]
  (let [limit  (min 500 (max 1 (int (or limit 20))))
        offset (max 0 (int (or offset 0)))
        resource-filter (if (seq resource)
                          ["resource = ?" resource]
                          [(str "resource IN ("
                                (->> review-resources
                                     (map (fn [r] (str "'" r "'")))
                                     (clojure.string/join ","))
                                ")")])
        status-filter (if (seq status)
                        ["status = ?" status]
                        [(str "status IN ("
                              (->> pending-statuses
                                   (map (fn [s] (str "'" s "'")))
                                   (clojure.string/join ","))
                              ")")])
        q-parts (if (seq q)
                  ["(name LIKE ? OR code LIKE ?)"]
                  [])
        org-parts (if (seq org-id)
                    ["org_id = ?" org-id]
                    [])
        filters (remove #(= "1 = 1" %)
                        (concat ["1 = 1"]
                                [(first resource-filter)]
                                [(first status-filter)]
                                q-parts
                                org-parts))
        where-clause (clojure.string/join " AND " filters)
        args (vec
              (filter some?
                      (concat
                       (when-not (= "resource = ?" (first resource-filter))
                         (rest resource-filter))
                       (when-not (= "status = ?" (first status-filter))
                         (rest status-filter))
                       (when (seq q) [(str "%" q "%") (str "%" q "%")])
                       (when (seq org-id) [org-id])
                       [limit offset])))
        sql (str "SELECT * FROM resource_item WHERE " where-clause
                 " ORDER BY updated_at DESC LIMIT ? OFFSET ?")
        count-sql (str "SELECT COUNT(*) AS total FROM resource_item WHERE " where-clause)
        count-args (vec (drop-last 2 args))
        items (db/query ds (into [sql] args))
        total-row (db/execute-one! ds (into [count-sql] count-args))]
    {:items items
     :total (:total total-row)
     :limit  limit
     :offset offset}))

;; ----------------------------------------------------------------
;; 单条详情
;; ----------------------------------------------------------------
(defn get-item-detail
  "获取单个 resource_item 记录，包括 payload 解析。"
  [ds resource id]
  (let [row (db/execute-one!
             ds
             ["SELECT * FROM resource_item WHERE resource = ? AND id = ?"
              resource id])]
    (when row
      (merge (dissoc row :payload :created_at :updated_at)
             (db/parse-json (:payload row))
             {:createdAt (:created_at row)
              :updatedAt (:updated_at row)}))))

;; ----------------------------------------------------------------
;; 审核日志写入
;; ----------------------------------------------------------------
(defn log-review!
  "写入一条审核日志到 audit_log 表。"
  [ds {:keys [actor-id action resource resource-id comment org-id]}]
  (let [id (db/uuid)
        payload (db/json-str {:comment comment :orgId org-id})]
    (db/execute!
     ds
     ["INSERT INTO audit_log (id, actor_id, action, resource, resource_id, payload)
       VALUES (?, ?, ?, ?, ?, ?)"
      id actor-id action resource resource-id payload])
    id))

;; ----------------------------------------------------------------
;; 审核历史查询
;; ----------------------------------------------------------------
(defn get-review-history
  "查询指定资源的审核历史。"
  [ds resource resource-id]
  (db/query
   ds
   ["SELECT * FROM audit_log
     WHERE resource = ? AND resource_id = ?
     ORDER BY created_at DESC"
    resource resource-id]))

;; ----------------------------------------------------------------
;; 状态更新（通过 resource_item）
;; ----------------------------------------------------------------
(defn update-item-status!
  "更新 resource_item 的状态字段。"
  [ds resource id new-status]
  (db/execute!
   ds
   ["UPDATE resource_item SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE resource = ? AND id = ?"
    new-status resource id])
  (get-item-detail ds resource id))

;; ----------------------------------------------------------------
;; 统计
;; ----------------------------------------------------------------
(defn review-statistics
  "按模块统计审核状态分布。"
  [ds]
  (let [sql (str "SELECT resource, status, COUNT(*) AS cnt "
                 "FROM resource_item "
                 "WHERE resource IN ("
                 (->> review-resources
                      (map (fn [r] (str "'" r "'")))
                      (clojure.string/join ","))
                 ") "
                 "GROUP BY resource, status "
                 "ORDER BY resource, status")]
    (->> (db/query ds [sql])
         (group-by :resource)
         (map (fn [[resource rows]]
                {:resource resource
                 :counts (reduce (fn [m r]
                                   (assoc m (keyword (:status r)) (:cnt r)))
                                 {}
                                 rows)}))
         (into []))))
