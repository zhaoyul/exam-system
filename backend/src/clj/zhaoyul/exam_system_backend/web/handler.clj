(ns zhaoyul.exam-system-backend.web.handler
  (:require
   [clojure.string :as str]
   [integrant.core :as ig]
   [reitit.ring :as ring]
   [reitit.swagger-ui :as swagger-ui]
   [ring.util.response :as response]
   [zhaoyul.exam-system-backend.web.middleware.core :as middleware]))

(defn- api-request? [request]
  (str/starts-with? (:uri request) "/api"))

(defn- spa-index-response []
  (or (some-> (response/resource-response "public/index.html")
              (response/content-type "text/html; charset=utf-8"))
      (-> {:status 404, :body "Page not found"}
          (response/content-type "text/plain"))))

(defn- not-found-handler [request]
  (if (api-request? request)
    (-> {:status 404, :body "Page not found"}
        (response/content-type "text/plain"))
    (spa-index-response)))

(defmethod ig/init-key :handler/ring
  [_ {:keys [router api-path] :as opts}]
  (ring/ring-handler
   (router)
    (ring/routes
     ;; Handle trailing slash in routes - add it + redirect to it
     ;; https://github.com/metosin/reitit/blob/master/doc/ring/slash_handler.md
     (ring/redirect-trailing-slash-handler)
     (ring/create-resource-handler {:path "/"})
     (when (some? api-path)
       (swagger-ui/create-swagger-ui-handler {:path api-path
                                              :url  (str api-path "/swagger.json")}))
     (ring/create-default-handler
      {:not-found not-found-handler
       :method-not-allowed
       (constantly (-> {:status 405, :body "Not allowed"}
                       (response/content-type "text/plain")))
       :not-acceptable
       (constantly (-> {:status 406, :body "Not acceptable"}
                       (response/content-type "text/plain")))}))
    {:middleware [(middleware/wrap-base opts)]}))

(defmethod ig/init-key :router/routes
  [_ {:keys [routes]}]
  (mapv (fn [route]
          (if (fn? route)
            (route)
            route))
        routes))

(defmethod ig/init-key :router/core
  [_ {:keys [routes env] :as opts}]
  (if (= env :dev)
    #(ring/router ["" opts routes])
    (constantly (ring/router ["" opts routes]))))
