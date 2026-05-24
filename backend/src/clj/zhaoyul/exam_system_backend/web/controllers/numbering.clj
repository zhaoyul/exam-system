(ns zhaoyul.exam-system-backend.web.controllers.numbering
  "编号/证书号生成 — HTTP 控制器"
  (:require
   [zhaoyul.exam-system-backend.domain.numbering :as svc]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ─── POST /api/numbering/plan-number ───

(defn generate-plan-number
  [{:keys [datasource]} request]
  (try
    (let [body   (:body-params request)
          result (svc/generate-plan-number!
                  datasource
                  {:filing-code (:filingCode body)
                   :year        (Integer/parseInt (str (:year body)))
                   :month       (Integer/parseInt (str (:month body)))})]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── POST /api/numbering/cert-number ───

(defn generate-cert-number
  [{:keys [datasource]} request]
  (try
    (let [body   (:body-params request)
          result (svc/generate-cert-number!
                  datasource
                  {:site-code (:siteCode body)
                   :year      (Integer/parseInt (str (:year body)))
                   :level     (:level body)})]
      (response/ok result))
    (catch Exception e
      (response/bad-request (.getMessage e)))))

;; ─── GET /api/numbering/level-mapping ───

(defn get-level-mapping
  [_ctx _request]
  (response/ok
   {:mapping svc/level->code
    :inverse svc/code->level}))
