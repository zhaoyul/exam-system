(ns zhaoyul.exam-system-backend.question-bank-test
  (:require
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.question-bank :as question-bank]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_question_bank?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest theory-questions-can-be-imported-exported-and-composed
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (testing "standard CSV import and export"
        (let [content (str "科目ID,知识结构,题型,难度,分值,正文,答案,解析,状态\n"
                           "subject-1,安全基础,单选,中等,1,安全第一的含义是什么？,A,坚持风险预控,valid\n"
                           "subject-1,安全基础,判断,简单,1,进入考场前应核验身份。,正确,制度要求,valid\n")
              result (question-bank/import-theory-questions! ds {:content content})
              exported (question-bank/export-theory-questions-csv ds {"q" "安全"})]
          (is (= 2 (:imported result)))
          (is (= 0 (:failed result)))
          (is (str/includes? exported "安全第一的含义是什么？"))))
      (testing "minimal paper engine generates paper-library item"
        (let [_multi (resources/create-item! ds "theory-questions" {:subjectId "subject-1"
                                                                     :knowledge "安全基础"
                                                                     :type "多选"
                                                                     :difficulty "中等"
                                                                     :score 2
                                                                     :content "安全措施包括哪些？"
                                                                     :answer "AB"
                                                                     :status "valid"})
              rule (resources/create-item! ds "theory-paper-rules" {:name "安全基础组卷规则"
                                                                     :subjectId "subject-1"
                                                                     :singleCount 1
                                                                     :multiCount 1
                                                                     :judgeCount 1
                                                                     :singleScore 1
                                                                     :multiScore 2
                                                                     :judgeScore 1
                                                                     :duration 90
                                                                     :status "active"})
              paper (question-bank/generate-theory-paper! ds (:id rule) {:seed 42})]
          (is (= "题库组卷" (:composeMode paper)))
          (is (= 3 (:questionCount paper)))
          (is (= 4.0 (:totalScore paper)))
          (is (= 3 (count (:items (question-bank/paper-questions ds (:id paper))))))))
      (finally
        (.close ds)))))
