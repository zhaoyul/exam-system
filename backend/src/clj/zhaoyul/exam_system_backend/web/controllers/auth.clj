(ns zhaoyul.exam-system-backend.web.controllers.auth
  (:require
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
        user (when username (auth/find-user datasource username))]
    (if (and user (= "active" (:status user)))
      (response/ok {:token (auth/issue-token config user)
                    :user (assoc (auth/public-user user)
                                 :authProvider "4A"
                                 :passwordManagedExternally true)})
      (response/unauthorized "4A账号不存在或已停用"))))

(defn me [{:keys [datasource]} request]
  (if-let [username (get-in request [:auth/claims :username])]
    (if-let [user (auth/find-user datasource username)]
      (response/ok {:user (auth/public-user user)})
      (response/unauthorized))
    (response/unauthorized)))
