(ns zhaoyul.exam-system-backend.web.controllers.branch-filing
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.branch-filing :as branch-filing]
   [zhaoyul.exam-system-backend.web.response :as response]))

(def valid-staff-types #{"exam_staff" "proctor" "evaluator"})

(defn- request-org-id [request]
  (some-> (or (get-in request [:auth/claims :org_id])
              (get-in request [:query-params "orgId"])
              (get-in request [:query-params "org-id"])
              (get-in request [:body-params :orgId])
              (get-in request [:body-params :org-id]))
          str
          str/trim))

(defn- require-org-id [request]
  (or (request-org-id request)
      ::missing))

(defn- staff-type [request]
  (let [value (or (get-in request [:query-params "staffType"])
                  (get-in request [:query-params "staff-type"])
                  (get-in request [:body-params :staffType])
                  (get-in request [:body-params :staff-type])
                  "exam_staff")]
    (if (valid-staff-types value) value "exam_staff")))

(defn get-current [{:keys [datasource]} request]
  (let [org-id (require-org-id request)]
    (if (= ::missing org-id)
      (response/unauthorized)
      (response/ok (branch-filing/get-profile datasource org-id)))))

(defn save-basic [{:keys [datasource]} request]
  (let [org-id (require-org-id request)]
    (if (= ::missing org-id)
      (response/unauthorized)
      (response/ok {:basicInfo (branch-filing/save-basic! datasource org-id (:body-params request))}))))

(defn list-staff [{:keys [datasource]} request]
  (let [org-id (require-org-id request)]
    (if (= ::missing org-id)
      (response/unauthorized)
      (response/ok (branch-filing/list-current-staff datasource org-id (staff-type request))))))

(defn create-staff [{:keys [datasource]} request]
  (let [org-id (require-org-id request)]
    (if (= ::missing org-id)
      (response/unauthorized)
      (response/created (branch-filing/create-current-staff! datasource org-id (staff-type request) (:body-params request))))))

(defn delete-staff [{:keys [datasource]} request]
  (let [org-id (require-org-id request)
        id (get-in request [:path-params :id])]
    (cond
      (= ::missing org-id) (response/unauthorized)
      (branch-filing/delete-current-staff! datasource org-id id) (response/ok {:deleted true})
      :else (response/not-found {:error "人员不存在"}))))
