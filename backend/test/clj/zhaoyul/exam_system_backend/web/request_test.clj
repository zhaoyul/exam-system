(ns zhaoyul.exam-system-backend.web.request-test
  (:require  [cheshire.core :as json]
             [clojure.test :refer [deftest testing is use-fixtures]]
             [zhaoyul.exam-system-backend.test-utils :refer [system-state system-fixture DELETE GET POST PUT]]))

(use-fixtures :once (system-fixture))

(deftest health-request-test []
  (testing "happy path"
    (let [handler (:handler/ring (system-state))
          params {}
          headers {}
          response (GET handler "/api/health" params headers)]
      (is (= 200 (:status response))))))

(deftest frontend-module-api-coverage-test
  (let [handler (:handler/ring (system-state))
        headers {}
        params {}
        paths ["/api/dashboard/summary"
               "/api/system/users"
               "/api/filing/group"
               "/api/standard/settings"
               "/api/certification/supervision"
               "/api/certification/exam-session"
               "/api/certification/video-monitor"
               "/api/question/subjects"
               "/api/question-bank/paper-library"
               "/api/supervision/forms"
               "/api/finance/charge"
               "/api/score/entry"
               "/api/certificate/issue"
               "/api/candidates/manage"
               "/api/exam/manage"
               "/api/grading"
               "/api/monitor"
               "/api/report/statistics"
               "/api/archive"
               "/api/messages"
               "/api/personal/score"
               "/api/file/distribute"
               "/api/resources/file-settings"]]
    (doseq [path paths]
      (testing path
        (is (= 200 (:status (GET handler path params headers))))))))

(deftest frontend-rest-and-action-api-test
  (let [handler (:handler/ring (system-state))
        headers {}
        create-response (POST handler
                              "/api/certification/plans"
                              {:name "接口测试认定计划"
                               :code "API-PLAN-001"
                               :status "draft"}
                              headers)
        created (json/parse-string (:body create-response) true)
        id (:id created)]
    (is (= 201 (:status create-response)))
    (is (string? id))
    (is (= 200 (:status (GET handler (str "/api/certification/plans/" id) {} headers))))
    (is (= 200 (:status (PUT handler (str "/api/certification/plans/" id) {:status "updated"} headers))))
    (let [action-response (POST handler
                                (str "/api/actions/certification-plans/" id "/submit")
                                {:operator "test"}
                                headers)
          action-body (json/parse-string (:body action-response) true)]
      (is (= 200 (:status action-response)))
      (is (= "待审核" (:status action-body)))
      (is (= "submit" (:lastAction action-body))))
    (is (= 204 (:status (DELETE handler (str "/api/certification/plans/" id) headers))))
    (is (= 404 (:status (GET handler (str "/api/certification/plans/" id) {} headers))))))

(deftest organization-rest-api-test
  (let [handler (:handler/ring (system-state))
        headers {}
        create-response (POST handler
                              "/api/certification/organizations"
                              {:name "接口测试机构"
                               :orgType "branch"
                               :creditCode "API-CREDIT-001"
                               :contactName "测试联系人"}
                              headers)
        created (json/parse-string (:body create-response) true)
        id (:id created)]
    (is (= 201 (:status create-response)))
    (is (= 200 (:status (GET handler (str "/api/certification/organizations/" id) {} headers))))
    (is (= 200 (:status (PUT handler (str "/api/certification/organizations/" id) {:email "api@example.com"} headers))))
    (is (= 204 (:status (DELETE handler (str "/api/certification/organizations/" id) headers))))
    (is (= 404 (:status (GET handler (str "/api/certification/organizations/" id) {} headers))))))
