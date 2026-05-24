(ns zhaoyul.exam-system-backend.web.controllers.plans
  "认定计划 API — 计划编号自动生成、站点级联查询"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.domain.filing :as filing]
   [zhaoyul.exam-system-backend.web.response :as response]))

;; ------------------------------------------------------------------
;; GET /api/certification/plans/generate-number?filingOrg=广东省
;; 根据备案地自动生成计划编号：filing_code + YYYY + MM + 3位顺序号
;; ------------------------------------------------------------------
(defn generate-number
  [{:keys [datasource]} request]
  (let [filing-org (get (:query-params request) "filingOrg")
        now (java.time.LocalDate/now)
        yyyy (str (.getYear now))
        mm (format "%02d" (.getMonthValue now))
        ;; 查询已有计划获取最大序号
        existing (resources/list-items datasource "certification-plans" {})
        code-map {"北京市" "BJ" "广东省" "GD" "福建省" "FJ" "辽宁省" "LN"}
        prefix (str (get code-map filing-org "XX") yyyy mm)
        max-seq (reduce
                 (fn [mx item]
                   (let [plan-no (or (:planNo item) "")
                         seq-str (when (.startsWith plan-no prefix) (subs plan-no (count prefix)))
                         seq-num (try (Integer/parseInt seq-str) (catch Exception _ 0))]
                     (max mx seq-num)))
                 0
                 (:items existing))
        next-no (str prefix (format "%03d" (inc max-seq)))]
    (response/ok {:planNo next-no
                  :prefix prefix
                  :sequence (inc max-seq)})))

;; ------------------------------------------------------------------
;; GET /api/certification/execution/filing-sites?filingId=xxx
;; 查询备案地下的站点列表（站点级联选择用）
;; ------------------------------------------------------------------
(defn list-filing-sites
  [{:keys [datasource]} request]
  (let [params (:query-params request)
        result (filing/list-sites datasource params)]
    (response/ok result)))
