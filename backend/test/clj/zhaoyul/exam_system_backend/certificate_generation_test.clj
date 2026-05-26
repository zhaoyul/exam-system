(ns zhaoyul.exam-system-backend.certificate-generation-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.certificate :as certificate]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_certificate_generation?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest certificates-can-be-generated-from-passed-plan-scores
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (db/execute! ds ["INSERT INTO cgn_recog_plan (id, org_id, code, name, occupation, level, status)
                        VALUES ('plan-cert-test', 'org-csyxgs', 'PLAN-CERT-001', '证书生成测试计划', '核反应堆运行值班员', '三级', 'processing')"])
      (doseq [[id name id-card total] [["candidate-cert-001" "陈小明" "440301199001011234" 88.0]
                                       ["candidate-cert-002" "赵小红" "440301199105152345" 81.5]
                                       ["candidate-cert-003" "周文博" "440301198512055678" 93.5]]]
        (db/execute! ds ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, occupation, profession, level, status)
                          VALUES (?, 'org-csyxgs', ?, ?, ?, '核反应堆运行值班员', '核反应堆运行值班员', '三级', 'approved')"
                         id (str "CAN-" id) name id-card])
        (db/execute! ds ["INSERT INTO cgn_score (id, org_id, code, plan_id, candidate_id, candidate_name, theory_score, skill_score, total_score, status)
                          VALUES (?, 'org-csyxgs', ?, 'plan-cert-test', ?, ?, ?, ?, ?, 'draft')"
                         (str "score-" id) (str "SCR-" id) id name total total total]))
      (testing "passed scores generate certificates and repeated generation skips existing id cards"
        (let [first-result (certificate/generate-plan-certificates! ds {:plan-id "plan-cert-test"
                                                                        :issue-date "2026-07-20"
                                                                        :site-code "GD"
                                                                        :year 2026})
              second-result (certificate/generate-plan-certificates! ds {:plan-id "plan-cert-test"
                                                                         :issue-date "2026-07-20"
                                                                         :site-code "GD"
                                                                         :year 2026})
              certs (certificate/list-certificates ds {:q "陈小明"})]
          (is (= 3 (:count first-result)))
          (is (= 0 (:count second-result)))
          (is (= 3 (:skipped second-result)))
          (is (= 1 (:total certs)))
          (is (re-matches #"GD263\d{6}" (:cert_no (first (:items certs)))))))
      (finally
        (.close ds)))))
