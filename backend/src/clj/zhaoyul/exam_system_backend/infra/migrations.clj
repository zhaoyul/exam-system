(ns zhaoyul.exam-system-backend.infra.migrations
  (:require
   [clojure.java.io :as io]
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.dialect :as dialect]
   [integrant.core :as ig]))

(def migrations
  ["001-init.up.sql"
   "002-domain-core.up.sql"
   "003-v2.0-core.up.sql"
   "004-numbering.up.sql"
   "004-scores.up.sql"
   "005-certificates.up.sql"
   "005-paper-demand.up.sql"
   "006-v3.0-core.up.sql"
   "007-paper-demand-v3-fields.up.sql"
   "008-exam-staff-eval-occupations.up.sql"
   "009-file-storage.up.sql"
   "010-system-users-mdm-permissions.up.sql"
   "011-exam-registration-import.up.sql"
   "012-finance-fees.up.sql"
   "013-file-workflow-fields.up.sql"])

(defn- split-statements [sql]
  (->> (str/split sql #"(?m)^\s*--;;\s*$")
       (map str/trim)
       (map #(str/replace % #";\s*$" ""))
       (remove str/blank?)))

(defn- ignorable-migration-error? [^Exception ex]
  (let [message (str/lower-case (or (.getMessage ex) ""))]
    (or (str/includes? message "duplicate column")
        (str/includes? message "already exists")
        (str/includes? message "重复")
        (str/includes? message "已存在"))))

(defn- execute-migration-statement! [ds statement]
  (try
    (db/execute! ds [statement])
    (catch Exception ex
      (when-not (ignorable-migration-error? ex)
        (throw ex)))))

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
        (execute-migration-statement! ds statement))
      (db/execute! ds ["INSERT INTO schema_migrations (id) VALUES (?)" migration])))
  {:status :migrated :count (count migrations)})

(defmethod ig/init-key ::migrations [_ {:keys [datasource config]}]
  (migrate! datasource config))
