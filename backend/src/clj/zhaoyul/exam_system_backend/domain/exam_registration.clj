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

(def candidate-template-headers
  ["姓名" "性别" "证件号码" "手机号" "邮箱" "学历" "工作单位" "部门" "岗位" "工作年限" "职业工种" "等级" "申报条件编号"])

(def candidate-header-aliases
  {"姓名" :name
   "name" :name
   "性别" :gender
   "gender" :gender
   "证件号码" :idCard
   "身份证号" :idCard
   "idCard" :idCard
   "手机号" :phone
   "phone" :phone
   "邮箱" :email
   "email" :email
   "学历" :education
   "education" :education
   "工作单位" :workUnit
   "workUnit" :workUnit
   "部门" :department
   "department" :department
   "岗位" :position
   "position" :position
   "工作年限" :workYears
   "workYears" :workYears
   "职业工种" :profession
   "profession" :profession
   "等级" :level
   "level" :level
   "申报条件编号" :conditionNo
   "conditionNo" :conditionNo})

(defn- body-param [body & keys]
  (some (fn [k]
          (or (get body k)
              (get body (keyword k))
              (get body (str k))))
        keys))

(defn- csv-escape [value]
  (let [text (str (or value ""))]
    (if (re-find #"[\",\n\r]" text)
      (str "\"" (str/replace text "\"" "\"\"") "\"")
      text)))

(defn- csv-line [values]
  (str/join "," (map csv-escape values)))

(defn candidate-template-csv []
  (str (csv-line candidate-template-headers)
       "\n"
       (csv-line ["张三" "男" "440301199001011234" "13800138001" "zhangsan@example.com" "本科" "大亚湾核电" "运行一部" "操作员" "8" "核反应堆运行值班员" "三级" "1"])
       "\n"))

(defn- parse-csv-line [line]
  (loop [chars (seq line)
         field []
         row []
         quoted? false]
    (if-let [ch (first chars)]
      (cond
        (and (= ch \") quoted? (= \" (second chars)))
        (recur (nnext chars) (conj field ch) row quoted?)

        (= ch \")
        (recur (next chars) field row (not quoted?))

        (and (= ch \,) (not quoted?))
        (recur (next chars) [] (conj row (apply str field)) quoted?)

        :else
        (recur (next chars) (conj field ch) row quoted?))
      (conj row (apply str field)))))

(defn- parse-csv [content]
  (->> (str/split-lines (str content))
       (remove #(str/blank? (str/trim %)))
       (mapv parse-csv-line)))

(defn- csv->candidates [content]
  (let [rows (parse-csv content)
        headers (vec (first rows))]
    (mapv
     (fn [row]
       (reduce-kv
        (fn [acc idx header]
          (if-let [k (candidate-header-aliases (str/trim header))]
            (assoc acc k (some-> (get row idx) str/trim))
            acc))
        {}
        headers))
     (rest rows))))

(defn- normalized-candidates [body]
  (let [items (or (body-param body :candidates "candidates")
                  (when-let [content (body-param body :content "content" :text "text")]
                    (csv->candidates content)))]
    (mapv (fn [item]
            (into {} (map (fn [[k v]] [(if (string? k) (keyword k) k) v]) item)))
          (or items []))))

(defn- candidate-errors [idx candidate]
  (cond-> []
    (str/blank? (str (:name candidate)))
    (conj {:row (+ idx 2) :message "姓名不能为空"})
    (str/blank? (str (:idCard candidate)))
    (conj {:row (+ idx 2) :message "证件号码不能为空"})
    (str/blank? (str (:profession candidate)))
    (conj {:row (+ idx 2) :message "职业工种不能为空"})
    (str/blank? (str (:level candidate)))
    (conj {:row (+ idx 2) :message "等级不能为空"})))

(defn- existing-candidate-by-id-card [ds id-card]
  (when (seq (str id-card))
    (db/execute-one! ds ["SELECT * FROM cgn_candidate WHERE id_card = ?" id-card])))

(defn- upsert-candidate! [ds candidate mode batch-id]
  (let [existing (existing-candidate-by-id-card ds (:idCard candidate))
        candidate-id (or (:id existing) (db/uuid))
        work-years (try (Integer/parseInt (str (or (:workYears candidate) 0))) (catch Exception _ 0))]
    (cond
      (and existing (= mode "ignore"))
      {:candidate-id (:id existing) :skipped? true}

      existing
      (do
        (db/execute!
         ds
         ["UPDATE cgn_candidate
           SET name = ?, gender = ?, phone = ?, email = ?, education = ?, work_unit = ?,
               department = ?, position = ?, work_years = ?, profession = ?, occupation = ?,
               level = ?, condition_no = ?, batch_id = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?"
          (:name candidate) (:gender candidate) (:phone candidate) (:email candidate)
          (:education candidate) (:workUnit candidate) (:department candidate) (:position candidate)
          work-years (:profession candidate) (:profession candidate) (:level candidate)
          (:conditionNo candidate) batch-id candidate-id])
        {:candidate-id candidate-id :updated? true})

      :else
      (do
        (db/execute!
         ds
         ["INSERT INTO cgn_candidate (id, org_id, code, name, id_card, gender, phone, email,
                                      education, work_unit, department, position, work_years,
                                      profession, occupation, level, exam_type, condition_no,
                                      photo_status, batch_id, candidate_type, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
          candidate-id (or (:orgId candidate) "") (str "IMP-" (subs (db/uuid) 0 8))
          (:name candidate) (:idCard candidate) (:gender candidate) (:phone candidate) (:email candidate)
          (:education candidate) (:workUnit candidate) (:department candidate) (:position candidate)
          work-years (:profession candidate) (:profession candidate) (:level candidate)
          (or (:examType candidate) "normal") (:conditionNo candidate)
          "pending" batch-id "batch" "active"])
        {:candidate-id candidate-id :created? true}))))

(defn- ensure-registration! [ds plan-id batch-id candidate-id candidate]
  (if-let [existing (db/execute-one! ds ["SELECT id FROM cgn_candidate_reg WHERE plan_id = ? AND batch_id = ? AND candidate_id = ?"
                                         plan-id batch-id candidate-id])]
    {:registration-id (:id existing) :existing? true}
    (let [reg-id (db/uuid)]
      (db/execute!
       ds
       ["INSERT INTO cgn_candidate_reg (id, org_id, code, plan_id, candidate_id, status, batch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
        reg-id (or (:orgId candidate) "") (str "REG-" (subs (db/uuid) 0 8)) plan-id candidate-id "submitted" batch-id])
      {:registration-id reg-id :created? true})))

(defn import-excel! [ds plan-id batch-id body]
  "Import candidates from parsed Excel data.
   body: {:mode 'clear|cover|ignore' :candidates [...]}"
  (let [mode (or (body-param body :mode "mode") "cover")
        candidates (normalized-candidates body)
        errors (atom [])]
    (when (= mode "clear")
      ;; Clear existing candidates for this batch
      (db/execute! ds ["DELETE FROM cgn_candidate_reg WHERE plan_id = ? AND batch_id = ?" plan-id batch-id]))
    (let [imported (doall
                    (map-indexed
                     (fn [idx c]
                       (let [row-errors (candidate-errors idx c)]
                         (if (seq row-errors)
                           (do
                             (swap! errors into row-errors)
                             nil)
                           (let [{:keys [candidate-id skipped? updated?]} (upsert-candidate! ds c mode batch-id)
                                 {:keys [registration-id]} (ensure-registration! ds plan-id batch-id candidate-id c)]
                             {:candidateId candidate-id
                              :registrationId registration-id
                              :name (:name c)
                              :skipped skipped?
                              :updated updated?}))))
                     candidates))]
      ;; Update batch candidate count
      (let [count-sql "SELECT COUNT(*) as cnt FROM cgn_candidate_reg WHERE plan_id = ? AND batch_id = ?"
            {:keys [cnt]} (db/execute-one! ds (into [count-sql] [plan-id batch-id]))]
        (db/execute! ds ["UPDATE cgn_exam_reg_batch SET candidate_count = ?, import_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?" cnt mode batch-id]))
      (let [items (vec (remove nil? imported))]
        {:imported (count (remove :skipped items))
         :skipped (count (filter :skipped items))
         :failed (count @errors)
         :mode mode
         :errors @errors
         :candidates items}))))

;; ─── Update photo status ───

(defn update-photo-status! [ds plan-id batch-id body]
  "Mark candidates as having photos uploaded"
  (let [ids (or (body-param body :candidate-ids "candidate-ids" :candidateIds "candidateIds") [])]
    (when (seq ids)
      (let [placeholders (str/join "," (repeat (count ids) "?"))
            sql (str "UPDATE cgn_candidate SET photo_status = 'uploaded' WHERE id IN (" placeholders ")")]
        (db/execute! ds (into [sql] ids)))
      (let [placeholders (str/join "," (repeat (count ids) "?"))
            sql (str "UPDATE cgn_candidate_reg SET photo_uploaded = 1 WHERE plan_id = ? AND candidate_id IN (" placeholders ")")]
        (db/execute! ds (into [sql plan-id] ids)))
      (when batch-id
        (db/execute! ds ["UPDATE cgn_exam_reg_batch SET photo_status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = ?" batch-id])))
    {:updated (count ids)}))
