(ns zhaoyul.exam-system-backend.domain.system-users
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.infra.db :as db]))

(def role-labels
  {"group_admin" "集团管理员"
   "branch_admin" "机构管理员"
   "expert" "评价专家"
   "supervisor" "督导人员"
   "exam_staff" "考务人员"
   "proctor" "监考人员"
   "candidate" "考生"
   "管理员" "机构管理员"
   "考务人员" "考务人员"
   "督导员" "督导人员"
   "考评员" "评价专家"})

(def role-keys
  {"集团管理员" "group_admin"
   "机构管理员" "branch_admin"
   "管理员" "branch_admin"
   "评价专家" "expert"
   "专家" "expert"
   "督导人员" "supervisor"
   "督导员" "supervisor"
   "考务人员" "exam_staff"
   "监考人员" "proctor"
   "考生" "candidate"})

(defn- normalize-role [role]
  (or (role-keys role) role "branch_admin"))

(defn- query-param [params & names]
  (some (fn [name]
          (or (get params name)
              (get params (keyword name))
              (get params (str name))))
        names))

(defn- row->mdm-person [row]
  (when row
    (-> row
        (assoc :employeeNo (:employee_no row)
               :orgId (:org_id row)
               :orgName (:org_name row)
               :syncedAt (:synced_at row))
        (dissoc :employee_no :org_id :org_name :synced_at))))

(defn user-permissions [ds user-id]
  (->> (db/query ds ["SELECT module, permission_type, status, granted_by, granted_at
                     FROM app_user_permission
                     WHERE user_id = ?
                     ORDER BY module"
                     user-id])
       (mapv #(-> %
                  (assoc :permissionType (:permission_type %)
                         :grantedBy (:granted_by %)
                         :grantedAt (:granted_at %))
                  (dissoc :permission_type :granted_by :granted_at)))))

(defn- row->user [ds row]
  (when row
    (let [role (:role row)]
      (-> row
          (assoc :name (:display_name row)
                 :displayName (:display_name row)
                 :orgId (:org_id row)
                 :org (:org_name row)
                 :roleLabel (get role-labels role role)
                 :createdAt (:created_at row)
                 :updatedAt (:updated_at row)
                 :permissions (user-permissions ds (:id row)))
          (dissoc :password_hash :display_name :org_id :org_name :created_at :updated_at)))))

