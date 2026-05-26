(ns zhaoyul.exam-system-backend.web.controllers.traceability
  "溯源中心 API — 溯源案例/溯源预警/时间轴"
  (:require
   [zhaoyul.exam-system-backend.domain.traceability :as trace]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 溯源案例 ───

(defn list-cases [{:keys [datasource]} request]
  (response/ok (trace/list-cases datasource (:query-params request))))

(defn get-case [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (trace/get-case datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-case [{:keys [datasource]} request]
  (response/created (trace/create-case! datasource (:body-params request))))

(defn update-case [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (trace/update-case! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-case [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (trace/delete-case! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 溯源预警 ───

(defn list-alerts [{:keys [datasource]} request]
  (response/ok (trace/list-alerts datasource (:query-params request))))

(defn get-alert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (trace/get-alert datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-alert [{:keys [datasource]} request]
  (response/created (trace/create-alert! datasource (:body-params request))))

(defn update-alert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (trace/update-alert! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-alert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (trace/delete-alert! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 时间轴聚合 ───

(defn get-timeline [{:keys [datasource]} request]
  (let [candidate-id (get-in request [:path-params :candidate-id])]
    (if-let [events (seq (trace/get-candidate-timeline datasource candidate-id))]
      (response/ok {:candidateId candidate-id :events events})
      (response/ok {:candidateId candidate-id :events []}))))

(defn get-audit-logs [{:keys [datasource]} request]
  (let [candidate-id (get-in request [:path-params :candidate-id])]
    (response/ok {:candidateId candidate-id
                  :items (trace/get-candidate-audit-logs datasource candidate-id)})))

(defn list-audit-events [{:keys [datasource]} request]
  (response/ok (trace/list-audit-events datasource (:query-params request))))
