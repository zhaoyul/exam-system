(ns zhaoyul.exam-system-backend.resource-audit-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_resource_audit?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest generic-resource-operations-write-audit-log
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (testing "create update item action and delete are audited"
        (let [created (resources/create-item! ds "certification-plans" {:name "审计测试计划" :status "draft"})
              _updated (resources/update-item! ds "certification-plans" (:id created) {:status "submitted"})
              _approved (resources/apply-item-action! ds "certification-plans" (:id created) "approve" {})
              _deleted (resources/delete-item! ds "certification-plans" (:id created))
              actions (set (map :action (db/query ds ["SELECT action FROM audit_log WHERE resource = ?"
                                                       "certification-plans"])))]
          (is (contains? actions "create-resource"))
          (is (contains? actions "update-resource"))
          (is (contains? actions "action-approve"))
          (is (contains? actions "delete-resource"))))
      (finally
        (.close ds)))))
