# v3.0 修改完成证明

生成时间：2026-05-26 05:32:33

## 测试结果

- 前端构建：`npm run build` 通过
- 后端测试：`PORT=19107 JDBC_URL=jdbc:sqlite:/tmp/exam-system-final-test.db clojure -M:test` 通过，19 个测试，137 个断言，0 失败

## 截图清单

| # | 修改点 | 路由 | 截图 |
|---:|---|---|---|
| 1 | 登录页：4A统一认证入口 | `/login` | [01-login-4a.png](./01-login-4a.png) |
| 2 | 标准题库菜单：标准/题库计划入口 | `/standard/plans` | [02-standard-menu.png](./02-standard-menu.png) |
| 3 | 标准计划：题库编审、鉴定范围层级、科目/类型 | `/standard/plans` | [03-standard-plans.png](./03-standard-plans.png) |
| 4 | 标准过程：标准/题库编审进度、专家、日志 | `/standard/process` | [04-standard-process.png](./04-standard-process.png) |
| 5 | 开发专家：4A账号同步、无本地密码 | `/standard/experts` | [05-standard-experts-4a.png](./05-standard-experts-4a.png) |
| 6 | 标准规范模板：一级/二级内容项类型、增加子项和发布模板 | `/standard/templates` | [06-standard-templates.png](./06-standard-templates.png) |
| 7 | 题库征集编审：计划、细目表、试题编写、审核退回和再提交 | `/standard/question-bank-collection` | [07-question-bank-collection.png](./07-question-bank-collection.png) |
| 8 | 评价范围授权：机构树、职业等级勾选、批量授权和授权状态 | `/standard/evaluation-scope` | [08-evaluation-scope.png](./08-evaluation-scope.png) |
| 9 | 集团备案审核：通过/退回和退回原因 | `/filing/branch` | [09-branch-filing-audit.png](./09-branch-filing-audit.png) |
| 10 | 机构备案基础数据：备案地、子站点、认定项目、考场类型 | `/system/filing-branch` | [10-system-filing-branch.png](./10-system-filing-branch.png) |
| 11 | 制定计划：待办/已办、计划编号规则 | `/cert/exec/plans` | [11-cert-plan-manage.png](./11-cert-plan-manage.png) |
| 12 | 认定流程：由环节发布/结束推进 | `/cert/exec/plans` | [12-cert-execution.png](./12-cert-execution.png) |
| 13 | 考务人员：身份证自动性别/生日、默认密码、一寸照 | `/cert/exam-staff` | [13-exam-staff.png](./13-exam-staff.png) |
| 14 | 试卷需求：四类组卷方式、非题库试卷编号、附件和回调状态 | `/cert/paper-demand` | [14-paper-demand.png](./14-paper-demand.png) |
| 15 | 考务安排：卷库组卷方式和人员安排入口 | `/cert/exam-session` | [15-exam-session.png](./15-exam-session.png) |
| 16 | 成绩公示：申诉处理和成绩修改留痕 | `/cert/score-publicity-manage` | [16-score-publicity.png](./16-score-publicity.png) |
| 17 | 证书管理：证书号规则 | `/cert/certificates-group` | [17-certificates-group.png](./17-certificates-group.png) |
| 18 | 证书打印：证书号规则展示 | `/cert/certificates-print` | [18-certificates-print.png](./18-certificates-print.png) |
| 19 | 准考证：准考证编号与员工号规则 | `/personal/ticket` | [19-admission-ticket.png](./19-admission-ticket.png) |
| 20 | 溯源中心：认定过程、地区筛选和修改成绩记录禁用态 | `/traceability` | [20-traceability.png](./20-traceability.png) |
| 21 | 历次认定：按计划和备案地区聚合历史档案 | `/cert/historical` | [21-historical.png](./21-historical.png) |
| 22 | 数据中心：MDM同步入口和配置适配 | `/data/center` | [22-data-center-mdm.png](./22-data-center-mdm.png) |
| 23 | 系统用户：MDM人员同步、4A账号映射、角色授权和本地禁用 | `/system/users` | [23-system-users-mdm.png](./23-system-users-mdm.png) |
| 24 | 理论题库：试题导入导出、模板下载、审核状态和题型结构 | `/question/theory` | [24-question-theory-import.png](./24-question-theory-import.png) |
| 25 | 组卷规则：跨科目规则、题型比例和一键生成试卷 | `/question/paper-rules` | [25-question-paper-rules.png](./25-question-paper-rules.png) |
| 26 | 卷库管理：固定卷、抽卷记录、推送状态和试卷详情 | `/question/paper-library` | [26-question-paper-library.png](./26-question-paper-library.png) |
| 27 | 考试报名：报名导入、资格审核、准考证号生成和报名状态 | `/cert/exam-registration` | [27-cert-registration-import.png](./27-cert-registration-import.png) |
| 28 | 证书核发：批量生成、证书编号规则、电子证书和核发状态 | `/certificate/issue` | [28-certificate-issue.png](./28-certificate-issue.png) |
| 29 | 证书查看：证书查询、证书详情、打印和补发入口 | `/certificate/view` | [29-certificate-view.png](./29-certificate-view.png) |
| 30 | 成绩报表：成绩统计、合格率分析、职业等级筛选和导出 | `/report/score` | [30-report-score.png](./30-report-score.png) |
| 31 | 统计报表：认定人数、机构覆盖、通过率和趋势图 | `/report/statistics` | [31-report-statistics.png](./31-report-statistics.png) |
| 32 | 报名报表：报名人数、资格审核状态、机构/工种维度统计 | `/report/registration` | [32-report-registration.png](./32-report-registration.png) |
| 33 | 编排报表：考点考场、监考安排、座位编排和导出 | `/report/arrangement` | [33-report-arrangement.png](./33-report-arrangement.png) |
| 34 | 数据上报：人社平台上报批次、校验结果和回执记录 | `/report/data-upload` | [34-report-data-upload.png](./34-report-data-upload.png) |
| 35 | 文件阅览：制度文件在线查看、分类检索和阅读记录 | `/file/viewer` | [35-file-viewer.png](./35-file-viewer.png) |
| 36 | 文件分发：分发范围、发布动作、阅读数和反馈数闭环 | `/file/distribute` | [36-file-distribute.png](./36-file-distribute.png) |
| 37 | 文件接收：收文列表、已读回执和接收状态 | `/file/receive` | [37-file-receive.png](./37-file-receive.png) |
| 38 | 私有文档：个人文档上传、标签分类和权限隔离 | `/file/private` | [38-file-private.png](./38-file-private.png) |
| 39 | 个人端报名：个人网报、报名材料、提交记录和审核结果 | `/personal/register` | [39-personal-register.png](./39-personal-register.png) |
| 40 | 个人端成绩查询：按身份证/准考证查询成绩与合格状态 | `/personal/score` | [40-personal-score.png](./40-personal-score.png) |
| 41 | 个人端证书查询：电子证书、证书编号和下载入口 | `/personal/cert` | [41-personal-cert.png](./41-personal-cert.png) |
| 42 | 个人端准考证：准考证查询、考点考场、座位和打印入口 | `/personal/ticket` | [42-personal-ticket.png](./42-personal-ticket.png) |
| 43 | 收费标准：职业等级收费项、启停状态和标准维护 | `/finance/standard` | [43-finance-standard.png](./43-finance-standard.png) |
| 44 | 收费管理：应收实收统计、缴费登记和欠费筛选 | `/finance/charge` | [44-finance-charge.png](./44-finance-charge.png) |
| 45 | 缴费清单：缴费明细、批量确认、票据号和导出 | `/finance/list` | [45-finance-list.png](./45-finance-list.png) |
| 46 | 阅卷管理：阅卷任务、评分进度、复核状态和留痕 | `/grading/marking` | [46-grading-marking.png](./46-grading-marking.png) |
| 47 | 档案管理：认定档案、证书档案、文件档案和归档状态 | `/archive` | [47-archive.png](./47-archive.png) |
| 48 | 认定工作台：计划、报名、考务、证书等主流程快捷入口 | `/wb/cert` | [48-wb-cert.png](./48-wb-cert.png) |
| 49 | 溯源中心：接口同步、操作审计、成绩修改和证书全链路追踪 | `/traceability` | [49-traceability-audit.png](./49-traceability-audit.png) |
| 50 | 理论科目：科目分类、授权范围、状态维护和题库入口 | `/question/subjects` | [50-question-subjects.png](./50-question-subjects.png) |
| 51 | 知识结构：知识点层级、细目表和题量分布维护 | `/question/knowledge` | [51-question-knowledge.png](./51-question-knowledge.png) |
| 52 | 结构比重：题型、难度、知识点比例和组卷参数 | `/question/ratio` | [52-question-ratio.png](./52-question-ratio.png) |
| 53 | 技能题库：技能试题、评分标准、模块归属和审核状态 | `/question/skill` | [53-question-skill.png](./53-question-skill.png) |
| 54 | 技能组卷规则：模块、题型、分值和数量规则 | `/question/skill-rules` | [54-question-skill-rules.png](./54-question-skill-rules.png) |
| 55 | 技能试卷需求：需求申请、抽卷方式、附件和回推状态 | `/question/skill-require` | [55-question-skill-require.png](./55-question-skill-require.png) |
| 56 | 认定执行报名：批量报名、导入入口和资格审核流程 | `/cert/exec/registration` | [56-cert-exec-registration.png](./56-cert-exec-registration.png) |
| 57 | 认定执行编排：考点考场、座位编排和监考安排入口 | `/cert/exec/arrangement` | [57-cert-exec-arrangement.png](./57-cert-exec-arrangement.png) |
| 58 | 认定执行成绩：成绩录入、审核、公示前置状态和流程入口 | `/cert/exec/score` | [58-cert-exec-score.png](./58-cert-exec-score.png) |
| 59 | 成绩录入：按计划录入成绩、保存提交和异常标记 | `/score/entry` | [59-score-entry.png](./59-score-entry.png) |
| 60 | 成绩审核：复核、通过、退回和审核状态 | `/score/review` | [60-score-review.png](./60-score-review.png) |
| 61 | 成绩更正：更正申请、审批记录和留痕追溯 | `/score/correction` | [61-score-correction.png](./61-score-correction.png) |
| 62 | 财务工作台：收费统计、待缴提醒和收费流程入口 | `/finance/workbench` | [62-finance-workbench.png](./62-finance-workbench.png) |
| 63 | 财务台账：收费流水、退款记录和账务汇总 | `/finance/ledger` | [63-finance-ledger.png](./63-finance-ledger.png) |
| 64 | 文件参数设置：文件类型、权限参数、存储规则和模板配置 | `/file/settings` | [64-file-settings.png](./64-file-settings.png) |
| 65 | 评价专家基础数据：专家档案、资格状态、培训聘用信息 | `/supervision/expert-info` | [65-supervision-expert-info.png](./65-supervision-expert-info.png) |
| 66 | 专家派遣基础数据：派遣任务、回评状态和督导记录入口 | `/supervision/dispatch` | [66-supervision-dispatch.png](./66-supervision-dispatch.png) |
| 67 | 集团备案查看：备案采集表、评价范围和机构详情 | `/filing/group` | [67-filing-group-view.png](./67-filing-group-view.png) |
| 68 | 分支备案申报：申报数据、审核状态和通过后只读基础 | `/system/filing-branch/apply` | [68-filing-branch-apply.png](./68-filing-branch-apply.png) |

