(ns zhaoyul.exam-system-backend.exam-registration-import-test
  (:require
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.exam-registration :as registration]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_registration_import?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest candidate-template-import-and-photo-status
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (db/execute! ds ["INSERT INTO cgn_exam_reg_batch (id, org_id, plan_id, name, profession, level)
                        VALUES ('batch-import-001', 'org-csyxgs', 'plan-import-001', '导入批次', '核反应堆运行值班员', '三级')"])
      (testing "template is CSV and import supports cover mode"
        (is (str/starts-with? (registration/candidate-template-csv) "姓名,性别,证件号码"))
        (let [content (str "姓名,性别,证件号码,手机号,邮箱,学历,工作单位,部门,岗位,工作年限,职业工种,等级,申报条件编号\n"
                           "导入甲,男,440301199001011111,13800138011,a@example.com,本科,大亚湾核电,运行一部,操作员,8,核反应堆运行值班员,三级,1\n")
              result (registration/import-excel! ds "plan-import-001" "batch-import-001" {:mode "cover" :content content})
              batch (registration/get-batch ds "batch-import-001")]
          (is (= 1 (:imported result)))
          (is (= 0 (:failed result)))
          (is (= 1 (:candidateCount batch)))
          (is (= "cover" (:importMode batch)))))
      (testing "ignore mode skips duplicate id card"
        (let [content (str "姓名,性别,证件号码,手机号,邮箱,学历,工作单位,部门,岗位,工作年限,职业工种,等级,申报条件编号\n"
                           "导入甲改名,男,440301199001011111,13800138011,a@example.com,本科,大亚湾核电,运行一部,操作员,8,核反应堆运行值班员,三级,1\n")
              result (registration/import-excel! ds "plan-import-001" "batch-import-001" {:mode "ignore" :content content})]
          (is (= 0 (:imported result)))
          (is (= 1 (:skipped result)))))
      (testing "photo upload marks candidate and registration"
        (let [candidate-id (:id (db/execute-one! ds ["SELECT id FROM cgn_candidate WHERE id_card = '440301199001011111'"]))
              result (registration/update-photo-status! ds "plan-import-001" "batch-import-001" {:candidateIds [candidate-id]})
              candidate (db/execute-one! ds ["SELECT photo_status FROM cgn_candidate WHERE id = ?" candidate-id])
              reg (db/execute-one! ds ["SELECT photo_uploaded FROM cgn_candidate_reg WHERE candidate_id = ?" candidate-id])]
          (is (= 1 (:updated result)))
          (is (= "uploaded" (:photo_status candidate)))
          (is (= 1 (:photo_uploaded reg)))))
      (finally
        (.close ds)))))
