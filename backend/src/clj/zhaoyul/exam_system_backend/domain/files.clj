(ns zhaoyul.exam-system-backend.domain.files
  "文件管理 — 文档分发/文档接收/文档阅览/私有文档/参数设置"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->doc-file [row]
  (when row
    (-> row
        (assoc :fileType (:file_type row)
               :fileSize (:file_size row)
               :filePath (:file_path row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :file_type :file_size :file_path :created_at :updated_at))))

(defn- row->distribution [row]
  (when row
    (-> row
        (assoc :docFileId (:doc_file_id row)
               :recipientCount (:recipient_count row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :doc_file_id :recipient_count :created_at :updated_at))))

(defn- row->receive [row]
  (when row
    (-> row
        (assoc :distributionId (:distribution_id row)
               :senderOrg (:sender_org row)
               :receiveDate (:receive_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :distribution_id :sender_org :receive_date :created_at :updated_at))))

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
      ["INSERT INTO cgn_doc_file (id, org_id, code, name, file_type, file_size, file_path, owner, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:fileType body) (:fileSize body) (:filePath body)
       (:owner body) (or (:status body) "active")])
    (get-doc-file ds id)))

(defn update-doc-file! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_file WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_doc_file
          SET code = ?, name = ?, file_type = ?, file_size = ?, file_path = ?, owner = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:fileType body) (:file_type current))
         (or (:fileSize body) (:file_size current))
         (or (:filePath body) (:file_path current))
         (or (:owner body) (:owner current))
         (or (:status body) (:status current))
         id])
      (get-doc-file ds id))))

(defn delete-doc-file! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_file WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_file WHERE id = ?" id])
    true))

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
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_doc_distribution (id, org_id, code, name, doc_file_id, sender, recipient_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:name body)
       (:docFileId body) (:sender body) (:recipientCount body)
       (or (:status body) "draft")])
    (get-distribution ds id)))

(defn update-distribution! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_doc_distribution
          SET code = ?, name = ?, doc_file_id = ?, sender = ?, recipient_count = ?,
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:name body) (:name current))
         (or (:docFileId body) (:doc_file_id current))
         (or (:sender body) (:sender current))
         (or (:recipientCount body) (:recipient_count current))
         (or (:status body) (:status current))
         id])
      (get-distribution ds id))))

(defn delete-distribution! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_distribution WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_distribution WHERE id = ?" id])
    true))

;; ─── 文档接收 (cgn_doc_receive) ───

(defn list-receives [ds {:keys [q distribution-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq distribution-id) (conj "distribution_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq distribution-id) (conj distribution-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_doc_receive WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->receive (db/query ds (into [sql] args)))}))

(defn get-receive [ds id]
  (row->receive (db/execute-one! ds ["SELECT * FROM cgn_doc_receive WHERE id = ?" id])))

(defn create-receive! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_doc_receive (id, org_id, code, distribution_id, name, sender_org, receive_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:distributionId body)
       (:name body) (:senderOrg body) (:receiveDate body)
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
         (or (:name body) (:name current))
         (or (:senderOrg body) (:sender_org current))
         (or (:receiveDate body) (:receive_date current))
         (or (:status body) (:status current))
         id])
      (get-receive ds id))))

(defn delete-receive! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_doc_receive WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_doc_receive WHERE id = ?" id])
    true))

;; ─── 文档阅览 / 私有文档 / 参数设置 (resource_item) ───

(def list-viewers
  (fn [ds params] (resources/list-items ds "file-viewers" params)))
(def get-viewer
  (fn [ds id] (resources/get-item ds "file-viewers" id)))

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
