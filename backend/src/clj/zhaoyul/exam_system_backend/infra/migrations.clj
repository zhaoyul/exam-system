(ns zhaoyul.exam-system-backend.infra.migrations
  (:require
   [clojure.java.io :as io]
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.dialect :as dialect]
   [integrant.core :as ig]))

(def migrations
  ["001-init.up.sql"
   "002-domain-core.up.sql"])

(defn- split-statements [sql]
  (->> (str/split sql #"(?m)^\s*--;;\s*$")
       (map str/trim)
       (map #(str/replace % #";\s*$" ""))
       (remove str/blank?)))

(defn- migration-applied? [ds migration]
  (try
    (boolean
     (db/execute-one! ds ["SELECT id FROM schema_migrations WHERE id = ?" migration]))
    (catch Exception _
      false)))

(defn- ensure-migration-table! [ds]
  (try
    (db/execute-one! ds ["SELECT id FROM schema_migrations WHERE 1 = 0"])
    (catch Exception _
      (db/execute! ds ["CREATE TABLE schema_migrations (id VARCHAR(160) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)"]))))

(defn migrate! [ds config]
  (ensure-migration-table! ds)
  (doseq [migration migrations
          :let [resource-path (str (dialect/migration-dir config) "/" migration)]
          :when (not (migration-applied? ds migration))]
    (let [sql (slurp (io/resource resource-path))]
      (doseq [statement (split-statements sql)]
        (db/execute! ds [statement]))
      (db/execute! ds ["INSERT INTO schema_migrations (id) VALUES (?)" migration])))
  {:status :migrated :count (count migrations)})

(defmethod ig/init-key ::migrations [_ {:keys [datasource config]}]
  (migrate! datasource config))
