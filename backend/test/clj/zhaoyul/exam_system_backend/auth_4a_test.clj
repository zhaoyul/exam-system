(ns zhaoyul.exam-system-backend.auth-4a-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]
   [zhaoyul.exam-system-backend.web.controllers.auth :as auth-controller]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_auth_4a?mode=memory&cache=shared"
              :username ""
              :password ""}})

(def token-config
  {:auth {:token-secret "test-secret"
          :token-ttl-seconds 3600}})

(deftest four-a-callback-can-map-local-and-mdm-users
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (db/execute! ds ["INSERT INTO app_user (id, username, password_hash, display_name, role, org_id, status)
                        VALUES ('u-4a-local', 'cgnzx001', ?, '集团管理员', 'group_admin', 'org-cgn', 'active')"
                       (auth/password-hash "cgnzx001" "unused")])
      (db/execute! ds ["INSERT INTO mdm_person (id, employee_no, name, phone, org_id, org_name, position, status)
                        VALUES ('mdm-4a-001', 'P4A001', '4A映射人员', '13800139999', 'org-csyxgs', '测试有限公司', '考务人员', 'active')"])
      (testing "callback supports existing local user"
        (let [response (auth-controller/callback-4a {:datasource ds :config token-config}
                                                     {:query-params {"ticket" "mock:cgnzx001"}})]
          (is (= 200 (:status response)))
          (is (= "4A" (get-in response [:body :user :authProvider])))))
      (testing "callback provisions an MDM user when local user is missing"
        (let [response (auth-controller/callback-4a {:datasource ds :config token-config}
                                                     {:query-params {"ticket" "mock:P4A001"}})
              user (auth/find-user ds "P4A001")
              audit (db/execute-one! ds ["SELECT action FROM audit_log WHERE resource = 'app_user' AND resource_id = ?" (:id user)])]
          (is (= 200 (:status response)))
          (is (= "4A映射人员" (:display_name user)))
          (is (= "4a-user-provision" (:action audit)))))
      (finally
        (.close ds)))))
