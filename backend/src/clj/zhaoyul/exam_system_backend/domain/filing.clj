(ns zhaoyul.exam-system-backend.domain.filing
  "备案模块 - 集团/分支/省级备案管理"
  (:require
   [zhaoyul.exam-system-backend.domain.resources :as resources]))

;; Resource constants
(def filing-group   "filing-group")
(def filing-branch  "filing-branch")
(def filing-province "filing-province")

;; Delegate CRUD to generic resources
(def list-groups    (fn [ds params] (resources/list-items ds filing-group params)))
(def get-group      (fn [ds id]     (resources/get-item ds filing-group id)))
(def create-group!  (fn [ds body]   (resources/create-item! ds filing-group body)))
(def update-group!  (fn [ds id body] (resources/update-item! ds filing-group id body)))
(def delete-group!  (fn [ds id]     (resources/delete-item! ds filing-group id)))

(def list-branches   (fn [ds params] (resources/list-items ds filing-branch params)))
(def get-branch      (fn [ds id]     (resources/get-item ds filing-branch id)))
(def create-branch!  (fn [ds body]   (resources/create-item! ds filing-branch body)))
(def update-branch!  (fn [ds id body] (resources/update-item! ds filing-branch id body)))
(def delete-branch!  (fn [ds id]     (resources/delete-item! ds filing-branch id)))

(def list-provinces   (fn [ds params] (resources/list-items ds filing-province params)))
(def get-province     (fn [ds id]     (resources/get-item ds filing-province id)))
(def create-province! (fn [ds body]   (resources/create-item! ds filing-province body)))
(def update-province! (fn [ds id body] (resources/update-item! ds filing-province id body)))
(def delete-province! (fn [ds id]     (resources/delete-item! ds filing-province id)))
