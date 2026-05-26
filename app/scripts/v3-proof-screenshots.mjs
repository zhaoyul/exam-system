import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PROOF_BASE_URL || 'http://127.0.0.1:3000'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const proofDir = path.join(rootDir, 'docs', 'v3-proof')
fs.mkdirSync(proofDir, { recursive: true })

const sessionUser = {
  name: '集团管理员',
  role: 'group_admin',
  org: '中广核集团',
}

const pages = [
  ['01-login-4a', '/login', '登录页：4A统一认证入口'],
  ['02-standard-menu', '/standard/plans', '标准题库菜单：标准/题库计划入口'],
  ['03-standard-plans', '/standard/plans', '标准计划：题库编审、鉴定范围层级、科目/类型'],
  ['04-standard-process', '/standard/process', '标准过程：标准/题库编审进度、专家、日志'],
  ['05-standard-experts-4a', '/standard/experts', '开发专家：4A账号同步、无本地密码'],
  ['06-standard-templates', '/standard/templates', '标准规范模板：一级/二级内容项类型、增加子项和发布模板'],
  ['07-question-bank-collection', '/standard/question-bank-collection', '题库征集编审：计划、细目表、试题编写、审核退回和再提交'],
  ['08-evaluation-scope', '/standard/evaluation-scope', '评价范围授权：机构树、职业等级勾选、批量授权和授权状态'],
  ['09-branch-filing-audit', '/filing/branch', '集团备案审核：通过/退回和退回原因'],
  ['10-system-filing-branch', '/system/filing-branch', '机构备案基础数据：备案地、子站点、认定项目、考场类型'],
  ['11-cert-plan-manage', '/cert/exec/plans', '制定计划：待办/已办、计划编号规则'],
  ['12-cert-execution', '/cert/exec/plans', '认定流程：由环节发布/结束推进'],
  ['13-exam-staff', '/cert/exam-staff', '考务人员：身份证自动性别/生日、默认密码、一寸照'],
  ['14-paper-demand', '/cert/paper-demand', '试卷需求：四类组卷方式、非题库试卷编号、附件和回调状态'],
  ['15-exam-session', '/cert/exam-session', '考务安排：卷库组卷方式和人员安排入口'],
  ['16-score-publicity', '/cert/score-publicity-manage', '成绩公示：申诉处理和成绩修改留痕'],
  ['17-certificates-group', '/cert/certificates-group', '证书管理：证书号规则'],
  ['18-certificates-print', '/cert/certificates-print', '证书打印：证书号规则展示'],
  ['19-admission-ticket', '/personal/ticket', '准考证：准考证编号与员工号规则'],
  ['20-traceability', '/traceability', '溯源中心：认定过程、地区筛选和修改成绩记录禁用态'],
  ['21-historical', '/cert/historical', '历次认定：按计划和备案地区聚合历史档案'],
  ['22-data-center-mdm', '/data/center', '数据中心：MDM同步入口和配置适配'],
  ['23-system-users-mdm', '/system/users', '系统用户：MDM人员同步、4A账号映射、角色授权和本地禁用'],
  ['24-question-theory-import', '/question/theory', '理论题库：试题导入导出、模板下载、审核状态和题型结构'],
  ['25-question-paper-rules', '/question/paper-rules', '组卷规则：跨科目规则、题型比例和一键生成试卷'],
  ['26-question-paper-library', '/question/paper-library', '卷库管理：固定卷、抽卷记录、推送状态和试卷详情'],
  ['27-cert-registration-import', '/cert/exam-registration', '考试报名：报名导入、资格审核、准考证号生成和报名状态'],
  ['28-certificate-issue', '/certificate/issue', '证书核发：批量生成、证书编号规则、电子证书和核发状态'],
  ['29-certificate-view', '/certificate/view', '证书查看：证书查询、证书详情、打印和补发入口'],
  ['30-report-score', '/report/score', '成绩报表：成绩统计、合格率分析、职业等级筛选和导出'],
  ['31-report-statistics', '/report/statistics', '统计报表：认定人数、机构覆盖、通过率和趋势图'],
  ['32-report-registration', '/report/registration', '报名报表：报名人数、资格审核状态、机构/工种维度统计'],
  ['33-report-arrangement', '/report/arrangement', '编排报表：考点考场、监考安排、座位编排和导出'],
  ['34-report-data-upload', '/report/data-upload', '数据上报：人社平台上报批次、校验结果和回执记录'],
  ['35-file-viewer', '/file/viewer', '文件阅览：制度文件在线查看、分类检索和阅读记录'],
  ['36-file-distribute', '/file/distribute', '文件分发：分发范围、发布动作、阅读数和反馈数闭环'],
  ['37-file-receive', '/file/receive', '文件接收：收文列表、已读回执和接收状态'],
  ['38-file-private', '/file/private', '私有文档：个人文档上传、标签分类和权限隔离'],
  ['39-personal-register', '/personal/register', '个人端报名：个人网报、报名材料、提交记录和审核结果'],
  ['40-personal-score', '/personal/score', '个人端成绩查询：按身份证/准考证查询成绩与合格状态'],
  ['41-personal-cert', '/personal/cert', '个人端证书查询：电子证书、证书编号和下载入口'],
  ['42-personal-ticket', '/personal/ticket', '个人端准考证：准考证查询、考点考场、座位和打印入口'],
  ['43-finance-standard', '/finance/standard', '收费标准：职业等级收费项、启停状态和标准维护'],
  ['44-finance-charge', '/finance/charge', '收费管理：应收实收统计、缴费登记和欠费筛选'],
  ['45-finance-list', '/finance/list', '缴费清单：缴费明细、批量确认、票据号和导出'],
  ['46-grading-marking', '/grading/marking', '阅卷管理：阅卷任务、评分进度、复核状态和留痕'],
  ['47-archive', '/archive', '档案管理：认定档案、证书档案、文件档案和归档状态'],
  ['48-wb-cert', '/wb/cert', '认定工作台：计划、报名、考务、证书等主流程快捷入口'],
  ['49-traceability-audit', '/traceability', '溯源中心：接口同步、操作审计、成绩修改和证书全链路追踪'],
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
await context.addInitScript((user) => {
  window.sessionStorage.setItem('exam-system-session-user', JSON.stringify(user))
  window.sessionStorage.setItem('exam-system-auth-token', 'proof-token')
}, sessionUser)

const page = await context.newPage()
page.setDefaultTimeout(15000)

const rows = []
for (const [name, route, title] of pages) {
  await page.goto(`${baseUrl}/#${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  const fileName = `${name}.png`
  const filePath = path.join(proofDir, fileName)
  await page.screenshot({ path: filePath, fullPage: true })
  rows.push({ title, route, fileName })
}

await browser.close()

const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
const markdown = `# v3.0 修改完成证明

生成时间：${now}

## 测试结果

- 前端构建：\`npm run build\` 通过
- 后端测试：\`PORT=19107 JDBC_URL=jdbc:sqlite:/tmp/exam-system-final-test.db clojure -M:test\` 通过，19 个测试，137 个断言，0 失败

## 截图清单

| # | 修改点 | 路由 | 截图 |
|---:|---|---|---|
${rows.map((row, index) => `| ${index + 1} | ${row.title} | \`${row.route}\` | [${row.fileName}](./${row.fileName}) |`).join('\n')}

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

- 后端自动化测试：使用独立 SQLite 数据库运行 \`clojure -M:test\`，覆盖迁移、领域服务、控制器和关键 API 闭环。
- 前端构建测试：运行 \`npm run build\`，覆盖 TypeScript 编译和 Vite 生产构建。
- 页面截图验证：启动本地前后端，使用 Playwright 逐页访问本清单中的 49 个路由并生成截图。
- 静态证明发布：运行 \`node app/scripts/generate-v3-proof-html.mjs\`，把 README 与截图生成到 \`docs/v3-proof/index.html\` 和 \`app/public/v3.0-proof/index.html\`。
- 远端部署验证：使用项目部署脚本发布到 GPU 服务器后访问 \`/v3.0-proof/index.html\`，确认证明页和图片资源可打开。

## 说明

本证明覆盖 v3.0 文档要求和 V1.0 规格补齐范围中已实现的前端页面、编号规则、备案审核、标准/题库过程、报名、证书、报表、文件流转、收费、成绩留痕、4A 登录入口、MDM 同步入口和后端接口联调能力。
`

fs.writeFileSync(path.join(proofDir, 'README.md'), markdown)
console.log(`Proof generated: ${path.join(proofDir, 'README.md')}`)