(defn list-users [ds params]
  (let [q (some-> (query-param params :q "q") str/trim)
        org-id (query-param params :org-id "org-id" :orgId "orgId" :org_id "org_id")
        status (query-param params :status "status")
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(u.username LIKE ? OR u.display_name LIKE ? OR u.phone LIKE ?)")
                  (seq org-id) (conj "u.org_id = ?")
                  (seq status) (conj "u.status = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq org-id) (conj org-id)
               (seq status) (conj status))
        sql (str "SELECT u.*, o.name AS org_name
                  FROM app_user u
                  LEFT JOIN organization o ON o.id = u.org_id
                  WHERE " (str/join " AND " filters) "
                  ORDER BY u.updated_at DESC")]
    {:items (mapv #(row->user ds %) (db/query ds (into [sql] args)))}))

(defn get-user [ds id]
  (row->user ds (db/execute-one! ds ["SELECT u.*, o.name AS org_name
                                      FROM app_user u
                                      LEFT JOIN organization o ON o.id = u.org_id
                                      WHERE u.id = ?" id])))

(defn list-mdm-persons [ds params]
  (let [q (some-> (query-param params :q "q") str/trim)
        org-id (query-param params :org-id "org-id" :orgId "orgId" :org_id "org_id")
        status (query-param params :status "status")
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(employee_no LIKE ? OR name LIKE ? OR phone LIKE ?)")
                  (seq org-id) (conj "org_id = ?")
                  (seq status) (conj "status = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq org-id) (conj org-id)
               (seq status) (conj status))
        sql (str "SELECT * FROM mdm_person WHERE " (str/join " AND " filters) " ORDER BY synced_at DESC")]
    {:items (mapv row->mdm-person (db/query ds (into [sql] args)))}))

(defn get-mdm-person [ds id]
  (row->mdm-person (db/execute-one! ds ["SELECT * FROM mdm_person WHERE id = ?" id])))

(defn- audit! [ds actor action resource-id payload]
  (db/execute!
   ds
   ["INSERT INTO audit_log (id, actor_id, action, resource, resource_id, payload)
     VALUES (?, ?, ?, 'app_user', ?, ?)"
    (db/uuid) actor action resource-id (db/json-str payload)]))

(defn create-user! [ds body]
  (let [mdm-person (when-let [id (:mdmPersonId body)] (get-mdm-person ds id))
        username (or (:username body) (:employeeNo mdm-person) (:employee_no mdm-person))
        display-name (or (:name body) (:displayName body) (:name mdm-person))
        phone (or (:phone body) (:phone mdm-person))
        org-id (or (:orgId body) (:org_id body) (:orgId mdm-person))
        role (normalize-role (:role body))
        password (or (:password body) (subs (str username "000000") (max 0 (- (count (str username "000000")) 6))))
        id (or (:id body) (db/uuid))]
    (when (str/blank? (str username))
      (throw (ex-info "用户名不能为空" {:type :system.exception/business})))
    (when (str/blank? (str display-name))
      (throw (ex-info "姓名不能为空" {:type :system.exception/business})))
    (db/execute!
     ds
     ["INSERT INTO app_user (id, username, password_hash, display_name, role, org_id, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      id username (auth/password-hash username password) display-name role org-id phone (or (:status body) "active")])
    (audit! ds (:actorId body) "create-user" id {:username username :role role :mdmPersonId (:mdmPersonId body)})
    (get-user ds id)))

(defn update-user! [ds id body]
  (when-let [current (db/execute-one! ds ["SELECT * FROM app_user WHERE id = ?" id])]
    (let [username (or (:username body) (:username current))
          role (normalize-role (or (:role body) (:role current)))]
      (db/execute!
       ds
       ["UPDATE app_user
         SET username = ?, display_name = ?, role = ?, org_id = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        username
        (or (:name body) (:displayName body) (:display_name current))
        role
        (or (:orgId body) (:org_id body) (:org_id current))
        (or (:phone body) (:phone current))
        (or (:status body) (:status current))
        id])
      (audit! ds (:actorId body) "update-user" id (dissoc body :password))
      (get-user ds id))))

(defn delete-user! [ds id]
  (when (db/execute-one! ds ["SELECT id FROM app_user WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM app_user_permission WHERE user_id = ?" id])
    (db/execute! ds ["DELETE FROM app_user WHERE id = ?" id])
    (audit! ds nil "delete-user" id {})
    true))

(defn set-status! [ds id status actor-id]
  (when (db/execute-one! ds ["SELECT id FROM app_user WHERE id = ?" id])
    (db/execute! ds ["UPDATE app_user SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?" status id])
    (audit! ds actor-id (if (= status "locked") "lock-user" "unlock-user") id {:status status})
    (get-user ds id)))

(defn reset-password! [ds id password actor-id]
  (when-let [user (db/execute-one! ds ["SELECT id, username FROM app_user WHERE id = ?" id])]
    (db/execute! ds ["UPDATE app_user SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                     (auth/password-hash (:username user) password) id])
    (audit! ds actor-id "reset-password" id {})
    (get-user ds id)))

(defn authorize! [ds id {:keys [modules permissionType actorId]}]
  (when (db/execute-one! ds ["SELECT id FROM app_user WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM app_user_permission WHERE user_id = ?" id])
    (doseq [module modules
            :when (seq (str module))]
      (db/execute!
       ds
       ["INSERT INTO app_user_permission (id, user_id, module, permission_type, status, granted_by)
         VALUES (?, ?, ?, ?, 'granted', ?)"
        (db/uuid) id module (or permissionType "view") actorId]))
    (audit! ds actorId "authorize-user" id {:modules modules :permissionType (or permissionType "view")})
    (get-user ds id)))
