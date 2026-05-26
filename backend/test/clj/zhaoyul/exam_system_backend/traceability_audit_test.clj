(ns zhaoyul.exam-system-backend.traceability-audit-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.domain.traceability :as trace]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_traceability_audit?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest audit-events-expose-generic-resource-history
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (testing "resource operations are returned as traceable audit events"
        (let [created (resources/create-item! ds "certification-plans" {:name "溯源审计计划" :status "draft"})
              _approved (resources/apply-item-action! ds "certification-plans" (:id created) "approve" {:reason "资料齐全"})
              result (trace/list-audit-events ds {"resource" "certification-plans"
                                                  "limit" "20"})
              actions (set (map :action (:items result)))
              approve-event (first (filter #(= "action-approve" (:action %)) (:items result)))]
          (is (pos? (:total result)))
          (is (contains? actions "create-resource"))
          (is (contains? actions "action-approve"))
          (is (= "certification-plans" (:resource approve-event)))
          (is (= (:id created) (:resourceId approve-event)))
          (is (re-find #"资料齐全" (:detail approve-event)))))
      (finally
        (.close ds)))))
