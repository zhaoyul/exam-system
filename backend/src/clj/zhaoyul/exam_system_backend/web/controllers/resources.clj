(ns zhaoyul.exam-system-backend.web.controllers.resources
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.web.response :as response]))

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
  (fn [request]
    (response/ok (resources/list-items (:datasource ctx) resource (:query-params request)))))

(defn get-alias [ctx resource]
  (fn [request]
    (let [id (get-in request [:path-params :id])]
      (if-let [item (resources/get-item (:datasource ctx) resource id)]
        (response/ok item)
        (response/not-found)))))

(defn create-alias [ctx resource]
  (fn [request]
    (response/created
     (resources/create-item! (:datasource ctx) resource (:body-params request)))))

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
