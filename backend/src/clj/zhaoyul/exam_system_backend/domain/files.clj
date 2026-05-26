(ns zhaoyul.exam-system-backend.domain.files
  "文件管理 — 文档分发/文档接收/文档阅览/私有文档/参数设置"
  (:require
   [clojure.java.io :as io]
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->doc-file [row]
  (when row
    (let [file-type (or (:file_type row) "")
          file-size (long (or (:file_size row) 0))]
      (-> row
          (assoc :orgId (:org_id row)
                 :fileType file-type
                 :fileSize file-size
                 :filePath (:file_path row)
                 :storageKey (:storage_key row)
                 :mimeType (:mime_type row)
                 :type (str/upper-case file-type)
                 :size (if (>= file-size 1048576)
                         (format "%.1fMB" (/ file-size 1048576.0))
                         (format "%.1fKB" (/ file-size 1024.0)))
                 :date (some-> (:created_at row) (subs 0 (min 10 (count (:created_at row)))))
                 :createdAt (:created_at row)
                 :updatedAt (:updated_at row))
        (dissoc :org_id :file_type :file_size :file_path :storage_key :mime_type :created_at :updated_at)))))

(defn- safe-filename [filename]
  (let [name (or (some-> filename str io/file .getName) "upload.bin")
        sanitized (str/replace name #"[^A-Za-z0-9._\-\u4e00-\u9fa5]" "_")]
    (if (str/blank? sanitized) "upload.bin" sanitized)))

(defn- file-extension [filename]
  (let [name (safe-filename filename)
        idx (.lastIndexOf name ".")]
    (if (pos? idx) (subs name idx) "")))

(defn- ensure-upload-dir! [upload-dir]
  (let [dir (io/file upload-dir)]
    (.mkdirs dir)
    dir))

(defn- row->distribution [row]
  (when row
    (-> row
        (assoc :docFileId (:doc_file_id row)
               :recipientCount (:recipient_count row)
               :recipientOrgs (:recipient_orgs row)
               :readCount (:read_count row)
               :feedbackCount (:feedback_count row)
               :title (:name row)
               :org (or (:recipient_orgs row) "")
               :type (or (:doc_type row) "通知")
               :date (some-> (:created_at row) (subs 0 (min 10 (count (:created_at row)))))
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :doc_file_id :recipient_count :recipient_orgs :read_count :feedback_count :doc_type :created_at :updated_at))))

(defn- row->receive [row]
  (when row
    (-> row
        (assoc :distributionId (:distribution_id row)
               :senderOrg (:sender_org row)
               :receiveDate (:receive_date row)
               :readAt (:read_at row)
               :title (:name row)
               :org (:sender_org row)
               :type (or (:doc_type row) "文件")
               :date (or (:receive_date row) (some-> (:created_at row) (subs 0 (min 10 (count (:created_at row))))))
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :distribution_id :sender_org :receive_date :read_at :created_at :updated_at))))

(defn- audit! [ds action resource resource-id payload]
  (try
    (db/execute! ds
                 ["INSERT INTO audit_log (id, action, resource, resource_id, payload)
                   VALUES (?, ?, ?, ?, ?)"
                  (db/uuid) action resource resource-id (db/json-str payload)])
    (catch Exception _ nil)))

;; ─── 文档管理 (cgn_doc_file) ───

(defn list-doc-files [ds {:keys [q file-type status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq file-type) (conj "file_type = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq file-type) (conj file-type)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_doc_file WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->doc-file (db/query ds (into [sql] args)))}))

(defn get-doc-file [ds id]
  (row->doc-file (db/execute-one! ds ["SELECT * FROM cgn_doc_file WHERE id = ?" id])))

(defn create-doc-file! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_doc_file (id, org_id, code, name, file_type, file_size, file_path, storage_key, mime_type, category, visibility, owner, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (or (:code body) "") (:name body)
       (:fileType body) (:fileSize body) (:filePath body)
       (:storageKey body) (:mimeType body) (:category body) (or (:visibility body) "org")
       (:owner body) (or (:status body) "active")])
    (get-doc-file ds id)))

(defn update-doc-file! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_file WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_doc_file
          SET code = ?, name = ?, file_type = ?, file_size = ?, file_path = ?,
              storage_key = ?, mime_type = ?, category = ?, visibility = ?, owner = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:fileType body) (:file_type current))
         (or (:fileSize body) (:file_size current))
         (or (:filePath body) (:file_path current))
         (or (:storageKey body) (:storage_key current))
         (or (:mimeType body) (:mime_type current))
         (or (:category body) (:category current))
         (or (:visibility body) (:visibility current))
         (or (:owner body) (:owner current))
         (or (:status body) (:status current))
         id])
      (get-doc-file ds id))))

