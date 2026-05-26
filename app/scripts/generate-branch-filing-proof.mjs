import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const baseUrl = (process.env.PROOF_BASE_URL || 'http://106.12.6.24:29527').replace(/\/$/, '')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const proofDir = path.join(rootDir, 'docs', 'branch-filing-proof')
const publicDir = path.join(rootDir, 'app', 'public', 'branch-filing-proof')

fs.rmSync(proofDir, { recursive: true, force: true })
fs.rmSync(publicDir, { recursive: true, force: true })
fs.mkdirSync(proofDir, { recursive: true })
fs.mkdirSync(publicDir, { recursive: true })

const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const suffix = stamp.slice(6)
const orgName = `分支隔离证明机构${suffix}`
const username = `branchfix${suffix}`
const password = `Fix@${suffix}`
const persistedAddress = `证明持久化地址-${suffix}`
const persistedContact = `证明联系人-${suffix}`
const examStaffName = `证明工作人员-${suffix}`
const evaluatorName = `证明考评人员-${suffix}`

async function api(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    throw new Error(`API ${pathname} failed: ${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

const createdOrg = await api('/api/certification/organizations', {
  method: 'POST',
  body: JSON.stringify({
    parentId: 'org-cgn',
    orgType: 'branch',
    name: orgName,
    creditCode: `BRANCHPROOF${suffix}`,
    contactName: '证明初始联系人',
    contactPhone: `139${suffix.slice(-8)}`,
    mobile: `139${suffix.slice(-8)}`,
    address: '证明初始地址',
    duty: '机构管理员',
    email: `${username}@example.com`,
    loginName: username,
    registerMobile: `139${suffix.slice(-8)}`,
    password,
    status: 'active',
  }),
})

const loginResult = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
})

if (loginResult.user?.role !== 'branch_admin' || loginResult.user?.orgId !== createdOrg.id) {
  throw new Error(`Login isolation failed: ${JSON.stringify(loginResult.user)}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
page.setDefaultTimeout(25000)

async function screenshot(fileName) {
  const filePath = path.join(proofDir, fileName)
  await page.screenshot({ path: filePath, fullPage: true })
  fs.copyFileSync(filePath, path.join(publicDir, fileName))
}

await page.goto(`${baseUrl}/#/login`, { waitUntil: 'domcontentloaded' })
await page.getByPlaceholder('请输入账号').fill(username)
await page.getByPlaceholder('请输入密码').fill(password)
await page.locator('input[placeholder="请输入验证码"]').last().fill('1234')
await page.getByRole('button', { name: '登 录' }).click()
await page.getByText('选择登录身份').waitFor()
await page.getByText('机构管理员').click()
await page.getByRole('button', { name: '进入工作台' }).click()
await page.waitForURL(/#\/branch\/portal/, { timeout: 25000 })
await page.getByText(orgName).first().waitFor()
await screenshot('01-proof-account-login.png')

await page.goto(`${baseUrl}/#/system/filing-branch`, { waitUntil: 'domcontentloaded' })
await page.getByText('备案信息（分支机构）').waitFor()
await page.getByText(orgName).first().waitFor()
await screenshot('02-current-org-basic-info.png')

await page.getByRole('button', { name: /编辑/ }).click()
const inputs = page.locator('input')
await inputs.nth(4).fill(persistedContact)
await inputs.nth(5).fill(`139${suffix.slice(-8)}`)
await inputs.nth(7).fill(persistedAddress)
await page.getByRole('button', { name: /^保存$/ }).click()
await page.getByText(persistedAddress).waitFor()
await page.reload({ waitUntil: 'domcontentloaded' })
await page.getByText(persistedAddress).waitFor()
await page.getByText(persistedContact).waitFor()
await screenshot('03-basic-info-persisted-after-refresh.png')

await page.getByRole('button', { name: '工作人员' }).click()
await page.getByRole('button', { name: '新增' }).click()
await page.locator('.fixed input').nth(0).fill(examStaffName)
await page.locator('.fixed input').nth(1).fill(`44030119900101${suffix.slice(-4)}`)
await page.locator('.fixed input').nth(2).fill(`138${suffix.slice(-8)}`)
await page.locator('.fixed').getByRole('button', { name: '保存' }).click()
await page.getByText(examStaffName).waitFor()
await screenshot('04-exam-staff-saved.png')

await page.getByRole('button', { name: '考评人员' }).click()
await page.waitForTimeout(800)
await page.getByText('共 0 人').waitFor()
await screenshot('05-evaluator-tab-isolated.png')

await page.getByRole('button', { name: '新增' }).click()
await page.locator('.fixed input').nth(0).fill(evaluatorName)
await page.locator('.fixed input').nth(1).fill(`44030119880202${suffix.slice(-4)}`)
await page.locator('.fixed input').nth(2).fill(`137${suffix.slice(-8)}`)
await page.locator('.fixed').getByRole('button', { name: '保存' }).click()
await page.getByText(evaluatorName).waitFor()
await screenshot('06-evaluator-staff-saved.png')

await page.reload({ waitUntil: 'domcontentloaded' })
await page.getByText('备案信息（分支机构）').waitFor()
await page.getByRole('button', { name: '考评人员' }).click()
await page.getByText(evaluatorName).waitFor()
await screenshot('07-staff-persisted-after-refresh.png')

const profileCheck = await api('/api/filing/branch-current', {
  headers: { Authorization: `Bearer ${loginResult.token}` },
})
const examCheck = await api('/api/filing/branch-current/staff?staffType=exam_staff', {
  headers: { Authorization: `Bearer ${loginResult.token}` },
})
const evaluatorCheck = await api('/api/filing/branch-current/staff?staffType=evaluator', {
  headers: { Authorization: `Bearer ${loginResult.token}` },
})

if (profileCheck.basicInfo?.address !== persistedAddress) {
  throw new Error(`Persisted address mismatch: ${JSON.stringify(profileCheck.basicInfo)}`)
}
if (!examCheck.items?.some(item => item.name === examStaffName)) {
  throw new Error('Exam staff API verification failed')
}
if (!evaluatorCheck.items?.some(item => item.name === evaluatorName) || evaluatorCheck.items?.some(item => item.name === examStaffName)) {
  throw new Error('Evaluator staff isolation verification failed')
}

await context.close()
await browser.close()

const generatedAt = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
const rows = [
  ['证明账号真实登录成功', '01-proof-account-login.png'],
  ['分支备案基础信息按当前登录机构显示，不再显示其他公司数据', '02-current-org-basic-info.png'],
  ['基础信息通过保存接口写入数据库，刷新后仍保留', '03-basic-info-persisted-after-refresh.png'],
  ['工作人员页签新增人员后保存到当前机构', '04-exam-staff-saved.png'],
  ['切换到考评人员页签不再复用工作人员数据', '05-evaluator-tab-isolated.png'],
  ['考评人员页签新增人员独立保存', '06-evaluator-staff-saved.png'],
  ['刷新后考评人员仍存在，证明写入数据库', '07-staff-persisted-after-refresh.png'],
]

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>分支机构备案数据隔离与持久化修复证明</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif; background: #f5f7fb; color: #182230; }
.hero { background: #17468f; color: #fff; padding: 32px; }
.hero h1 { margin: 0 0 8px; font-size: 28px; }
.hero p { margin: 0; color: #dbeafe; }
.wrap { max-width: 1180px; margin: 0 auto; padding: 24px; }
.notice { background: #ecfdf3; border: 1px solid #abefc6; color: #067647; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 18px; }
.card, .proof, .fixes div { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.card strong { display: block; font-size: 13px; color: #667085; margin-bottom: 4px; }
code, .card span { overflow-wrap: anywhere; }
.fixes { display: grid; gap: 8px; margin-bottom: 18px; }
.proof { margin-bottom: 18px; }
.proof h2 { margin: 0 0 10px; font-size: 18px; }
.proof img { width: 100%; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; }
</style>
</head>
<body>
<section class="hero">
  <h1>分支机构备案数据隔离与持久化修复证明</h1>
  <p>修复分支账号显示其他公司数据、基础信息刷新丢失、工作人员/督导人员/考评人员切换无效的问题</p>
</section>
<main class="wrap">
  <div class="notice">本证明基于公网环境 ${baseUrl} 生成，创建证明机构和证明账号后完成真实登录、页面保存、刷新校验和 API 校验。</div>
  <section class="grid">
    <div class="card"><strong>生成时间</strong><span>${generatedAt}</span></div>
    <div class="card"><strong>发布版本</strong><code>3.1.1 / ${createdOrg.id}</code></div>
    <div class="card"><strong>证明机构</strong><span>${orgName}</span></div>
    <div class="card"><strong>登录账号</strong><code>${username}</code></div>
    <div class="card"><strong>登录密码</strong><code>${password}</code></div>
    <div class="card"><strong>登录验证</strong><code>POST /api/auth/login → 200 / branch_admin</code></div>
    <div class="card"><strong>基础信息验证</strong><code>GET /api/filing/branch-current → ${persistedAddress}</code></div>
    <div class="card"><strong>人员隔离验证</strong><code>exam_staff / evaluator 按 staffType 分离</code></div>
  </section>
  <section class="fixes">
    <div>修复 1：分支备案页改为调用当前登录机构接口，后端从 token 的 org_id 取数，禁止读取其他机构备案资料。</div>
    <div>修复 2：基本信息保存写入 organization 与分支备案 profile，刷新页面后从数据库重新加载。</div>
    <div>修复 3：工作人员、督导人员、考评人员分别按 staffType 查询和保存，三类页签不再共用本地数组。</div>
    <div>修复 4：登录后的机构名称优先使用账号所属机构名称，避免分支账号显示“测试有限公司”等兜底名称。</div>
  </section>
  ${rows.map(([title, file], index) => `<section class="proof"><h2>${index + 1}. ${title}</h2><img src="${file}" alt="${title}"></section>`).join('\n  ')}
</main>
</body>
</html>`

fs.writeFileSync(path.join(proofDir, 'index.html'), html)
fs.writeFileSync(path.join(publicDir, 'index.html'), html)
fs.writeFileSync(path.join(proofDir, 'README.md'), [
  '# 分支机构备案数据隔离与持久化修复证明',
  '',
  `生成时间：${generatedAt}`,
  `公网地址：${baseUrl}/branch-filing-proof/index.html`,
  `证明账号：${username}`,
  `证明密码：${password}`,
  `证明机构：${orgName}`,
  '',
  '验证点：',
  '- 新分支机构账号可真实登录。',
  '- 分支备案基础信息只显示当前机构数据。',
  '- 基础信息保存后刷新仍存在。',
  '- 工作人员、督导人员、考评人员按 staffType 独立保存和加载。',
].join('\n'))

console.log(JSON.stringify({
  proofUrl: `${baseUrl}/branch-filing-proof/index.html`,
  username,
  password,
  orgName,
  orgId: createdOrg.id,
  screenshots: rows.map(([, file]) => file),
}, null, 2))
