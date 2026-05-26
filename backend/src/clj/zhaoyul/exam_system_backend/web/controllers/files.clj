(ns zhaoyul.exam-system-backend.web.controllers.files
  "文件管理 API — 文档分发/文档接收/文档阅览/私有文档/参数设置"
  (:require
   [ring.util.response :as ring-response]
   [zhaoyul.exam-system-backend.domain.files :as files]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- param [request k]
  (or (get-in request [:params k])
      (get-in request [:params (name k)])
      (get-in request [:body-params k])
      (get-in request [:body-params (name k)])))

(defn- upload-file-param [request]
  (or (param request :file)
      (some (fn [value]
              (when (and (map? value) (or (:tempfile value) (get value "tempfile")))
                value))
            (vals (:params request)))))

(defn- normalize-file-param [file]
  (when file
    {:filename (or (:filename file) (get file "filename"))
     :content-type (or (:content-type file) (get file "content-type"))
     :tempfile (or (:tempfile file) (get file "tempfile"))
     :size (or (:size file) (get file "size"))}))

;; ─── 文件元数据/上传下载 ───

(defn list-files [{:keys [datasource]} request]
  (response/ok (files/list-doc-files datasource (:query-params request))))

(defn get-file [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/get-doc-file datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-file [{:keys [datasource]} request]
  (response/created (files/create-doc-file! datasource (:body-params request))))

(defn update-file [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/update-doc-file! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-file [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (files/delete-doc-file! datasource id)
      (response/no-content)
      (response/not-found))))

(defn upload-file [{:keys [datasource] :as ctx} request]
  (let [upload-dir (or (get-in ctx [:files :upload-dir]) "./data/uploads")
        file (normalize-file-param (upload-file-param request))]
    (cond
      (nil? file)
      (response/bad-request "缺少上传文件字段 file")

      (nil? (:tempfile file))
      (response/bad-request "上传文件缺少临时文件")

      :else
      (response/created
       (files/create-uploaded-doc-file!
        datasource
        upload-dir
        {:file file
         :org-id (param request :orgId)
         :owner (param request :owner)
         :category (param request :category)
         :visibility (param request :visibility)
         :status (param request :status)
         :code (param request :code)
         :name (param request :name)})))))

(defn download-file [{:keys [datasource] :as ctx} request]
  (let [id (get-in request [:path-params :id])
        upload-dir (or (get-in ctx [:files :upload-dir]) "./data/uploads")]
    (if-let [item (files/get-doc-file datasource id)]
      (if-let [stored (files/stored-file upload-dir item)]
        (-> (ring-response/file-response (.getAbsolutePath stored))
            (ring-response/header "Content-Type" (or (:mimeType item) "application/octet-stream"))
            (ring-response/header "Content-Disposition" (str "attachment; filename=\"" (:name item) "\"")))
        (response/not-found "文件内容不存在"))
      (response/not-found))))

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

(defn send-distribute [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (files/send-distribution! datasource id)]
      (response/ok item)
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

(defn mark-receive-read [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        feedback (get-in request [:body-params :feedback])]
    (if-let [item (files/mark-receive-read! datasource id feedback)]
      (response/ok item)
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
