(ns zhaoyul.exam-system-backend.file-workflow-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.files :as files]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_file_workflow?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest distribution-send-creates-receive-records-and-feedback-stats
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (testing "send distribution creates recipient receive records and read feedback updates distribution"
        (let [created (files/create-distribution! ds {:title "认定工作通知"
                                                      :org "大亚湾核电、阳江核电"
                                                      :type "通知"
                                                      :sender "集团评价中心"
                                                      :status "draft"})
              sent (files/send-distribution! ds (:id created))
              receives (:items (files/list-receives ds {:distribution-id (:id created)}))
              first-receive (first receives)
              read (files/mark-receive-read! ds (:id first-receive) "已阅知")
              refreshed (files/get-distribution ds (:id created))
              audit-actions (set (map :action (db/query ds ["SELECT action FROM audit_log WHERE resource IN ('cgn_doc_distribution','cgn_doc_receive')"])))]
          (is (= "sent" (:status sent)))
          (is (= 2 (:recipientCount sent)))
          (is (= 2 (count receives)))
          (is (= "read" (:status read)))
          (is (= 1 (:readCount refreshed)))
          (is (= 1 (:feedbackCount refreshed)))
          (is (contains? audit-actions "file-distribution-send"))
          (is (contains? audit-actions "file-receive-read"))))
      (finally
        (.close ds)))))
