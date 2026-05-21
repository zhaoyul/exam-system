(ns zhaoyul.exam-system-backend.web.controllers.personal
  "个人中心 API — 个人报名/成绩查询/证书查询/准考证"
  (:require
   [zhaoyul.exam-system-backend.domain.personal :as personal]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 个人报名 ───

(defn list-register [{:keys [datasource]} request]
  (response/ok (personal/list-registrations datasource (:query-params request))))

(defn get-register [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (personal/get-registration datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-register [{:keys [datasource]} request]
  (response/created (personal/create-registration! datasource (:body-params request))))

(defn update-register [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (personal/update-registration! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-register [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (personal/delete-registration! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 成绩查询 (只读) ───

(defn list-score [{:keys [datasource]} request]
  (response/ok (personal/list-scores datasource (:query-params request))))

(defn get-score [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (personal/get-score datasource id)]
      (response/ok item)
      (response/not-found))))

;; ─── 证书查询 (只读) ───

(defn list-cert [{:keys [datasource]} request]
  (response/ok (personal/list-certificates datasource (:query-params request))))

(defn get-cert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (personal/get-certificate datasource id)]
      (response/ok item)
      (response/not-found))))

;; ─── 准考证 (只读) ───

(defn list-ticket [{:keys [datasource]} request]
  (response/ok (personal/list-tickets datasource (:query-params request))))

(defn get-ticket [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (personal/get-ticket datasource id)]
      (response/ok item)
      (response/not-found))))
