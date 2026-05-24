(ns zhaoyul.exam-system-backend.domain.scores
  "成绩管理 — 理论/技能成绩 CRUD + audit_log + 公示锁定"
  (:require
   [cheshire.core :as json]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->score [row]
  (when row
    (-> row
        (assoc :candidateId (:candidate_id row)
               :candidateName (:candidate_name row)
               :planId (:plan_id row)
               :theoryScore (:theory_score row)
               :skillScore (:skill_score row)
               :totalScore (:total_score row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :candidate_id :candidate_name :plan_id
                :theory_score :skill_score :total_score
                :created_at :updated_at))))

;; ─── 公示期检查 ───

(defn- get-publicity [ds plan-id]
  (db/execute-one! ds
    ["SELECT * FROM cgn_score_publicity WHERE plan_id = ?" plan-id]))

(defn- publicity-open? [ds plan-id]
  (if-let [p (get-publicity ds plan-id)]
    (and (= "publicizing" (:status p))
         (or (nil? (:publicity_start p))
             (let [now (java.time.LocalDateTime/now)
                   start (java.time.LocalDateTime/parse (:publicity_start p))]
               (not (.isBefore now start))))
         (or (nil? (:publicity_end p))
             (let [now (java.time.LocalDateTime/now)
                   end (java.time.LocalDateTime/parse (:publicity_end p))]
               (.isBefore now end))))
    false))

(defn- publicity-expired? [ds plan-id]
  (if-let [p (get-publicity ds plan-id)]
    (and (:publicity_end p)
         (let [now (java.time.LocalDateTime/now)
               end (java.time.LocalDateTime/parse (:publicity_end p))]
           (.isAfter now end)))
    false))

(defn- publicity-not-started? [ds plan-id]
  (if-let [p (get-publicity ds plan-id)]
    (and (:publicity_start p)
         (let [now (java.time.LocalDateTime/now)
               start (java.time.LocalDateTime/parse (:publicity_start p))]
           (.isBefore now start)))
    false))

(defn- maybe-auto-lock! [ds plan-id]
  (when (publicity-expired? ds plan-id)
    (db/execute! ds
      ["UPDATE cgn_score_publicity SET status = 'locked', updated_at = CURRENT_TIMESTAMP
        WHERE plan_id = ? AND status = 'publicizing'" plan-id])
    (db/execute! ds
      ["UPDATE cgn_score SET status = 'locked', updated_at = CURRENT_TIMESTAMP
        WHERE plan_id = ? AND status != 'locked'" plan-id])))

(defn get-publicity-status
  "Returns publicity status info for a plan.
   Status keywords: :not-started, :publicizing, :expired, :locked, :none"
  [ds plan-id]
  (if-let [p (get-publicity ds plan-id)]
    (let [result {:id (:id p)
                  :planId (:plan_id p)
                  :name (:name p)
                  :publicityStart (:publicity_start p)
                  :publicityEnd (:publicity_end p)
                  :publicityDays (:publicity_days p)
                  :candidateCount (:candidate_count p)}]
      (cond
        (= "locked" (:status p))
        (assoc result :status "locked" :label "已锁定")
        (publicity-expired? ds plan-id)
        (assoc result :status "expired" :label "公示已结束")
        (publicity-not-started? ds plan-id)
        (assoc result :status "pending" :label "待公示")
        (publicity-open? ds plan-id)
        (assoc result :status "publicizing" :label "公示中")
        (= "publicizing" (:status p))
        (assoc result :status "publicizing" :label "公示中")
        :else
        (assoc result :status (:status p) :label (str (:status p)))))
    {:status "none" :label "未配置公示"}))

;; ─── audit_log ───

(defn- write-audit-log! [ds {:keys [actor-id action resource resource-id payload]}]
  (let [id (db/uuid)]
    (db/execute! ds
      ["INSERT INTO audit_log (id, actor_id, action, resource, resource_id, payload)
        VALUES (?, ?, ?, ?, ?, ?)"
       id (or actor-id "")
       action resource resource-id
       (db/json-str payload)])
    id))

;; ─── 查询 ───

(defn list-scores [ds {:keys [q plan-id candidate-id status org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq plan-id) (conj "plan_id = ?")
                  (seq candidate-id) (conj "candidate_id = ?")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?")
                  (seq q) (conj "(candidate_name LIKE ? OR code LIKE ?)"))
        args (cond-> []
               (seq plan-id) (conj plan-id)
               (seq candidate-id) (conj candidate-id)
               (seq status) (conj status)
               (seq org-id) (conj org-id)
               (seq q) (into [(str "%" q "%") (str "%" q "%")]))
        sql (str "SELECT * FROM cgn_score WHERE "
                 (clojure.string/join " AND " filters)
                 " ORDER BY updated_at DESC")]
    ;; Auto-lock expired publicity periods on query
    (when (seq plan-id)
      (try (maybe-auto-lock! ds plan-id) (catch Exception _)))
    {:items (mapv row->score (db/query ds (into [sql] args)))}))

(defn get-score [ds id]
  (row->score (db/execute-one! ds ["SELECT * FROM cgn_score WHERE id = ?" id])))

;; ─── 创建 ───

(defn create-score! [ds body]
  (let [id (or (:id body) (db/uuid))
        plan-id (:planId body)
        candidate-id (:candidateId body)]
    (when (publicity-expired? ds plan-id)
      (throw (ex-info "公示期已结束，不能录入新成绩" {:plan-id plan-id})))
    (db/execute! ds
      ["INSERT INTO cgn_score (id, org_id, code, plan_id, candidate_id, candidate_name,
                               theory_score, skill_score, total_score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (or (:code body) "")
       plan-id candidate-id
       (:candidateName body)
       (:theoryScore body)
       (:skillScore body)
       (:totalScore body)
       (or (:status body) "draft")])
    ;; 记录创建审计
    (write-audit-log! ds
      {:actor-id (:actorId body)
       :action "create_score"
       :resource "cgn_score"
       :resource-id id
       :payload {:candidate_id candidate-id
                 :plan_id plan-id
                 :theory_score (:theoryScore body)
                 :skill_score (:skillScore body)
                 :reason (:reason body)}})
    (get-score ds id)))

;; ─── 更新（含 audit_log） ───

(defn update-score! [ds id body & {:keys [actor-id]}]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_score WHERE id = ?" id])]
    (when-not current
      (throw (ex-info "成绩记录不存在" {:id id})))
    (let [plan-id (:plan_id current)]
      ;; 公示期已过期 → 锁定，不允许修改
      (when (publicity-expired? ds plan-id)
        (throw (ex-info "公示期已结束，成绩已锁定，不能修改" {:plan-id plan-id})))
      ;; 收集变更
      (let [old-theory (:theory_score current)
            new-theory (:theoryScore body)
            old-skill (:skill_score current)
            new-skill (:skillScore body)
            changes (cond-> []
                      (and (some? new-theory) (not= old-theory new-theory))
                      (conj {:subject_type "theory"
                             :old_score old-theory
                             :new_score new-theory
                             :reason (:reason body)})
                      (and (some? new-skill) (not= old-skill new-skill))
                      (conj {:subject_type "skill"
                             :old_score old-skill
                             :new_score new-skill
                             :reason (:reason body)}))]
        ;; 执行更新
        (db/execute! ds
          ["UPDATE cgn_score
            SET theory_score = COALESCE(?, theory_score),
                skill_score = COALESCE(?, skill_score),
                total_score = COALESCE(?, total_score),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?"
           (:theoryScore body)
           (:skillScore body)
           (:totalScore body)
           (:status body)
           id])
        ;; 每条变更写一条 audit_log
        (doseq [change changes]
          (write-audit-log! ds
            {:actor-id (or actor-id (:actorId body))
             :action "update_score"
             :resource "cgn_score"
             :resource-id id
             :payload (merge {:candidate_id (:candidate_id current)
                              :plan_id plan-id}
                             change)}))
        (get-score ds id)))))

;; ─── 删除 ───

(defn delete-score! [ds id & {:keys [actor-id]}]
  (when-let [current (db/execute-one! ds ["SELECT * FROM cgn_score WHERE id = ?" id])]
    (let [plan-id (:plan_id current)]
      (when (publicity-expired? ds plan-id)
        (throw (ex-info "公示期已结束，成绩已锁定，不能删除" {:plan-id plan-id}))))
    (db/execute! ds ["DELETE FROM cgn_score WHERE id = ?" id])
    (write-audit-log! ds
      {:actor-id (or actor-id "")
       :action "delete_score"
       :resource "cgn_score"
       :resource-id id
       :payload {:candidate_id (:candidate_id current)
                 :plan_id (:plan_id current)
                 :old_theory_score (:theory_score current)
                 :old_skill_score (:skill_score current)}})
    true))

;; ─── 锁定/解锁 ───

(defn lock-scores-by-plan! [ds plan-id]
  (db/execute! ds
    ["UPDATE cgn_score SET status = 'locked', updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ? AND status != 'locked'" plan-id])
  (db/execute! ds
    ["UPDATE cgn_score_publicity SET status = 'locked', updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ? AND status = 'publicizing'" plan-id]))

(defn unlock-scores-by-plan! [ds plan-id]
  (db/execute! ds
    ["UPDATE cgn_score SET status = 'draft', updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ? AND status = 'locked'" plan-id])
  (db/execute! ds
    ["UPDATE cgn_score_publicity SET status = 'publicizing', updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ? AND status = 'locked'" plan-id]))

;; ─── 批量录入 ───

(defn batch-create-scores! [ds scores actor-id]
  (mapv (fn [score]
          (create-score! ds (assoc score :actorId actor-id)))
        scores))

;; ─── audit_log 查询 ───

(defn get-audit-logs [ds & {:keys [resource-id plan-id candidate-id]}]
  (let [filters (cond-> []
                  resource-id (conj "resource_id = ?")
                  plan-id (conj "payload LIKE ?")
                  candidate-id (conj "payload LIKE ?"))
        args (cond-> []
               resource-id (conj resource-id)
               plan-id (conj (str "%\"plan_id\":\"" plan-id "\"%"))
               candidate-id (conj (str "%\"candidate_id\":\"" candidate-id "\"%")))]
    (if (seq filters)
      (let [sql (str "SELECT * FROM audit_log WHERE resource = 'cgn_score' AND "
                     (clojure.string/join " AND " filters)
                     " ORDER BY created_at DESC")]
        (mapv (fn [row]
                (-> row
                    (assoc :actor-id (:actor_id row)
                           :resource-id (:resource_id row)
                           :created-at (:created_at row)
                           :payload (db/parse-json (:payload row)))
                    (dissoc :actor_id :resource_id :created_at)))
              (db/query ds (into [sql] args))))
      (db/query ds ["SELECT * FROM audit_log WHERE resource = 'cgn_score' ORDER BY created_at DESC"]))))
