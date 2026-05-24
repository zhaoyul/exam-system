(ns zhaoyul.exam-system-backend.web.controllers.exam-registration
  "考试报名 API — 批次管理 + 导入 + 照片"
  (:require
   [zhaoyul.exam-system-backend.domain.exam-registration :as domain]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── Registration Plans ───

(defn list-plans [{:keys [datasource]} request]
  (response/ok (domain/list-registration-plans datasource (:query-params request))))

(defn get-plan [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (if-let [plan (domain/plan-registration-status datasource plan-id)]
      (response/ok plan)
      (response/not-found))))

;; ─── Batches ───

(defn list-batches [{:keys [datasource]} _request]
  (response/ok (domain/list-batches datasource {})))

(defn list-plan-batches [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        query (:query-params request)]
    (response/ok (domain/list-batches datasource (assoc query :plan-id plan-id)))))

(defn create-batch [{:keys [datasource]} request]
  (response/created (domain/create-batch! datasource (:body-params request))))

(defn get-batch [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :batch-id])]
    (if-let [batch (domain/get-batch datasource batch-id)]
      (response/ok batch)
      (response/not-found))))

(defn update-batch [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :batch-id])]
    (if-let [batch (domain/update-batch! datasource batch-id (:body-params request))]
      (response/ok batch)
      (response/not-found))))

(defn delete-batch [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :batch-id])]
    (if (domain/delete-batch! datasource batch-id)
      (response/no-content)
      (response/not-found))))

(defn end-batch [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :batch-id])]
    (if-let [batch (domain/batch-end-registration! datasource batch-id)]
      (response/ok batch)
      (response/not-found))))

;; ─── Import / Photo ───

(defn import-excel [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        batch-id (:batchId body)]
    (if (and plan-id batch-id)
      (response/ok (domain/import-excel! datasource plan-id batch-id body))
      (response/bad-request "plan_id and batch_id are required"))))

(defn import-photos [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        batch-id (:batchId body)]
    (response/ok (domain/update-photo-status! datasource plan-id batch-id body))))

;; ─── Plan Status ───

(defn get-full-status [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (if-let [status (domain/plan-registration-status datasource plan-id)]
      (response/ok status)
      (response/not-found))))