(defn delete-doc-file! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_file WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_file WHERE id = ?" id])
    true))

(defn create-uploaded-doc-file! [ds upload-dir {:keys [file org-id owner category visibility status code name]}]
  (let [{:keys [filename content-type tempfile size]} file
        id (db/uuid)
        original-name (or name filename "upload.bin")
        ext (file-extension original-name)
        storage-key (str id ext)
        dir (ensure-upload-dir! upload-dir)
        target (io/file dir storage-key)
        file-size (or size (some-> tempfile io/file .length) 0)]
    (io/copy (io/file tempfile) target)
    (db/execute! ds
      ["INSERT INTO cgn_doc_file (id, org_id, code, name, file_type, file_size, file_path, storage_key, mime_type, category, visibility, owner, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or org-id "") (or code "") (safe-filename original-name)
       (some-> original-name file-extension (str/replace #"^\." ""))
       file-size (.getAbsolutePath target) storage-key content-type category
       (or visibility "org") owner (or status "active")])
    (get-doc-file ds id)))

(defn stored-file [upload-dir doc-file]
  (let [storage-key (:storageKey doc-file)
        file-path (:filePath doc-file)
        candidate (cond
                    (seq storage-key) (io/file upload-dir storage-key)
                    (seq file-path) (io/file file-path))]
    (when (and candidate (.exists candidate) (.isFile candidate))
      candidate)))

;; ─── 文档分发 (cgn_doc_distribution) ───

(defn list-distributions [ds {:keys [q status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_doc_distribution WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->distribution (db/query ds (into [sql] args)))}))

(defn get-distribution [ds id]
  (row->distribution (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])))

(defn create-distribution! [ds body]
  (let [id (or (:id body) (db/uuid))
        recipient-orgs (or (:recipientOrgs body) (:recipient_orgs body) (:org body) "")
        doc-type (or (:type body) (:docType body) (:doc_type body) "通知")]
    (db/execute! ds
      ["INSERT INTO cgn_doc_distribution
        (id, org_id, code, name, doc_file_id, sender, recipient_count, doc_type, recipient_orgs, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (or (:code body) (str "DIST-" (subs id 0 8))) (or (:name body) (:title body))
       (:docFileId body) (:sender body) (or (:recipientCount body) 0) doc-type recipient-orgs
       (or (:status body) "draft")])
    (audit! ds "file-distribution-create" "cgn_doc_distribution" id {:name (or (:name body) (:title body)) :recipientOrgs recipient-orgs})
    (get-distribution ds id)))

(defn update-distribution! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_doc_distribution
          SET code = ?, name = ?, doc_file_id = ?, sender = ?, recipient_count = ?,
              doc_type = ?, recipient_orgs = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:title body) (:name current))
         (or (:docFileId body) (:doc_file_id current))
         (or (:sender body) (:sender current))
         (or (:recipientCount body) (:recipient_count current))
         (or (:type body) (:docType body) (:doc_type current))
         (or (:recipientOrgs body) (:recipient_orgs body) (:org body) (:recipient_orgs current))
         (or (:status body) (:status current))
         id])
      (audit! ds "file-distribution-update" "cgn_doc_distribution" id (select-keys body [:name :title :status :org :recipientOrgs]))
      (get-distribution ds id))))

(defn delete-distribution! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_distribution WHERE id = ?" id])
    (audit! ds "file-distribution-delete" "cgn_doc_distribution" id {})
    true))

(defn- recipient-list [distribution]
  (->> (str/split (str (or (:recipient_orgs distribution) "")) #"[、,，;；]")
       (map str/trim)
       (remove str/blank?)
       distinct
       vec))

(defn send-distribution! [ds id]
  (when-let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])]
    (let [recipients (recipient-list current)
          recipients (if (seq recipients) recipients ["全部机构"])]
      (doseq [org recipients
              :when (nil? (db/execute-one! ds ["SELECT id FROM cgn_doc_receive WHERE distribution_id = ? AND sender_org = ?"
                                               id org]))]
        (db/execute! ds
                     ["INSERT INTO cgn_doc_receive
                       (id, org_id, code, distribution_id, name, sender_org, receive_date, status)
                       VALUES (?, ?, ?, ?, ?, ?, ?, 'unread')"
                      (db/uuid) (:org_id current) (str "RCV-" (:code current)) id (:name current) org
                      (str (java.time.LocalDate/now))]))
      (db/execute! ds
                   ["UPDATE cgn_doc_distribution
                     SET status = 'sent', recipient_count = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?"
                    (count recipients) id])
      (audit! ds "file-distribution-send" "cgn_doc_distribution" id {:recipientOrgs recipients})
      (get-distribution ds id))))

