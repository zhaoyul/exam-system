(ns zhaoyul.exam-system-backend.web.routes.api
  (:require
   [integrant.core :as ig]
   [reitit.ring.middleware.muuntaja :as muuntaja]
   [reitit.ring.middleware.parameters :as parameters]
   [reitit.swagger :as swagger]
   [zhaoyul.exam-system-backend.web.controllers.auth :as auth]
   [zhaoyul.exam-system-backend.web.controllers.candidates :as candidates]
   [zhaoyul.exam-system-backend.web.controllers.catalog :as catalog]
   [zhaoyul.exam-system-backend.web.controllers.exam-staff :as exam-staff]
   [zhaoyul.exam-system-backend.web.controllers.files :as files-ctrl]
   [zhaoyul.exam-system-backend.web.controllers.filing :as filing]
   [zhaoyul.exam-system-backend.web.controllers.numbering :as numbering]
   [zhaoyul.exam-system-backend.web.controllers.registration-orgs :as registration-orgs]
   [zhaoyul.exam-system-backend.web.controllers.scores :as score-controller]
   [zhaoyul.exam-system-backend.web.controllers.health :as health]
   [zhaoyul.exam-system-backend.web.controllers.organizations :as organizations]
   [zhaoyul.exam-system-backend.web.controllers.paper-demand :as paper-demand]
   [zhaoyul.exam-system-backend.web.controllers.personal :as personal]
   [zhaoyul.exam-system-backend.web.controllers.resources :as resource-controller]
   [zhaoyul.exam-system-backend.web.controllers.supervision :as supervision]
   [zhaoyul.exam-system-backend.web.controllers.traceability :as traceability]
   [zhaoyul.exam-system-backend.web.middleware-auth :as auth-middleware]
   [zhaoyul.exam-system-backend.web.middleware.exception :as exception]
   [zhaoyul.exam-system-backend.web.middleware.formats :as formats]
   [zhaoyul.exam-system-backend.web.routes.certification-biz :as cert-biz-routes]))

(defn route-data [{:keys [auth cors]}]
  {:muuntaja formats/instance
   :swagger {:id ::api}
   :middleware [parameters/parameters-middleware
                muuntaja/format-negotiate-middleware
                muuntaja/format-response-middleware
                muuntaja/format-request-middleware
                [auth-middleware/wrap-auth-context {:auth auth}]
                [auth-middleware/wrap-cors {:cors cors}]
                exception/wrap-exception]})

(defn resource-routes [ctx]
  [["/resources/:resource"
    {:swagger {:tags ["通用资源"]}}
    [""
     {:get {:summary "查询资源列表"
            :handler (partial resource-controller/list-resource ctx)}
      :post {:summary "创建资源"
             :handler (partial resource-controller/create-resource ctx)}}]
    ["/:id"
     {:get {:summary "查看资源详情"
            :handler (partial resource-controller/get-resource ctx)}
      :put {:summary "更新资源"
            :handler (partial resource-controller/update-resource ctx)}
      :delete {:summary "删除资源"
               :handler (partial resource-controller/delete-resource ctx)}}]]])

(defn resource-endpoint
  ([ctx path resource tag summary]
   (resource-endpoint ctx path resource tag summary true))
  ([ctx path resource tag summary writable?]
   [path
    {}
    [""
     (cond-> {:swagger {:tags [tag]}
              :get {:summary (str summary "列表")
                    :handler (resource-controller/list-alias ctx resource)}}
       writable? (assoc :post {:summary (str "新增" summary)
                               :handler (resource-controller/create-alias ctx resource)}))]
    ["/:id"
     (cond-> {:swagger {:tags [tag]}
              :get {:summary (str "查看" summary)
                    :handler (resource-controller/get-alias ctx resource)}}
       writable? (assoc :put {:summary (str "更新" summary)
                              :handler (resource-controller/update-alias ctx resource)}
                        :delete {:summary (str "删除" summary)
                                 :handler (resource-controller/delete-alias ctx resource)}))]]))

