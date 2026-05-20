(ns zhaoyul.exam-system-backend.web.response)

(defn ok
  ([] (ok {}))
  ([body] {:status 200 :body body}))

(defn created [body]
  {:status 201 :body body})

(defn no-content []
  {:status 204 :body nil})

(defn bad-request [message]
  {:status 400 :body {:error "bad_request" :message message}})

(defn unauthorized
  ([] (unauthorized "未登录或登录已过期"))
  ([message] {:status 401 :body {:error "unauthorized" :message message}}))

(defn not-found
  ([] (not-found "资源不存在"))
  ([message] {:status 404 :body {:error "not_found" :message message}}))
