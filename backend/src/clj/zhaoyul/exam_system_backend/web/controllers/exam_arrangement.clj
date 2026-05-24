(ns zhaoyul.exam-system-backend.web.controllers.exam-arrangement
  "考场编排 — HTTP 控制器"
  (:require
   [zhaoyul.exam-system-backend.domain.exam-arrangement :as arr]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn list-plans [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (arr/list-arrangement-plans datasource params)]
    (response/ok result)))

(defn get-plan [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (if-let [plan (arr/get-arrangement-plan datasource plan-id)]
      (response/ok plan)
      (response/not-found "计划不存在"))))

;; ─── Theory Sessions ───

(defn list-theory-sessions [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/list-theory-sessions datasource plan-id)]
    (response/ok result)))

(defn create-theory-session [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        result (arr/create-theory-session! datasource plan-id body)]
    (response/ok result)))

(defn delete-theory-session [{:keys [datasource]} request]
  (let [session-id (get-in request [:path-params :session-id])]
    (if (arr/delete-theory-session! datasource session-id)
      (response/ok {:deleted true})
      (response/not-found "场次不存在"))))

;; ─── Theory Sites ───

(defn list-theory-sites [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/list-theory-sites datasource plan-id)]
    (response/ok {:items result})))

(defn add-theory-site [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        result (arr/add-theory-site! datasource plan-id body)]
    (response/ok result)))

(defn remove-theory-site [{:keys [datasource]} request]
  (let [site-id (get-in request [:path-params :site-id])]
    (if (arr/remove-theory-site! datasource site-id)
      (response/ok {:deleted true})
      (response/not-found "考点不存在"))))

;; ─── Theory Rooms ───

(defn add-room [{:keys [datasource]} request]
  (let [site-id (get-in request [:path-params :site-id])
        body (:body-params request)
        result (arr/add-theory-room! datasource site-id body)]
    (if result
      (response/ok result)
      (response/not-found "考点不存在"))))

(defn add-room-seats [{:keys [datasource]} request]
  (let [room-id (get-in request [:path-params :room-id])
        body (:body-params request)
        result (arr/add-room-seats! datasource room-id body)]
    (if result
      (response/ok result)
      (response/not-found "考场不存在"))))

(defn delete-room [{:keys [datasource]} request]
  (let [room-id (get-in request [:path-params :room-id])]
    (if (arr/delete-room! datasource room-id)
      (response/ok {:deleted true})
      (response/not-found "考场不存在"))))

;; ─── Candidates ───

(defn list-unassigned [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/list-unassigned-candidates datasource plan-id)]
    (response/ok result)))

(defn list-assigned [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        params (:query-params request)
        result (arr/list-assigned-candidates datasource (assoc params :plan-id plan-id))]
    (response/ok result)))

(defn assign-candidates [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        result (arr/assign-candidates! datasource plan-id body)]
    (response/ok result)))

(defn cancel-assignment [{:keys [datasource]} request]
  (let [assignment-id (get-in request [:path-params :assignment-id])]
    (if (arr/cancel-assignment! datasource assignment-id)
      (response/ok {:cancelled true})
      (response/not-found "分配记录不存在"))))

(defn cancel-all-assignments [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/cancel-all-assignments! datasource plan-id)]
    (response/ok result)))

;; ─── Skill Sessions ───

(defn list-skill-sessions [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/list-skill-sessions datasource plan-id)]
    (response/ok result)))

(defn create-skill-cycle [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        result (arr/create-skill-cycle-sessions! datasource plan-id body)]
    (response/ok {:sessions result})))

(defn list-skill-sites [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/list-skill-sites datasource plan-id)]
    (response/ok {:items result})))

;; ─── Auto Arrange ───

(defn auto-arrange [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        body (:body-params request)
        result (arr/auto-arrange! datasource plan-id body)]
    (response/ok result)))

;; ─── Phase Transition ───

(defn advance-to-skill [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/advance-to-skill-phase! datasource plan-id)]
    (response/ok result)))

(defn complete-arrangement [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        result (arr/complete-arrangement! datasource plan-id)]
    (response/ok result)))
