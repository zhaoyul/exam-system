(ns zhaoyul.exam-system-backend.web.controllers.question-bank
  (:require
   [zhaoyul.exam-system-backend.domain.question-bank :as question-bank]
   [zhaoyul.exam-system-backend.web.response :as response]))

(def csv-content-type
  "text/csv; charset=utf-8")

(defn- csv-response [filename content]
  {:status 200
   :headers {"Content-Type" csv-content-type
             "Content-Disposition" (str "attachment; filename=\"" filename "\"")}
   :body content})

(defn template [_ctx _request]
  (csv-response "theory-question-template.csv" (question-bank/theory-template-csv)))

(defn import-theory-questions [{:keys [datasource]} request]
  (response/ok (question-bank/import-theory-questions! datasource (:body-params request))))

(defn export-theory-questions [{:keys [datasource]} request]
  (csv-response "theory-questions.csv"
                (question-bank/export-theory-questions-csv datasource (:query-params request))))

(defn generate-theory-paper [{:keys [datasource]} request]
  (let [rule-id (get-in request [:path-params :id])]
    (response/created (question-bank/generate-theory-paper! datasource rule-id (:body-params request)))))

(defn paper-questions [{:keys [datasource]} request]
  (let [paper-id (get-in request [:path-params :id])]
    (response/ok (question-bank/paper-questions datasource paper-id))))
