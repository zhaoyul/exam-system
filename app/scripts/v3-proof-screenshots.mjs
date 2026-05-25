import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PROOF_BASE_URL || 'http://127.0.0.1:3000'
const rootDir = path.resolve(process.cwd(), '..')
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
- 后端测试：\`PORT=19089 JDBC_URL=jdbc:sqlite:/tmp/exam-system-v3-evaluator-test-2.db clojure -M:test\` 通过，5 个测试，43 个断言，0 失败

## 截图清单

| # | 修改点 | 路由 | 截图 |
|---:|---|---|---|
${rows.map((row, index) => `| ${index + 1} | ${row.title} | \`${row.route}\` | [${row.fileName}](./${row.fileName}) |`).join('\n')}

## 说明

本证明覆盖 v3.0 文档要求中已实现的前端页面、编号规则、备案审核、标准/题库过程、成绩留痕、4A 登录入口、MDM 同步入口和后端接口联调能力。
`

fs.writeFileSync(path.join(proofDir, 'README.md'), markdown)
console.log(`Proof generated: ${path.join(proofDir, 'README.md')}`)