(defn extra-business-routes [ctx]
  [["/dashboard"
    {:swagger {:tags ["工作台"]}}
    (resource-endpoint ctx "/summary" "dashboard-summary" "工作台" "首页看板统计" false)
    (resource-endpoint ctx "/workbench-cards" "workbench-cards" "工作台" "工作台卡片" false)]
   ["/workbenches"
    {:swagger {:tags ["工作台"]}}
    ["/:module"
     [""
      {:get {:summary "模块工作台数据" :handler (resource-controller/list-alias ctx "workbench-cards")}}]
     ["/:id"
      {:get {:summary "模块工作台详情" :handler (resource-controller/get-alias ctx "workbench-cards")}}]]]
   ["/system"
    (resource-endpoint ctx "/users" "system-users" "基础数据" "系统用户")
    (resource-endpoint ctx "/personnel" "personnel" "基础数据" "人员信息")
    (resource-endpoint ctx "/filing-group" "filing-group" "机构备案" "集团备案")
    (resource-endpoint ctx "/filing-branch" "filing-branch" "机构备案" "分支备案")
    (resource-endpoint ctx "/announcements" "system-announcements" "基础数据" "公告")
    (resource-endpoint ctx "/logs" "system-logs" "基础数据" "操作日志" false)
    (resource-endpoint ctx "/config" "system-config" "基础数据" "系统配置")]
   ["/data"
    (resource-endpoint ctx "/center" "data-center" "基础数据" "数据管理")]
   ["/filing"
    {:swagger {:tags ["机构备案"]}}
    ["/group"
     [""
      {:get {:summary "集团备案列表" :handler (partial filing/list-filing-group ctx)}
       :post {:summary "新增集团备案" :handler (partial filing/create-filing-group ctx)}}]
     ["/:id"
      {:get {:summary "查看集团备案" :handler (partial filing/get-filing-group ctx)}
       :put {:summary "更新集团备案" :handler (partial filing/update-filing-group ctx)}
       :delete {:summary "删除集团备案" :handler (partial filing/delete-filing-group ctx)}}]]
    ["/branch"
     [""
      {:get {:summary "分支备案列表" :handler (partial filing/list-filing-branch ctx)}
       :post {:summary "新增分支备案" :handler (partial filing/create-filing-branch ctx)}}]
     ["/:id"
      {:get {:summary "查看分支备案" :handler (partial filing/get-filing-branch ctx)}
       :put {:summary "更新分支备案" :handler (partial filing/update-filing-branch ctx)}
       :delete {:summary "删除分支备案" :handler (partial filing/delete-filing-branch ctx)}}]]
    ["/province"
     [""
      {:get {:summary "省级备案列表" :handler (partial filing/list-filing-province ctx)}
       :post {:summary "新增省级备案" :handler (partial filing/create-filing-province ctx)}}]
     ["/:id"
      {:get {:summary "查看省级备案" :handler (partial filing/get-filing-province ctx)}
       :put {:summary "更新省级备案" :handler (partial filing/update-filing-province ctx)}
       :delete {:summary "删除省级备案" :handler (partial filing/delete-filing-province ctx)}}]]]
   ["/standard"
    (resource-endpoint ctx "/evaluation-scope" "evaluation-scopes" "职业标准" "评价范围")
    (resource-endpoint ctx "/settings" "standard-settings" "职业标准" "标准设置")
    (resource-endpoint ctx "/experts" "standard-experts" "职业标准" "标准专家")
    (resource-endpoint ctx "/templates" "standard-templates" "职业标准" "模板")
    (resource-endpoint ctx "/plans" "standard-plans" "职业标准" "标准计划")
    (resource-endpoint ctx "/assignment" "standard-assignments" "职业标准" "任务分配")
    (resource-endpoint ctx "/process" "standard-processes" "职业标准" "标准流程")
    (resource-endpoint ctx "/library" "standard-library" "职业标准" "职业标准库")]
   ["/finance"
    (resource-endpoint ctx "/workbench" "finance-ledgers" "财务系统" "财务工作台" false)
    (resource-endpoint ctx "/charge" "finance-charges" "财务系统" "收费")
    (resource-endpoint ctx "/list" "finance-lists" "财务系统" "缴费清单")
    (resource-endpoint ctx "/ledger" "finance-ledgers" "财务系统" "收费台账")
    (resource-endpoint ctx "/standard" "finance-standards" "财务系统" "收费标准")]
   ["/score"
    (resource-endpoint ctx "/entry" "scores" "成绩管理" "成绩录入")
    (resource-endpoint ctx "/review" "score-reviews" "成绩管理" "成绩审核")
    (resource-endpoint ctx "/publicity" "score-publicity-batches" "成绩管理" "成绩公示")
    (resource-endpoint ctx "/correction" "score-corrections" "成绩管理" "成绩更正")]
   ["/certificate"
    (resource-endpoint ctx "/issue" "certificates" "证书管理" "证书核发")
    (resource-endpoint ctx "/view" "certificates" "证书管理" "证书查看" false)
    (resource-endpoint ctx "/reissue" "certificate-reissues" "证书管理" "证书补发")]
   ["/candidates"
    {:swagger {:tags ["考生管理"]}}
    ["/manage"
     [""
      {:get {:summary "考生档案列表" :handler (partial candidates/list-candidates ctx)}
       :post {:summary "新增考生" :handler (partial candidates/create-candidate ctx)}}]
     ["/:id"
      {:get {:summary "查看考生详情" :handler (partial candidates/get-candidate ctx)}
       :put {:summary "更新考生信息" :handler (partial candidates/update-candidate ctx)}
       :delete {:summary "删除考生" :handler (partial candidates/delete-candidate ctx)}}]]]
   ["/exam"
    (resource-endpoint ctx "/manage" "exams" "考试中心" "考试管理")
    (resource-endpoint ctx "/online" "online-exams" "考试中心" "在线考试" false)
    (resource-endpoint ctx "/seats" "seat-arrangements" "考试中心" "座位编排")]
   ["/grading"
    [""
     {:swagger {:tags ["阅卷管理"]}
      :get {:summary "阅卷任务列表" :handler (resource-controller/list-alias ctx "grading-tasks")}
      :post {:summary "新增阅卷任务" :handler (resource-controller/create-alias ctx "grading-tasks")}}]
    (resource-endpoint ctx "/marking" "marking-tasks" "阅卷管理" "阅卷评分")]
   ["/monitor"
    (resource-endpoint ctx "" "monitor-rooms" "考务监控" "监控看板")]
   ["/reports"
    (resource-endpoint ctx "/score" "reports" "报表档案" "成绩报表")
    (resource-endpoint ctx "/statistics" "certification-statistics" "报表档案" "统计报表")
    (resource-endpoint ctx "/data-upload" "report-uploads" "报表档案" "上报数据")
    (resource-endpoint ctx "/registration" "exam-registration" "报表档案" "报名报表")
    (resource-endpoint ctx "/arrangement" "exam-arrangement" "报表档案" "编排报表")]
   ["/report"
    (resource-endpoint ctx "/score" "reports" "报表档案" "成绩报表")
    (resource-endpoint ctx "/statistics" "certification-statistics" "报表档案" "统计报表")
    (resource-endpoint ctx "/data-upload" "report-uploads" "报表档案" "上报数据")
    (resource-endpoint ctx "/registration" "exam-registration" "报表档案" "报名报表")
    (resource-endpoint ctx "/arrangement" "exam-arrangement" "报表档案" "编排报表")]
   ["/archive"
    (resource-endpoint ctx "" "archives" "报表档案" "档案")]
   ["/messages"
    (resource-endpoint ctx "" "messages" "消息中心" "消息")]
   ["/personal"
    {:swagger {:tags ["个人中心"]}}
    ["/register"
     [""
      {:get {:summary "个人报名列表" :handler (partial personal/list-register ctx)}
       :post {:summary "新增个人报名" :handler (partial personal/create-register ctx)}}]
     ["/:id"
      {:get {:summary "查看报名详情" :handler (partial personal/get-register ctx)}
       :put {:summary "更新报名信息" :handler (partial personal/update-register ctx)}
       :delete {:summary "删除报名" :handler (partial personal/delete-register ctx)}}]]
    ["/score"
     [""
      {:get {:summary "成绩查询列表" :handler (partial personal/list-score ctx)}}]
     ["/:id"
      {:get {:summary "查看成绩详情" :handler (partial personal/get-score ctx)}}]]
    ["/cert"
     [""
      {:get {:summary "证书查询列表" :handler (partial personal/list-cert ctx)}}]
     ["/:id"
      {:get {:summary "查看证书详情" :handler (partial personal/get-cert ctx)}}]]
    ["/ticket"
     [""
      {:get {:summary "准考证列表" :handler (partial personal/list-ticket ctx)}}]
     ["/:id"
      {:get {:summary "查看准考证详情" :handler (partial personal/get-ticket ctx)}}]]]
   ["/file"
    {:swagger {:tags ["文件传输"]}}
    ["/distribute"
     [""
      {:get {:summary "文档分发列表" :handler (partial files-ctrl/list-distribute ctx)}
       :post {:summary "新增文档分发" :handler (partial files-ctrl/create-distribute ctx)}}]
     ["/:id"
      {:get {:summary "查看分发详情" :handler (partial files-ctrl/get-distribute ctx)}
       :put {:summary "更新分发信息" :handler (partial files-ctrl/update-distribute ctx)}
       :delete {:summary "删除分发" :handler (partial files-ctrl/delete-distribute ctx)}}]]
    ["/receive"
     [""
      {:get {:summary "文档接收列表" :handler (partial files-ctrl/list-receive ctx)}
       :post {:summary "新增文档接收" :handler (partial files-ctrl/create-receive ctx)}}]
     ["/:id"
      {:get {:summary "查看接收详情" :handler (partial files-ctrl/get-receive ctx)}
       :put {:summary "更新接收信息" :handler (partial files-ctrl/update-receive ctx)}
       :delete {:summary "删除接收" :handler (partial files-ctrl/delete-receive ctx)}}]]
    ["/viewer"
     [""
      {:get {:summary "文档阅览列表" :handler (partial files-ctrl/list-viewer ctx)}}]
     ["/:id"
      {:get {:summary "查看文档详情" :handler (partial files-ctrl/get-viewer ctx)}}]]
    ["/private"
     [""
      {:get {:summary "私有文档列表" :handler (partial files-ctrl/list-private ctx)}
       :post {:summary "新增私有文档" :handler (partial files-ctrl/create-private ctx)}}]
     ["/:id"
      {:get {:summary "查看私有文档" :handler (partial files-ctrl/get-private ctx)}
       :put {:summary "更新私有文档" :handler (partial files-ctrl/update-private ctx)}
       :delete {:summary "删除私有文档" :handler (partial files-ctrl/delete-private ctx)}}]]
    ["/settings"
     [""
      {:get {:summary "参数设置列表" :handler (partial files-ctrl/list-settings ctx)}
       :post {:summary "新增参数设置" :handler (partial files-ctrl/create-settings ctx)}}]
     ["/:id"
      {:get {:summary "查看参数详情" :handler (partial files-ctrl/get-settings ctx)}
       :put {:summary "更新参数设置" :handler (partial files-ctrl/update-settings ctx)}
       :delete {:summary "删除参数设置" :handler (partial files-ctrl/delete-settings ctx)}}]]]
   ["/paper-demand"
    {:swagger {:tags ["试卷需求"]}}
    ["/assembly-methods"
     {:get {:summary "组卷方式枚举"
            :handler (paper-demand/assembly-methods ctx)}}]
    ["/items"
     [""
      {:get {:summary "试卷需求项列表"
             :handler (paper-demand/list-demands ctx)}
       :post {:summary "创建试卷需求项（按工种）"
              :handler (paper-demand/create-demand ctx)}}]
     ["/:id"
      {:get {:summary "查看需求项详情"
             :handler (paper-demand/get-demand ctx)}
       :put {:summary "更新需求项"
             :handler (paper-demand/update-demand ctx)}
       :delete {:summary "删除需求项"
                :handler (paper-demand/delete-demand ctx)}}]
     ["/:id/:action"
      {:post {:summary "需求项业务动作"
              :handler (paper-demand/action-demand ctx)}}]]
    ["/push"
     [""
      {:post {:summary "试卷完成推送（回推）"
              :handler (paper-demand/push-results ctx)}}]
     ["/results"
      {:get {:summary "推送结果列表"
             :handler (paper-demand/list-push-results ctx)}}]]]])

