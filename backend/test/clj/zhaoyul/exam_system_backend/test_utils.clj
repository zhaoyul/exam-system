(ns zhaoyul.exam-system-backend.test-utils
  (:require
    [cheshire.core :as json]
    [zhaoyul.exam-system-backend.core :as core]
    [peridot.core :as p]
    [byte-streams :as bs]
    [integrant.repl.state :as state]))

(defn system-state
  []
  (or @core/system state/system))

(defn system-fixture
  []
  (fn [f]
    (when (nil? (system-state))
      (core/start-app {:opts {:profile :test}}))
    (f)
    (core/stop-app)))

(defn get-response [ctx]
  (-> ctx
      :response
      (update :body (fnil bs/to-string ""))))

(defn GET [app path params headers]
  (-> (p/session app)
      (p/request path
                 :request-method :get
                 :content-type "application/edn"
                 :headers headers
                 :params params)
      (get-response)))

(defn request-json [app method path body headers]
  (-> (p/session app)
      (p/request path
                 :request-method method
                 :content-type "application/json"
                 :headers headers
                 :body (json/generate-string body))
      (get-response)))

(defn POST [app path body headers]
  (request-json app :post path body headers))

(defn PUT [app path body headers]
  (request-json app :put path body headers))

(defn DELETE [app path headers]
  (-> (p/session app)
      (p/request path
                 :request-method :delete
                 :headers headers)
      (get-response)))
