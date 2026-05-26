(ns zhaoyul.exam-system-backend.domain.branch-filing
  "当前分支机构备案信息。按登录用户所属 org_id 隔离数据。"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.exam-staff :as exam-staff]
   [zhaoyul.exam-system-backend.infra.db :as db]))

(def profile-resource "branch-filing-profile")

(defn- blank-basic []
  {:name ""
   :code ""
   :nature ""
   :group ""
   :contact ""
   :phone ""
   :email ""
   :address ""})

(defn- row->basic [org-row]
  (merge
   (blank-basic)
   (when org-row
     {:name (or (:name org-row) "")
      :code (or (:credit_code org-row) "")
      :nature (case (:org_type org-row)
                "group" "集团"
                "branch" "分支机构"
                (or (:org_type org-row) ""))
      :contact (or (:contact_name org-row) "")
      :phone (or (:contact_phone org-row) (:mobile org-row) "")
      :email (or (:email org-row) "")
      :address (or (:address org-row) "")})))

(defn org-row [ds org-id]
  (when (seq (str org-id))
    (db/execute-one! ds ["SELECT * FROM organization WHERE id = ?" org-id])))

(defn- profile-row [ds org-id]
  (db/execute-one!
   ds
   ["SELECT * FROM resource_item
     WHERE resource = ? AND org_id = ?
     ORDER BY updated_at DESC
     LIMIT 1"
    profile-resource org-id]))

(defn get-profile [ds org-id]
  (let [org (org-row ds org-id)
        payload (some-> (profile-row ds org-id) :payload db/parse-json)
        basic (merge (row->basic org) (:basicInfo payload))]
    {:orgId org-id
     :orgName (or (:name org) (:name basic) "")
     :basicInfo basic}))

(defn save-basic! [ds org-id basic]
  (let [current (profile-row ds org-id)
        org (org-row ds org-id)
        payload (assoc (db/parse-json (:payload current)) :basicInfo basic)
        name (or (:name basic) (:name org) "分支备案信息")
        code (str "BRANCH-FILING-" org-id)]
    (when org
      (db/execute!
       ds
       ["UPDATE organization
         SET name = ?, credit_code = ?, contact_name = ?, contact_phone = ?,
             mobile = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        (or (:name basic) (:name org))
        (or (:code basic) (:credit_code org))
        (or (:contact basic) (:contact_name org))
        (or (:phone basic) (:contact_phone org))
        (or (:phone basic) (:mobile org))
        (or (:email basic) (:email org))
        (or (:address basic) (:address org))
        org-id]))
    (if current
      (db/execute!
       ds
       ["UPDATE resource_item
         SET code = ?, name = ?, status = 'active', payload = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        code name (db/json-str payload) (:id current)])
      (db/execute!
       ds
       ["INSERT INTO resource_item (id, resource, code, name, status, org_id, payload)
         VALUES (?, ?, ?, ?, 'active', ?, ?)"
        (db/uuid) profile-resource code name org-id (db/json-str payload)]))
    (:basicInfo (get-profile ds org-id))))

(defn list-current-staff [ds org-id staff-type]
  (exam-staff/list-staff ds {:orgId org-id :staffType staff-type}))

(defn create-current-staff! [ds org-id staff-type body]
  (let [org (org-row ds org-id)
        role (or (:role body) (:position body))
        item (exam-staff/create-staff!
              ds
              (assoc body
                     :orgId org-id
                     :staffType staff-type
                     :unitName (or (:name org) (:unitName body))
                     :position role))]
    (assoc item :role (:position item))))

(defn delete-current-staff! [ds org-id id]
  (when (db/execute-one! ds ["SELECT id FROM cgn_exam_staff WHERE id = ? AND org_id = ?" id org-id])
    (exam-staff/delete-staff! ds id)))
