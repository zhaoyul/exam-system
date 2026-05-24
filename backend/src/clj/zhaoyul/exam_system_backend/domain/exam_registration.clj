(ns zhaoyul.exam-system-backend.domain.exam-registration
  "考试报名 — 报名批次管理 + 导入 + 照片"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → cammelCase ───

(defn- row->batch [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :regOrgId (:reg_org_id row)
               :candidateCount (:candidate_count row)
               :importMode (:import_mode row)
               :photoStatus (:photo_status row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :reg_org_id :candidate_count :import_mode :photo_status :created_at :updated_at))))

(defn- row->plan-reg [row]
  (when row
    (-> row
        (assoc :planNo (:plan_no row)
               :planName (:plan_name row)
               :examMonth (:exam_month row)
               :regDeadline (:reg_deadline row)
               :regCount (:reg_count row)
               :batchCount (:batch_count row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_no :plan_name :exam_month :reg_deadline :reg_count :batch_count :created_at :updated_at))))

;; ─── Registration Plans (enriched with registration state) ───

(defn list-registration-plans [ds query-params]
  "Return plans with registration stats (regCount, batchCount, status)"
  (let [{:keys [status q org-id]} query-params
        q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(p.name LIKE ? OR p.code LIKE ?)")
                  (seq status) (conj "p.status = ?")
                  (seq org-id) (conj "p.org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        sql (str "SELECT p.*, "
                 "(SELECT COUNT(*) FROM cgn_candidate_reg cr WHERE cr.plan_id = p.id AND cr.status != 'cancelled') as reg_count, "
                 "(SELECT COUNT(*) FROM cgn_exam_reg_batch b WHERE b.plan_id = p.id) as batch_count "
                 "FROM cgn_recog_plan p WHERE "
                 (str/join " AND " filters)
                 " ORDER BY p.created_at DESC")]
    {:items (mapv row->plan-reg (db/query ds (into [sql] args)))}))

(defn get-registration-plan [ds plan-id]
  (row->plan-reg
   (db/execute-one! ds
     ["SELECT p.*, "
      "(SELECT COUNT(*) FROM cgn_candidate_reg cr WHERE cr.plan_id = p.id AND cr.status != 'cancelled') as reg_count, "
      "(SELECT COUNT(*) FROM cgn_exam_reg_batch b WHERE b.plan_id = p.id) as batch_count "
      "FROM cgn_recog_plan p WHERE p.id = ?" plan-id])))

;; ─── Registration Batches ───

(defn list-batches [ds {:keys [plan-id reg-org-id status]}]
  (let [filters (cond-> ["1 = 1"]
                  (seq plan-id) (conj "plan_id = ?")
                  (seq reg-org-id) (conj "reg_org_id = ?")
                  (seq status) (conj "status = ?"))
        args (cond-> []
               (seq plan-id) (conj plan-id)
               (seq reg-org-id) (conj reg-org-id)
               (seq status) (conj status))
        sql (str "SELECT * FROM cgn_exam_reg_batch WHERE " (str/join " AND " filters) " ORDER BY created_at DESC")]
    {:items (mapv row->batch (db/query ds (into [sql] args)))}))

(defn get-batch [ds batch-id]
  (row->batch (db/execute-one! ds ["SELECT * FROM cgn_exam_reg_batch WHERE id = ?" batch-id])))

(defn create-batch! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_exam_reg_batch (id, org_id, plan_id, reg_org_id, name, profession, level, candidate_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (or (:planId body) "")
       (or (:regOrgId body) "") (:name body)
       (or (:profession body) "") (or (:level body) "")
       0 (or (:status body) "open")])
    (get-batch ds id)))

(defn update-batch! [ds batch-id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_exam_reg_batch WHERE id = ?" batch-id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_exam_reg_batch
          SET name = ?, profession = ?, level = ?, status = ?, candidate_count = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:name body) (:name current))
         (or (:profession body) (:profession current))
         (or (:level body) (:level current))
         (or (:status body) (:status current))
         (or (:candidateCount body) (:candidate_count current))
         batch-id])
      (get-batch ds batch-id))))

(defn delete-batch! [ds batch-id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_exam_reg_batch WHERE id = ?" batch-id])
    (db/execute! ds ["DELETE FROM cgn_exam_reg_batch WHERE id = ?" batch-id])
    true))

