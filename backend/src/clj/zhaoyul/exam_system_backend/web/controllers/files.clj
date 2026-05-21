(ns zhaoyul.exam-system-backend.web.controllers.files
  "文件管理 API — 文档分发/文档接收/文档阅览/私有文档/参数设置"
  (:require
   [zhaoyul.exam-system-backend.domain.files :as files]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 文档分发 ───

(defn list-distribute [{:keys [datasource]} request]
  (response/ok (files/list-distributions datasource (:query-params request))))

(defn get-distribute [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-distribution datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-distribute [{:keys [datasource]} request]
  (response/created (files/create-distribution! datasource (:body-params request))))

(defn update-distribute [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/update-distribution! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-distribute [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (files/delete-distribution! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 文档接收 ───

(defn list-receive [{:keys [datasource]} request]
  (response/ok (files/list-receives datasource (:query-params request))))

(defn get-receive [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-receive datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-receive [{:keys [datasource]} request]
  (response/created (files/create-receive! datasource (:body-params request))))

(defn update-receive [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/update-receive! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-receive [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (files/delete-receive! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 文档阅览 (只读) ───

(defn list-viewer [{:keys [datasource]} request]
  (response/ok (files/list-viewers datasource (:query-params request))))

(defn get-viewer [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-viewer datasource id)]
      (response/ok item)
      (response/not-found))))

;; ─── 私有文档 ───

(defn list-private [{:keys [datasource]} request]
  (response/ok (files/list-private datasource (:query-params request))))

(defn get-private [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-private datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-private [{:keys [datasource]} request]
  (response/created (files/create-private! datasource (:body-params request))))

(defn update-private [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/update-private! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-private [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (files/delete-private! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 参数设置 ───

(defn list-settings [{:keys [datasource]} request]
  (response/ok (files/list-settings datasource (:query-params request))))

(defn get-settings [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-setting datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-settings [{:keys [datasource]} request]
  (response/created (files/create-setting! datasource (:body-params request))))

(defn update-settings [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/update-setting! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-settings [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (files/delete-setting! datasource id)
      (response/no-content)
      (response/not-found))))
