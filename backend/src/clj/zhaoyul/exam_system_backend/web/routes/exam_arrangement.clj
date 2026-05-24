(ns zhaoyul.exam-system-backend.web.routes.exam-arrangement
  "考场编排 - 路由定义"
  (:require
   [zhaoyul.exam-system-backend.web.controllers.exam-arrangement :as ea]))

(defn exam-arrangement-routes [ctx]
  [["/exam-arrangement"
    {:swagger {:tags ["考场编排"]}}

    ["/plans"
     {:get {:summary "编排计划列表"
            :handler (partial ea/list-plans ctx)}}]

    ["/plans/:plan-id"
     {:get {:summary "编排详情"
            :handler (partial ea/get-detail ctx)}}]

    ["/plans/:plan-id/sites"
     {:get {:summary "可用考点列表"
            :handler (partial ea/list-sites ctx)}
      :post {:summary "添加考点到编排"
             :handler (partial ea/add-site ctx)}}]

    ["/plans/:plan-id/sites/:site-id"
     {:delete {:summary "删除考点"
               :handler (partial ea/remove-site ctx)}}]

    ["/plans/:plan-id/sites/:site-id/rooms"
     {:post {:summary "添加考场"
             :handler (partial ea/add-room ctx)}}]

    ["/plans/:plan-id/sites/:site-id/rooms/:room-id"
     {:delete {:summary "删除考场"
               :handler (partial ea/remove-room ctx)}}]

    ["/plans/:plan-id/sites/:site-id/rooms/:room-id/seats"
     {:post {:summary "追加座位"
             :handler (partial ea/add-seats ctx)}}]

    ["/plans/:plan-id/sites/:site-id/rooms/:room-id/candidates"
     {:get {:summary "获取可分配考生"
            :handler (partial ea/list-candidates ctx)}
      :post {:summary "分配考生到考场"
             :handler (partial ea/assign-candidates ctx)}
      :delete {:summary "取消考生分配"
               :handler (partial ea/unassign-candidates ctx)}}]

    ["/plans/:plan-id/cancel-all"
     {:post {:summary "取消全部分配"
             :handler (partial ea/cancel-all ctx)}}]

    ["/plans/:plan-id/cycle-sessions"
     {:post {:summary "生成循环天数场次"
             :handler (partial ea/generate-cycle-sessions ctx)}}]

    ["/plans/:plan-id/shuffle"
     {:post {:summary "打乱编排"
             :handler (partial ea/shuffle-arrange ctx)}}]

    ["/plans/:plan-id/status"
     {:post {:summary "更新编排状态"
             :handler (partial ea/update-status ctx)}}]

    ["/sessions"
     {:get {:summary "场次列表"
            :handler (partial ea/list-sessions ctx)}
      :post {:summary "新增场次"
             :handler (partial ea/create-session ctx)}}]

    ["/sessions/:session-id"
     {:put {:summary "更新场次"
            :handler (partial ea/update-session ctx)}
      :delete {:summary "删除场次"
               :handler (partial ea/delete-session ctx)}}]]])