(defn business-routes [ctx]
  [["/certification"
    {:swagger {:tags ["等级认定"]}}
    ["/organizations"
     {}
     [""
      {:get {:summary "认定机构列表"
             :handler (partial organizations/list-organizations ctx)}
       :post {:summary "新增认定机构"
              :handler (partial organizations/create-organization ctx)}}]
     ["/:id"
      {:get {:summary "查看认定机构"
             :handler (partial organizations/get-organization ctx)}
       :put {:summary "更新认定机构"
             :handler (partial organizations/update-organization ctx)}
       :delete {:summary "删除认定机构"
                :handler (partial organizations/delete-organization ctx)}}]]
    (resource-endpoint ctx "/plans" "certification-plans" "等级认定" "认定计划")
    (resource-endpoint ctx "/supervision" "certification-supervision" "等级认定" "认定监督")
    (resource-endpoint ctx "/statistics" "certification-statistics" "等级认定" "认定统计" false)
    (resource-endpoint ctx "/approval-settings" "approval-settings" "等级认定" "批复设置")
    (resource-endpoint ctx "/approvals" "approvals" "等级认定" "认定批复")
    (resource-endpoint ctx "/certificate-reports" "certificate-reports" "等级认定" "证书上报")
    (resource-endpoint ctx "/violations" "trace-alerts" "等级认定" "预警违规")
    (resource-endpoint ctx "/special-applications" "special-applications" "等级认定" "特办申请")
    (resource-endpoint ctx "/historical" "historical-certifications" "等级认定" "历次认定" false)
    (resource-endpoint ctx "/fee-settings" "fee-settings" "等级认定" "收费设置")
    (resource-endpoint ctx "/certificates-group" "certificates" "等级认定" "集团证书" false)
    (resource-endpoint ctx "/certificates-print" "certificate-print-jobs" "等级认定" "证书打印")
    (resource-endpoint ctx "/public-query" "certificates" "等级认定" "公共证书查询" false)
    (resource-endpoint ctx "/exam-registration" "exam-registration" "等级认定" "报名管理")
    (resource-endpoint ctx "/exam-arrangement" "exam-arrangement" "等级认定" "考场编排")
    (resource-endpoint ctx "/exam-session" "exam-sessions" "等级认定" "考试场次")
    (resource-endpoint ctx "/score-publicity-manage" "score-publicity-batches" "等级认定" "成绩公示批次")
    (resource-endpoint ctx "/evaluator-staff" "evaluator-staff" "等级认定" "考评人员")
    (resource-endpoint ctx "/declaration" "cert-declarations" "等级认定" "证书申报")
    (resource-endpoint ctx "/video-monitor" "video-monitor" "等级认定" "视频监控")]
   ["/numbering"
    {:swagger {:tags ["编号服务"]}}
    ["/plan-number"
     {:post {:summary "生成计划编号"
             :handler (partial numbering/generate-plan-number ctx)}}]
    ["/cert-number"
     {:post {:summary "生成证书号"
             :handler (partial numbering/generate-cert-number ctx)}}]
    ["/level-mapping"
     {:get {:summary "获取等级编码映射"
            :handler numbering/get-level-mapping}}]]
   ["/cert"
    {:swagger {:tags ["等级认定兼容路径"]}}
    ["/public-query" {:get {:summary "公共证书查询" :handler (resource-controller/list-alias ctx "certificates")}}]
    ["/video-monitor" {:get {:summary "视频监控列表" :handler (resource-controller/list-alias ctx "video-monitor")}}]]
   ["/certification/execution"
    {:swagger {:tags ["机构端等级认定"]}}
    (resource-endpoint ctx "/exam-rooms" "exam-rooms" "机构端等级认定" "考场信息")
    ["/registration-orgs"
     {:swagger {:tags ["机构端等级认定"]}}
     ["/site-tree"
      {:get {:summary "站点树"
             :handler (partial registration-orgs/site-tree ctx)}}]
     [""
      {:get {:summary "报名机构列表"
             :handler (partial registration-orgs/list-registration-orgs ctx)}
       :post {:summary "新增报名机构"
              :handler (partial registration-orgs/create-registration-org ctx)}}]
    ["/:id"
      {:get {:summary "查看报名机构"
             :handler (partial registration-orgs/get-registration-org ctx)}
       :put {:summary "更新报名机构"
             :handler (partial registration-orgs/update-registration-org ctx)}
       :delete {:summary "删除报名机构"
                :handler (partial registration-orgs/delete-registration-org ctx)}}]
     ["/:id/lock"
      {:post {:summary "锁定机构"
              :handler (partial registration-orgs/lock-org ctx)}}]
     ["/:id/unlock"
      {:post {:summary "解锁机构"
              :handler (partial registration-orgs/unlock-org ctx)}}]
     ["/:id/reset-password"
      {:post {:summary "重置密码"
              :handler (partial registration-orgs/reset-password ctx)}}]]
    (resource-endpoint ctx "/exam-staff" "exam-staff" "机构端等级认定" "考务人员")
    (resource-endpoint ctx "/supervisors" "supervisors" "机构端等级认定" "监考人员")
    (resource-endpoint ctx "/marking-leads" "marking-leads" "机构端等级认定" "阅卷负责人")
   ;; 人员管理统一 API - 共用 cgn_exam_staff 表
   ["/staff"
    {:swagger {:tags ["人员管理"]}}
    [""
     {:get {:summary "人员列表 (支持 staffType 筛选)"
            :handler (partial exam-staff/list-staff ctx)}
      :post {:summary "新增人员"
             :handler (partial exam-staff/create-staff ctx)}}]
    ["/:id"
     {:get {:summary "查看人员详情"
            :handler (partial exam-staff/get-staff ctx)}
      :put {:summary "更新人员信息"
            :handler (partial exam-staff/update-staff ctx)}
      :delete {:summary "删除人员"
               :handler (partial exam-staff/delete-staff ctx)}}]
    ["/:id/password-hint"
     {:get {:summary "获取密码提示 (身份证后六位)"
            :handler (partial exam-staff/get-password-hint ctx)}}]]
   ;; 身份证解析
   ["/utils/parse-id-card"
    {:get {:summary "解析身份证号 (返回性别和出生日期)"
           :handler exam-staff/parse-id-card}}]
   ["/question-bank"
    {:swagger {:tags ["题库"]}}
    (resource-endpoint ctx "/subject-categories" "subject-categories" "题库" "科目分类")
    (resource-endpoint ctx "/theory-subjects" "theory-subjects" "题库" "理论科目")
    (resource-endpoint ctx "/knowledge-structures" "knowledge-structures" "题库" "知识结构")
    (resource-endpoint ctx "/theory-questions" "theory-questions" "题库" "理论试题")
    (resource-endpoint ctx "/structure-ratios" "structure-ratios" "题库" "结构比重")
    (resource-endpoint ctx "/theory-paper-rules" "theory-paper-rules" "题库" "理论组卷规则")
    (resource-endpoint ctx "/theory-paper-requirements" "theory-paper-requirements" "题库" "理论试卷需求")
    (resource-endpoint ctx "/skill-subjects" "skill-subjects" "题库" "技能科目")
    (resource-endpoint ctx "/skill-modules" "skill-modules" "题库" "技能模块")
    (resource-endpoint ctx "/skill-questions" "skill-questions" "题库" "技能试题")
    (resource-endpoint ctx "/skill-paper-rules" "skill-paper-rules" "题库" "技能组卷规则")
    (resource-endpoint ctx "/skill-paper-requirements" "skill-paper-requirements" "题库" "技能试卷需求")
    (resource-endpoint ctx "/paper-library" "paper-library" "题库" "卷库")]
   ["/question"
    {:swagger {:tags ["题库兼容路径"]}}
    (resource-endpoint ctx "/subject-sort" "subject-categories" "题库兼容路径" "科目分类")
    (resource-endpoint ctx "/subjects" "theory-subjects" "题库兼容路径" "科目管理")
    (resource-endpoint ctx "/knowledge" "knowledge-structures" "题库兼容路径" "知识结构")
    (resource-endpoint ctx "/ratio" "structure-ratios" "题库兼容路径" "结构比重")
    (resource-endpoint ctx "/theory" "theory-questions" "题库兼容路径" "理论试题")
    (resource-endpoint ctx "/paper-rules" "theory-paper-rules" "题库兼容路径" "理论组卷规则")
    (resource-endpoint ctx "/paper-require" "theory-paper-requirements" "题库兼容路径" "理论试卷需求")
    (resource-endpoint ctx "/paper-library" "paper-library" "题库兼容路径" "卷库")
    (resource-endpoint ctx "/skill-subject-sort" "skill-subject-categories" "题库兼容路径" "技能科目分类")
    (resource-endpoint ctx "/skill-subjects" "skill-subjects" "题库兼容路径" "技能科目")
    (resource-endpoint ctx "/skill-modules" "skill-modules" "题库兼容路径" "技能模块")
    (resource-endpoint ctx "/skill" "skill-questions" "题库兼容路径" "技能试题")
    (resource-endpoint ctx "/skill-rules" "skill-paper-rules" "题库兼容路径" "技能组卷规则")
    (resource-endpoint ctx "/skill-require" "skill-paper-requirements" "题库兼容路径" "技能试卷需求")]
   ["/experts"
    {:swagger {:tags ["评价专家"]}}
    [""
     {:get {:summary "专家信息列表" :handler (resource-controller/list-alias ctx "experts")}
      :post {:summary "新增专家" :handler (resource-controller/create-alias ctx "experts")}}]
    ["/items/:id"
     {:get {:summary "专家详情" :handler (resource-controller/get-alias ctx "experts")}
      :put {:summary "更新专家" :handler (resource-controller/update-alias ctx "experts")}
      :delete {:summary "删除专家" :handler (resource-controller/delete-alias ctx "experts")}}]
    (resource-endpoint ctx "/hiring" "expert-hiring" "评价专家" "专家聘用")
    (resource-endpoint ctx "/dispatch" "expert-dispatch" "评价专家" "专家派遣")]
   ["/supervision"
    {:swagger {:tags ["督导专家"]}}
    ["/expert-info"
     [""
      {:get {:summary "专家信息列表" :handler (partial supervision/list-experts ctx)}
       :post {:summary "新增专家" :handler (partial supervision/create-expert ctx)}}]
     ["/:id"
      {:get {:summary "查看专家详情" :handler (partial supervision/get-expert ctx)}
       :put {:summary "更新专家信息" :handler (partial supervision/update-expert ctx)}
       :delete {:summary "删除专家" :handler (partial supervision/delete-expert ctx)}}]]
    ["/hiring"
     [""
      {:get {:summary "专家聘用列表" :handler (partial supervision/list-hiring ctx)}
       :post {:summary "新增聘用" :handler (partial supervision/create-hiring ctx)}}]
     ["/:id"
      {:get {:summary "查看聘用详情" :handler (partial supervision/get-hiring ctx)}
       :put {:summary "更新聘用信息" :handler (partial supervision/update-hiring ctx)}
       :delete {:summary "删除聘用" :handler (partial supervision/delete-hiring ctx)}}]]
    ["/training"
     [""
      {:get {:summary "督导培训列表" :handler (partial supervision/list-training ctx)}
       :post {:summary "新增培训" :handler (partial supervision/create-training ctx)}}]
     ["/:id"
      {:get {:summary "查看培训详情" :handler (partial supervision/get-training ctx)}
       :put {:summary "更新培训信息" :handler (partial supervision/update-training ctx)}
       :delete {:summary "删除培训" :handler (partial supervision/delete-training ctx)}}]]
    ["/evaluator-training"
     [""
      {:get {:summary "考评培训列表" :handler (partial supervision/list-evaluator-training ctx)}
       :post {:summary "新增考评培训" :handler (partial supervision/create-evaluator-training ctx)}}]
     ["/:id"
      {:get {:summary "查看考评培训详情" :handler (partial supervision/get-evaluator-training ctx)}
       :put {:summary "更新考评培训" :handler (partial supervision/update-evaluator-training ctx)}
       :delete {:summary "删除考评培训" :handler (partial supervision/delete-evaluator-training ctx)}}]]
    ["/dispatch"
     [""
      {:get {:summary "专家派遣列表" :handler (partial supervision/list-dispatch ctx)}
       :post {:summary "新增派遣" :handler (partial supervision/create-dispatch ctx)}}]
     ["/:id"
      {:get {:summary "查看派遣详情" :handler (partial supervision/get-dispatch ctx)}
       :put {:summary "更新派遣信息" :handler (partial supervision/update-dispatch ctx)}
       :delete {:summary "删除派遣" :handler (partial supervision/delete-dispatch ctx)}}]]
    ["/forms"
     [""
      {:get {:summary "表单列表" :handler (partial supervision/list-forms ctx)}
       :post {:summary "新增表单" :handler (partial supervision/create-form ctx)}}]
     ["/:id"
      {:get {:summary "查看表单详情" :handler (partial supervision/get-form ctx)}
       :put {:summary "更新表单" :handler (partial supervision/update-form ctx)}
       :delete {:summary "删除表单" :handler (partial supervision/delete-form ctx)}}]]
    ["/personnel-statistics"
     [""
      {:get {:summary "人员统计" :handler (partial supervision/get-personnel-statistics ctx)}}]]]
   ["/traceability"
    {:swagger {:tags ["溯源中心"]}}
    (resource-endpoint ctx "/cert-records" "trace-cert-records" "溯源中心" "证书溯源记录")
    ["/cases"
     [""
      {:get {:summary "溯源案例列表" :handler (partial traceability/list-cases ctx)}
       :post {:summary "新增案例" :handler (partial traceability/create-case ctx)}}]
     ["/:id"
      {:get {:summary "查看案例详情" :handler (partial traceability/get-case ctx)}
       :put {:summary "更新案例" :handler (partial traceability/update-case ctx)}
       :delete {:summary "删除案例" :handler (partial traceability/delete-case ctx)}}]]
    ["/alerts"
     [""
      {:get {:summary "溯源预警列表" :handler (partial traceability/list-alerts ctx)}
       :post {:summary "新增预警" :handler (partial traceability/create-alert ctx)}}]
     ["/:id"
      {:get {:summary "查看预警详情" :handler (partial traceability/get-alert ctx)}
       :put {:summary "更新预警" :handler (partial traceability/update-alert ctx)}
       :delete {:summary "删除预警" :handler (partial traceability/delete-alert ctx)}}]]]]])