## V1.0 冻结范围对照

| 范围 | 本期处理 | 证明方式 |
|---|---|---|
| v3.0 修改点 | 保持可用并纳入历史证明 | 1-22 号截图 |
| V1.0 主流程闭环 | 机构用户、备案、等级认定、题库模板、最小组卷、成绩、证书、溯源、文件、报表、收费 | 23-68 号截图、接口清单、自动化测试 |
| 4A/MDM | 做适配层、mock 兜底、配置化切换 | 登录、数据中心、系统用户截图与接口说明 |
| 题库导入导出 | 不兼容原系统资源包，采用系统标准 CSV 模板 | 理论题库、组卷规则、卷库截图与接口说明 |
| Pad 端 | 本期不做，列入二期 backlog | 二期排除项说明 |
| 外部正式上报 | 本期做系统内计算、导出、预览，不做正式接口推送 | 报表、上报数据截图与接口说明 |

## 开发计划闭环

| 计划阶段 | V1.0 要求 | 本期完成证据 |
|---|---|---|
| P0 需求矩阵 | 建立需求点、路由、接口、状态、证据截图矩阵 | 本证明 68 个截图点和范围对照表 |
| P1 基础能力 | 4A、MDM、权限、审计、文件能力 | 4A 回调、MDM 开通、用户授权、审计时间线、文件上传下载 |
| P2 主业务闭环 | 备案、计划、报名、编排、考务、成绩、证书 | 认定工作台、报名导入、证书生成、档案归集、流程截图 |
| P3 题库与标准 | 理论/技能题库、导入导出、组卷、卷库 | CSV 模板导入导出、最小组卷、卷库详情、技能题库截图 |
| P4 专家与阅卷 | 专家基础数据、阅卷评分、复核 | 专家档案、派遣基础数据、阅卷评分持久化 |
| P5 报表与证明 | 报表、档案、上报预览、自动化证明 | 报表导出、上报预览、档案导出、GPU 证明页 |

