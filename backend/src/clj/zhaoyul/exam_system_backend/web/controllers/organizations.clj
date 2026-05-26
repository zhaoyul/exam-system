(ns zhaoyul.exam-system-backend.web.controllers.organizations
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- role-for-org [org-type]
  (if (= "group" org-type) "group_admin" "branch_admin"))

(defn- default-password [username]
  (let [value (str username "000000")]
    (subs value (max 0 (- (count value) 6)))))

(defn- org-users [ds org-id]
  (mapv (fn [row]
          {:id (:id row)
           :loginName (:username row)
           :phone (:phone row)
           :name (:display_name row)
           :role (:role row)
           :status (:status row)})
        (db/query ds ["SELECT id, username, display_name, role, phone, status
                       FROM app_user
                       WHERE org_id = ?
                       ORDER BY created_at ASC"
                      org-id])))

(defn- org-scopes [ds org-id]
  (mapv (fn [row]
          (str (:occupation row) (when (seq (:level row)) (str "（" (:level row) "）"))))
        (db/query ds ["SELECT occupation, level
                       FROM cgn_eval_scope
                       WHERE org_id = ?
                       ORDER BY updated_at DESC"
                      org-id])))

(defn- row->organization [ds row]
  (when row
    (-> row
        (assoc :parentId (:parent_id row)
               :orgType (:org_type row)
               :creditCode (:credit_code row)
               :contactName (:contact_name row)
               :contactPhone (:contact_phone row)
               :loginName (:login_name row)
               :users (org-users ds (:id row))
               :scopes (org-scopes ds (:id row))
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :parent_id :org_type :credit_code :contact_name :contact_phone :login_name :created_at :updated_at))))

(defn- ensure-login-user! [ds org body]
  (let [login-name (some-> (or (:loginName body) (:login_name org)) str/trim)
        org-id (:id org)
        org-type (or (:orgType body) (:org_type org) "branch")
        role (role-for-org org-type)
        display-name (or (:name body) (:name org))
        phone (or (:registerMobile body) (:mobile body) (:contactPhone body) (:contact_phone org) (:mobile org))
        password (or (:password body) (default-password login-name))]
    (when (seq login-name)
      (let [by-username (auth/find-user ds login-name)
            primary (db/execute-one! ds ["SELECT * FROM app_user
                                          WHERE org_id = ? AND role = ?
                                          ORDER BY created_at ASC
                                          LIMIT 1"
                                         org-id role])]
        (cond
          (and by-username (not= org-id (:org_id by-username)))
          (throw (ex-info "登录名已存在，请更换登录名" {:type :system.exception/business}))

          by-username
          (db/execute! ds ["UPDATE app_user
                            SET display_name = ?, role = ?, org_id = ?, phone = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?"
                           display-name role org-id phone (:id by-username)])

          primary
          (db/execute! ds ["UPDATE app_user
                            SET username = ?, password_hash = ?, display_name = ?, phone = ?, status = 'active', updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?"
                           login-name (auth/password-hash login-name password) display-name phone (:id primary)])

          :else
          (db/execute! ds ["INSERT INTO app_user (id, username, password_hash, display_name, role, org_id, phone, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')"
                           (db/uuid) login-name (auth/password-hash login-name password) display-name role org-id phone]))
        (db/execute! ds ["INSERT INTO audit_log (id, action, resource, resource_id, payload)
                          VALUES (?, 'organization-login-user-upsert', 'organization', ?, ?)"
                         (db/uuid) org-id (db/json-str {:username login-name :role role})])))))

(defn- backfill-login-users! [ds rows]
  (doseq [row rows
          :when (seq (str/trim (str (:login_name row))))]
    (ensure-login-user! ds row {}))
  rows)

(defn list-organizations [{:keys [datasource]} request]
  (let [{:keys [q org-type status]} (:query-params request)
        q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR credit_code LIKE ? OR contact_name LIKE ?)")
                  (seq org-type) (conj "org_type = ?")
                  (seq status) (conj "status = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq org-type) (conj org-type)
               (seq status) (conj status))
        sql (str "SELECT * FROM organization WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC")
        rows (backfill-login-users! datasource (db/query datasource (into [sql] args)))]
    (response/ok {:items (mapv #(row->organization datasource %) rows)})))

(defn get-organization [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
      (do
        (backfill-login-users! datasource [org])
        (response/ok (row->organization datasource (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id]))))
      (response/not-found))))

(defn create-organization [{:keys [datasource]} request]
  (let [body (:body-params request)
        id (or (:id body) (db/uuid))]
    (db/execute!
     datasource
     ["INSERT INTO organization
       (id, parent_id, org_type, name, credit_code, contact_name, contact_phone, mobile, address, duty, email, fax, postcode, login_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      id (:parentId body) (or (:orgType body) "branch") (:name body) (:creditCode body)
      (:contactName body) (:contactPhone body) (:mobile body) (:address body)
      (:duty body) (:email body) (:fax body) (:postcode body) (:loginName body)
      (or (:status body) "active")])
    (let [created (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
      (ensure-login-user! datasource created body)
      (response/created (row->organization datasource (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id]))))))

(defn update-organization [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        body (:body-params request)
        current (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
    (if current
      (do
        (db/execute!
         datasource
         ["UPDATE organization
           SET parent_id = ?, org_type = ?, name = ?, credit_code = ?, contact_name = ?, contact_phone = ?,
               mobile = ?, address = ?, duty = ?, email = ?, fax = ?, postcode = ?, login_name = ?,
               status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?"
          (or (:parentId body) (:parent_id current))
          (or (:orgType body) (:org_type current))
          (or (:name body) (:name current))
          (or (:creditCode body) (:credit_code current))
          (or (:contactName body) (:contact_name current))
          (or (:contactPhone body) (:contact_phone current))
          (or (:mobile body) (:mobile current))
          (or (:address body) (:address current))
          (or (:duty body) (:duty current))
          (or (:email body) (:email current))
          (or (:fax body) (:fax current))
          (or (:postcode body) (:postcode current))
          (or (:loginName body) (:login_name current))
          (or (:status body) (:status current))
          id])
        (let [updated (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
          (ensure-login-user! datasource updated body)
          (response/ok (row->organization datasource updated))))
      (response/not-found))))

(defn delete-organization [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        current (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
    (if current
      (do
        (db/execute! datasource ["DELETE FROM app_user_permission WHERE user_id IN (SELECT id FROM app_user WHERE org_id = ?)" id])
        (db/execute! datasource ["DELETE FROM app_user WHERE org_id = ?" id])
        (db/execute! datasource ["DELETE FROM organization WHERE id = ?" id])
        (response/no-content))
      (response/not-found))))