(defn api-routes [opts]
  (let [ctx {:datasource (:datasource opts)
             :config {:auth (:auth opts)}}]
    (vec
     (concat
      [["/swagger.json"
        {:get {:no-doc true
               :swagger {:info {:title "职业技能等级认定系统 API"
                                :description "Kit/Integrant 后端接口，开发使用 SQLite，上线可切换达梦数据库。"
                                :version "0.1.0"}}
               :handler (swagger/create-swagger-handler)}}]
       ["/docs/swagger.json"
        {:get {:no-doc true
               :swagger {:info {:title "职业技能等级认定系统 API"
                                :description "Kit/Integrant 后端接口，开发使用 SQLite，上线可切换达梦数据库。"
                                :version "0.1.0"}}
               :handler (swagger/create-swagger-handler)}}]
       ["/health" {:get #'health/healthcheck!}]
       ["/auth"
        {:swagger {:tags ["认证"]}}
        ["/login"
         {:post {:summary "登录"
                 :handler (partial auth/login ctx)}}]
        ["/me"
         {:get {:summary "当前用户"
                :handler (partial auth/me ctx)}}]]
       ["/catalog"
        {:swagger {:tags ["基础字典"]}}
        ["/menus" {:get {:summary "菜单结构" :handler catalog/list-menus}}]
        ["/options" {:get {:summary "下拉字典" :handler catalog/list-options}}]]
       ["/actions"
        {:swagger {:tags ["通用业务动作"]}}
        ["/:resource/:action"
         {:post {:summary "批量执行业务动作"
                 :handler (resource-controller/action-resource ctx)}}]
        ["/:resource/:id/:action"
         {:post {:summary "执行单条业务动作"
                 :handler (resource-controller/action-resource-item ctx)}}]]]
      (business-routes ctx)
      (cert-biz-routes/certification-biz-routes ctx)
      (extra-business-routes ctx)
      (resource-routes ctx)))))

(derive :reitit.routes/api :reitit/routes)

(defmethod ig/init-key :reitit.routes/api
  [_ {:keys [base-path]
      :or {base-path ""}
      :as opts}]
  (fn [] [base-path (route-data opts) (api-routes opts)]))
