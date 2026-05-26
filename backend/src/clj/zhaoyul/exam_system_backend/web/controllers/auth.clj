(ns zhaoyul.exam-system-backend.web.controllers.auth
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn login [{:keys [datasource config]} request]
  (let [{:keys [username password]} (:body-params request)
        user (when username (auth/find-user datasource username))]
    (if (and user (= "active" (:status user)) (auth/password-valid? user password))
      (response/ok {:token (auth/issue-token config user)
                    :user (auth/public-user user)})
      (response/unauthorized "账号或密码错误"))))

(defn login-4a [{:keys [datasource config]} request]
  (let [{:keys [username]} (:body-params request)
        user (when username (auth/ensure-4a-user! datasource username))]
    (if (and user (= "active" (:status user)))
      (response/ok {:token (auth/issue-token config user)
                    :user (assoc (auth/public-user user)
                                 :authProvider "4A"
                                 :passwordManagedExternally true)})
      (response/unauthorized "4A账号不存在或已停用"))))

(defn- request-value [request key]
  (or (get-in request [:body-params key])
      (get-in request [:query-params (name key)])
      (get-in request [:query-params key])))

(defn- mock-ticket->username [ticket]
  (let [ticket (str ticket)]
    (cond
      (str/starts-with? ticket "mock:") (subs ticket 5)
      (str/includes? ticket "@") (first (str/split ticket #"@"))
      (seq ticket) ticket)))

(defn callback-4a [{:keys [datasource config]} request]
  (let [username (or (request-value request :username)
                     (request-value request :account)
                     (mock-ticket->username (or (request-value request :ticket)
                                                (request-value request :code))))
        user (when (seq username) (auth/ensure-4a-user! datasource username))]
    (if (and user (= "active" (:status user)))
      (response/ok {:token (auth/issue-token config user)
                    :user (assoc (auth/public-user user)
                                 :authProvider "4A"
                                 :passwordManagedExternally true)
                    :callbackMode "mock-compatible"})
      (response/unauthorized "4A回调票据无效或账号未授权"))))

(defn me [{:keys [datasource]} request]
  (if-let [username (get-in request [:auth/claims :username])]
    (if-let [user (auth/find-user datasource username)]
      (response/ok {:user (auth/public-user user)})
      (response/unauthorized))
    (response/unauthorized)))
