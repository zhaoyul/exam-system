(ns zhaoyul.exam-system-backend.web.controllers.resources
  "通用资源CRUD控制器，支持org_id机构隔离"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- auth-org-id
  "从请求中提取认证用户的org_id。集团管理员返回nil（不过滤），分支管理员返回自己的org_id。"
  [request]
  (let [claims (get request :auth/claims)
        role (:role claims)]
    (when (and claims (not= "group_admin" role))
      (or (:orgId claims) (:org_id claims)))))

(defn list-resource [{:keys [datasource]} request]
  (let [resource (get-in request [:path-params :resource])]
    (response/ok (resources/list-items datasource resource (:query-params request)))))

(defn get-resource [{:keys [datasource]} request]
  (let [{:keys [resource id]} (:path-params request)]
    (if-let [item (resources/get-item datasource resource id)]
      (response/ok item)
      (response/not-found))))

(defn create-resource [{:keys [datasource]} request]
  (let [resource (get-in request [:path-params :resource])]
    (response/created
     (resources/create-item! datasource resource (:body-params request)))))

(defn update-resource [{:keys [datasource]} request]
  (let [{:keys [resource id]} (:path-params request)]
    (if-let [item (resources/update-item! datasource resource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-resource [{:keys [datasource]} request]
  (let [{:keys [resource id]} (:path-params request)]
    (if (resources/delete-item! datasource resource id)
      (response/no-content)
      (response/not-found))))

(defn list-alias [ctx resource]
  "列表查询，自动按机构隔离（非集团管理员只能看自己机构数据）"
  (fn [request]
    (let [forced-org (auth-org-id request)
          params (if forced-org
                   (assoc (:query-params request) "org-id" forced-org)
                   (:query-params request))]
      (response/ok (resources/list-items (:datasource ctx) resource params)))))

(defn get-alias [ctx resource]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if-let [item (resources/get-item (:datasource ctx) resource id)]
        (response/ok item)
        (response/not-found)))))

(defn create-alias [ctx resource]
  "创建资源，自动绑定当前用户org_id"
  (fn [request]
    (let [claims (get request :auth/claims)
          org-id (or (:org_id claims) "")
          body (if (get (:body-params request) "orgId")
                 (:body-params request)
                 (assoc (:body-params request) "orgId" org-id))]
      (response/created
       (resources/create-item! (:datasource ctx) resource body)))))

(defn update-alias [ctx resource]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if-let [item (resources/update-item! (:datasource ctx) resource id (:body-params request))]
        (response/ok item)
        (response/not-found)))))

(defn delete-alias [ctx resource]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if (resources/delete-item! (:datasource ctx) resource id)
        (response/no-content)
        (response/not-found)))))

(defn action-resource [ctx]
  (fn [request]
    (let [{:keys [resource action]} (:path-params request)]
      (response/ok
       (resources/apply-action! (:datasource ctx) resource action (:body-params request))))))

(defn action-resource-item [ctx]
  (fn [request]
    (let [{:keys [resource id action]} (:path-params request)]
      (if-let [item (resources/apply-item-action! (:datasource ctx) resource id action (:body-params request))]
        (response/ok item)
        (response/not-found)))))
