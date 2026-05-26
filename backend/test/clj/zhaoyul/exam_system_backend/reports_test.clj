(ns zhaoyul.exam-system-backend.reports-test
  (:require
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.reports :as reports]
   [zhaoyul.exam-system-backend.domain.seed :as seed]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_reports?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest report-data-can-be-calculated-and-exported
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (seed/seed! ds)
      (testing "score and statistics reports are calculated from domain tables"
        (let [score (:items (reports/score-report ds {}))
              statistics (:items (reports/statistics-report ds {}))]
          (is (seq score))
          (is (seq statistics))
          (is (some #(= "大亚湾核电" (:org %)) score))))
      (testing "CSV export uses stable report headers"
        (let [csv (reports/report-csv ds "registration" {})]
          (is (str/starts-with? csv "机构,职业(工种),等级,报名人数"))
          (is (str/includes? csv "核反应堆运行值班员"))))
      (testing "upload preview summarizes generated report rows"
        (let [preview (reports/upload-preview ds {})]
          (is (pos? (get-in preview [:summary :scoreRows])))
          (is (= "ready" (get-in preview [:items 0 :status])))))
      (finally
        (.close ds)))))
