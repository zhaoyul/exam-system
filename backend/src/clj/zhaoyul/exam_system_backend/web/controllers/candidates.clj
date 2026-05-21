(ns zhaoyul.exam-system-backend.web.controllers.candidates
  "考生管理 API — 考生档案/报名记录"
  (:require
   [zhaoyul.exam-system-backend.domain.candidates :as candidates]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 考生档案 ───

(defn list-candidates [{:keys [datasource]} request]
  (response/ok (candidates/list-candidates datasource (:query-params request))))

(defn get-candidate [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (candidates/get-candidate datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-candidate [{:keys [datasource]} request]
  (response/created (candidates/create-candidate! datasource (:body-params request))))

(defn update-candidate [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (candidates/update-candidate! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-candidate [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (candidates/delete-candidate! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 报名记录 ───

(defn list-registrations [{:keys [datasource]} request]
  (response/ok (candidates/list-registrations datasource (:query-params request))))

(defn get-registration [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (candidates/get-registration datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-registration [{:keys [datasource]} request]
  (response/created (candidates/create-registration! datasource (:body-params request))))

(defn update-registration [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (candidates/update-registration! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-registration [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (candidates/delete-registration! datasource id)
      (response/no-content)
      (response/not-found))))
