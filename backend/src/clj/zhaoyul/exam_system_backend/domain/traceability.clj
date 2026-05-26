(ns zhaoyul.exam-system-backend.domain.traceability
  "溯源中心 — 溯源案例/溯源预警/时间轴聚合"
  (:require
   [cheshire.core :as json]
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->warning [row]
  (when row
    (-> row
        (assoc :traceNo (:trace_no row)
               :candidateName (:candidate_name row)
               :orgName (:org_name row)
               :planId (:plan_id row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :trace_no :candidate_name :org_name :plan_id :created_at :updated_at))))

;; ─── 溯源案例 (复用 resources 域，resource = trace-cases) ───

(def list-cases
  "列出溯源案例 — 委托给 resources/list-items"
  (fn [ds params]
    (resources/list-items ds "trace-cases" params)))

(def get-case
  "获取单个溯源案例"
  (fn [ds id]
    (resources/get-item ds "trace-cases" id)))

(def create-case!
  "创建溯源案例"
  (fn [ds body]
    (resources/create-item! ds "trace-cases" body)))

(def update-case!
  "更新溯源案例"
  (fn [ds id body]
    (resources/update-item! ds "trace-cases" id body)))

(def delete-case!
  "删除溯源案例"
  (fn [ds id]
    (resources/delete-item! ds "trace-cases" id)))

;; ─── 溯源预警 (使用 cgn_warning_record 表) ───

(defn list-alerts [ds {:keys [q candidate-name status level org-id]}]
  (let [q (some-> q str)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(trace_no LIKE ? OR candidate_name LIKE ?)")
                  (seq candidate-name) (conj "candidate_name LIKE ?")
                  (seq status) (conj "status = ?")
                  (seq level) (conj "level = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq candidate-name) (conj (str "%" candidate-name "%"))
               (seq status) (conj status)
               (seq level) (conj level)
               (seq org-id) (conj org-id))
        sql (str "SELECT * FROM cgn_warning_record WHERE " (clojure.string/join " AND " filters) " ORDER BY updated_at DESC")]
    {:items (mapv row->warning (db/query ds (into [sql] args)))}))

(defn get-alert [ds id]
  (row->warning (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])))

(defn create-alert! [ds body]
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO cgn_warning_record (id, org_id, code, trace_no, candidate_name, org_name, stage, level, problem, plan_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
       id (or (:orgId body) "") (:code body) (:traceNo body)
       (:candidateName body) (:orgName body) (:stage body)
       (:level body) (:problem body) (:planId body)
       (or (:status body) "processing")])
    (get-alert ds id)))

(defn update-alert! [ds id body]
  (let [current (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])]
    (when current
      (db/execute! ds
        ["UPDATE cgn_warning_record
          SET code = ?, trace_no = ?, candidate_name = ?, org_name = ?, stage = ?, level = ?,
              problem = ?, plan_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?"
         (or (:code body) (:code current))
         (or (:traceNo body) (:trace_no current))
         (or (:candidateName body) (:candidate_name current))
         (or (:orgName body) (:org_name current))
         (or (:stage body) (:stage current))
         (or (:level body) (:level current))
         (or (:problem body) (:problem current))
         (or (:planId body) (:plan_id current))
         (or (:status body) (:status current))
         id])
      (get-alert ds id))))

(defn delete-alert! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_warning_record WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_warning_record WHERE id = ?" id])
    true))

;; ─── 时间轴聚合查询 ───

(defn- row->timeline-event
  "Convert a DB row into TimelineEvent format.
   Expected row keys: :type, :time, :operator, :title, :detail, :status"
  [row]
  (when row
    {:type (keyword (:type row))
     :time (:time row)
     :operator (or (:operator row) "系统")
     :title (:title row)
     :detail (or (:detail row) "")
     :status (or (:status row) "completed")}))

