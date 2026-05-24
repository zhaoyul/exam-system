(ns zhaoyul.exam-system-backend.web.controllers.scores
  "成绩管理 API — 分数 CRUD + audit_log 查询"
  (:require
   [zhaoyul.exam-system-backend.domain.scores :as scores]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 成绩 CRUD ───

(defn list-scores [{:keys [datasource]} request]
  (response/ok (scores/list-scores datasource (:query-params request))))

(defn get-score [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (scores/get-score datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-score [{:keys [datasource]} request]
  (let [body (:body-params request)
        actor-id (get-in request [:auth :user-id])]
    (try
      (response/created (scores/create-score! datasource (assoc body :actorId actor-id)))
      (catch Exception e
        (response/forbidden (ex-message e))))))

(defn update-score [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        body (:body-params request)
        actor-id (get-in request [:auth :user-id])]
    (try
      (if-let [item (scores/update-score! datasource id body :actor-id actor-id)]
        (response/ok item)
        (response/not-found (str "成绩记录不存在: " id)))
      (catch Exception e
        (response/forbidden (ex-message e))))))

(defn delete-score [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        actor-id (get-in request [:auth :user-id])]
    (try
      (if (scores/delete-score! datasource id :actor-id actor-id)
        (response/no-content)
        (response/not-found (str "成绩记录不存在: " id)))
      (catch Exception e
        (response/forbidden (ex-message e))))))

;; ─── 批量录入 ───

(defn batch-create-scores [{:keys [datasource]} request]
  (let [body (:body-params request)
        actor-id (get-in request [:auth :user-id])
        scores-list (:scores body)]
    (if (seq scores-list)
      (try
        (response/created (scores/batch-create-scores! datasource scores-list actor-id))
        (catch Exception e
          (response/forbidden (ex-message e))))
      (response/bad-request "scores array is required"))))

;; ─── 锁定/解锁 ───

(defn lock-plan-scores [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (scores/lock-scores-by-plan! datasource plan-id)
    (response/ok {:status "locked" :plan-id plan-id})))

(defn unlock-plan-scores [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (scores/unlock-scores-by-plan! datasource plan-id)
    (response/ok {:status "unlocked" :plan-id plan-id})))

;; ─── audit_log 查询 ───

(defn list-audit-logs [{:keys [datasource]} request]
  (let [params (:query-params request)]
    (response/ok (scores/get-audit-logs datasource
                   :resource-id (:resource-id params)
                   :plan-id (:plan-id params)
                   :candidate-id (:candidate-id params)))))
