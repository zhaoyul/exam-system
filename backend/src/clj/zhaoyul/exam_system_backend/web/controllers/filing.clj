(ns zhaoyul.exam-system-backend.web.controllers.filing
  "备案管理 API — 集团备案/分支备案/省级备案"
  (:require
   [zhaoyul.exam-system-backend.domain.filing :as filing]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 集团备案 ───

(defn list-filing-group [{:keys [datasource]} request]
  (let [items (filing/list-filings datasource (assoc (:query-params request) :filing-type "group"))]
    (response/ok items)))

(defn get-filing-group [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (filing/get-filing datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-filing-group [{:keys [datasource]} request]
  (response/created
   (filing/create-filing! datasource (assoc (:body-params request) :filingType "group"))))

(defn update-filing-group [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (filing/update-filing! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-filing-group [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (filing/delete-filing! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 分支备案 ───

(defn list-filing-branch [{:keys [datasource]} request]
  (let [items (filing/list-filings datasource (assoc (:query-params request) :filing-type "branch"))]
    (response/ok items)))

(defn get-filing-branch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (filing/get-filing datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-filing-branch [{:keys [datasource]} request]
  (response/created
   (filing/create-filing! datasource (assoc (:body-params request) :filingType "branch"))))

(defn update-filing-branch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (filing/update-filing! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-filing-branch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (filing/delete-filing! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 省级备案 (resource_item) ───

(defn list-filing-province [{:keys [datasource]} request]
  (response/ok (resources/list-items datasource "filing-province" (:query-params request))))

(defn get-filing-province [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (resources/get-item datasource "filing-province" id)]
      (response/ok item)
      (response/not-found))))

(defn create-filing-province [{:keys [datasource]} request]
  (response/created (resources/create-item! datasource "filing-province" (:body-params request))))

(defn update-filing-province [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (resources/update-item! datasource "filing-province" id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-filing-province [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (resources/delete-item! datasource "filing-province" id)
      (response/no-content)
      (response/not-found))))
