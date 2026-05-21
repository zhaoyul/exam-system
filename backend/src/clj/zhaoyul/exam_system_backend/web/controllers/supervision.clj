(ns zhaoyul.exam-system-backend.web.controllers.supervision
  "督导专家管理接口 — 专家/聘用/培训/派遣/表单/统计"
  (:require
   [zhaoyul.exam-system-backend.domain.supervision :as supervision]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── 专家信息 ───

(defn list-experts [{:keys [datasource]} request]
  (response/ok (supervision/list-experts datasource (:query-params request))))

(defn get-expert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [expert (supervision/get-expert datasource id)]
      (response/ok expert)
      (response/not-found))))

(defn create-expert [{:keys [datasource]} request]
  (response/created (supervision/create-expert! datasource (:body-params request))))

(defn update-expert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [expert (supervision/update-expert! datasource id (:body-params request))]
      (response/ok expert)
      (response/not-found))))

(defn delete-expert [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-expert! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 专家聘用 ───

(defn list-hiring [{:keys [datasource]} request]
  (response/ok (supervision/list-employments datasource (:query-params request))))

(defn get-hiring [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/get-employment datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-hiring [{:keys [datasource]} request]
  (response/created (supervision/create-employment! datasource (:body-params request))))

(defn update-hiring [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/update-employment! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-hiring [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-employment! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 督导培训 ───

(defn list-training [{:keys [datasource]} request]
  (response/ok (supervision/list-trainings datasource (:query-params request))))

(defn get-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/get-training datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-training [{:keys [datasource]} request]
  (response/created (supervision/create-training! datasource (:body-params request))))

(defn update-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/update-training! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-training! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 考评培训 ───

(defn list-evaluator-training [{:keys [datasource]} request]
  (response/ok (supervision/list-trainings datasource (assoc (:query-params request) :train-type "evaluator"))))

(defn get-evaluator-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/get-training datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-evaluator-training [{:keys [datasource]} request]
  (response/created (supervision/create-training! datasource (assoc (:body-params request) :trainType "evaluator"))))

(defn update-evaluator-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/update-training! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-evaluator-training [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-training! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 专家派遣 ───

(defn list-dispatch [{:keys [datasource]} request]
  (response/ok (supervision/list-dispatches datasource (:query-params request))))

(defn get-dispatch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/get-dispatch datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-dispatch [{:keys [datasource]} request]
  (response/created (supervision/create-dispatch! datasource (:body-params request))))

(defn update-dispatch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/update-dispatch! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-dispatch [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-dispatch! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 表单管理 ───

(defn list-forms [{:keys [datasource]} request]
  (response/ok (supervision/list-forms datasource (:query-params request))))

(defn get-form [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/get-form datasource id)]
      (response/ok item)
      (response/not-found))))

(defn create-form [{:keys [datasource]} request]
  (response/created (supervision/create-form! datasource (:body-params request))))

(defn update-form [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (supervision/update-form! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn delete-form [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if (supervision/delete-form! datasource id)
      (response/no-content)
      (response/not-found))))

;; ─── 人员统计 ───

(defn get-personnel-statistics [{:keys [datasource]} request]
  (response/ok (supervision/get-statistics datasource (:query-params request))))
