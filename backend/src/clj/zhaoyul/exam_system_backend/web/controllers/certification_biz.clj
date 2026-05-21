(ns zhaoyul.exam-system-backend.web.controllers.certification-biz
  "等级认定业务审核 — HTTP 控制器
   提供待审核列表、审核详情、提交审核、审核历史、审核统计接口。"
  (:require
   [zhaoyul.exam-system-backend.domain.certification-biz-service :as svc]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ----------------------------------------------------------------
;; GET /api/certification/biz/pending
;; ----------------------------------------------------------------
(defn list-pending
  [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (svc/list-pending datasource params)]
    (response/ok result)))

;; ----------------------------------------------------------------
;; GET /api/certification/biz/detail/:module/:id
;; ----------------------------------------------------------------
(defn get-detail
  [{:keys [datasource]} request]
  (let [module (get-in request [:path-params :module])
        id     (get-in request [:path-params :id])]
    (if-let [item (svc/get-detail datasource module id)]
      (response/ok item)
      (response/not-found "审核项不存在"))))

;; ----------------------------------------------------------------
;; POST /api/certification/biz/review
;; ----------------------------------------------------------------
(defn submit-review
  [{:keys [datasource]} request]
  (try
    (let [body    (:body-params request)
          result  (svc/submit-review!
                   datasource
                   {:module    (:module body)
                    :id        (:id body)
                    :action    (:action body)
                    :comment   (:comment body)
                    :actor-id  (get-in request [:identity :id])
                    :org-id    (get-in request [:identity :org-id])})]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ----------------------------------------------------------------
;; GET /api/certification/biz/history/:module/:id
;; ----------------------------------------------------------------
(defn get-history
  [{:keys [datasource]} request]
  (let [module (get-in request [:path-params :module])
        id     (get-in request [:path-params :id])
        items  (svc/get-history datasource module id)]
    (response/ok {:items items :total (count items)})))

;; ----------------------------------------------------------------
;; GET /api/certification/biz/statistics
;; ----------------------------------------------------------------
(defn get-statistics
  [ctx _request]
  (let [stats (zhaoyul.exam-system-backend.domain.certification-biz-repo/review-statistics
               (:datasource ctx))]
    (response/ok {:statistics stats})))
