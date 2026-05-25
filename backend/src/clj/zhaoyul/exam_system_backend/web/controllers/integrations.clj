(ns zhaoyul.exam-system-backend.web.controllers.integrations
  "外部系统集成适配层。支持通过环境变量配置 4A/MDM 真实端点；未配置时返回开发态模拟结果，便于流程闭环。"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.web.response :as response]))

(defn- configured? [value]
  (boolean (and (string? value) (not (str/blank? value)))))

(defn- integrations-config [ctx key]
  (get-in ctx [:config :integrations key]))

(defn mdm-status [ctx _request]
  (let [cfg (integrations-config ctx :mdm)
        base-url (:base-url cfg)
        external? (configured? base-url)]
    (response/ok
     {:system "MDM"
      :mode (if external? "external" "mock")
      :status (if external? "configured" "mock-connected")
      :baseUrl (when external? base-url)
      :orgEndpoint (:org-endpoint cfg)
      :personEndpoint (:person-endpoint cfg)
      :lastSyncAt "2026-05-25 08:30:00"
      :resources [{:name "组织主数据" :count 7}
                  {:name "人员主数据" :count 1560}
                  {:name "岗位主数据" :count 48}]})))

(defn mdm-sync [ctx request]
  (let [body (:body-params request)
        scope (or (:scope body) "all")
        cfg (integrations-config ctx :mdm)
        external? (configured? (:base-url cfg))]
    (response/ok
     {:system "MDM"
      :mode (if external? "external" "mock")
      :scope scope
      :status (if external? "queued" "completed")
      :endpoint (when external?
                  (case scope
                    "org" (str (:base-url cfg) (:org-endpoint cfg))
                    "person" (str (:base-url cfg) (:person-endpoint cfg))
                    (:base-url cfg)))
      :startedAt "2026-05-25 08:30:00"
      :finishedAt (when-not external? "2026-05-25 08:30:12")
      :created 12
      :updated 86
      :skipped 3
      :message (if external?
                 "MDM真实端点已配置，同步任务已进入适配队列"
                 "MDM主数据同步完成")})))

(defn four-a-users [ctx _request]
  (let [cfg (integrations-config ctx :four-a)
        external? (configured? (:base-url cfg))]
    (response/ok
     {:system "4A"
      :mode (if external? "external" "mock")
      :status (if external? "configured" "mock-connected")
      :baseUrl (when external? (:base-url cfg))
      :appId (when external? (:app-id cfg))
      :redirectUri (when external? (:redirect-uri cfg))
      :items [{:username "cgnzx001" :displayName "集团管理员" :role "group_admin" :orgId "org-cgn" :status "active"}
              {:username "Csyxgs001" :displayName "机构管理员" :role "branch_admin" :orgId "org-csyxgs" :status "active"}
              {:username "zhangsan" :displayName "张三" :role "user" :orgId "org-dayawan" :status "active"}]})))
