(ns zhaoyul.exam-system-backend.domain.certification-biz-repo
  "等级认定业务审核 — 数据访问层
   从 resource_item 表查询各模块待审核数据，以及 audit_log 审核历史。"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ----------------------------------------------------------------
;; 覆盖的 11 个业务模块（resource 名称）
;; ----------------------------------------------------------------
(def review-resources
  ["certification-plans" "exam-registration" "exam-arrangement" "exam-sessions"
   "certificates" "certificate-print-jobs"
   "approval-settings" "approvals" "certificate-reports"
   "trace-alerts" "special-applications" "historical-certifications"])

;; ----------------------------------------------------------------
;; 审核状态集
;; ----------------------------------------------------------------
(def pending-statuses ["待审核" "submitted" "pending" "processing"])
(def done-statuses ["已通过" "已退回" "已完成" "已发布" "approved" "rejected" "done" "completed"])

(defn- param [params & keys]
  (some (fn [k]
          (or (get params k)
              (get params (keyword k))
              (get params (str k))))
        keys))

(defn- parse-int [value fallback]
  (try
    (Integer/parseInt (str (or value fallback)))
    (catch Exception _ fallback)))

(defn- placeholders [items]
  (str/join "," (repeat (count items) "?")))

;; ----------------------------------------------------------------
;; 待审核列表
;; ----------------------------------------------------------------
(defn list-pending-items
  "分页查询待审核记录，支持按模块、状态、关键词筛选。"
  [ds params]
  (let [resource (param params :resource "resource" :module "module")
        status (param params :status "status")
        q (some-> (param params :q "q") str/trim)
        org-id (param params :org-id "org-id" :orgId "orgId" :org_id "org_id")
        limit  (min 500 (max 1 (parse-int (param params :limit "limit") 20)))
        offset (max 0 (parse-int (param params :offset "offset") 0))
        filters (cond-> []
                  (seq resource) (conj "resource = ?")
                  (not (seq resource)) (conj (str "resource IN (" (placeholders review-resources) ")"))
                  (seq status) (conj "status = ?")
                  (not (seq status)) (conj (str "status IN (" (placeholders pending-statuses) ")"))
                  (seq q) (conj "(name LIKE ? OR code LIKE ? OR payload LIKE ?)")
                  (seq org-id) (conj "org_id = ?"))
        where-clause (str/join " AND " filters)
        args (vec
              (concat
               (if (seq resource) [resource] review-resources)
               (if (seq status) [status] pending-statuses)
               (when (seq q) [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (when (seq org-id) [org-id])
               [limit offset]))
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

(defn list-work-items
  "按 todo/done/all 查询业务待办/已办。"
  [ds params]
  (let [scope (or (param params :scope "scope") "todo")
        statuses (case scope
                   "done" done-statuses
                   "all" nil
                   pending-statuses)
        q (some-> (param params :q "q") str/trim)
        filters (cond-> [(str "resource IN (" (placeholders review-resources) ")")]
                  (seq statuses) (conj (str "status IN (" (placeholders statuses) ")"))
                  (seq q) (conj "(name LIKE ? OR code LIKE ? OR payload LIKE ?)"))
        args (vec (concat review-resources
                          statuses
                          (when (seq q) [(str "%" q "%") (str "%" q "%") (str "%" q "%")])))
        sql (str "SELECT * FROM resource_item WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC LIMIT 100")]
    {:items (db/query ds (into [sql] args))}))

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
       AND action LIKE 'review_%'
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