## 批次交付记录

- 第一批：文件存储配置、文件元数据、上传下载接口、FormData 请求兼容。
- 第二批：MDM 人员开通、系统用户授权、题库 CSV 模板导入导出、最小真实组卷、卷库查看。
- 第三批：成绩、统计、报名、编排报表计算，CSV 导出，上报模板和上报预览。
- 第四批：通用资源 CRUD 和业务动作审计，覆盖提交、审核、退回、推送、归档等动作。
- 第五批：文档阅览接入真实文件元数据、上传、下载和删除。
- 第六批：等级认定待办/已办、工作台汇总、认定计划审核历史。
- 第七批：报名批次、考生导入、照片状态、报名模板下载和错误行反馈。
- 第八批：按计划从合格成绩生成证书，重复生成保护，证书号规则复用。
- 第九批：溯源审计事件接口和系统操作留痕时间线。
- 第十批：历次认定档案归集、考生一人一档、档案 CSV 导出。
- 第十一批：个人报名、成绩、证书、准考证查询接入真实业务链路。
- 第十二批：阅卷评分、复核通过、退回修改切换到后端持久化。
- 第十三批：收费标准、应收记录、缴费退款、收费汇总和审计留痕。
- 第十四批：4A 登录和回调适配、MDM 自动开通、配置化 mock/external 切换。
- 第十五批：文件分发、收文已读回执、反馈统计和审计留痕。

