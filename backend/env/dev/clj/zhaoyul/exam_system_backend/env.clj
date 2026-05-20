(ns zhaoyul.exam-system-backend.env
  (:require
    [clojure.tools.logging :as log]
    [zhaoyul.exam-system-backend.dev-middleware :refer [wrap-dev]]))

(def defaults
  {:init       (fn []
                 (log/info "\n-=[exam-system-backend starting using the development or test profile]=-"))
   :start      (fn []
                 (log/info "\n-=[exam-system-backend started successfully using the development or test profile]=-"))
   :stop       (fn []
                 (log/info "\n-=[exam-system-backend has shut down successfully]=-"))
   :middleware wrap-dev
   :opts       {:profile       :dev}})