;; ─── 文档接收 (cgn_doc_receive) ───

(defn list-receives [ds {:keys [q distribution-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(r.name LIKE ?)")
                  (seq distribution-id) (conj "r.distribution_id = ?")
                  (seq status) (conj "r.status = ?")
                  (seq org-id) (conj "r.org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq distribution-id) (conj distribution-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT r.*, d.doc_type FROM cgn_doc_receive r"
                 " LEFT JOIN cgn_doc_distribution d ON d.id = r.distribution_id"
                 " WHERE " (clojure.string/join " AND " filters)
                 " ORDER BY r.updated_at DESC")]
    {:items (mapv row->receive (db/query ds (into [sql] args)))}))

(defn get-receive [ds id]
  (row->receive (db/execute-one! ds ["SELECT r.*, d.doc_type FROM cgn_doc_receive r
                                      LEFT JOIN cgn_doc_distribution d ON d.id = r.distribution_id
                                      WHERE r.id = ?" id])))

(defn create-receive! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_doc_receive (id, org_id, code, distribution_id, name, sender_org, receive_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:distributionId body)
       (or (:name body) (:title body)) (:senderOrg body) (:receiveDate body)
       (or (:status body) "pending")])
    (get-receive ds id)))

(defn update-receive! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_receive WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_doc_receive
          SET code = ?, distribution_id = ?, name = ?, sender_org = ?, receive_date = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:distributionId body) (:distribution_id current))
         (or (:name body) (:title body) (:name current))
         (or (:senderOrg body) (:org body) (:sender_org current))
         (or (:receiveDate body) (:receive_date current))
         (or (:status body) (:status current))
         id])
      (get-receive ds id))))

(defn delete-receive! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_receive WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_receive WHERE id = ?" id])
    true))

(defn mark-receive-read! [ds id feedback]
  (when-let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_receive WHERE id = ?" id])]
    (db/execute! ds
                 ["UPDATE cgn_doc_receive
                   SET status = 'read', feedback = ?, read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?"
                  (or feedback (:feedback current) "") id])
    (when-let [distribution-id (:distribution_id current)]
      (let [stats (db/execute-one! ds ["SELECT
                                          SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS read_count,
                                          SUM(CASE WHEN feedback IS NOT NULL AND feedback != '' THEN 1 ELSE 0 END) AS feedback_count
                                        FROM cgn_doc_receive WHERE distribution_id = ?" distribution-id])]
        (db/execute! ds ["UPDATE cgn_doc_distribution
                          SET read_count = ?, feedback_count = ?, updated_at = CURRENT_TIMESTAMP
                          WHERE id = ?"
                         (or (:read_count stats) 0) (or (:feedback_count stats) 0) distribution-id])))
    (audit! ds "file-receive-read" "cgn_doc_receive" id {:feedback feedback})
    (get-receive ds id)))

;; ─── 文档阅览 / 私有文档 / 参数设置 (resource_item) ───

(def list-viewers list-doc-files)
(def get-viewer get-doc-file)

(def list-private
  (fn [ds params] (resources/list-items ds "private-files" params)))
(def get-private
  (fn [ds id] (resources/get-item ds "private-files" id)))
(def create-private!
  (fn [ds body] (resources/create-item! ds "private-files" body)))
(def update-private!
  (fn [ds id body] (resources/update-item! ds "private-files" id body)))
(def delete-private!
  (fn [ds id] (resources/delete-item! ds "private-files" id)))

(def list-settings
  (fn [ds params] (resources/list-items ds "file-settings" params)))
(def get-setting
  (fn [ds id] (resources/get-item ds "file-settings" id)))
(def create-setting!
  (fn [ds body] (resources/create-item! ds "file-settings" body)))
(def update-setting!
  (fn [ds id body] (resources/update-item! ds "file-settings" id body)))
(def delete-setting!
  (fn [ds id] (resources/delete-item! ds "file-settings" id)))
