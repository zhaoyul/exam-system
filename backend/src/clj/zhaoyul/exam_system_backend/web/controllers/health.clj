(ns zhaoyul.exam-system-backend.web.controllers.health
  (:require
    [clojure.java.io :as io]
    [ring.util.http-response :as http-response])
  (:import
    [java.util Date Properties]))

(defn- read-build-info []
  (try
    (let [props (Properties.)
          url   (or (io/resource "version.properties")
                    (let [f (io/file "target/classes/version.properties")]
                      (when (.exists f) (.toURL f))))]
      (when url
        (with-open [rdr (io/reader url)]
          (.load props rdr))
        {:version    (.getProperty props "version" "unknown")
         :buildTime  (.getProperty props "build.time" "unknown")
         :gitCommit  (.getProperty props "git.commit" "unknown")}))
    (catch Exception _
      {:version "unknown" :buildTime "unknown" :gitCommit "unknown"})))

(defn healthcheck!
  [req]
  (http-response/ok
    {:time     (str (Date. (System/currentTimeMillis)))
     :up-since (str (Date. (.getStartTime (java.lang.management.ManagementFactory/getRuntimeMXBean))))
     :app      {:status  "up"
                :message ""}
     :build    (or (read-build-info)
                   {:version "unknown" :buildTime "unknown" :gitCommit "unknown"})}))