(defn get-candidate-timeline
  "Return a list that includes all traceable events for a candidate,
   in chronological order from registration => arrangement => exams => scores => certificate.
   Each event contains: :type :time :operator :title :detail :status"
  [ds candidate-id]
  (let [reg-events (->> (db/query ds
                           [(str "SELECT 'registration' AS type, r.created_at AS time,"
                                 " COALESCE(o.name, '报名管理员') AS operator,"
                                 " '考生报名与审核' AS title,"
                                 " '考生报名提交资料，审核通过。' AS detail,"
                                 " CASE WHEN r.status = 'submitted' THEN 'completed'"
                                 " WHEN r.status = 'pending' THEN 'active' ELSE 'pending' END AS status"
                                 " FROM cgn_candidate_reg r"
                                 " LEFT JOIN cgn_reg_org o ON r.reg_org_id = o.id"
                                 " WHERE r.candidate_id = ?"
                                 " ORDER BY r.created_at ASC") candidate-id])
                        (mapv row->timeline-event))
        arr-events (->> (db/query ds
                           [(str "SELECT 'arrangement' AS type, s.start_at AS time,"
                                 " COALESCE(es.name, '考务管理员') AS operator,"
                                 " '考场与准考证编排' AS title,"
                                 " '考场已编排，准考证已生成。' AS detail,"
                                 " CASE WHEN s.status = 'scheduled' THEN 'completed'"
                                 " WHEN r.status = 'submitted' THEN 'active' ELSE 'pending' END AS status"
                                 " FROM cgn_candidate_reg r"
                                 " LEFT JOIN cgn_exam_session s ON s.plan_id = r.plan_id"
                                 " LEFT JOIN cgn_exam_room er ON s.exam_room_id = er.id"
                                 " LEFT JOIN cgn_exam_staff es ON es.org_id = s.org_id AND es.staff_type = 'exam_staff'"
                                 " WHERE r.candidate_id = ? AND s.id IS NOT NULL"
                                 " ORDER BY s.start_at ASC") candidate-id])
                        (mapv row->timeline-event))
        score-events (->> (db/query ds
                             [(str "SELECT 'score' AS type, s.created_at AS time,"
                                   " COALESCE(u.display_name, '成绩管理员') AS operator,"
                                   " '成绩录入与复核' AS title,"
                                   " '理论' || s.theory_score || '分，技能' || s.skill_score || '分，综合' || s.total_score || '分' AS detail,"
                                   " CASE WHEN s.status = 'locked' THEN 'completed'"
                                   " WHEN s.status = 'draft' THEN 'active' ELSE 'pending' END AS status"
                                   " FROM cgn_score s"
                                   " LEFT JOIN app_user u ON s.org_id = u.org_id"
                                   " WHERE s.candidate_id = ?"
                                   " ORDER BY s.created_at ASC") candidate-id])
                          (mapv row->timeline-event))
        cert-events (->> (db/query ds
                            [(str "SELECT 'certificate' AS type, c.created_at AS time,"
                                  " COALESCE(u.display_name, '证书管理员') AS operator,"
                                  " '证书生成与确认' AS title,"
                                  " '证书编号' || c.cert_no || '已生成' AS detail,"
                                  " CASE WHEN c.status IN ('printed','issued') THEN 'completed' ELSE 'pending' END AS status"
                                  " FROM cgn_certificate c"
                                  " LEFT JOIN app_user u ON c.org_id = u.org_id"
                                  " WHERE c.id_card = (SELECT id_card FROM cgn_candidate WHERE id = ?)"
                                  " ORDER BY c.created_at ASC") candidate-id])
                         (mapv row->timeline-event))
        audit-events (->> (db/query ds
                             [(str "SELECT 'score' AS type, a.created_at AS time,"
                                   " COALESCE(u.display_name, '系统') AS operator,"
                                   " '成绩修改记录' AS title, a.payload AS detail, 'completed' AS status"
                                   " FROM audit_log a"
                                   " LEFT JOIN app_user u ON a.actor_id = COALESCE(u.id, '')"
                                   " WHERE a.resource = 'cgn_score' AND a.action = 'update_score'"
                                   " AND a.payload LIKE '%' || ? || '%'"
                                   " ORDER BY a.created_at DESC") (str "\"candidate_id\":\"" candidate-id "\"")])
                         (mapv (fn [row]
                                 (let [p (db/parse-json (:detail row))
                                       d (str (when-let [st (:subject_type p)] (str st "成绩: "))
                                              (when-let [old (:old_score p)] (str old " → "))
                                              (when-let [new (:new_score p)] (str new))
                                              (when-let [r (:reason p)] (str " (理由: " r ")")))]
                                   (-> (row->timeline-event (assoc row :detail d))
                                       (assoc :type :score))))))
        all-events (->> (concat reg-events arr-events score-events cert-events audit-events)
                        (sort-by :time)
                        vec)]
    all-events))

(defn get-candidate-audit-logs
  "Return score modification audit logs for a candidate.
   Returns [] if no modification records exist."
  [ds candidate-id]
  (let [rows (db/query ds
                ["SELECT
                    a.id,
                    a.created_at,
                    a.actor_id,
                    a.action,
                    a.payload,
                    COALESCE(u.display_name, '系统') AS actor_name
                  FROM audit_log a
                  LEFT JOIN app_user u ON a.actor_id = u.id
                  WHERE a.resource = 'cgn_score'
                    AND a.action = 'update_score'
                    AND a.payload LIKE '%' || ? || '%'
                  ORDER BY a.created_at DESC" (str "\"candidate_id\":\"" candidate-id "\"")])]
    (mapv (fn [row]
            (let [payload (db/parse-json (:payload row))
                  is-theory (= "theory" (:subject_type payload))
                  is-skill (= "skill" (:subject_type payload))]
              {:id (:id row)
               :createdAt (:created_at row)
               :actorId (:actor_id row)
               :actorName (:actor_name row)
               :action (:action row)
               :theoryScore (when is-theory
                              {:old (:old_score payload) :new (:new_score payload)})
               :skillScore (when is-skill
                             {:old (:old_score payload) :new (:new_score payload)})
               :reason (:reason payload)
               :candidateId (:candidate_id payload)
               :planId (:plan_id payload)}))
          rows)))

