(ns zhaoyul.exam-system-backend.domain.certificate
  "证书管理 — 批次管理 + 证书号生成 + 打印
   使用 numbering 服务的全局原子序列号生成证书号。
   证书号格式: 站点代码 + 2位年度 + 1位等级编码 + 6位顺序号"
  (:require
   [next.jdbc :as jdbc]
   [zhaoyul.exam-system-backend.domain.numbering :as numbering]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ═══════════════════════════════════════════════════════════════
;; 证书批次管理
;; ═══════════════════════════════════════════════════════════════

(defn list-batches
  "分页查询证书批次列表。支持 planId、status 筛选。"
  [ds {:keys [plan-id status q limit offset]
       :or {limit 50 offset 0}}]
  (let [limit  (min 200 (max 1 (int (or limit 50))))
        offset (max 0 (int (or offset 0)))
        filters (cond-> ["1 = 1"]
                  (seq plan-id) (conj "plan_id = ?")
                  (seq status) (conj "status = ?")
                  (seq q) (conj "(name LIKE ? OR batch_no LIKE ?)"))
        where-clause (clojure.string/join " AND " filters)
        args (concat
              (when (seq plan-id) [plan-id])
              (when (seq status) [status])
              (when (seq q) [(str "%" q "%") (str "%" q "%")]))
        sql (str "SELECT b.*, "
                 "(SELECT COUNT(*) FROM cgn_certificate c WHERE c.batch_id = b.id) AS certificate_count "
                 "FROM cgn_cert_batch b "
                 "WHERE " where-clause
                 " ORDER BY b.updated_at DESC LIMIT ? OFFSET ?")
        count-sql (str "SELECT COUNT(*) AS total FROM cgn_cert_batch WHERE " where-clause)
        items (db/query ds (into [sql] (concat args [limit offset])))
        total-row (db/execute-one! ds (into [count-sql] args))]
    {:items  items
     :total  (:total total-row)
     :limit  limit
     :offset offset}))

(defn get-batch
  "获取单个批次详情，包括关联的证书列表。"
  [ds batch-id]
  (let [batch (db/execute-one!
              ds
              ["SELECT * FROM cgn_cert_batch WHERE id = ?" batch-id])]
    (when batch
      (let [certs (db/query
                   ds
                   ["SELECT * FROM cgn_certificate WHERE batch_id = ? ORDER BY cert_no"
                    batch-id])]
        (assoc batch :certificates certs)))))

(defn create-batch!
  "创建证书批次。"
  [ds {:keys [org-id plan-id batch-no name issue-date cert-type]
       :or {cert-type "skill_level"}
       :as params}]
  (let [id (or (:id params) (db/uuid))
        code (or (:code params) "")
        batch-no (or batch-no (str "BATCH-" (.substring (str (java.time.LocalDateTime/now)) 0 16)))
        name (or name "未命名批次")]
    (db/execute!
     ds
     ["INSERT INTO cgn_cert_batch (id, org_id, code, plan_id, batch_no, name, issue_date, cert_type, status, print_status, report_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', 'pending', 'pending')"
      id (or org-id "") code plan-id batch-no name issue-date cert-type])
    (get-batch ds id)))

(defn update-batch!
  "更新批次信息。"
  [ds batch-id {:keys [name issue-date status print-status report-status]}]
  (let [current (db/execute-one!
                ds
                ["SELECT * FROM cgn_cert_batch WHERE id = ?" batch-id])]
    (when current
      (db/execute!
       ds
       ["UPDATE cgn_cert_batch
         SET name = COALESCE(?, name),
             issue_date = COALESCE(?, issue_date),
             status = COALESCE(?, status),
             print_status = COALESCE(?, print_status),
             report_status = COALESCE(?, report_status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        name issue-date status print-status report-status batch-id])
      (get-batch ds batch-id))))

;; ═══════════════════════════════════════════════════════════════
;; 证书生成 — 原子批量生成证书号
;; ═══════════════════════════════════════════════════════════════

(defn generate-batch-certificates!
  "为一个批次的所有候选人原子生成证书号并写入 cgn_certificate 表。
   参数:
     :batch-id    — 批次 ID
     :candidates  — 候选证书申请列表 [{:name, :id-card, :occupation, :level, ...}]
     :site-code   — 站点代码 (如 GD)
     :year        — 年度 (如 2026)
     :issue-date  — 发证日期
   返回 map: {:batch-id, :certificates, :count}
   所有操作在 SQLite 事务内完成，确保证书号全局唯一。"
  [ds {:keys [batch-id candidates site-code year issue-date plan-id org-id]
       :as _params}]
  (when (empty? candidates)
    (throw (ex-info "候选人列表不能为空" {:batch-id batch-id})))
  (jdbc/with-transaction [tx ds]
    (let [batch (db/execute-one!
                tx
                ["SELECT * FROM cgn_cert_batch WHERE id = ?" batch-id])
          _ (when-not batch
              (throw (ex-info "批次不存在" {:batch-id batch-id})))
          certificates
          (mapv
           (fn [candidate]
             (let [{:keys [cert-number level-code]}
                   (numbering/generate-cert-number!
                    tx
                    {:site-code site-code
                     :year      year
                     :level     (:level candidate)})
                   cert-id (db/uuid)
                   code    (or (:code candidate) "")]
               (db/execute!
                tx
                ["INSERT INTO cgn_certificate
                  (id, org_id, code, batch_id, cert_no, candidate_name, id_card, occupation, level, level_code, plan_id, issue_date, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'issued')"
                 cert-id
                 (or org-id (:org_id batch) "")
                 code
                 batch-id
                 cert-number
                 (:name candidate)
                 (:id-card candidate)
                 (:occupation candidate)
                 (:level candidate)
                 level-code
                 (or plan-id (:plan_id batch))
                 issue-date])
               {:id        cert-id
                :certNo    cert-number
                :name      (:name candidate)
                :occupation (:occupation candidate)
                :level     (:level candidate)
                :levelCode level-code}))
           candidates)]
      ;; 更新批次的证书计数和状态
      (db/execute!
       tx
       ["UPDATE cgn_cert_batch
         SET certificate_count = ?,
             status = 'generated',
             issue_date = COALESCE(?, issue_date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
        (count certificates)
        issue-date
        batch-id])
      {:batch-id     batch-id
       :certificates certificates
       :count        (count certificates)})))

(defn- passed-score-candidates [ds plan-id]
  (db/query
   ds
   ["SELECT s.id AS score_id,
           s.org_id,
           s.plan_id,
           s.candidate_id,
           s.candidate_name,
           s.total_score,
           c.id_card,
           c.occupation,
           c.profession,
           c.level
     FROM cgn_score s
     LEFT JOIN cgn_candidate c ON c.id = s.candidate_id
     WHERE s.plan_id = ? AND s.total_score >= 60
     ORDER BY s.candidate_name"
    plan-id]))

(defn- existing-cert-id-cards [ds plan-id]
  (->> (db/query ds ["SELECT id_card FROM cgn_certificate WHERE plan_id = ?" plan-id])
       (map :id_card)
       (remove nil?)
       set))

(defn generate-plan-certificates!
  "按计划从通过成绩生成证书批次和证书，自动跳过已生成证书的身份证号。"
  [ds {:keys [plan-id issue-date site-code year org-id batch-no name]
       :or {site-code "GD"}
       :as _params}]
  (when-not (seq (str plan-id))
    (throw (ex-info "plan-id不能为空" {})))
  (let [plan (db/execute-one! ds ["SELECT * FROM cgn_recog_plan WHERE id = ?" plan-id])
        _ (when-not plan (throw (ex-info "认定计划不存在" {:plan-id plan-id})))
        existing-id-cards (existing-cert-id-cards ds plan-id)
        candidates (->> (passed-score-candidates ds plan-id)
                        (remove #(contains? existing-id-cards (:id_card %)))
                        (mapv (fn [row]
                                {:name (:candidate_name row)
                                 :id-card (:id_card row)
                                 :occupation (or (:profession row) (:occupation row) (:occupation plan))
                                 :level (or (:level row) (:level plan))
                                 :code (:score_id row)})))
        batch (create-batch!
               ds
               {:org-id (or org-id (:org_id plan))
                :plan-id plan-id
                :batch-no (or batch-no (str "CERT-" (:code plan)))
                :name (or name (str (:name plan) "证书批次"))
                :issue-date issue-date})]
    (if (seq candidates)
      (assoc (generate-batch-certificates!
              ds
              {:batch-id (:id batch)
               :candidates candidates
               :site-code site-code
               :year (or year (.getYear (java.time.LocalDate/now)))
               :issue-date issue-date
               :plan-id plan-id
               :org-id (or org-id (:org_id plan))})
             :skipped (count existing-id-cards))
      {:batch-id (:id batch)
       :certificates []
       :count 0
       :skipped (count existing-id-cards)
       :message "没有新的合格成绩可生成证书"})))

;; ═══════════════════════════════════════════════════════════════
;; 证书查询
;; ═══════════════════════════════════════════════════════════════

(defn get-batch-certificates
  "获取批次下所有证书。"
  [ds batch-id]
  (db/query
   ds
   ["SELECT * FROM cgn_certificate WHERE batch_id = ? ORDER BY cert_no"
    batch-id]))

(defn get-certificate
  "获取单个证书详情。"
  [ds cert-id]
  (db/execute-one!
   ds
   ["SELECT * FROM cgn_certificate WHERE id = ?" cert-id]))

(defn list-certificates
  "分页查询证书列表。支持 batchId、status、关键词筛选。"
  [ds {:keys [batch-id status q limit offset]
       :or {limit 50 offset 0}}]
  (let [limit  (min 200 (max 1 (int (or limit 50))))
        offset (max 0 (int (or offset 0)))
        filters (cond-> ["1 = 1"]
                  (seq batch-id) (conj "batch_id = ?")
                  (seq status) (conj "status = ?")
                  (seq q) (conj "(candidate_name LIKE ? OR cert_no LIKE ? OR id_card LIKE ?)"))
        where-clause (clojure.string/join " AND " filters)
        args (concat
              (when (seq batch-id) [batch-id])
              (when (seq status) [status])
              (when (seq q) [(str "%" q "%") (str "%" q "%") (str "%" q "%")]))
        sql (str "SELECT * FROM cgn_certificate WHERE " where-clause
                 " ORDER BY cert_no LIMIT ? OFFSET ?")
        count-sql (str "SELECT COUNT(*) AS total FROM cgn_certificate WHERE " where-clause)
        items (db/query ds (into [sql] (concat args [limit offset])))
        total-row (db/execute-one! ds (into [count-sql] args))]
    {:items  items
     :total  (:total total-row)
     :limit  limit
     :offset offset}))

;; ═══════════════════════════════════════════════════════════════
;; 打印管理
;; ═══════════════════════════════════════════════════════════════

(defn mark-batch-printed!
  "将批次标记为已打印，同时标记批次下所有证书为已打印。"
  [ds batch-id]
  (let [batch (db/execute-one!
              ds
              ["SELECT * FROM cgn_cert_batch WHERE id = ?" batch-id])]
    (when-not batch
      (throw (ex-info "批次不存在" {:batch-id batch-id})))
    (jdbc/with-transaction [tx ds]
      ;; 更新所有关联证书
      (db/execute!
       tx
       ["UPDATE cgn_certificate SET status = 'printed', updated_at = CURRENT_TIMESTAMP
         WHERE batch_id = ?" batch-id])
      ;; 更新批次
      (db/execute!
       tx
       ["UPDATE cgn_cert_batch
         SET print_status = 'printed', status = 'completed', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?" batch-id])
      (get-batch tx batch-id))))

(defn mark-certificates-printed!
  "将指定证书 ID 列表标记为已打印。"
  [ds cert-ids]
  (when (empty? cert-ids)
    (throw (ex-info "证书ID列表不能为空" {})))
  (let [placeholders (clojure.string/join "," (repeat (count cert-ids) "?"))]
    (db/execute!
     ds
     (into [(str "UPDATE cgn_certificate SET status = 'printed', updated_at = CURRENT_TIMESTAMP WHERE id IN (" placeholders ")")]
           cert-ids))
    {:updated (count cert-ids)}))
