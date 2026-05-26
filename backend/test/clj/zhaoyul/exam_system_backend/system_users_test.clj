(ns zhaoyul.exam-system-backend.system-users-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.seed :as seed]
   [zhaoyul.exam-system-backend.domain.system-users :as users]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_users?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest mdm-person-can-be-opened-as-system-user
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (seed/seed! ds)
      (testing "MDM person candidates are available"
        (let [matches (:items (users/list-mdm-persons ds {"q" "P100002"}))
              org-matches (:items (users/list-mdm-persons ds {"orgId" "org-csyxgs"}))]
          (is (= 1 (count matches)))
          (is (= "P100002" (:employeeNo (first matches))))
          (is (= 2 (count org-matches)))))
      (testing "open user from MDM, authorize, and lock"
        (let [created (users/create-user! ds {:mdmPersonId "mdm-person-002"
                                              :role "考务人员"
                                              :actorId "tester"})
              authorized (users/authorize! ds (:id created) {:modules ["等级认定" "文件传输"]
                                                             :permissionType "all"
                                                             :actorId "tester"})
              locked (users/set-status! ds (:id created) "locked" "tester")
              user-matches (:items (users/list-users ds {"q" "P100002"}))
              logs (db/query ds ["SELECT action FROM audit_log WHERE resource = 'app_user' AND resource_id = ? ORDER BY created_at" (:id created)])]
          (is (= "P100002" (:username created)))
          (is (= "李四" (:name created)))
          (is (= "exam_staff" (:role created)))
          (is (= 1 (count user-matches)))
          (is (= 2 (count (:permissions authorized))))
          (is (= "locked" (:status locked)))
          (is (= #{"create-user" "authorize-user" "lock-user"} (set (map :action logs))))))
      (finally
        (.close ds)))))
