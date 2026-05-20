(ns zhaoyul.exam-system-backend.infra.dialect
  (:require
   [clojure.string :as str]))

(defn profile [config]
  (let [value (or (get-in config [:database :profile]) :sqlite)]
    (if (keyword? value) value (keyword (str/lower-case (str value))))))

(defn sqlite? [config]
  (= :sqlite (profile config)))

(defn dm? [config]
  (contains? #{:dm :dameng} (profile config)))

(defn migration-dir [config]
  (case (profile config)
    :dm "migrations/dm"
    :dameng "migrations/dm"
    "migrations/sqlite"))

(defn now-sql [config]
  (if (dm? config) "CURRENT_TIMESTAMP" "CURRENT_TIMESTAMP"))

(defn normalize-status [status]
  (let [value (some-> status str str/trim)]
    (if (seq value) value "active")))
