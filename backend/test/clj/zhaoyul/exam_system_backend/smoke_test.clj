(ns zhaoyul.exam-system-backend.smoke-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.domain.seed :as seed]
   [zhaoyul.exam-system-backend.infra.datasource :as datasource]
   [zhaoyul.exam-system-backend.infra.migrations :as migrations]))

(def test-config
  {:database {:profile :sqlite
              :driver-class "org.sqlite.JDBC"
              :jdbc-url "jdbc:sqlite:file:exam_system_smoke?mode=memory&cache=shared"
              :username ""
              :password ""}})

(deftest smoke-test
  (let [ds (datasource/make-datasource test-config)]
    (try
      (migrations/migrate! ds test-config)
      (seed/seed! ds)
      (testing "seeded login users"
        (let [user (auth/find-user ds "Csyxgs001")]
          (is (= "branch_admin" (:role user)))
          (is (auth/password-valid? user "cs@13311331"))))
      (testing "generic resources"
        (is (= 1 (:total (resources/list-items ds "exam-rooms" {}))))
        (let [created (resources/create-item! ds "registration-orgs" {:name "烟台报名点" :loginName "yt001"})]
          (is (:id created))
          (is (= "烟台报名点" (:name (resources/get-item ds "registration-orgs" (:id created)))))))
      (finally
        (.close ds)))))
