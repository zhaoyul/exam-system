(ns zhaoyul.exam-system-backend.domain.filing
  "备案管理 — 集团备案/分支备案/省级备案"
  (:require
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- ui-status [status]
  (case status
    "pending" "reviewing"
    status))

(defn- row->filing [row]
  (when row
    (-> row
        (assoc :filingType (:filing_type row)
               :applyOrg (:apply_org row)
               :org (:apply_org row)
               :orgType (:org_type row)
               :filingPlace (:filing_place row)
               :filingMode (:filing_mode row)
               :submitDate (:submit_date row)
               :submitTime (:submit_date row)
               :siteCount (:site_count row)
               :projectCount (:project_count row)
               :staffCount (:staff_count row)
               :supervisorCount (:supervisor_count row)
               :assessorCount (:assessor_count row)
               :examRoomCount (:exam_room_count row)
               :rejectReason (:reject_reason row)
               :status (ui-status (:status row))
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :filing_type :apply_org :org_type :filing_place :filing_mode
                :submit_date :site_count :project_count :staff_count
                :supervisor_count :assessor_count :exam_room_count
                :reject_reason :created_at :updated_at))))

(defn- row->site [row]
  (when row
    (-> row
        (assoc :filingId (:filing_id row)
               :siteType (:site_type row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :filing_id :site_type :created_at :updated_at))))

;; ─── 备案申请 CRUD ───

(defn list-filings [ds {:keys [q filing-type province status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ? OR code LIKE ?)")
                  (seq filing-type) (conj "filing_type = ?")
                  (seq province) (conj "province = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq filing-type) (conj filing-type)
               (seq province) (conj province)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_filing_application WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->filing (db/query ds (into [sql] args)))}))

(defn get-filing [ds id]
  (row->filing (db/execute-one! ds ["SELECT * FROM cgn_filing_application WHERE id = ?" id])))

(defn create-filing! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute!
     ds
     ["INSERT INTO cgn_filing_application
       (id, org_id, code, name, filing_type, province, apply_org, org_type,
        filing_place, filing_mode, submit_date, site_count, project_count,
        staff_count, supervisor_count, assessor_count, exam_room_count, reject_reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      id (or (:orgId body) "") (:code body) (:name body)
      (:filingType body) (:province body) (or (:applyOrg body) (:org body))
      (:orgType body) (or (:filingPlace body) (:province body)) (:filingMode body)
      (or (:submitDate body) (:submitTime body))
      (or (:siteCount body) 0) (or (:projectCount body) 0)
      (or (:staffCount body) 0) (or (:supervisorCount body) 0)
      (or (:assessorCount body) 0) (or (:examRoomCount body) 0)
      (:rejectReason body) (or (:status body) "pending")])
    (get-filing ds id)))

(defn update-filing! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_filing_application WHERE id = ?" id])]
    (when current
      (db/execute!
       ds
       ["UPDATE cgn_filing_application
         SET code = ?, name = ?, filing_type = ?, province = ?, apply_org = ?,
             org_type = ?, filing_place = ?, filing_mode = ?, submit_date = ?,
             site_count = ?, project_count = ?, staff_count = ?, supervisor_count = ?,
             assessor_count = ?, exam_room_count = ?, reject_reason = ?,
             status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        (or (:code body) (:code current))
        (or (:name body) (:name current))
        (or (:filingType body) (:filing_type current))
        (or (:province body) (:province current))
        (or (:applyOrg body) (:org body) (:apply_org current))
        (or (:orgType body) (:org_type current))
        (or (:filingPlace body) (:filing_place current))
        (or (:filingMode body) (:filing_mode current))
        (or (:submitDate body) (:submitTime body) (:submit_date current))
        (or (:siteCount body) (:site_count current))
        (or (:projectCount body) (:project_count current))
        (or (:staffCount body) (:staff_count current))
        (or (:supervisorCount body) (:supervisor_count current))
        (or (:assessorCount body) (:assessor_count current))
        (or (:examRoomCount body) (:exam_room_count current))
        (if (contains? body :rejectReason) (:rejectReason body) (:reject_reason current))
        (or (:status body) (:status current))
        id])
      (get-filing ds id))))

(defn delete-filing! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_filing_application WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_filing_application WHERE id = ?" id])
    true))

;; ─── 备案考点 CRUD ───

(defn list-sites [ds {:keys [q filing-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(name LIKE ?)")
                  (seq filing-id) (conj "filing_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (conj (str "%" q "%"))
               (seq filing-id) (conj filing-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_filing_site WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->site (db/query ds (into [sql] args)))}))

(defn get-site [ds id]
  (row->site (db/execute-one! ds ["SELECT * FROM cgn_filing_site WHERE id = ?" id])))

(defn create-site! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute!
     ds
     ["INSERT INTO cgn_filing_site (id, org_id, code, filing_id, name, site_type, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      id (or (:orgId body) "") (:code body) (:filingId body)
      (:name body) (:siteType body) (:address body) (or (:status body) "active")])
    (get-site ds id)))

(defn update-site! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_filing_site WHERE id = ?" id])]
    (when current
      (db/execute!
       ds
       ["UPDATE cgn_filing_site
         SET code = ?, filing_id = ?, name = ?, site_type = ?, address = ?,
             status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        (or (:code body) (:code current))
        (or (:filingId body) (:filing_id current))
        (or (:name body) (:name current))
        (or (:siteType body) (:site_type current))
        (or (:address body) (:address current))
        (or (:status body) (:status current))
        id])
      (get-site ds id))))

(defn delete-site! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_filing_site WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_filing_site WHERE id = ?" id])
    true))

;; ─── 省级备案 (存储在 resource_item 中，resource = filing-province) ───
;; 复用 resources 域
