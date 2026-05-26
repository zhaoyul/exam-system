(ns zhaoyul.exam-system-backend.domain.certification-biz-service
  "等级认定业务审核 — 业务逻辑层
   审核状态流转、权限校验、复核意见记录。"
  (:require
   [zhaoyul.exam-system-backend.domain.certification-biz-repo :as repo]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ----------------------------------------------------------------
;; 审核动作 → 状态映射
;; ----------------------------------------------------------------
(def action->status
  {"approved" "已通过"
   "rejected" "已退回"
   "returned" "待修改"
   "submitted" "待审核"})

(def valid-actions (set (keys action->status)))

;; ----------------------------------------------------------------
;; 待审核列表
;; ----------------------------------------------------------------
(defn list-pending [ds params]
  (repo/list-pending-items ds params))

(defn- row->work-item [row]
  (let [payload (db/parse-json (:payload row))]
    (merge (dissoc row :payload :created_at :updated_at)
           payload
           {:title (or (:name row) (:title payload) (:planName payload))
            :module (:resource row)
            :createdAt (:created_at row)
            :updatedAt (:updated_at row)})))

(defn list-work-items [ds params]
  (let [result (repo/list-work-items ds params)]
    (update result :items #(mapv row->work-item %))))

(defn workbench-summary [ds]
  (let [todo (:items (list-work-items ds {:scope "todo"}))
        done (:items (list-work-items ds {:scope "done"}))
        stats (repo/review-statistics ds)]
    {:stats [{:label "待办事项" :value (count todo) :unit "条"}
             {:label "已办事项" :value (count done) :unit "条"}
             {:label "覆盖模块" :value (count stats) :unit "个"}
             {:label "审核记录" :value (reduce + 0 (map #(reduce + 0 (vals (:counts %))) stats)) :unit "条"}]
     :todos (take 10 todo)
     :done (take 10 done)
     :statistics stats}))

;; ----------------------------------------------------------------
;; 审核详情
;; ----------------------------------------------------------------
(defn get-detail [ds resource id]
  (repo/get-item-detail ds resource id))

;; ----------------------------------------------------------------
;; 执行审核
;; ----------------------------------------------------------------
(defn submit-review!
  "执行一条审核动作（通过/退回）。"
  [ds {:keys [module id action comment actor-id org-id]}]
  (when-not (valid-actions action)
    (throw (ex-info "无效的审核动作"
                    {:action action :valid valid-actions})))
  (let [status (get action->status action)
        item   (repo/get-item-detail ds module id)]
    (when-not item
      (throw (ex-info "审核目标不存在"
                      {:module module :id id})))
    ;; 1. 更新状态
    (repo/update-item-status! ds module id status)
    ;; 2. 写入审核日志
    (repo/log-review!
     ds
     {:actor-id    actor-id
      :action      (str "review_" action)
      :resource    module
      :resource-id id
      :comment     comment
      :org-id      org-id})
    ;; 3. 返回更新后的记录
    {:item   (repo/get-item-detail ds module id)
     :action action
     :status status}))

;; ----------------------------------------------------------------
;; 审核历史
;; ----------------------------------------------------------------
(defn get-history [ds module id]
  (let [items (repo/get-review-history ds module id)]
    (mapv (fn [row]
            (merge (dissoc row :payload :created_at)
                   (db/parse-json (:payload row))
                   {:createdAt (:created_at row)}))
          items)))
