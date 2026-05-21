(ns zhaoyul.exam-system-backend.web.routes.api
  (:require
   [integrant.core :as ig]
   [reitit.ring.middleware.muuntaja :as muuntaja]
   [reitit.ring.middleware.parameters :as parameters]
   [reitit.swagger :as swagger]
   [zhaoyul.exam-system-backend.web.controllers.auth :as auth]
   [zhaoyul.exam-system-backend.web.controllers.catalog :as catalog]
   [zhaoyul.exam-system-backend.web.controllers.health :as health]
   [zhaoyul.exam-system-backend.web.controllers.organizations :as organizations]
   [zhaoyul.exam-system-backend.web.controllers.resources :as resource-controller]
   [zhaoyul.exam-system-backend.web.middleware-auth :as auth-middleware]
   [zhaoyul.exam-system-backend.web.middleware.exception :as exception]
   [zhaoyul.exam-system-backend.web.middleware.formats :as formats]))

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
    (resource-endpoint ctx "/group" "filing-group" "机构备案" "集团备案")
    (resource-endpoint ctx "/branch" "filing-branch" "机构备案" "分支备案")
    (resource-endpoint ctx "/province" "filing-province" "机构备案" "省级备案")]
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
    (resource-endpoint ctx "/manage" "candidates" "考生管理" "考生档案")]
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
    (resource-endpoint ctx "/register" "personal-registrations" "个人中心" "个人报名")
    (resource-endpoint ctx "/score" "personal-scores" "个人中心" "成绩查询" false)
    (resource-endpoint ctx "/cert" "personal-certificates" "个人中心" "证书查询" false)
    (resource-endpoint ctx "/ticket" "admission-tickets" "个人中心" "准考证" false)]
   ["/file"
    (resource-endpoint ctx "/distribute" "file-distributions" "文件传输" "文档分发")
    (resource-endpoint ctx "/receive" "file-receives" "文件传输" "文档接收")
    (resource-endpoint ctx "/viewer" "file-viewers" "文件传输" "文档阅览" false)
    (resource-endpoint ctx "/private" "private-files" "文件传输" "私有文档")
    (resource-endpoint ctx "/settings" "file-settings" "文件传输" "参数设置")]])

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
   ["/cert"
    {:swagger {:tags ["等级认定兼容路径"]}}
    ["/public-query" {:get {:summary "公共证书查询" :handler (resource-controller/list-alias ctx "certificates")}}]
    ["/video-monitor" {:get {:summary "视频监控列表" :handler (resource-controller/list-alias ctx "video-monitor")}}]]
   ["/certification/execution"
    {:swagger {:tags ["机构端等级认定"]}}
    (resource-endpoint ctx "/exam-rooms" "exam-rooms" "机构端等级认定" "考场信息")
    (resource-endpoint ctx "/registration-orgs" "registration-orgs" "机构端等级认定" "报名机构")
    (resource-endpoint ctx "/exam-staff" "exam-staff" "机构端等级认定" "考务人员")
    (resource-endpoint ctx "/supervisors" "supervisors" "机构端等级认定" "监考人员")
    (resource-endpoint ctx "/marking-leads" "marking-leads" "机构端等级认定" "阅卷负责人")]
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
    (resource-endpoint ctx "/skill-subject-sort" "subject-categories" "题库兼容路径" "技能科目分类")
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
    {:swagger {:tags ["评价专家"]}}
    (resource-endpoint ctx "/expert-info" "experts" "评价专家" "专家信息")
    (resource-endpoint ctx "/hiring" "expert-hiring" "评价专家" "专家聘用")
    (resource-endpoint ctx "/training" "expert-training" "评价专家" "督导培训")
    (resource-endpoint ctx "/evaluator-training" "evaluator-training" "评价专家" "考评培训")
    (resource-endpoint ctx "/dispatch" "expert-dispatch" "评价专家" "专家派遣")
    (resource-endpoint ctx "/forms" "expert-forms" "评价专家" "表单管理")
    (resource-endpoint ctx "/personnel-statistics" "expert-statistics" "评价专家" "人员统计")]
   ["/traceability"
    {:swagger {:tags ["溯源中心"]}}
    (resource-endpoint ctx "/cases" "trace-cases" "溯源中心" "溯源案例")
    (resource-endpoint ctx "/alerts" "trace-alerts" "溯源中心" "溯源预警")]])

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
      (extra-business-routes ctx)
      (resource-routes ctx)))))

(derive :reitit.routes/api :reitit/routes)

(defmethod ig/init-key :reitit.routes/api
  [_ {:keys [base-path]
      :or {base-path ""}
      :as opts}]
  (fn [] [base-path (route-data opts) (api-routes opts)]))
