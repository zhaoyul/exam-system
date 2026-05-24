(ns zhaoyul.exam-system-backend.web.controllers.exam-staff-assignment
  "考务人员安排 HTTP 控制器"
  (:require
   [zhaoyul.exam-system-backend.domain.exam-staff-assignment :as assignment]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn list-assignments [{:keys [datasource]} req]
  (let [params (:query-params req)
        result (assignment/list-assignments datasource params)]
    (response/ok result)))

(defn get-assignment [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if-let [item (assignment/get-assignment datasource id)]
      (response/ok item)
      (response/not-found {:error "安排记录不存在"}))))

(defn create-assignment [{:keys [datasource]} req]
  (let [body (:body-params req)
        item (assignment/create-assignment! datasource body)]
    (response/created item)))

(defn delete-assignment [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if (assignment/delete-assignment! datasource id)
      (response/ok {:deleted true})
      (response/not-found {:error "安排记录不存在"}))))

;; ─── Query helpers ───

(defn get-assignable-staff [{:keys [datasource]} req]
  (let [params (:query-params req)
        result (assignment/get-assignable-staff datasource params)]
    (response/ok {:items result})))

(defn get-plan-occupations [{:keys [datasource]} req]
  (let [plan-id (-> req :query-params :planId)
        result (assignment/get-plan-occupations datasource plan-id)]
    (response/ok {:items result})))

(defn get-plan-sessions [{:keys [datasource]} req]
  (let [plan-id (-> req :query-params :planId)
        result (assignment/get-plan-sessions datasource plan-id)]
    (response/ok {:items result})))

(defn get-plan-exam-rooms [{:keys [datasource]} _req]
  (let [result (assignment/get-plan-exam-rooms datasource nil)]
    (response/ok {:items result})))

(defn get-staff-assignment-history [{:keys [datasource]} req]
  (let [staff-id (-> req :path-params :id)
        result (assignment/get-staff-assignment-history datasource staff-id)]
    (response/ok {:items result})))

(defn batch-assign [{:keys [datasource]} req]
  (let [body (:body-params req)
        result (assignment/batch-assign! datasource body)]
    (response/ok result)))

(defn cancel-assignment [{:keys [datasource]} req]
  (let [id (-> req :path-params :id)]
    (if (assignment/delete-assignment! datasource id)
      (response/ok {:cancelled true})
      (response/not-found {:error "安排记录不存在"}))))
