(ns zhaoyul.exam-system-backend.env
  (:require [clojure.tools.logging :as log]))

(def defaults
  {:init       (fn []
                 (log/info "\n-=[exam-system-backend starting]=-"))
   :start      (fn []
                 (log/info "\n-=[exam-system-backend started successfully]=-"))
   :stop       (fn []
                 (log/info "\n-=[exam-system-backend has shut down successfully]=-"))
   :middleware (fn [handler _] handler)
   :opts       {:profile :prod}})
