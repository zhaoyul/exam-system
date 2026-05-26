(ns zhaoyul.exam-system-backend.archive-test
  (:require
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.archive :as archive]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_archive?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest archive-data-is-built-from-plan-candidates-scores-and-certificates
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (db/execute! ds ["INSERT INTO cgn_recog_plan (id, org_id, code, name, occupation, level, planned_month, exam_start_date, exam_end_date, candidate_count, status)
                        VALUES ('plan-archive-test', 'org-csyxgs', 'PLAN-ARCH-001', '档案归集测试计划', '核反应堆运行值班员', '三级', '2026-06', '2026-06-20', '2026-06-22', 1, 'completed')"])
      (db/execute! ds ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, occupation, level, status)
                        VALUES ('candidate-archive-001', 'org-csyxgs', 'CAN-ARCH-001', '陈小明', '440301199001011234', '核反应堆运行值班员', '三级', 'approved')"])
      (db/execute! ds ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, status)
                        VALUES ('reg-archive-001', 'org-csyxgs', 'REG-ARCH-001', 'plan-archive-test', 'candidate-archive-001', 'submitted')"])
      (db/execute! ds ["INSERT INTO cgn_score (id, org_id, code, plan_id, candidate_id, candidate_name, theory_score, skill_score, total_score, status)
                        VALUES ('score-archive-001', 'org-csyxgs', 'SCR-ARCH-001', 'plan-archive-test', 'candidate-archive-001', '陈小明', 86, 90, 88, 'locked')"])
      (db/execute! ds ["INSERT INTO cgn_certificate (id, org_id, code, cert_no, candidate_name, id_card, occupation, level, plan_id, issue_date, status)
                        VALUES ('cert-archive-001', 'org-csyxgs', 'CERT-ARCH-001', 'GD263000001', '陈小明', '440301199001011234', '核反应堆运行值班员', '三级', 'plan-archive-test', '2026-07-01', 'issued')"])
      (testing "archive list and candidate package expose closed-loop data"
        (let [archives (:items (archive/list-archives ds {"q" "档案归集"}))
              first-archive (first archives)
              candidates (:items (archive/list-candidates ds "plan-archive-test"))
              csv (archive/archive-csv ds "plan-archive-test")]
          (is (= 1 (count archives)))
          (is (= "已归档" (:status first-archive)))
          (is (= 1 (:count first-archive)))
          (is (= 1 (:certCount first-archive)))
          (is (= "GD263000001" (:certNo (first candidates))))
          (is (str/includes? csv "陈小明"))))
      (finally
        (.close ds)))))
