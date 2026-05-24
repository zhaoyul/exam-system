(ns zhaoyul.exam-system-backend.web.middleware-role
  "Role-based authorization middleware for API endpoints.
   Checks that the authenticated user has one of the required roles."
  (:require
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn wrap-require-role
  "Middleware that restricts access to users with specific roles.
   `roles` is a set of allowed role keywords (e.g. #{\"group_admin\"}).
   Returns 403 if the user is not authenticated or lacks the required role."
  [handler roles]
  (fn [request]
    (if-let [user-role (get-in request [:auth/claims :role])]
      (if (contains? roles user-role)
        (handler request)
        (response/forbidden
         (str "权限不足: 需要角色 " (pr-str roles) "，当前角色 " user-role)))
      (response/unauthorized "未认证"))))

(defn wrap-require-org
  "Middleware that restricts access to users belonging to a specific org.
   `org-ids` is a set of allowed org_id values.
   Returns 403 if the user's org_id is not in the allowed set.
   group_admin (who has no org_id filter) is always allowed through."
  [handler org-ids]
  (fn [request]
    (let [user-role (get-in request [:auth/claims :role])
          user-org (get-in request [:auth/claims :org_id])]
      (if (= "group_admin" user-role)
        (handler request)
        (if (contains? org-ids user-org)
          (handler request)
          (response/forbidden
           (str "权限不足: 无权访问机构 " user-org " 的数据")))))))
