(ns zhaoyul.exam-system-backend.infra.datasource
  (:require
   [clojure.java.io :as io]
   [zhaoyul.exam-system-backend.infra.dialect :as dialect]
   [integrant.core :as ig])
  (:import
   [com.zaxxer.hikari HikariConfig HikariDataSource]))

(defn- ensure-sqlite-dir! [jdbc-url]
  (when-let [[_ path] (re-matches #"jdbc:sqlite:(.+)" jdbc-url)]
    (when-not (contains? #{"::memory:" ":memory:"} path)
      (when-let [parent (.getParentFile (io/file path))]
        (.mkdirs parent)))))

(defn make-datasource [config]
  (let [{:keys [driver-class jdbc-url username password]} (:database config)
        hikari-config (HikariConfig.)]
    (ensure-sqlite-dir! jdbc-url)
    (.setPoolName hikari-config "exam-system-db")
    (.setDriverClassName hikari-config driver-class)
    (.setJdbcUrl hikari-config jdbc-url)
    (when (seq username)
      (.setUsername hikari-config username))
    (when (seq password)
      (.setPassword hikari-config password))
    (when (dialect/sqlite? config)
      (.setMaximumPoolSize hikari-config 1)
      (.setConnectionInitSql hikari-config "PRAGMA foreign_keys=ON"))
    (HikariDataSource. hikari-config)))

(defmethod ig/init-key ::datasource [_ {:keys [config]}]
  (make-datasource config))

(defmethod ig/halt-key! ::datasource [_ datasource]
  (.close datasource))