(defn batch-end-registration! [ds batch-id]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_exam_reg_batch WHERE id = ?" batch-id])]
    (when current
      (db/execute! ds ["UPDATE cgn_exam_reg_batch SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?" batch-id])
      (get-batch ds batch-id))))

;; ─── Plan Registration ───

(defn plan-registration-status [ds plan-id]
  "Get full registration status for a plan: batches + registrations"
  (let [plan (get-registration-plan ds plan-id)
        batches (:items (list-batches ds {:plan-id plan-id}))
        reg-sql "SELECT COUNT(*) as total FROM cgn_candidate_reg WHERE plan_id = ? AND status != 'cancelled'"
        reg-total (:total (db/execute-one! ds (into [reg-sql] [plan-id])))
        photo-sql "SELECT COUNT(*) as total FROM cgn_candidate_reg WHERE plan_id = ? AND photo_uploaded = 1"
        photo-count (:total (db/execute-one! ds (into [photo-sql] [plan-id])))
        material-sql "SELECT COUNT(*) as total FROM cgn_candidate_reg WHERE plan_id = ? AND materials_complete = 1"
        material-count (:total (db/execute-one! ds (into [material-sql] [plan-id])))]
    (merge plan
           {:batches batches
            :regTotal reg-total
            :photoCount photo-count
            :materialCount material-count})))

;; ─── Import Excel (parse + create candidates/registrations) ───

(defn import-excel! [ds plan-id batch-id body]
  "Import candidates from parsed Excel data.
   body: {:mode 'clear|cover|ignore' :candidates [...]}"
  (let [mode (or (:mode body) "cover")
        candidates (:candidates body)]
    (when (= mode "clear")
      ;; Clear existing candidates for this batch
      (db/execute! ds ["DELETE FROM cgn_candidate_reg WHERE plan_id = ? AND batch_id = ?" plan-id batch-id]))
    (let [imported (doall
                    (map-indexed
                     (fn [idx c]
                       (let [cand-id (db/uuid)
                             reg-id (db/uuid)]
                         ;; Create candidate
                         (db/execute! ds
                           ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, gender, phone, email,
                              birth_date, ethnicity, political_status, education, graduation_school, major,
                              graduation_date, work_unit, department, position, work_years, profession, level,
                              exam_type, condition_no, photo_status, batch_id, candidate_type, status)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                            cand-id (or (:orgId c) "") (str "IMP-" (subs (db/uuid) 0 8))
                            (:name c) (:idCard c) (:gender c) (:phone c) (:email c)
                            (:birthDate c) (:ethnicity c) (:politicalStatus c)
                            (:education c) (:graduationSchool c) (:major c)
                            (:graduationDate c) (:workUnit c) (:department c) (:position c)
                            (or (:workYears c) 0) (:profession c) (:level c)
                            (or (:examType c) "normal") (:conditionNo c) "pending" batch-id "batch" "active"])
                         ;; Create registration record
                         (db/execute! ds
                           ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, status, batch_id)
                              VALUES (?, ?, ?, ?, ?, ?, ?)"
                            reg-id "" (str "REG-" (subs (db/uuid) 0 8)) plan-id cand-id "submitted" batch-id])
                         {:candidateId cand-id :registrationId reg-id :name (:name c)}))
                     candidates))]
      ;; Update batch candidate count
      (let [count-sql "SELECT COUNT(*) as cnt FROM cgn_candidate_reg WHERE plan_id = ? AND batch_id = ?"
            {:keys [cnt]} (db/execute-one! ds (into [count-sql] [plan-id batch-id]))]
        (db/execute! ds ["UPDATE cgn_exam_reg_batch SET candidate_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?" cnt batch-id]))
      {:imported (count imported) :mode mode :candidates imported})))

;; ─── Update photo status ───

(defn update-photo-status! [ds plan-id batch-id {:keys [candidate-ids]}]
  "Mark candidates as having photos uploaded"
  (let [ids (or candidate-ids [])]
    (when (seq ids)
      (let [placeholders (str/join "," (repeat (count ids) "?"))
            sql (str "UPDATE cgn_candidate SET photo_status = 'uploaded' WHERE id IN (" placeholders ")")]
        (db/execute! ds (into [sql] ids)))
      (when batch-id
        (db/execute! ds ["UPDATE cgn_exam_reg_batch SET photo_status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = ?" batch-id])))
    {:updated (count ids)}))
