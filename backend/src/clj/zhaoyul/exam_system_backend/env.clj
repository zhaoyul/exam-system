(ns zhaoyul.exam-system-backend.env
  (:require [ring.middleware.keyword-params :as keyword-params]
            [ring.middleware.nested-params :as nested-params]
            [ring.middleware.params :as params]))

(def defaults
  {:start (fn [])
   :stop  (fn [])
   :opts  {}
   :middleware (fn [handler _opts]
                 (-> handler
                     keyword-params/wrap-keyword-params
                     nested-params/wrap-nested-params
                     params/wrap-params))})
