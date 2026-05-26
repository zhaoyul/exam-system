(ns zhaoyul.exam-system-backend.personal-flow-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.personal :as personal]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_personal_flow?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest personal-registration-and-query-use-core-business-tables
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (db/execute! ds ["INSERT INTO cgn_recog_plan (id, org_id, code, name, occupation, level, status)
                        VALUES ('plan-personal-test', 'org-csyxgs', 'PLAN-PER-001', '个人报名测试计划', '核反应堆运行值班员', '三级', 'processing')"])
      (testing "self registration creates candidate and registration records"
        (let [created (personal/create-registration! ds {:planId "plan-personal-test"
                                                         :name "陈小明"
                                                         :idCard "440301199001011234"
                                                         :phone "13800138201"
                                                         :org "测试有限公司"
                                                         :occupation "核反应堆运行值班员"
                                                         :level "三级"
                                                         :edu "本科"
                                                         :workYears "5"})
              regs (:items (personal/list-registrations ds {"idCard" "440301199001011234"}))
              candidate-id (:candidateId created)]
          (is (= "submitted" (:status created)))
          (is (= 1 (count regs)))
          (is (= "陈小明" (:candidateName (first regs))))
          (db/execute! ds ["INSERT INTO cgn_score (id, org_id, code, plan_id, candidate_id, candidate_name, theory_score, skill_score, total_score, status)
                            VALUES ('score-personal-001', 'org-csyxgs', 'SCR-PER-001', 'plan-personal-test', ?, '陈小明', 86, 90, 88, 'locked')" candidate-id])
          (db/execute! ds ["INSERT INTO cgn_certificate (id, org_id, code, cert_no, candidate_name, id_card, occupation, level, plan_id, issue_date, status)
                            VALUES ('cert-personal-001', 'org-csyxgs', 'CERT-PER-001', 'GD263000088', '陈小明', '440301199001011234', '核反应堆运行值班员', '三级', 'plan-personal-test', '2026-07-01', 'issued')"])
          (is (= 88.0 (:totalScore (first (:items (personal/list-scores ds {"idCard" "440301199001011234"}))))))
          (is (= "GD263000088" (:certNo (first (:items (personal/list-certificates ds {:id-card "440301199001011234"}))))))))
      (finally
        (.close ds)))))
