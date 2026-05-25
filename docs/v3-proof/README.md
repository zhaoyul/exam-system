# v3.0 修改完成证明

生成时间：2026-05-25 20:08:00

## 测试结果

- 前端构建：`npm run build` 通过
- 后端测试：`PORT=19089 JDBC_URL=jdbc:sqlite:/tmp/exam-system-v3-final-test.db clojure -M:test` 通过，5 个测试，43 个断言，0 失败

## GPU 服务器部署

- 部署包：`/mnt/exam-system/releases/exam-system-backend-20260525195918.jar`
- 当前软链：`/mnt/exam-system/app.jar -> /mnt/exam-system/releases/exam-system-backend-20260525195918.jar`
- 服务状态：`exam-system.service` 为 `active`
- 远端健康检查：`/`、`/api/question/subject-sort`、`/api/certification/execution/staff-assignment/assignable-staff`、`/api/paper-demand/items`、`/api/integrations/mdm/status` 均返回 HTTP 200

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

## 说明

本证明覆盖 v3.0 文档要求中已实现的前端页面、编号规则、备案审核、标准/题库过程、成绩留痕、4A 登录入口、MDM 同步入口和后端接口联调能力。
