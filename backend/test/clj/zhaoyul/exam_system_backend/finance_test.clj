(ns zhaoyul.exam-system-backend.finance-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.finance :as finance]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_finance?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest finance-charges-are-generated-from-registration-and-fee-standard
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (finance/save-standard! ds nil {:professionCode "6-28-01-01"
                                      :professionName "核反应堆运行值班员"
                                      :level1 600 :level2 500 :level3 400 :level4 300 :level5 200})
      (db/execute! ds ["INSERT INTO cgn_recog_plan (id, org_id, code, name, occupation, level, status)
                        VALUES ('plan-finance-test', 'org-csyxgs', 'PLAN-FIN-001', '收费测试计划', '核反应堆运行值班员', '三级', 'processing')"])
      (db/execute! ds ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, occupation, profession, level, status)
                        VALUES ('candidate-finance-001', 'org-csyxgs', 'CAN-FIN-001', '陈小明', '440301199001011234', '核反应堆运行值班员', '核反应堆运行值班员', '三级', 'approved')"])
      (db/execute! ds ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, status)
                        VALUES ('reg-finance-001', 'org-csyxgs', 'REG-FIN-001', 'plan-finance-test', 'candidate-finance-001', 'submitted')"])
      (testing "unpaid charge can be confirmed and refunded"
        (let [charges (:items (finance/list-charges ds {"q" "陈小明"}))
              charge (first charges)
              paid (finance/update-charge-status! ds (:id charge) "paid" "线上支付")
              refunded (finance/update-charge-status! ds (:id charge) "refunded" "退款")
              audit-actions (set (map :action (db/query ds ["SELECT action FROM audit_log WHERE resource = 'cgn_fee_charge'"])))]
          (is (= 1 (count charges)))
          (is (= 400.0 (:amount charge)))
          (is (= "paid" (:status paid)))
          (is (= "refunded" (:status refunded)))
          (is (contains? audit-actions "finance-paid"))
          (is (contains? audit-actions "finance-refunded"))))
      (finally
        (.close ds)))))
