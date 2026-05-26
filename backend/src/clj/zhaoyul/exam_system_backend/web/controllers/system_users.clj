(ns zhaoyul.exam-system-backend.web.controllers.system-users
  (:require
   [zhaoyul.exam-system-backend.domain.system-users :as users]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- actor-id [request]
  (get-in request [:auth/claims :sub]))

(defn list-users [{:keys [datasource]} request]
  (response/ok (users/list-users datasource (:query-params request))))

(defn get-user [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (users/get-user datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-user [{:keys [datasource]} request]
  (response/created (users/create-user! datasource (assoc (:body-params request) :actorId (actor-id request)))))

(defn update-user [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (users/update-user! datasource id (assoc (:body-params request) :actorId (actor-id request)))]
      (response/ok item)
      (response/not-found))))

(defn delete-user [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (users/delete-user! datasource id)
      (response/no-content)
      (response/not-found))))

(defn list-mdm-persons [{:keys [datasource]} request]
  (response/ok (users/list-mdm-persons datasource (:query-params request))))

(defn lock-user [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (users/set-status! datasource id "locked" (actor-id request))]
      (response/ok item)
      (response/not-found))))

(defn unlock-user [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (users/set-status! datasource id "active" (actor-id request))]
      (response/ok item)
      (response/not-found))))

(defn reset-password [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        password (or (get-in request [:body-params :password])
                     (get-in request [:body-params "password"]))]
    (cond
      (not (seq (str password)))
      (response/bad-request "新密码不能为空")

      :else
      (if-let [item (users/reset-password! datasource id password (actor-id request))]
        (response/ok item)
        (response/not-found)))))

(defn authorize [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        body (:body-params request)
        modules (or (:modules body) (get body "modules") [])]
    (if-let [item (users/authorize! datasource id {:modules modules
                                                   :permissionType (or (:permissionType body) (get body "permissionType"))
                                                   :actorId (actor-id request)})]
      (response/ok item)
      (response/not-found))))
