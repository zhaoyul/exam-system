(ns zhaoyul.exam-system-backend.web.controllers.paper-demand
  "试卷需求管理 — 控制器层
   按工种创建需求项、组卷方式查询、试卷完成推送"
  (:require
   [zhaoyul.exam-system-backend.domain.paper-demand :as demand]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- auth-org-id [request]
  (let [claims (get request :auth/claims)
        role (:role claims)]
    (when (and claims (not= "group_admin" role))
      (:org_id claims))))

;; ============================================================
;; 组卷方式枚举
;; ============================================================

(defn assembly-methods
  "获取组卷方式枚举列表"
  [_ctx]
  (fn [_request]
    (response/ok {:methods (mapv (fn [m]
                                   {:key (:key m)
                                    :label (:label m)
                                    :description (:desc m)})
                                 demand/assembly-methods)})))

;; ============================================================
;; 试卷需求项 CRUD
;; ============================================================

(defn list-demands
  "查询试卷需求项列表"
  [{:keys [datasource] :as ctx}]
  (fn [request]
    (let [forced-org (auth-org-id request)
          params (:query-params request)
          params (if forced-org (assoc params "org-id" forced-org) params)]
      (response/ok (demand/list-demands datasource params)))))

(defn get-demand
  "查看试卷需求项详情"
  [{:keys [datasource]}]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if-let [item (demand/get-demand datasource id)]
        (response/ok item)
        (response/not-found)))))

(defn create-demand
  "创建试卷需求项（按工种）"
  [{:keys [datasource]}]
  (fn [request]
    (let [claims (get request :auth/claims)
          org-id (or (:org_id claims) "")
          body (:body-params request)
          body (if (:orgId body) body (assoc body :orgId org-id))]
      (try
        (response/created (demand/create-demand! datasource body))
        (catch Exception e
          (response/bad-request (.getMessage e)))))))

(defn update-demand
  "更新试卷需求项"
  [{:keys [datasource]}]
  (fn [request]
    (let [id (get-in request [:path-params :id])
          body (:body-params request)]
      (try
        (if-let [item (demand/update-demand! datasource id body)]
          (response/ok item)
          (response/not-found))
        (catch Exception e
          (response/bad-request (.getMessage e)))))))

(defn delete-demand
  "删除试卷需求项"
  [{:keys [datasource]}]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if (demand/delete-demand! datasource id)
        (response/no-content)
        (response/not-found)))))

;; ============================================================
;; 需求项状态动作
;; ============================================================

(defn action-demand
  "试卷需求项业务动作（提交、确认、分配、完成、取消）"
  [{:keys [datasource]}]
  (fn [request]
    (let [id (get-in request [:path-params :id])
          action (get-in request [:path-params :action])
          body (:body-params request)]
      (try
        (if-let [item (demand/apply-demand-action! datasource id action body)]
          (response/ok item)
          (response/not-found))
        (catch Exception e
          (response/bad-request (.getMessage e)))))))

;; ============================================================
;; 推送接口 — 试卷完成回推
;; ============================================================

(defn list-push-results
  "查询推送结果列表"
  [{:keys [datasource]}]
  (fn [request]
    (let [forced-org (auth-org-id request)
          params (:query-params request)
          params (if forced-org (assoc params "org-id" forced-org) params)]
      (response/ok (demand/list-push-results datasource params)))))

(defn push-results
  "试卷完成回推 — 单条或批量推送"
  [{:keys [datasource]}]
  (fn [request]
    (let [claims (get request :auth/claims)
          org-id (or (:org_id claims) "")
          body (:body-params request)
          body (if (:orgId body) body (assoc body :orgId org-id))]
      (try
        (let [result (demand/batch-push! datasource body)
              is-batch (contains? result :failed)
              success? (if is-batch
                         (= 0 (:failed result))
                         (= "success" (:pushStatus result)))
              status (if success? 201 207)]
          {:status status :body result})
        (catch Exception e
          (response/bad-request (.getMessage e)))))))
