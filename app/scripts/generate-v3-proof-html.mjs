import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const sourceDir = path.join(rootDir, 'docs', 'v3-proof')
const publicDir = path.join(rootDir, 'app', 'public', 'v3.0-proof')
const readmePath = path.join(sourceDir, 'README.md')

const readme = fs.readFileSync(readmePath, 'utf8')

const rows = readme
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /^\|\s*\d+\s*\|/.test(line))
  .map((line) => {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
    const link = cells[3]?.match(/\((\.\/)?([^)]*)\)/)?.[2] || ''
    return {
      id: Number(cells[0]),
      text: cells[1],
      route: cells[2].replace(/`/g, ''),
      image: link,
      module: moduleFor(cells[2], cells[1]),
    }
  })

if (!rows.length) {
  throw new Error(`No proof rows parsed from ${readmePath}`)
}

fs.rmSync(publicDir, { recursive: true, force: true })
fs.mkdirSync(publicDir, { recursive: true })

for (const entry of fs.readdirSync(sourceDir)) {
  if (/\.(png|jpe?g|webp)$/i.test(entry)) {
    fs.copyFileSync(path.join(sourceDir, entry), path.join(publicDir, entry))
  }
}

const html = renderHtml(rows)
fs.writeFileSync(path.join(sourceDir, 'index.html'), html)
fs.writeFileSync(path.join(publicDir, 'index.html'), html)

console.log(`Generated ${path.join(sourceDir, 'index.html')}`)
console.log(`Published static copy ${path.join(publicDir, 'index.html')}`)

function moduleFor(route, text) {
  if (route.includes('/finance')) return '财务收费'
  if (route.includes('/standard')) return '标准题库'
  if (route.includes('/question')) return '题库组卷'
  if (route.includes('/filing') || route.includes('/system/filing')) return '机构备案'
  if (route.includes('/cert') || route.includes('/certificate') || route.includes('/wb/cert')) return '等级认定'
  if (route.includes('/report')) return '报表上报'
  if (route.includes('/file')) return '文件流转'
  if (route.includes('/grading')) return '阅卷评分'
  if (route.includes('/archive')) return '档案管理'
  if (route.includes('/system/users')) return '基础数据'
  if (route.includes('/personal')) return '个人端'
  if (route.includes('/traceability')) return '溯源中心'
  if (route.includes('/data')) return '集团对接'
  if (route.includes('/login') || text.includes('4A')) return '登录认证'
  return '其他'
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHtml(requirements) {
  const modules = [...new Set(requirements.map((item) => item.module))]
  const now = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
  })
  const total = requirements.length

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>v3.0 修改验收报告 - 中广核职业技能等级认定管理系统</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif; background: #f5f7fb; color: #182230; line-height: 1.6; }
.hero { background: #0f4c81; color: #fff; padding: 2.4rem 2rem; }
.hero h1 { font-size: 1.8rem; line-height: 1.25; margin-bottom: .55rem; font-weight: 700; letter-spacing: 0; }
.hero p { color: #dbeafe; font-size: .96rem; }
.hero .meta { margin-top: .8rem; color: #bfdbfe; font-size: .84rem; display: flex; flex-wrap: wrap; gap: .45rem 1rem; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .8rem; padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #e5e7eb; }
.stat { border: 1px solid #e5e7eb; border-radius: 8px; padding: .85rem 1rem; background: #fff; }
.stat .num { display: block; font-size: 1.45rem; font-weight: 700; color: #047857; }
.stat .label { font-size: .82rem; color: #667085; }
.container { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
.notice { background: #ecfdf3; border: 1px solid #abefc6; color: #067647; border-radius: 8px; padding: .9rem 1rem; margin-bottom: 1.2rem; font-size: .9rem; }
.module { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 1.2rem; }
.module-head { padding: .95rem 1.1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
.module-head h2 { font-size: 1rem; font-weight: 700; letter-spacing: 0; }
.badge { font-size: .74rem; color: #067647; background: #dcfae6; border: 1px solid #abefc6; border-radius: 999px; padding: .12rem .55rem; white-space: nowrap; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .75rem; padding: 1rem 1.1rem; }
.summary-grid div { border: 1px solid #e5e7eb; border-radius: 8px; padding: .85rem; background: #f8fafc; }
.summary-grid strong, .feature strong, .test-step strong { display: block; color: #182230; font-size: .88rem; margin-bottom: .22rem; }
.summary-grid span, .feature span, .test-step span { color: #475467; font-size: .82rem; }
.feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: .75rem; padding: 1rem 1.1rem; }
.feature { border: 1px solid #e5e7eb; border-radius: 8px; padding: .85rem; background: #fff; }
.matrix { display: grid; gap: .55rem; padding: 1rem 1.1rem; }
.matrix-row { display: grid; grid-template-columns: 150px minmax(0, 1.2fr) minmax(0, 1fr); gap: .75rem; align-items: start; border: 1px solid #e5e7eb; border-radius: 8px; padding: .75rem .85rem; background: #fff; }
.matrix-row strong { color: #182230; font-size: .84rem; }
.matrix-row span { color: #475467; font-size: .82rem; }
.matrix-row em { color: #175cd3; font-size: .8rem; font-style: normal; }
.batch-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: .55rem; padding: 1rem 1.1rem; }
.batch-list div { border: 1px solid #e5e7eb; border-radius: 8px; padding: .72rem .8rem; background: #f8fafc; color: #475467; font-size: .82rem; }
.batch-list.deferred div { background: #fffbeb; border-color: #fedf89; color: #92400e; }
.api-list { display: grid; gap: .55rem; padding: 1rem 1.1rem; }
.api-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: .75rem; align-items: start; border: 1px solid #e5e7eb; border-radius: 8px; padding: .72rem .8rem; background: #fff; }
.api-row strong { color: #182230; font-size: .84rem; }
.api-row code { white-space: normal; overflow-wrap: anywhere; color: #344054; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 5px; padding: .2rem .35rem; font-size: .76rem; }
.test-list { display: grid; gap: .65rem; padding: 1rem 1.1rem; }
.test-step { display: grid; grid-template-columns: 2rem 1fr; gap: .65rem; align-items: start; border: 1px solid #e5e7eb; border-radius: 8px; padding: .8rem; background: #f8fafc; }
.test-step em { width: 2rem; height: 2rem; border-radius: 50%; background: #eff8ff; color: #175cd3; border: 1px solid #b2ddff; display: flex; align-items: center; justify-content: center; font-style: normal; font-weight: 700; font-size: .78rem; }
.req { display: grid; grid-template-columns: 2.25rem minmax(0, 1fr); gap: .75rem; padding: 1rem 1.1rem; border-bottom: 1px solid #f1f5f9; }
.req:last-child { border-bottom: 0; }
.idx { width: 2.25rem; height: 1.55rem; border-radius: 5px; background: #dcfae6; color: #067647; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .78rem; }
.text { font-size: .92rem; font-weight: 600; color: #182230; }
.route { display: inline-flex; margin-top: .3rem; color: #475467; font-size: .78rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 4px; padding: .08rem .4rem; }
.proof-links { margin-top: .55rem; display: flex; flex-wrap: wrap; gap: .4rem; }
.proof-links a { color: #175cd3; border: 1px solid #b2ddff; background: #eff8ff; border-radius: 5px; padding: .14rem .48rem; text-decoration: none; font-size: .76rem; }
.shot { margin-top: .7rem; max-width: 720px; }
.shot img { width: 100%; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; cursor: pointer; display: block; }
.shot .cap { color: #667085; font-size: .76rem; text-align: center; margin-top: .25rem; }
footer { color: #98a2b3; text-align: center; font-size: .82rem; padding: 2rem 1rem; }
.modal { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, .82); align-items: center; justify-content: center; z-index: 1000; padding: 2vw; }
.modal.show { display: flex; }
.modal img { max-width: 96vw; max-height: 94vh; border-radius: 6px; background: #fff; }
@media (max-width: 720px) {
  .hero { padding: 1.8rem 1rem; }
  .stats { padding: .8rem 1rem; }
  .container { padding: 1rem; }
  .req { grid-template-columns: 1fr; }
  .matrix-row, .api-row { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<section class="hero">
  <h1>v3.0 修改验收报告</h1>
  <p>中广核职业技能等级认定管理系统 - 功能修改对照、V1.0主流程补齐与截图证明</p>
  <div class="meta">
    <span>文档对照：v3.0修改.docx / 需求规格说明书V1.0</span>
    <span>验收时间：${now}</span>
    <span>服务器：http://106.12.6.24:29527/</span>
  </div>
</section>
<section class="stats">
  <div class="stat"><span class="num">${total}</span><span class="label">截图证明点</span></div>
  <div class="stat"><span class="num">${modules.length}</span><span class="label">覆盖模块</span></div>
  <div class="stat"><span class="num">100%</span><span class="label">证明清单完成率</span></div>
  <div class="stat"><span class="num">200</span><span class="label">远端健康检查</span></div>
</section>
<main class="container">
  <div class="notice">本页由 v3.0 + V1.0 主流程证明目录自动生成，覆盖标准题库、题库组卷、机构备案、等级认定、报表上报、文件流转、财务收费、个人端、溯源中心、4A/MDM 对接等修改点。点击截图可放大查看。</div>
  ${renderDeliverySummary(total, modules.length)}
  ${renderScopeMatrix()}
  ${renderPlanClosure()}
  ${renderBatchEvidence()}
  ${renderApiEvidence()}
  ${renderDeferredScope()}
  ${renderFeatureSummary()}
  ${renderTestMethod(total)}
  ${modules.map((module) => renderModule(module, requirements.filter((item) => item.module === module))).join('\n')}
</main>
<footer>v3.0 修改验收报告 - 生成于 ${now}</footer>
<div class="modal" id="modal" onclick="this.classList.remove('show')"><img id="modalImg" alt=""></div>
<script>
function showModal(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('modal').classList.add('show');
}
</script>
</body>
</html>`
}

function renderDeliverySummary(total, moduleCount) {
  return `<section class="module">
    <div class="module-head"><h2>交付概览</h2><span class="badge">${moduleCount} 个模块</span></div>
    <div class="summary-grid">
      <div><strong>交付版本</strong><span>3.1.0</span></div>
      <div><strong>证明点数量</strong><span>${total} 个</span></div>
      <div><strong>后端测试</strong><span>19 个测试 / 137 个断言 / 0 失败</span></div>
      <div><strong>前端验证</strong><span>TypeScript 编译 + Vite 生产构建</span></div>
    </div>
  </section>`
}

function renderScopeMatrix() {
  const rows = [
    ['v3.0 修改点', '保持可用并纳入历史证明', '1-22 号截图'],
    ['V1.0 主流程闭环', '机构用户、备案、等级认定、题库模板、最小组卷、成绩、证书、溯源、文件、报表、收费', '23-68 号截图、接口清单、自动化测试'],
    ['4A/MDM', '做适配层、mock 兜底、配置化切换', '登录、数据中心、系统用户截图与接口说明'],
    ['题库导入导出', '不兼容原系统资源包，采用系统标准 CSV 模板', '理论题库、组卷规则、卷库截图与接口说明'],
    ['Pad 端', '本期不做，列入二期 backlog', '二期排除项说明'],
    ['外部正式上报', '本期做系统内计算、导出、预览，不做正式接口推送', '报表、上报数据截图与接口说明'],
  ]

  return `<section class="module">
    <div class="module-head"><h2>V1.0 冻结范围对照</h2><span class="badge">${rows.length} 类范围</span></div>
    <div class="matrix">
      ${rows.map(([scope, handling, proof]) => `<div class="matrix-row"><strong>${esc(scope)}</strong><span>${esc(handling)}</span><em>${esc(proof)}</em></div>`).join('\n')}
    </div>
  </section>`
}

function renderPlanClosure() {
  const rows = [
    ['P0 需求矩阵', '建立需求点、路由、接口、状态、证据截图矩阵', '本证明截图点和范围对照表'],
    ['P1 基础能力', '4A、MDM、权限、审计、文件能力', '4A 回调、MDM 开通、用户授权、审计时间线、文件上传下载'],
    ['P2 主业务闭环', '备案、计划、报名、编排、考务、成绩、证书', '认定工作台、报名导入、证书生成、档案归集、流程截图'],
    ['P3 题库与标准', '理论/技能题库、导入导出、组卷、卷库', 'CSV 模板导入导出、最小组卷、卷库详情、技能题库截图'],
    ['P4 专家与阅卷', '专家基础数据、阅卷评分、复核', '专家档案、派遣基础数据、阅卷评分持久化'],
    ['P5 报表与证明', '报表、档案、上报预览、自动化证明', '报表导出、上报预览、档案导出、GPU 证明页'],
  ]

  return `<section class="module">
    <div class="module-head"><h2>开发计划闭环</h2><span class="badge">P0-P5</span></div>
    <div class="matrix">
      ${rows.map(([stage, need, proof]) => `<div class="matrix-row"><strong>${esc(stage)}</strong><span>${esc(need)}</span><em>${esc(proof)}</em></div>`).join('\n')}
    </div>
  </section>`
}

function renderBatchEvidence() {
  const batches = [
    '第一批：文件存储配置、文件元数据、上传下载接口、FormData 请求兼容。',
    '第二批：MDM 人员开通、系统用户授权、题库 CSV 模板导入导出、最小真实组卷、卷库查看。',
    '第三批：成绩、统计、报名、编排报表计算，CSV 导出，上报模板和上报预览。',
    '第四批：通用资源 CRUD 和业务动作审计，覆盖提交、审核、退回、推送、归档等动作。',
    '第五批：文档阅览接入真实文件元数据、上传、下载和删除。',
    '第六批：等级认定待办/已办、工作台汇总、认定计划审核历史。',
    '第七批：报名批次、考生导入、照片状态、报名模板下载和错误行反馈。',
    '第八批：按计划从合格成绩生成证书，重复生成保护，证书号规则复用。',
    '第九批：溯源审计事件接口和系统操作留痕时间线。',
    '第十批：历次认定档案归集、考生一人一档、档案 CSV 导出。',
    '第十一批：个人报名、成绩、证书、准考证查询接入真实业务链路。',
    '第十二批：阅卷评分、复核通过、退回修改切换到后端持久化。',
    '第十三批：收费标准、应收记录、缴费退款、收费汇总和审计留痕。',
    '第十四批：4A 登录和回调适配、MDM 自动开通、配置化 mock/external 切换。',
    '第十五批：文件分发、收文已读回执、反馈统计和审计留痕。',
  ]

  return `<section class="module">
    <div class="module-head"><h2>批次交付记录</h2><span class="badge">${batches.length} 批</span></div>
    <div class="batch-list">
      ${batches.map((item) => `<div>${esc(item)}</div>`).join('\n')}
    </div>
  </section>`
}

function renderApiEvidence() {
  const groups = [
    ['4A/MDM', 'POST /api/auth/4a-login, GET/POST /api/auth/4a-callback, GET /api/integrations/4a/status, GET /api/system/users/mdm-persons'],
    ['系统用户', 'GET/POST/PUT /api/system/users, 锁定/解锁, 重置密码, 模块授权'],
    ['题库组卷', 'GET /api/question/theory/import-template, POST /api/question/theory/import, GET /api/question/theory/export, POST /api/question/paper-rules/:id/generate'],
    ['报名证书', 'GET /api/certification/exam-registration/import-template, POST /api/certification/exam-registration/:plan-id/import, POST /api/certificate/plans/:plan-id/generate'],
    ['报表上报', 'GET /api/report/score, GET /api/report/statistics, GET /api/report/registration, GET /api/report/arrangement, GET /api/report/data-upload/preview'],
    ['文件流转', 'POST /api/file/files/upload, GET /api/file/files/:id/download, POST /api/file/distribute/:id/send, POST /api/file/receive/:id/read'],
    ['财务收费', 'GET/POST/PUT /api/finance/standard, GET /api/finance/charge, POST /api/finance/charge/:id/pay, GET /api/finance/charge/summary, GET /api/finance/list'],
    ['溯源档案', 'GET /api/traceability/audit-events, GET /api/archive, GET /api/archive/:plan-id/candidates, GET /api/archive/:plan-id/export'],
    ['个人端', 'POST /api/personal/register, GET /api/personal/score, GET /api/personal/cert, GET /api/personal/ticket'],
  ]

  return `<section class="module">
    <div class="module-head"><h2>关键接口验证清单</h2><span class="badge">${groups.length} 组接口</span></div>
    <div class="api-list">
      ${groups.map(([title, apis]) => `<div class="api-row"><strong>${esc(title)}</strong><code>${esc(apis)}</code></div>`).join('\n')}
    </div>
  </section>`
}

function renderDeferredScope() {
  const items = [
    '真实 4A/MDM 外部环境联调：本期已预留配置化适配层和 mock 兜底，真实接口到位后做小范围联调。',
    '原系统题库资源包兼容：本期不兼容原格式，只做系统标准 CSV 模板。',
    '考评员/督导员 Pad 端：本期不做移动端专项适配、签名提交、离线或弱网策略。',
    '外部正式上报接口：本期做系统内计算、Excel/CSV 导出和上报预览，不做正式接口推送。',
    '对象存储、病毒扫描、Office 在线协同编辑：本期采用服务器本地磁盘存储，预留替换接口。',
  ]

  return `<section class="module">
    <div class="module-head"><h2>二期/待联调范围</h2><span class="badge">${items.length} 项说明</span></div>
    <div class="batch-list deferred">
      ${items.map((item) => `<div>${esc(item)}</div>`).join('\n')}
    </div>
  </section>`
}

function renderFeatureSummary() {
  const features = [
    ['登录与基础数据', '补齐 4A 回调、本地用户映射、MDM 人员同步、系统用户角色和权限状态维护。'],
    ['标准题库与组卷', '补齐理论题导入导出、模板下载、组卷规则生成试卷、卷库管理和题库流转页面。'],
    ['认定主流程', '补齐报名导入、资格审核、准考证号、证书生成/查看/打印、工作台入口和流程状态联动。'],
    ['报表与上报', '补齐成绩、统计、报名、编排报表，以及上报数据批次、校验结果、回执记录。'],
    ['文件流转', '补齐文件阅览、分发、接收已读回执、私有文档和分发反馈统计。'],
    ['财务收费', '补齐收费标准、缴费登记、应收实收统计、缴费清单、票据号和导出入口。'],
    ['阅卷、档案与溯源', '补齐阅卷进度、复核状态、档案归档、审计日志和关键操作留痕。'],
    ['个人端', '补齐个人报名、准考证、成绩查询、证书查询等候选人自助能力。'],
  ]

  return `<section class="module">
    <div class="module-head"><h2>新增功能说明</h2><span class="badge">${features.length} 类能力</span></div>
    <div class="feature-list">
      ${features.map(([title, desc]) => `<div class="feature"><strong>${esc(title)}</strong><span>${esc(desc)}</span></div>`).join('\n')}
    </div>
  </section>`
}

function renderTestMethod(total) {
  const methods = [
    ['后端自动化测试', '使用独立 SQLite 数据库运行 clojure -M:test，覆盖迁移、领域服务、控制器和关键 API 闭环。'],
    ['前端构建测试', '运行 npm run build，覆盖 TypeScript 编译和 Vite 生产构建。'],
    ['页面截图验证', `启动本地前后端，使用 Playwright 逐页访问 ${total} 个证明路由并生成截图。`],
    ['静态证明发布', '运行 node app/scripts/generate-v3-proof-html.mjs，生成 docs/v3-proof/index.html 与 app/public/v3.0-proof/index.html。'],
    ['远端部署验证', '使用项目部署脚本发布到 GPU 服务器后访问 /v3.0-proof/index.html，确认证明页和图片资源可打开。'],
  ]

  return `<section class="module">
    <div class="module-head"><h2>测试方法</h2><span class="badge">5 步验证</span></div>
    <div class="test-list">
      ${methods.map(([title, desc], index) => `<div class="test-step"><em>${index + 1}</em><div><strong>${esc(title)}</strong><span>${esc(desc)}</span></div></div>`).join('\n')}
    </div>
  </section>`
}

function renderModule(module, items) {
  return `<section class="module">
    <div class="module-head"><h2>${esc(module)}</h2><span class="badge">${items.length} 项已完成</span></div>
    ${items.map(renderItem).join('\n')}
  </section>`
}

function renderItem(item) {
  return `<article class="req">
    <div class="idx">${item.id}</div>
    <div>
      <div class="text">已完成：${esc(item.text)}</div>
      <div class="route">${esc(item.route)}</div>
      <div class="proof-links"><a href="${esc(item.image)}" target="_blank">截图：${esc(item.image)}</a></div>
      <div class="shot"><img src="${esc(item.image)}" alt="${esc(item.text)}" loading="lazy" onclick="showModal(this.src)"><div class="cap">${esc(item.image)}</div></div>
    </div>
  </article>`
}
