(ns zhaoyul.exam-system-backend.web.controllers.reports
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.reports :as reports]
   [zhaoyul.exam-system-backend.web.response :as response]))

(def report-kinds #{"score" "statistics" "registration" "arrangement"})

(defn- report-kind [request]
  (or (get-in request [:path-params :kind])
      (some report-kinds (str/split (str (:uri request)) #"/"))))

(defn- csv-response [filename content]
  {:status 200
   :headers {"Content-Type" "text/csv; charset=utf-8"
             "Content-Disposition" (str "attachment; filename=\"" filename "\"")}
   :body content})

(defn report-data [{:keys [datasource]} request]
  (let [kind (report-kind request)]
    (response/ok (reports/report-data datasource kind (:query-params request)))))

(defn export-report [{:keys [datasource]} request]
  (let [kind (report-kind request)]
    (csv-response (str kind "-report.csv")
                  (reports/report-csv datasource kind (:query-params request)))))

(defn upload-template [_ctx _request]
  (csv-response "report-upload-template.csv" (reports/upload-template-csv)))

(defn upload-preview [{:keys [datasource]} request]
  (response/ok (reports/upload-preview datasource (:query-params request))))
