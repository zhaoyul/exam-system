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
                               :contactName "测试联系人"
                               :loginName "api-org-admin"
                               :password "api-pass-001"
                               :registerMobile "13900000001"}
                              headers)
        created (json/parse-string (:body create-response) true)
        id (:id created)
        login-response (POST handler
                             "/api/auth/login"
                             {:username "api-org-admin"
                              :password "api-pass-001"}
                             headers)
        detail (json/parse-string (:body (GET handler (str "/api/certification/organizations/" id) {} headers)) true)]
    (is (= 201 (:status create-response)))
    (is (= 200 (:status login-response)))
    (is (= "api-org-admin" (get-in detail [:users 0 :loginName])))
    (is (= 200 (:status (GET handler (str "/api/certification/organizations/" id) {} headers))))
    (is (= 200 (:status (PUT handler (str "/api/certification/organizations/" id) {:email "api@example.com"} headers))))
    (is (= 204 (:status (DELETE handler (str "/api/certification/organizations/" id) headers))))
    (is (= 404 (:status (GET handler (str "/api/certification/organizations/" id) {} headers))))))

(deftest branch-filing-current-org-isolated-and-persistent-test
  (let [handler (:handler/ring (system-state))
        headers {}
        org-a-response (POST handler
                             "/api/certification/organizations"
                             {:name "分支备案测试机构A"
                              :orgType "branch"
                              :creditCode "BRANCH-FILING-A"
                              :contactName "初始联系人"
                              :loginName "branch-filing-a"
                              :password "branch-pass-a"
                              :registerMobile "13900001001"}
                             headers)
        org-a (json/parse-string (:body org-a-response) true)
        org-b-response (POST handler
                             "/api/certification/organizations"
                             {:name "分支备案测试机构B"
                              :orgType "branch"
                              :creditCode "BRANCH-FILING-B"
                              :contactName "其他联系人"
                              :loginName "branch-filing-b"
                              :password "branch-pass-b"
                              :registerMobile "13900001002"}
                             headers)
        org-b (json/parse-string (:body org-b-response) true)
        login-response (POST handler "/api/auth/login" {:username "branch-filing-a" :password "branch-pass-a"} headers)
        token (:token (json/parse-string (:body login-response) true))
        auth-headers {"authorization" (str "Bearer " token)}
        initial (json/parse-string (:body (GET handler "/api/filing/branch-current" {} auth-headers)) true)
        saved-response (PUT handler
                            "/api/filing/branch-current/basic"
                            {:name "分支备案测试机构A"
                             :code "BRANCH-FILING-A"
                             :nature "分支机构"
                             :group "测试集团"
                             :contact "持久化联系人"
                             :phone "13900009999"
                             :email "persist@example.com"
                             :address "持久化地址"}
                            auth-headers)
        reloaded (json/parse-string (:body (GET handler "/api/filing/branch-current" {} auth-headers)) true)
        _ (POST handler "/api/staff"
                {:name "其他机构人员"
                 :idCard "440301199001011111"
                 :phone "13800001111"
                 :staffType "exam_staff"
                 :orgId (:id org-b)
                 :position "其他人员"}
                headers)
        created-exam (json/parse-string
                      (:body (POST handler "/api/filing/branch-current/staff"
                                   {:name "机构A工作人员"
                                    :idCard "440301199001012222"
                                    :phone "13800002222"
                                    :staffType "exam_staff"
                                    :position "考务人员"}
                                   auth-headers))
                      true)
        _ (POST handler "/api/filing/branch-current/staff"
                {:name "机构A考评人员"
                 :idCard "440301199001013333"
                 :phone "13800003333"
                 :staffType "evaluator"
                 :position "考评人员"}
                auth-headers)
        exam-list (json/parse-string (:body (GET handler "/api/filing/branch-current/staff" {"staffType" "exam_staff"} auth-headers)) true)
        evaluator-list (json/parse-string (:body (GET handler "/api/filing/branch-current/staff" {"staffType" "evaluator"} auth-headers)) true)]
    (is (= 201 (:status org-a-response)))
    (is (= 201 (:status org-b-response)))
    (is (= 200 (:status login-response)))
    (is (= (:id org-a) (:orgId initial)))
    (is (= "分支备案测试机构A" (get-in initial [:basicInfo :name])))
    (is (= 200 (:status saved-response)))
    (is (= "持久化地址" (get-in reloaded [:basicInfo :address])))
    (is (= "持久化联系人" (get-in reloaded [:basicInfo :contact])))
    (is (= (:id org-a) (:orgId created-exam)))
    (is (= ["机构A工作人员"] (mapv :name (:items exam-list))))
    (is (= ["机构A考评人员"] (mapv :name (:items evaluator-list))))
    (is (not-any? #(= "其他机构人员" (:name %)) (:items exam-list)))))
