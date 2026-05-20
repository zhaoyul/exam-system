(ns zhaoyul.exam-system-backend.core
  (:require
   [clojure.tools.logging :as log]
   [integrant.core :as ig]
   [zhaoyul.exam-system-backend.config :as config]
   [zhaoyul.exam-system-backend.env :refer [defaults]]

    ;; Edges
   [kit.edge.server.undertow]
   [zhaoyul.exam-system-backend.domain.seed]
   [zhaoyul.exam-system-backend.infra.datasource]
   [zhaoyul.exam-system-backend.infra.migrations]
   [zhaoyul.exam-system-backend.web.handler]

    ;; Routes
   [zhaoyul.exam-system-backend.web.routes.api])
  (:gen-class))

;; log uncaught exceptions in threads
(Thread/setDefaultUncaughtExceptionHandler
 (fn [thread ex]
   (log/error {:what :uncaught-exception
               :exception ex
               :where (str "Uncaught exception on" (.getName thread))})))

(defonce system (atom nil))

(defn stop-app []
  ((or (:stop defaults) (fn [])))
  (some-> (deref system) (ig/halt!)))

(defn start-app [& [params]]
  ((or (:start params) (:start defaults) (fn [])))
  (->> (config/system-config (or (:opts params) (:opts defaults) {}))
       (ig/expand)
       (ig/init)
       (reset! system)))

(defn -main [& _]
  (start-app)
  (.addShutdownHook (Runtime/getRuntime) (Thread. (fn [] (stop-app) (shutdown-agents)))))
