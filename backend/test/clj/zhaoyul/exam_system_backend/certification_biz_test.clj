(ns zhaoyul.exam-system-backend.certification-biz-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.certification-biz-service :as biz]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_certification_biz?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest certification-work-items-and-review-flow
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (let [plan (resources/create-item! ds "certification-plans" {:name "待审核计划"
                                                                    :code "FLOW-001"
                                                                    :status "待审核"})]
        (testing "pending list supports resource query params"
          (let [result (biz/list-pending ds {"resource" "certification-plans" "status" "待审核"})]
            (is (= 1 (:total result)))
            (is (= (:id plan) (:id (first (:items result)))))))
        (testing "work items split todo and done"
          (is (= 1 (count (:items (biz/list-work-items ds {"scope" "todo"})))))
          (is (zero? (count (:items (biz/list-work-items ds {"scope" "done"}))))))
        (testing "review action moves item to done and writes history"
          (let [reviewed (biz/submit-review! ds {:module "certification-plans"
                                                 :id (:id plan)
                                                 :action "approved"
                                                 :comment "材料齐全"
                                                 :actor-id "tester"
                                                 :org-id "org-cgn"})
                history (biz/get-history ds "certification-plans" (:id plan))]
            (is (= "已通过" (:status reviewed)))
            (is (= 1 (count (:items (biz/list-work-items ds {"scope" "done"})))))
            (is (= "材料齐全" (:comment (first history)))))))
      (finally
        (.close ds)))))
