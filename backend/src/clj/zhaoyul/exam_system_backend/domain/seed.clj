(ns zhaoyul.exam-system-backend.domain.seed
  (:require
   [cheshire.core :as json]
   [zhaoyul.exam-system-backend.domain.auth :as auth]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [integrant.core :as ig]))

(def users
  [{:id "u-group-admin"
    :username "cgnzx001"
    :password "cs@13311331"
    :display-name "集团管理员"
    :role "group_admin"
    :org-id "org-cgn"}
   {:id "u-branch-admin"
    :username "Csyxgs001"
    :password "cs@13311331"
    :display-name "机构管理员"
    :role "branch_admin"
    :org-id "org-csyxgs"}
   {:id "u-branch-admin-original"
    :username "Csyxgs001cs"
    :password "cs@13311331"
    :display-name "机构管理员"
    :role "branch_admin"
    :org-id "org-csyxgs"}])

(def organizations
  [{:id "org-cgn" :org-type "group" :name "中广核集团" :contact-name "张总" :contact-phone "13800138000" :status "active"}
   {:id "org-csyxgs" :parent-id "org-cgn" :org-type "branch" :name "测试有限公司" :credit-code "91440000MA00000001" :contact-name "李经理" :contact-phone "13800138001" :mobile "13800138001" :address "广东省深圳市" :login-name "Csyxgs001" :status "active"}
   {:id "org-dayawan" :parent-id "org-cgn" :org-type "branch" :name "大亚湾核电" :contact-name "李经理" :contact-phone "13800138002" :status "active"}
   {:id "org-yangjiang" :parent-id "org-cgn" :org-type "branch" :name "阳江核电" :contact-name "王经理" :contact-phone "13800138003" :status "active"}])