;; ─── 通用操作留痕 ───

(def action-labels
  {"create-resource" "新增业务数据"
   "update-resource" "修改业务数据"
   "delete-resource" "删除业务数据"
   "action-submit" "提交"
   "action-audit" "审核"
   "action-approve" "审核通过"
   "action-reject" "退回"
   "action-reply" "批复"
   "action-report" "上报"
   "action-upload" "上传"
   "action-cancel" "取消"
   "action-cancel-upload" "撤销上报"
   "action-push" "推送"
   "action-end" "结束"
   "action-finish" "完成"
   "action-generate" "生成"
   "action-print" "打印"
   "action-configure" "配置"
   "action-assign" "分配"
   "action-publish" "发布"
   "action-unpublish" "取消发布"
   "action-archive" "归档"
   "action-restore" "恢复"
   "update_score" "成绩修改"
   "create_user" "开通用户"
   "update_user" "修改用户"
   "lock_user" "锁定用户"
   "unlock_user" "解锁用户"
   "reset_password" "重置密码"
   "authorize_user" "授权用户"})

(defn- parse-int-param [value default max-value]
  (let [parsed (try
                 (Integer/parseInt (str value))
                 (catch Exception _ default))]
    (min max-value (max 1 parsed))))

(defn- audit-title [resource action payload]
  (let [label (get action-labels action action)
        name (or (:name payload) (:title payload) (:planName payload) (:orgName payload) (:candidateName payload))]
    (str label (when (seq resource) (str " · " resource)) (when (seq name) (str " · " name)))))

(defn- audit-detail [payload]
  (let [parts (cond-> []
                (:status payload) (conj (str "状态：" (:status payload)))
                (:affectedCount payload) (conj (str "影响数量：" (:affectedCount payload)))
                (:reason payload) (conj (str "原因：" (:reason payload)))
                (:requestedIds payload) (conj (str "对象：" (str/join "、" (:requestedIds payload))))
                (:params payload) (conj (str "参数：" (json/generate-string (:params payload))))
                (:old_score payload) (conj (str "原成绩：" (:old_score payload)))
                (:new_score payload) (conj (str "新成绩：" (:new_score payload))))]
    (if (seq parts)
      (str/join "；" parts)
      (json/generate-string payload))))

(defn- audit-type [action]
  (cond
    (= action "update_score") :score
    (str/includes? action "approve") :review
    (str/includes? action "reject") :review
    (str/includes? action "audit") :review
    (str/includes? action "upload") :material
    (str/includes? action "generate") :certificate
    (str/includes? action "print") :certificate
    :else :operation))

(defn- row->audit-event [row]
  (let [payload (db/parse-json (:payload row))
        action (:action row)
        resource (:resource row)]
    {:id (:id row)
     :type (audit-type action)
     :time (:created_at row)
     :operator (or (:actor_name row) "系统")
     :title (audit-title resource action payload)
     :detail (audit-detail payload)
     :status "completed"
     :action action
     :resource resource
     :resourceId (:resource_id row)
     :actorId (:actor_id row)
     :payload payload}))

(defn list-audit-events
  "查询系统操作留痕，可按 resource/resourceId/q 过滤。"
  [ds params]
  (let [param #(or (get params %) (get params (keyword %)))
        resource (some-> (param "resource") str/trim)
        resource-id (or (some-> (param "resourceId") str/trim)
                        (some-> (param "resource-id") str/trim))
        q (some-> (param "q") str/trim)
        limit (parse-int-param (or (param "limit") 50) 50 200)
        offset (max 0 (try
                        (Integer/parseInt (str (or (param "offset") 0)))
                        (catch Exception _ 0)))
        filters (cond-> ["1 = 1"]
                  (seq resource) (conj "a.resource = ?")
                  (seq resource-id) (conj "a.resource_id = ?")
                  (seq q) (conj "(a.action LIKE ? OR a.resource LIKE ? OR a.resource_id LIKE ? OR a.payload LIKE ? OR u.display_name LIKE ?)"))
        args (cond-> []
               (seq resource) (conj resource)
               (seq resource-id) (conj resource-id)
               (seq q) (into (repeat 5 (str "%" q "%"))))
        where (str/join " AND " filters)
        select-sql (str "SELECT a.id, a.created_at, a.actor_id, a.action, a.resource, a.resource_id, a.payload,"
                        " COALESCE(u.display_name, '系统') AS actor_name"
                        " FROM audit_log a"
                        " LEFT JOIN app_user u ON a.actor_id = u.id"
                        " WHERE " where
                        " ORDER BY a.created_at DESC, a.id DESC LIMIT ? OFFSET ?")
        count-sql (str "SELECT COUNT(*) AS total FROM audit_log a"
                       " LEFT JOIN app_user u ON a.actor_id = u.id"
                       " WHERE " where)
        rows (db/query ds (into [select-sql] (conj args limit offset)))
        total (:total (db/execute-one! ds (into [count-sql] args)))]
    {:items (mapv row->audit-event rows)
     :total total
     :limit limit
     :offset offset}))
