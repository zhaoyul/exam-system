(ns zhaoyul.exam-system-backend.web.controllers.archive
  (:require
   [zhaoyul.exam-system-backend.domain.archive :as archive]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- csv-response [filename content]
  {:status 200
   :headers {"Content-Type" "text/csv; charset=utf-8"
             "Content-Disposition" (str "attachment; filename=\"" filename "\"")}
   :body content})

(defn list-archives [{:keys [datasource]} request]
  (response/ok (archive/list-archives datasource (:query-params request))))

(defn list-candidates [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (response/ok (archive/list-candidates datasource plan-id))))

(defn export-plan [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (csv-response (str plan-id "-archive.csv")
                  (archive/archive-csv datasource plan-id))))
