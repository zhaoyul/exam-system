(ns zhaoyul.exam-system-backend.web.controllers.exam-staff
  "考务/监考/考评统一人员管理 HTTP 控制器"
  (:require
   [zhaoyul.exam-system-backend.domain.exam-staff :as staff]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn list-staff [{:keys [datasource]} req]
  (let [params (:query-params req)
        result (staff/list-staff datasource params)]
    (response/ok result)))

(defn get-staff [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if-let [item (staff/get-staff datasource id)]
      (response/ok item)
      (response/not-found {:error "人员不存在"}))))

(defn create-staff [{:keys [datasource]} req]
  (let [body (:body-params req)
        item (staff/create-staff! datasource body)]
    (response/created item)))

(defn update-staff [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)
        body (:body-params req)
        item (staff/update-staff! datasource id body)]
    (if item
      (response/ok item)
      (response/not-found {:error "人员不存在"}))))

(defn delete-staff [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if (staff/delete-staff! datasource id)
      (response/ok {:deleted true})
      (response/not-found {:error "人员不存在"}))))

(defn parse-id-card [_req]
  (let [id-card (get-in _req [:query-params "idCard"])]
    (if-let [parsed (staff/parse-id-card id-card)]
      (response/ok parsed)
      (response/ok {:error "无效的身份证号"}))))

(defn get-password-hint [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if-let [hint (staff/get-password-hint datasource id)]
      (response/ok hint)
      (response/not-found {:error "人员不存在"}))))
