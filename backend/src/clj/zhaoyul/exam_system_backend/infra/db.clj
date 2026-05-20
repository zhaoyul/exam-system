(ns zhaoyul.exam-system-backend.infra.db
  (:require
   [cheshire.core :as json]
   [clojure.string :as str]
   [next.jdbc :as jdbc]
   [next.jdbc.result-set :as rs]))

(def opts
  {:builder-fn rs/as-unqualified-lower-maps})

(defn execute! [ds sql-params]
  (jdbc/execute! ds sql-params opts))

(defn execute-one! [ds sql-params]
  (jdbc/execute-one! ds sql-params opts))

(defn query [ds sql-params]
  (jdbc/execute! ds sql-params opts))

(defn uuid []
  (str (random-uuid)))

(defn json-str [value]
  (json/generate-string (or value {})))

(defn parse-json [value]
  (cond
    (nil? value) {}
    (map? value) value
    (str/blank? (str value)) {}
    :else (json/parse-string (str value) true)))
