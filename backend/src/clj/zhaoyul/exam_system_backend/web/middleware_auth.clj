(ns zhaoyul.exam-system-backend.web.middleware-auth
  (:require
   [zhaoyul.exam-system-backend.domain.auth :as auth]))

(defn wrap-auth-context [handler config]
  (fn [request]
    (let [claims (some->> (auth/bearer-token request)
                          (auth/verify-token config))]
      (handler (cond-> request claims (assoc :auth/claims claims))))))

(defn wrap-cors [handler config]
  (let [origin (get-in config [:cors :allowed-origins] "*")]
    (fn [request]
      (let [headers {"Access-Control-Allow-Origin" origin
                     "Access-Control-Allow-Headers" "authorization,content-type"
                     "Access-Control-Allow-Methods" "GET,POST,PUT,PATCH,DELETE,OPTIONS"}]
        (if (= :options (:request-method request))
          {:status 204 :headers headers :body ""}
          (update (handler request) :headers merge headers))))))
