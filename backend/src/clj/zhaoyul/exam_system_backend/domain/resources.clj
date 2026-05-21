(ns zhaoyul.exam-system-backend.domain.resources
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.infra.dialect :as dialect]))

(def resource-aliases
  {"organizations" "certification-organizations"
   "certification-organizations" "certification-organizations"
   "plans" "certification-plans"
   "certification-plans" "certification-plans"
   "supervision" "certification-supervision"
   "statistics" "certification-statistics"
   "approval-settings" "approval-settings"
   "approvals" "approvals"
   "certificate-reports" "certificate-reports"
   "certificates" "certificates"
   "certificates-group" "certificates"
   "certificates-print" "certificate-print-jobs"
   "certificate-print-jobs" "certificate-print-jobs"
   "fee-settings" "fee-settings"
   "historical" "historical-certifications"
   "historical-certifications" "historical-certifications"
   "exam-rooms" "exam-rooms"
   "registration-orgs" "registration-orgs"
   "exam-staff" "exam-staff"
   "supervisors" "supervisors"
   "marking-leads" "marking-leads"
   "violations" "trace-alerts"
   "special-applications" "special-applications"
   "exam-registration" "exam-registration"
   "exam-arrangement" "exam-arrangement"
   "exam-session" "exam-sessions"
   "exam-sessions" "exam-sessions"
   "score-publicity-manage" "score-publicity-batches"
   "score-publicity-batches" "score-publicity-batches"
   "evaluator-staff" "evaluator-staff"
   "declaration" "cert-declarations"
   "cert-declarations" "cert-declarations"
   "video-monitor" "video-monitor"
   "public-query" "certificates"
   "subject-categories" "subject-categories"
   "subject-sort" "subject-categories"
   "theory-subjects" "theory-subjects"
   "subjects" "theory-subjects"
   "knowledge" "knowledge-structures"
   "knowledge-structures" "knowledge-structures"
   "ratio" "structure-ratios"
   "structure-ratios" "structure-ratios"
   "theory-questions" "theory-questions"
   "theory" "theory-questions"
   "theory-paper-rules" "theory-paper-rules"
   "paper-rules" "theory-paper-rules"
   "paper-require" "theory-paper-requirements"
   "theory-paper-requirements" "theory-paper-requirements"
   "paper-library" "paper-library"
   "skill-subjects" "skill-subjects"
   "skill-modules" "skill-modules"
   "skill-questions" "skill-questions"
   "skill" "skill-questions"
   "skill-paper-rules" "skill-paper-rules"
   "skill-rules" "skill-paper-rules"
   "skill-require" "skill-paper-requirements"
   "skill-paper-requirements" "skill-paper-requirements"
   "experts" "experts"
   "expert-info" "experts"
   "expert-hiring" "expert-hiring"
   "hiring" "expert-hiring"
   "training" "expert-training"
   "expert-training" "expert-training"
   "evaluator-training" "evaluator-training"
   "expert-dispatch" "expert-dispatch"
   "dispatch" "expert-dispatch"
   "forms" "expert-forms"
   "personnel-statistics" "expert-statistics"
   "trace-cases" "trace-cases"
   "cases" "trace-cases"
   "trace-alerts" "trace-alerts"
   "alerts" "trace-alerts"
   "users" "system-users"
   "personnel" "personnel"
   "standards" "standard-settings"
   "questions" "theory-questions"
   "candidates" "candidates"
   "messages" "messages"
   "reports" "reports"})

(defn canonical-resource [resource]
  (get resource-aliases resource resource))

(defn- inflate [row]
  (when row
    (merge (dissoc row :payload :created_at :updated_at :org_id)
           (db/parse-json (:payload row))
           {:createdAt (:created_at row)
            :updatedAt (:updated_at row)
            :orgId (:org_id row)})))

