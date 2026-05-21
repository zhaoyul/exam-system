(ns zhaoyul.exam-system-backend.web.routes.certification-biz
  "等级认定业务审核 — 路由定义
   挂载在 /api/certification/biz 下。"
  (:require
   [zhaoyul.exam-system-backend.web.controllers.certification-biz :as biz]))

(defn certification-biz-routes [ctx]
  [["/certification/biz"
    {:swagger {:tags ["等级认定-业务审核"]}}

    ;; 待审核列表（支持按模块、状态、关键词筛选）
    ["/pending"
     {:get {:summary "待审核列表"
            :handler (partial biz/list-pending ctx)}}]

    ;; 审核详情（查看单个审核项）
    ["/detail/:module/:id"
     {:get {:summary "审核项详情"
            :handler (partial biz/get-detail ctx)}}]

    ;; 提交审核（通过/退回）
    ["/review"
     {:post {:summary "提交审核（通过/退回）"
             :handler (partial biz/submit-review ctx)}}]

    ;; 审核历史
    ["/history/:module/:id"
     {:get {:summary "审核历史记录"
            :handler (partial biz/get-history ctx)}}]

    ;; 统计（按模块统计审核状态）
    ["/statistics"
     {:get {:summary "审核统计"
            :handler (partial biz/get-statistics ctx)}}]]])
