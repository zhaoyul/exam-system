(ns zhaoyul.exam-system-backend.web.controllers.supervision
  "督导专家管理接口"
  (:require
   [zhaoyul.exam-system-backend.web.response :as response]))

;; TODO: 替换为真实 DB 查询
(def experts-db (atom []))

(defn list-experts
  "GET /api/supervision/expert-info"
  [_request]
  (response/ok {:items (vec @experts-db)
                :total (count @experts-db)
                :limit 50 :offset 0}))

(defn get-expert
  "GET /api/supervision/expert-info/:id"
  [{{{:keys [id]} :path} :parameters}]
  (if-let [expert (some #(when (= (:id %) id) %) @experts-db)]
    (response/ok expert)
    (response/not-found)))

(defn create-expert
  "POST /api/supervision/expert-info"
  [{{{:keys [body]} :parameters} :parameters}]
  (let [expert (assoc body :id (str (java.util.UUID/randomUUID)))]
    (swap! experts-db conj expert)
    (response/created expert)))

(defn update-expert
  "PUT /api/supervision/expert-info/:id"
  [{{{:keys [id]} :path :keys [body]} :parameters}]
  (if-let [idx (first (keep-indexed #(when (= (:id %2) id) %1) @experts-db))]
    (do (swap! experts-db assoc idx (merge (@experts-db idx) body))
        (response/ok (@experts-db idx)))
    (response/not-found)))

(defn delete-expert
  "DELETE /api/supervision/expert-info/:id"
  [{{{:keys [id]} :path} :parameters}]
  (if-let [idx (first (keep-indexed #(when (= (:id %2) id) %1) @experts-db))]
    (do (swap! experts-db #(vec (concat (subvec % 0 idx) (subvec % (inc idx)))))
        (response/no-content))
    (response/not-found)))

;; TODO: hiring, training, evaluator-training, dispatch, forms, personnel-statistics