(defn list-items [ds resource {:keys [q status org-id limit offset]}]
  (let [resource (canonical-resource resource)
        q (some-> q str/trim)
        status (some-> status str/trim)
        limit (min 200 (max 1 (Integer/parseInt (str (or limit 50)))))
        offset (max 0 (Integer/parseInt (str (or offset 0))))
        filters (cond-> ["resource = ?"]
                  (seq q) (conj "(name LIKE ? OR code LIKE ? OR payload LIKE ?)")
                  (seq status) (conj "status = ?")
                  (seq org-id) (conj "org_id = ?"))
        args (cond-> [resource]
               (seq q) (into [(str "%" q "%") (str "%" q "%") (str "%" q "%")])
               (seq status) (conj status)
               (seq org-id) (conj org-id))
        where (str/join " AND " filters)
        items (mapv inflate
                    (db/query ds
                              (into [(str "SELECT * FROM resource_item WHERE " where " ORDER BY updated_at DESC LIMIT ? OFFSET ?")]
                                    (conj args limit offset))))
        total-row (db/execute-one! ds (into [(str "SELECT COUNT(*) AS total FROM resource_item WHERE " where)] args))]
    {:items items :total (:total total-row) :limit limit :offset offset}))

(defn get-item [ds resource id]
  (inflate
   (db/execute-one!
    ds
    ["SELECT * FROM resource_item WHERE resource = ? AND id = ?"
     (canonical-resource resource) id])))

(defn create-item! [ds resource body]
  (let [resource (canonical-resource resource)
        id (or (:id body) (db/uuid))
        name (or (:name body) (:title body) (:planName body) (:orgName body) "未命名")
        status (dialect/normalize-status (:status body))
        payload (dissoc body :id :resource :code :name :status :orgId :org-id)
        org-id (or (:orgId body) (:org-id body))]
    (db/execute-one!
     ds
     ["INSERT INTO resource_item (id, resource, code, name, status, org_id, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)"
      id resource (:code body) name status org-id (db/json-str payload)])
    (get-item ds resource id)))

(defn update-item! [ds resource id body]
  (let [resource (canonical-resource resource)
        current (get-item ds resource id)
        merged (merge current body)
        name (or (:name merged) (:title merged) (:planName merged) (:orgName merged) "未命名")
        status (dialect/normalize-status (:status merged))
        payload (dissoc merged :id :resource :code :name :status :orgId :org-id :createdAt :updatedAt)
        org-id (or (:orgId merged) (:org-id merged))]
    (when current
      (db/execute!
       ds
       ["UPDATE resource_item
         SET code = ?, name = ?, status = ?, org_id = ?, payload = ?, updated_at = CURRENT_TIMESTAMP
         WHERE resource = ? AND id = ?"
        (:code merged) name status org-id (db/json-str payload) resource id])
      (get-item ds resource id))))

(defn delete-item! [ds resource id]
  (let [resource (canonical-resource resource)
        current (get-item ds resource id)]
    (when current
      (db/execute! ds ["DELETE FROM resource_item WHERE resource = ? AND id = ?" resource id])
      current)))

(def action-status
  {"submit" "待审核"
   "audit" "已审核"
   "approve" "已通过"
   "reject" "已退回"
   "reply" "已批复"
   "report" "已上报"
   "upload" "已上报"
   "cancel" "已取消"
   "cancel-upload" "待上报"
   "push" "已推送"
   "end" "已完成"
   "finish" "已完成"
   "generate" "已生成"
   "print" "已打印"
   "configure" "已配置"
   "assign" "已分配"
   "publish" "已发布"
   "unpublish" "待发布"
   "archive" "已归档"
   "restore" "active"})

(defn apply-action! [ds resource action body]
  (let [resource (canonical-resource resource)
        ids (vec (or (:ids body) (:idList body) []))
        status (get action-status action)
        action-record {:id (db/uuid)
                       :resource resource
                       :action action
                       :status (or status "已处理")
                       :affectedCount (count ids)
                       :requestedIds ids
                       :params (dissoc body :ids :idList)}]
    (when (and status (seq ids))
      (doseq [id ids]
        (when-let [current (get-item ds resource id)]
          (update-item! ds resource id (assoc current :status status :lastAction action)))))
    action-record))

(defn apply-item-action! [ds resource id action body]
  (let [resource (canonical-resource resource)
        status (get action-status action)
        current (get-item ds resource id)]
    (when current
      (if status
        (update-item! ds resource id (merge body {:status status :lastAction action}))
        (assoc current :lastAction action :actionParams body)))))
