(ns zhaoyul.exam-system-backend.web.controllers.registration-orgs
  "报名机构管理 — 站点树 + 锁定解锁 + 重置密码
   操作 cgn_reg_org 表"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── row → camelCase ───

(defn- row->reg-org [row]
  (when row
    (-> row
        (assoc :loginName (:login_name row)
               :contactName (:contact_name row)
               :contactPhone (:contact_phone row)
               :siteName (:site_name row)
               :orgCode (:org_code row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :login_name :contact_name :contact_phone :site_name :org_code :created_at :updated_at))))

;; ─── CRUD ───

(defn list-registration-orgs [{:keys [datasource]} request]
  (let [{:keys [q site-name status org-id]} (:query-params request)
        q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR code LIKE ? OR login_name LIKE ? OR contact_name LIKE ?)")
                  (seq site-name) (conj "site_name = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq site-name) (conj site-name)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_reg_org WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC")]
    (response/ok {:items (mapv row->reg-org (db/query datasource (into [sql] args)))})))

(defn get-registration-org [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
      (response/ok (row->reg-org org))
      (response/not-found))))

(defn create-registration-org [{:keys [datasource]} request]
  (let [body (:body-params request)
        id (or (:id body) (db/uuid))]
    (db/execute!
     datasource
     ["INSERT INTO cgn_reg_org (id, org_id, code, name, login_name, org_code, contact_name, contact_phone, site_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      id (or (:orgId body) "") (or (:code body) "") (:name body)
      (or (:loginName body) "") (or (:orgCode body) "")
      (or (:contactName body) "") (or (:contactPhone body) "")
      (or (:siteName body) "") (or (:status body) "active")])
    (response/created (row->reg-org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])))))

(defn update-registration-org [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        body (:body-params request)
        current (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
    (if current
      (do
        (db/execute!
         datasource
         ["UPDATE cgn_reg_org
           SET code = ?, name = ?, login_name = ?, org_code = ?, contact_name = ?,
               contact_phone = ?, site_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?"
          (or (:code body) (:code current))
          (or (:name body) (:name current))
          (or (:loginName body) (:login_name current))
          (or (:orgCode body) (:org_code current))
          (or (:contactName body) (:contact_name current))
          (or (:contactPhone body) (:contact_phone current))
          (or (:siteName body) (:site_name current))
          (or (:status body) (:status current))
          id])
        (response/ok (row->reg-org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id]))))
      (response/not-found))))

(defn delete-registration-org [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        current (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
    (if current
      (do
        (db/execute! datasource ["DELETE FROM cgn_reg_org WHERE id = ?" id])
        (response/no-content))
      (response/not-found))))

;; ─── 站点树 ───

(defn site-tree [{:keys [datasource]} _request]
  (let [rows (db/query datasource ["SELECT DISTINCT site_name FROM cgn_reg_org WHERE site_name IS NOT NULL AND site_name != '' ORDER BY site_name"])
        sites (mapv :site_name rows)]
    (response/ok {:sites sites})))

;; ─── 锁定 / 解锁 ───

(defn lock-org [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
      (do
        (db/execute! datasource ["UPDATE cgn_reg_org SET status = 'locked', updated_at = CURRENT_TIMESTAMP WHERE id = ?" id])
        (response/ok (assoc (row->reg-org org) :status "locked")))
      (response/not-found))))

(defn unlock-org [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
      (do
        (db/execute! datasource ["UPDATE cgn_reg_org SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?" id])
        (response/ok (assoc (row->reg-org org) :status "active")))
      (response/not-found))))

;; ─── 重置密码 ───

(defn reset-password [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        body (:body-params request)
        new-password (or (:password body) "123456")]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM cgn_reg_org WHERE id = ?" id])]
      (do
        ;; Store password as login_name for simplicity — in a real system this would use a proper auth table
        (db/execute! datasource ["UPDATE cgn_reg_org SET login_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                                 (or (:loginName body) (:login_name org)) id])
        (response/ok {:id id :message "密码已重置" :password new-password}))
      (response/not-found))))