(def resource-fixtures
  {"dashboard-summary"
   [{:id "dashboard-summary-main"
     :name "首页看板"
     :status "active"
     :monthCount 342
     :orgCount 7
     :pendingApproval 12
     :certIssued 1289
     :scoreData [{:month "1月" :count 120}
                 {:month "2月" :count 180}
                 {:month "3月" :count 210}
                 {:month "4月" :count 260}
                 {:month "5月" :count 342}]
     :statusPieData [{:name "已完成" :value 42 :color "#0E9F6E"}
                     {:name "进行中" :value 35 :color "#1A56DB"}
                     {:name "待审批" :value 23 :color "#F59E0B"}]
     :todoItems [{:title "阳江核电认定计划待审批" :time "2026-05-20 10:30" :type "warning"}
                 {:title "台山核电考场编排待完成" :time "2026-05-20 09:45" :type "warning"}
                 {:title "宁德核电成绩公示待确认" :time "2026-05-19 16:20" :type "info"}]
     :activities [{:user "张三" :action "提交了新认定计划" :target "2026年第二批技能认定" :time "10:30"}
                  {:user "李四" :action "完成了考场编排" :target "电气试验员四级认定" :time "09:45"}
                  {:user "王五" :action "审核通过了备案申请" :target "阳江核电新增考点" :time "09:15"}]}]
   "workbench-cards"
   [{:id "wb-cert" :name "等级认定工作台" :status "active" :module "cert" :todoCount 12 :warningCount 3}
    {:id "wb-theory" :name "理论题库工作台" :status "active" :module "theory" :subjectCount 8 :questionCount 520}
    {:id "wb-skill" :name "技能题库工作台" :status "active" :module "skill" :subjectCount 6 :questionCount 180}]
   "system-users"
   [{:id "sys-user-001" :name "张三" :status "active" :username "zhangsan" :phone "13800138001" :org "大亚湾核电" :role "管理员"}]
   "personnel"
   [{:id "person-001" :name "陈小明" :status "active" :idCard "440301199001011234" :gender "男" :org "大亚湾核电" :phone "13800138201"}]
   "system-announcements"
   [{:id "announcement-001" :name "系统维护通知" :status "published" :title "系统维护通知" :publishAt "2026-05-20 18:00"}]
   "system-logs"
   [{:id "log-001" :name "登录系统" :status "success" :actor "集团管理员" :ip "127.0.0.1" :createdAt "2026-05-20 09:00"}]
   "system-config"
   [{:id "config-001" :name "默认系统配置" :status "success" :captchaEnabled true :sessionMinutes 480}]
   "data-center"
   [{:id "data-center-001" :name "主数据同步" :status "active" :lastSyncAt "2026-05-20 08:00" :recordCount 1560}]
   "filing-group"
   [{:id "filing-group-001" :name "中广核集团备案" :status "approved" :orgId "org-cgn" :province "广东"}]
   "filing-branch"
   [{:id "filing-branch-001" :name "测试有限公司备案" :status "approved" :orgId "org-csyxgs" :province "广东"}]
   "filing-province"
   [{:id "filing-province-001" :name "广东省备案" :status "active" :province "广东" :orgCount 7}]
   "evaluation-scopes"
   [{:id "scope-001" :name "核反应堆运行值班员三级" :status "active" :occupation "核反应堆运行值班员" :level "三级"}]
   "standard-settings"
   [{:id "standard-setting-001" :name "认定标准设置" :status "active" :version "V1.0"}]
   "standard-experts"
   [{:id "standard-expert-001" :name "标准编制专家组" :status "active" :expertCount 5}]
   "standard-templates"
   [{:id "standard-template-001" :name "认定方案模板" :status "active" :templateType "方案"}]
   "standard-plans"
   [{:id "standard-plan-001" :name "2026年度标准编制计划" :status "processing" :owner "集团中心"}]
   "standard-assignments"
   [{:id "standard-assignment-001" :name "题库编制任务" :status "assigned" :expertId "expert-001"}]
   "standard-processes"
   [{:id "standard-process-001" :name "标准编制流程" :status "active" :stepCount 5}]
   "standard-library"
   [{:id "standard-library-001" :name "核反应堆运行值班员国家职业标准" :status "active" :version "2026"}]
   "certification-plans"
   [{:id "plan-2026-001" :code "Y0041GD0000012603001" :name "2026年第一批技能认定" :status "processing" :orgId "org-csyxgs" :occupation "核反应堆运行值班员" :level "三级" :plannedMonth "2026-06" :registrationDeadline "2026-06-15" :candidateCount 45}
    {:id "plan-2026-002" :code "Y0041GD0000022603002" :name "2026年第二批技能认定" :status "pending" :orgId "org-yangjiang" :occupation "电气试验员" :level "四级" :plannedMonth "2026-07" :registrationDeadline "2026-07-15" :candidateCount 32}]
   "certification-supervision"
   [{:id "cert-supervision-001" :name "2026年第一批现场督导" :status "进行中" :planId "plan-2026-001" :supervisor "王督导"}]
   "certification-statistics"
   [{:id "cert-stat-001" :name "2026年度认定统计" :status "active" :planCount 12 :candidateCount 342 :passedCount 286}]
   "approval-settings"
   [{:id "approval-setting-default" :name "默认批复模板" :status "active" :enabled true :templateName "认定计划批复" :approvalMode "集团批复"}]
   "approvals"
   [{:id "approval-001" :name "2026年第一批技能认定批复" :status "待批复" :planId "plan-2026-001" :orgId "org-csyxgs" :submitDate "2026-05-20"}]
   "certificate-reports"
   [{:id "cert-report-001" :name "2026年第一批证书上报" :status "待上报" :batchNo "Y0041GD0000012603001" :candidateCount 45}]
   "certificates"
   [{:id "cert-001" :name "陈小明" :status "已制证" :certNo "Y0041GD0000012603001001" :occupation "核反应堆运行值班员" :level "三级"}]
   "certificate-print-jobs"
   [{:id "cert-print-001" :name "2026年第一批证书打印" :status "待打印" :batchNo "Y0041GD0000012603001" :count 45}]
   "certificate-reissues"
   [{:id "cert-reissue-001" :name "陈小明证书补发" :status "pending" :certNo "Y0041GD0000012603001001" :reason "证书遗失"}]
   "fee-settings"
   [{:id "fee-setting-001" :name "三级认定收费标准" :status "active" :level "三级" :amount 380}]
   "historical-certifications"
   [{:id "history-001" :name "2026年第一批技能认定" :status "成绩管理" :orgId "org-csyxgs" :candidateCount 45 :passedCount 41}]
   "exam-rooms"
   [{:id "site-001" :name "大亚湾基地考点" :status "active" :orgId "org-csyxgs" :address "大亚湾基地培训中心" :phone "0755-00000000" :writtenRoomCount 2 :machineRoomCount 1 :rooms [{:name "101教室考场" :type "理论考场" :seats 50} {:name "实操一号工位" :type "技能考场" :seats 20}]}]
   "registration-orgs"
   [{:id "enroll-unit-001" :name "大亚湾报名点" :status "active" :loginName "dyw001" :orgCode "DYW001" :phone "0755-11111111" :contact "刘老师" :site "大亚湾基地考点"}]
   "exam-staff"
   [{:id "exam-staff-001" :name "李考务" :status "active" :loginName "kw001" :phone "13800138111" :gender "男" :unit "测试有限公司"}]
   "supervisors"
   [{:id "supervisor-001" :name "王监考" :status "active" :loginName "jk001" :phone "13800138112" :gender "女" :unit "测试有限公司"}]
   "marking-leads"
   [{:id "marking-lead-001" :name "赵阅卷" :status "active" :loginName "440301199001011234" :phone "13800138113"}]
   "exam-registration"
   [{:id "exam-registration-001" :name "2026年第一批报名" :status "pending" :planId "plan-2026-001" :candidateCount 45}]
   "exam-arrangement"
   [{:id "exam-arrangement-001" :name "2026年第一批考场编排" :status "arranged" :planId "plan-2026-001" :roomCount 3}]
   "exam-sessions"
   [{:id "exam-session-001" :name "理论考试第一场" :status "scheduled" :planId "plan-2026-001" :startAt "2026-06-20 09:00"}]
   "score-publicity-batches"
   [{:id "score-publicity-001" :name "2026年第一批成绩公示" :status "publicizing" :planId "plan-2026-001" :days 7}]
   "evaluator-staff"
   [{:id "evaluator-staff-001" :name "刘考评员" :status "active" :phone "13800138121" :occupation "核反应堆运行值班员"}]
   "cert-declarations"
   [{:id "cert-declaration-001" :name "2026年第一批证书申报" :org "中广核工程有限公司" :scope "电气设备安装工、核电运行值班员" :submitTime "2026-04-12 14:20" :reviewer "集团中心" :status "进行中" :planId "plan-2026-001" :count 41}]
   "video-monitor"
   [{:id "video-monitor-001" :name "大亚湾基地考点监控" :planCode "26440310050002" :planName "20260402中广核测试第2批认定" :org "中广测试有限公司" :room "理论第一考场" :site "深圳市中广核" :status "正在考试" :date "2026-05-19" :time "09:00-11:00" :online true :candidates 40}
    {:id "video-monitor-002" :name "阳江核电实操监控" :planCode "26440310050003" :planName "2026年集团焊工技能等级认定" :org "阳江核电有限公司" :room "实操焊接工位" :site "阳江核电培训中心" :status "未开考" :date "2026-05-19" :time "14:00-17:00" :online false :candidates 24}]
   "special-applications"
   [{:id "special-001" :name "理论考试延期申请" :status "待审核" :planId "plan-2026-001" :reason "考场调整"}]
   "subject-categories"
   [{:id "subject-category-001" :name "核电运行类" :status "active" :sort 1}]
   "theory-subjects"
   [{:id "theory-subject-001" :code "4-07-03-04" :name "核反应堆运行值班员" :status "active" :level "三级" :questionCount 520}]
   "knowledge-structures"
   [{:id "knowledge-001" :name "核安全基础" :status "active" :subjectId "theory-subject-001" :questionCount 120}]
   "theory-questions"
   [{:id "theory-question-001" :name "核反应堆运行值班员的主要职责是什么？" :content "核反应堆运行值班员的主要职责是什么？" :options ["A. 负责核反应堆的日常运行监控和操作" "B. 负责核电站的安保工作" "C. 负责核电站的行政管理工作" "D. 负责核电站的设备采购"] :status "valid" :type "单选" :difficulty "medium"}
    {:id "theory-question-002" :name "核安全文化的核心理念包括哪些？" :content "核安全文化的核心理念包括哪些？" :options ["A. 安全第一、预防为主" "B. 效率优先、兼顾安全" "C. 成本控制、安全次要" "D. 技术领先、安全随缘"] :status "valid" :type "单选" :difficulty "medium"}
    {:id "theory-question-003" :name "核反应堆控制棒的主要作用是什么？" :content "核反应堆控制棒的主要作用是什么？" :options ["A. 控制核裂变反应的速率" "B. 用于冷却反应堆" "C. 用于发电" "D. 用于测量温度"] :status "valid" :type "单选" :difficulty "medium"}
    {:id "theory-question-004" :name "核反应堆运行中，控制棒插入越深，反应性越高。" :content "核反应堆运行中，控制棒插入越深，反应性越高。" :options ["A. 正确" "B. 错误"] :status "valid" :type "判断" :difficulty "easy"}
    {:id "theory-question-005" :name "核电站工作人员必须持有相应的资格证书才能上岗。" :content "核电站工作人员必须持有相应的资格证书才能上岗。" :options ["A. 正确" "B. 错误"] :status "valid" :type "判断" :difficulty "easy"}]
   "structure-ratios"
   [{:id "ratio-001" :name "核安全基础比重" :status "active" :subjectId "theory-subject-001" :ratio 30}]
   "theory-paper-rules"
   [{:id "theory-paper-rule-001" :name "三级理论组卷规则" :status "active" :singleCount 60 :multiCount 20 :judgeCount 20}]
   "theory-paper-requirements"
   [{:id "theory-paper-req-001" :name "三级理论试卷需求" :status "active" :totalScore 100 :durationMinutes 120}]
   "paper-library"
   [{:id "paper-001" :name "2026年第一批理论试卷A" :status "已发布" :bankType "理论题库" :questionCount 100}]
   "skill-subjects"
   [{:id "skill-subject-001" :code "4-07-03-04-S" :name "核反应堆运行值班员技能科目" :status "active" :level "三级"}]
   "skill-modules"
   [{:id "skill-module-001" :name "现场操作模块" :status "active" :subjectId "skill-subject-001" :score 60}]
   "skill-questions"
   [{:id "skill-question-001" :name "主控室异常工况处置" :status "valid" :type "实操题" :moduleId "skill-module-001"}]
   "skill-paper-rules"
   [{:id "skill-paper-rule-001" :name "三级技能组卷规则" :status "active" :moduleCount 3 :totalScore 100}]
   "skill-paper-requirements"
   [{:id "skill-paper-req-001" :name "三级技能试卷需求" :status "active" :durationMinutes 180}]
   "experts"
   [{:id "expert-001" :name "刘专家" :status "active" :phone "13800138101" :unit "清华大学" :skillType "题库编制" :skillProject "核反应堆运行值班员"}]
   "expert-hiring"
   [{:id "expert-hiring-001" :name "刘专家聘用记录" :status "聘用中" :expertId "expert-001" :startDate "2026-01-01" :endDate "2026-12-31"}]
   "expert-dispatch"
   [{:id "expert-dispatch-001" :name "2026年第一批专家派遣" :status "已派遣" :expertId "expert-001" :planId "plan-2026-001"}]
   "expert-training"
   [{:id "expert-training-001" :name "督导培训第一期" :status "进行中" :type "督导培训" :hours 16}]
   "evaluator-training"
   [{:id "evaluator-training-001" :name "考评员培训第一期" :status "报名中" :type "考评培训" :hours 24}]
   "expert-forms"
   [{:id "expert-form-001" :name "现场督导记录表" :status "active" :formType "督导"}]
   "expert-statistics"
   [{:id "expert-stat-001" :name "专家人员统计" :status "active" :expertCount 18 :activeCount 15}]
   "trace-cases"
   [{:id "trace-001" :code "Y0041GD0000012603001" :name "2026年第一批技能认定" :status "进行中" :currentStage "score" :candidateCount 45}]
   "trace-alerts"
   [{:id "trace-alert-001" :name "成绩审核超期预警" :traceNo "TR-2026-0002" :candidateName "李四" :org "阳江核电" :stage "成绩管理" :level "中" :problem "成绩复核超过批复设置时限" :status "处理中" :traceId "trace-001"}]
   "finance-charges"
   [{:id "finance-charge-001" :name "2026年第一批认定缴费" :status "unpaid" :amount 17100 :planId "plan-2026-001"}]
   "finance-lists"
   [{:id "finance-list-001" :name "缴费清单" :status "charged" :count 45 :amount 17100}]
   "finance-ledgers"
   [{:id "finance-ledger-001" :name "收费台账" :status "active" :income 17100 :refund 0}]
   "finance-standards"
   [{:id "finance-standard-001" :name "认定收费标准" :status "active" :level "三级" :amount 380}]
   "scores"
   [{:id "score-001" :name "陈小明" :status "录入完成" :candidateId "candidate-001" :theoryScore 86 :skillScore 90}]
   "score-reviews"
   [{:id "score-review-001" :name "2026年第一批成绩审核" :status "pending" :planId "plan-2026-001" :sampleRate 30}]
   "score-corrections"
   [{:id "score-correction-001" :name "陈小明成绩更正" :status "pending" :reason "复核申请"}]
   "candidates"
   [{:id "candidate-001" :name "陈小明" :status "approved" :idCard "440301199001011234" :gender "男" :org "大亚湾核电" :occupation "核反应堆运行值班员" :level "三级"}]
   "exams"
   [{:id "exam-001" :name "2026年第一批理论考试" :status "planned" :startAt "2026-06-20 09:00" :roomCount 2}]
   "online-exams"
   [{:id "online-exam-001" :name "模拟在线考试" :status "active" :questionCount 100 :durationMinutes 120}]
   "seat-arrangements"
   [{:id "seat-arrange-001" :name "101教室座位编排" :status "arranged" :room "101教室考场" :seatCount 50}]
   "grading-tasks"
   [{:id "grading-task-001" :name "2026年第一批阅卷任务" :status "待阅卷" :paperCount 45}]
   "marking-tasks"
   [{:id "marking-task-001" :name "陈小明实操评分" :status "待评分" :candidateId "candidate-001"}]
   "monitor-rooms"
   [{:id "monitor-room-001" :name "101教室监控" :status "normal" :online true :alerts 0}]
   "reports"
   [{:id "report-score-001" :name "成绩报表" :status "generated" :reportType "score" :period "2026-05"}]
   "report-uploads"
   [{:id "report-upload-001" :name "上报数据包" :status "待上传" :fileName "report-202605.zip"}]
   "archives"
   [{:id "archive-001" :name "2026年第一批认定档案" :status "archived" :planId "plan-2026-001" :fileCount 18}]
   "messages"
   [{:id "message-001" :name "新认定计划待审批" :status "unread" :title "新认定计划待审批" :type "warning"}]
   "personal-registrations"
   [{:id "personal-registration-001" :name "陈小明个人报名" :status "submitted" :candidateId "candidate-001"}]
   "personal-scores"
   [{:id "personal-score-001" :name "陈小明成绩" :status "published" :candidateId "candidate-001" :totalScore 88}]
   "personal-certificates"
   [{:id "personal-cert-001" :name "陈小明证书" :status "issued" :candidateId "candidate-001" :certNo "Y0041GD0000012603001001"}]
   "admission-tickets"
   [{:id "ticket-001" :name "陈小明准考证" :status "available" :candidateId "candidate-001" :examAt "2026-06-20 09:00"}]
   "file-distributions"
   [{:id "file-distribution-001" :name "认定工作通知" :status "sent" :recipientCount 7}]
   "file-receives"
   [{:id "file-receive-001" :name "备案材料回执" :status "received" :sender "测试有限公司"}]
   "file-viewers"
   [{:id "file-viewer-001" :name "认定工作指南.pdf" :status "active" :fileType "pdf"}]
   "private-files"
   [{:id "private-file-001" :name "内部认定材料" :status "private" :owner "集团中心"}]
   "file-settings"
   [{:id "file-setting-001" :name "文件传输参数" :status "active" :maxSizeMb 100}]})

