(ns zhaoyul.exam-system-backend.web.controllers.exam-arrangement
  "考场编排 — HTTP 控制器
   提供编排列表、编排详情、场次管理、考点管理、考生分配、循环天数、打乱编排接口。"
  (:require
   [zhaoyul.exam-system-backend.domain.exam-arrangement :as svc]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ============================================================
;; 编排计划列表
;; ============================================================
(defn list-plans
  [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (svc/list-arrangement-plans datasource params)]
    (response/ok result)))

;; ============================================================
;; 编排详情
;; ============================================================
(defn get-detail
  [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])]
    (if-let [detail (svc/get-arrangement-detail datasource plan-id)]
      (response/ok detail)
      (response/not-found "编排计划不存在"))))

;; ============================================================
;; 考点列表
;; ============================================================
(defn list-sites
  [{:keys [datasource]} request]
  (let [org-id (get-in request [:query-params "org-id"])
        result (svc/list-exam-sites datasource org-id)]
    (response/ok result)))

;; ============================================================
;; 添加考点
;; ============================================================
(defn add-site
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:body-params :siteId])]
      (if-let [result (svc/add-site-to-plan! datasource plan-id site-id)]
        (response/ok result)
        (response/not-found "编排计划或考点不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 删除考点
;; ============================================================
(defn remove-site
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])]
      (if-let [result (svc/remove-site-from-plan! datasource plan-id site-id)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 添加考场
;; ============================================================
(defn add-room
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])
          room-name (get-in request [:body-params :name])
          seat-count (get-in request [:body-params :seatCount])]
      (if-let [result (svc/add-room-to-site! datasource plan-id site-id room-name seat-count)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 删除考场
;; ============================================================
(defn remove-room
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])
          room-id (get-in request [:path-params :room-id])]
      (if-let [result (svc/remove-room-from-site! datasource plan-id site-id room-id)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 追加座位
;; ============================================================
(defn add-seats
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])
          room-id (get-in request [:path-params :room-id])
          count-n (:count (:body-params request))]
      (if-let [result (svc/add-seats-to-room! datasource plan-id site-id room-id count-n)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 生成循环天数场次
;; ============================================================
(defn generate-cycle-sessions
  [{:keys [datasource]} request]
  (try
    (let [body (:body-params request)
          plan-id (get-in request [:path-params :plan-id])
          params (assoc body :planId plan-id)]
      (if-let [result (svc/generate-cycle-sessions! datasource params)]
        (response/ok {:sessions result :count (count result)})
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 考生分配
;; ============================================================
(defn assign-candidates
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])
          room-id (get-in request [:path-params :room-id])
          candidate-ids (get-in request [:body-params :candidateIds])]
      (if-let [result (svc/assign-candidates-to-room! datasource plan-id site-id room-id candidate-ids)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 取消考生分配
;; ============================================================
(defn unassign-candidates
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          site-id (get-in request [:path-params :site-id])
          room-id (get-in request [:path-params :room-id])
          candidate-ids (get-in request [:body-params :candidateIds])]
      (if-let [result (svc/unassign-candidates-from-room! datasource plan-id site-id room-id candidate-ids)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 取消全部分配
;; ============================================================
(defn cancel-all
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])]
      (if-let [result (svc/cancel-all-assignments! datasource plan-id)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 打乱编排
;; ============================================================
(defn shuffle-arrange
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])]
      (if-let [result (svc/shuffle-arrange! datasource plan-id)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 编排流程状态
;; ============================================================
(defn update-status
  [{:keys [datasource]} request]
  (try
    (let [plan-id (get-in request [:path-params :plan-id])
          action (get-in request [:body-params :action])]
      (case action
        "theory-done"
        (if-let [result (svc/mark-theory-done! datasource plan-id)]
          (response/ok result)
          (response/not-found "编排计划不存在"))
        "skill-done"
        (if-let [result (svc/mark-skill-done! datasource plan-id)]
          (response/ok result)
          (response/not-found "编排计划不存在"))
        "confirm"
        (if-let [result (svc/confirm-arrangement! datasource plan-id)]
          (response/ok result)
          (response/not-found "编排计划不存在"))
        (response/bad-request (str "未知操作: " action))))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 获取可分配考生
;; ============================================================
(defn list-candidates
  [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        session-id (get-in request [:query-params "session-id"])]
    (if-let [result (svc/list-candidates-for-arrangement datasource plan-id session-id)]
      (response/ok result)
      (response/not-found "编排计划不存在"))))

;; ============================================================
;; 场次列表
;; ============================================================
(defn list-sessions
  [{:keys [datasource]} request]
  (let [plan-id (get-in request [:path-params :plan-id])
        session-type (get-in request [:query-params "type"])]
    (if-let [result (svc/get-plan-sessions datasource plan-id session-type)]
      (response/ok result)
      (response/not-found "编排计划不存在"))))

;; ============================================================
;; 新增场次
;; ============================================================
(defn create-session
  [{:keys [datasource]} request]
  (try
    (let [body (:body-params request)
          plan-id (get-in request [:path-params :plan-id])
          params (assoc body :planId plan-id)]
      (if-let [result (svc/create-session! datasource params)]
        (response/ok result)
        (response/not-found "编排计划不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 更新场次
;; ============================================================
(defn update-session
  [{:keys [datasource]} request]
  (try
    (let [session-id (get-in request [:path-params :session-id])
          body (:body-params request)]
      (if-let [result (svc/update-session! datasource session-id body)]
        (response/ok result)
        (response/not-found "场次不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ============================================================
;; 删除场次
;; ============================================================
(defn delete-session
  [{:keys [datasource]} request]
  (try
    (let [session-id (get-in request [:path-params :session-id])]
      (if-let [result (svc/delete-session! datasource session-id)]
        (response/ok {:deleted true})
        (response/not-found "场次不存在")))
    (catch Exception e
      (response/bad-request (.getMessage e)))))
