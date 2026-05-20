(ns zhaoyul.exam-system-backend.web.controllers.organizations
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- row->organization [row]
  (when row
    (-> row
        (assoc :parentId (:parent_id row)
               :orgType (:org_type row)
               :creditCode (:credit_code row)
               :contactName (:contact_name row)
               :contactPhone (:contact_phone row)
               :loginName (:login_name row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :parent_id :org_type :credit_code :contact_name :contact_phone :login_name :created_at :updated_at))))

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
        sql (str "SELECT * FROM organization WHERE " (str/join " AND " filters) " ORDER BY updated_at DESC")]
    (response/ok {:items (mapv row->organization (db/query datasource (into [sql] args)))})))

(defn get-organization [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [org (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
      (response/ok (row->organization org))
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
    (response/created (row->organization (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])))))

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
        (response/ok (row->organization (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id]))))
      (response/not-found))))

(defn delete-organization [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        current (db/execute-one! datasource ["SELECT * FROM organization WHERE id = ?" id])]
    (if current
      (do
        (db/execute! datasource ["DELETE FROM organization WHERE id = ?" id])
        (response/no-content))
      (response/not-found))))