(defn- ensure-user! [ds {:keys [id username password display-name role org-id phone]}]
  (when-not (auth/find-user ds username)
    (db/execute!
     ds
     ["INSERT INTO app_user (id, username, password_hash, display_name, role, org_id, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')"
      id username (auth/password-hash username password) display-name role org-id phone])))

(defn- ensure-organization! [ds org]
  (when-not (db/execute-one! ds ["SELECT id FROM organization WHERE id = ?" (:id org)])
    (db/execute!
     ds
     ["INSERT INTO organization
       (id, parent_id, org_type, name, credit_code, contact_name, contact_phone, mobile, address, duty, email, fax, postcode, login_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      (:id org) (:parent-id org) (:org-type org) (:name org) (:credit-code org)
      (:contact-name org) (:contact-phone org) (:mobile org) (:address org)
      (:duty org) (:email org) (:fax org) (:postcode org) (:login-name org)
      (or (:status org) "active")])))

(defn- ensure-resource! [ds resource item]
  (if (resources/get-item ds resource (:id item))
    (resources/update-item! ds resource (:id item) item)
    (resources/create-item! ds resource item)))

(defn seed! [ds]
  (doseq [org organizations]
    (ensure-organization! ds org))
  (doseq [user users]
    (ensure-user! ds user))
  (doseq [[resource items] resource-fixtures
          item items]
    (ensure-resource! ds resource item))
  {:status :seeded})

(defmethod ig/init-key ::seed [_ {:keys [datasource]}]
  (seed! datasource))
