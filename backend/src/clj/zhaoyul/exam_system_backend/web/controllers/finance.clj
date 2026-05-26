(ns zhaoyul.exam-system-backend.web.controllers.finance
  (:require
   [zhaoyul.exam-system-backend.domain.finance :as finance]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn list-standards [{:keys [datasource]} request]
  (response/ok (finance/list-standards datasource (:query-params request))))

(defn create-standard [{:keys [datasource]} request]
  (response/created (finance/save-standard! datasource nil (:body-params request))))

(defn update-standard [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (finance/save-standard! datasource id (:body-params request))]
      (response/ok item)
      (response/not-found))))

(defn list-charges [{:keys [datasource]} request]
  (response/ok (finance/list-charges datasource (:query-params request))))

(defn list-charge-items [{:keys [datasource]} request]
  (response/ok (finance/charge-list datasource (:query-params request))))

(defn charge-summary [{:keys [datasource]} request]
  (response/ok (finance/summary datasource (:query-params request))))

(defn pay-charge [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])
        pay-method (or (get-in request [:body-params :payMethod]) "线上支付")]
    (if-let [item (finance/update-charge-status! datasource id "paid" pay-method)]
      (response/ok item)
      (response/not-found))))

(defn refund-charge [{:keys [datasource]} request]
  (let [id (get-in request [:path-params :id])]
    (if-let [item (finance/update-charge-status! datasource id "refunded" "退款")]
      (response/ok item)
      (response/not-found))))