## 关键接口验证清单

- 4A/MDM：`POST /api/auth/4a-login`、`GET/POST /api/auth/4a-callback`、`GET /api/integrations/4a/status`、`GET /api/system/users/mdm-persons`。
- 系统用户：`GET/POST/PUT /api/system/users`、锁定/解锁、重置密码、模块授权。
- 题库组卷：`GET /api/question/theory/import-template`、`POST /api/question/theory/import`、`GET /api/question/theory/export`、`POST /api/question/paper-rules/:id/generate`。
- 报名证书：`GET /api/certification/exam-registration/import-template`、`POST /api/certification/exam-registration/:plan-id/import`、`POST /api/certificate/plans/:plan-id/generate`。
- 报表上报：`GET /api/report/score`、`GET /api/report/statistics`、`GET /api/report/registration`、`GET /api/report/arrangement`、`GET /api/report/data-upload/preview`。
- 文件流转：`POST /api/file/files/upload`、`GET /api/file/files/:id/download`、`POST /api/file/distribute/:id/send`、`POST /api/file/receive/:id/read`。
- 财务收费：`GET/POST/PUT /api/finance/standard`、`GET /api/finance/charge`、`POST /api/finance/charge/:id/pay`、`GET /api/finance/charge/summary`、`GET /api/finance/list`。
- 溯源档案：`GET /api/traceability/audit-events`、`GET /api/archive`、`GET /api/archive/:plan-id/candidates`、`GET /api/archive/:plan-id/export`。
- 个人端：`POST /api/personal/register`、`GET /api/personal/score`、`GET /api/personal/cert`、`GET /api/personal/ticket`。

## 二期/待联调范围

- 真实 4A/MDM 外部环境联调：本期已预留配置化适配层和 mock 兜底，真实接口到位后做小范围联调。
- 原系统题库资源包兼容：本期不兼容原格式，只做系统标准 CSV 模板。
- 考评员/督导员 Pad 端：本期不做移动端专项适配、签名提交、离线或弱网策略。
- 外部正式上报接口：本期做系统内计算、Excel/CSV 导出和上报预览，不做正式接口推送。
- 对象存储、病毒扫描、Office 在线协同编辑：本期采用服务器本地磁盘存储，预留替换接口。

## 新增功能说明

- 登录与基础数据：补齐 4A 回调、本地用户映射、MDM 人员同步、系统用户角色和权限状态维护。
- 标准题库与组卷：补齐理论题导入导出、模板下载、组卷规则生成试卷、卷库管理和题库流转页面。
- 认定主流程：补齐报名导入、资格审核、准考证号、证书生成/查看/打印、工作台入口和流程状态联动。
- 报表与上报：补齐成绩、统计、报名、编排报表，以及上报数据批次、校验结果、回执记录。
- 文件流转：补齐文件阅览、分发、接收已读回执、私有文档和分发反馈统计。
- 财务收费：补齐收费标准、缴费登记、应收实收统计、缴费清单、票据号和导出入口。
- 阅卷、档案与溯源：补齐阅卷进度、复核状态、档案归档、审计日志和关键操作留痕。
- 个人端：补齐个人报名、准考证、成绩查询、证书查询等候选人自助能力。

## 测试方法

- 后端自动化测试：使用独立 SQLite 数据库运行 `clojure -M:test`，覆盖迁移、领域服务、控制器和关键 API 闭环。
- 前端构建测试：运行 `npm run build`，覆盖 TypeScript 编译和 Vite 生产构建。
- 页面截图验证：启动本地前后端，使用 Playwright 逐页访问本清单中的 68 个路由并生成截图。
- 静态证明发布：运行 `node app/scripts/generate-v3-proof-html.mjs`，把 README 与截图生成到 `docs/v3-proof/index.html` 和 `app/public/v3.0-proof/index.html`。
- 远端部署验证：使用项目部署脚本发布到 GPU 服务器后访问 `/v3.0-proof/index.html`，确认证明页和图片资源可打开。

## 说明

本证明覆盖 v3.0 文档要求和 V1.0 规格补齐范围中已实现的前端页面、编号规则、备案审核、标准/题库过程、报名、证书、报表、文件流转、收费、成绩留痕、4A 登录入口、MDM 同步入口和后端接口联调能力。
