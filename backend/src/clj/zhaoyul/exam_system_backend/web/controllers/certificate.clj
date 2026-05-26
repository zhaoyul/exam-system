(ns zhaoyul.exam-system-backend.web.controllers.certificate
  "证书管理 — HTTP 控制器
   批次 CRUD + 证书生成 + 打印标记 + 证书查询"
  (:require
   [zhaoyul.exam-system-backend.domain.certificate :as svc]
   [zhaoyul.exam-system-backend.domain.numbering :as numbering]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 批次列表 GET /api/certificate/batches ───

(defn list-batches
  [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (svc/list-batches datasource params)]
    (response/ok result)))

;; ─── 批次详情 GET /api/certificate/batches/:id ───

(defn get-batch
  [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :id])]
    (if-let [batch (svc/get-batch datasource batch-id)]
      (response/ok batch)
      (response/not-found (str "批次不存在: " batch-id)))))

;; ─── 创建批次 POST /api/certificate/batches ───

(defn create-batch
  [{:keys [datasource]} request]
  (try
    (let [body   (:body-params request)
          batch  (svc/create-batch! datasource body)]
      (response/created batch))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── 更新批次 PUT /api/certificate/batches/:id ───

(defn update-batch
  [{:keys [datasource]} request]
  (let [batch-id (get-in request [:path-params :id])
        body     (:body-params request)]
    (if-let [batch (svc/update-batch! datasource batch-id body)]
      (response/ok batch)
      (response/not-found (str "批次不存在: " batch-id)))))

;; ─── 生成证书 POST /api/certificate/batches/:id/generate ───

(defn generate-certificates
  [{:keys [datasource]} request]
  (try
    (let [batch-id   (get-in request [:path-params :id])
          body       (:body-params request)
          result     (svc/generate-batch-certificates!
                      datasource
                      (merge body {:batch-id batch-id}))]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

(defn generate-plan-certificates
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          body (:body-params request)
          result (svc/generate-plan-certificates!
                  datasource
                  (merge body {:plan-id plan-id}))]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── 标记批次已打印 POST /api/certificate/batches/:id/print ───

(defn mark-batch-printed
  [{:keys [datasource]} request]
  (try
    (let [batch-id (get-in request [:path-params :id])
          result   (svc/mark-batch-printed! datasource batch-id)]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── 标记证书已打印 POST /api/certificate/print ───

(defn mark-certificates-printed
  [{:keys [datasource]} request]
  (try
    (let [body   (:body-params request)
          result (svc/mark-certificates-printed! datasource (:ids body))]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── 证书列表 GET /api/certificate/list ───

(defn list-certificates
  [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (svc/list-certificates datasource params)]
    (response/ok result)))

;; ─── 证书详情 GET /api/certificate/:id ───

(defn get-certificate
  [{:keys [datasource]} request]
  (let [cert-id (get-in request [:path-params :id])]
    (if-let [cert (svc/get-certificate datasource cert-id)]
      (response/ok cert)
      (response/not-found (str "证书不存在: " cert-id)))))

;; ─── 等级映射 GET /api/certificate/level-mapping ───

(defn get-level-mapping
  [_ctx _request]
  (response/ok
   {:mapping numbering/level->code
    :inverse numbering/code->level}))
