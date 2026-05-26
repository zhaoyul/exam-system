(ns zhaoyul.exam-system-backend.file-storage-test
  (:require
   [clojure.java.io :as io]
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.files :as files]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_file_storage?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest uploaded-file-is-stored-and-indexed
  (let [ds (datasource/make-datasource test-config)
        upload-dir (str (System/getProperty "java.io.tmpdir") "/exam-system-file-storage-test")
        source (java.io.File/createTempFile "exam-system-upload" ".txt")]
    (try
      (spit source "file-storage-ok")
      (migrations/migrate! ds test-config)
      (testing "upload writes cgn_doc_file metadata and local file"
        (let [created (files/create-uploaded-doc-file!
                       ds
                       upload-dir
                       {:file {:filename "证明文件.txt"
                               :content-type "text/plain"
                               :tempfile source
                               :size (.length source)}
                        :org-id "org-csyxgs"
                        :owner "tester"
                        :category "proof"})
              stored (files/stored-file upload-dir created)]
          (is (:id created))
          (is (= "org-csyxgs" (:orgId created)))
          (is (= "证明文件.txt" (:name created)))
          (is (= "text/plain" (:mimeType created)))
          (is (= "proof" (:category created)))
          (is (= "org" (:visibility created)))
          (is (= "file-storage-ok" (slurp stored)))
          (is (= 1 (count (:items (files/list-doc-files ds {:org-id "org-csyxgs"})))))))
      (finally
        (.delete source)
        (.close ds)))))
