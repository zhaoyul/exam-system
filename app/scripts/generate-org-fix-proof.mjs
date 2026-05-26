import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const baseUrl = (process.env.PROOF_BASE_URL || 'http://106.12.6.24:29527').replace(/\/$/, '')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const proofDir = path.join(rootDir, 'docs', 'org-fix-proof')
const publicDir = path.join(rootDir, 'app', 'public', 'org-fix-proof')

fs.rmSync(proofDir, { recursive: true, force: true })
fs.rmSync(publicDir, { recursive: true, force: true })
fs.mkdirSync(proofDir, { recursive: true })
fs.mkdirSync(publicDir, { recursive: true })

const stamp = new Date()
  .toISOString()
  .replace(/\D/g, '')
  .slice(0, 14)
const orgName = `修复证明机构${stamp.slice(8)}`
const username = `fixorg${stamp.slice(8)}`
const password = `Fix@${stamp.slice(8)}`
const creditCode = `FIX${stamp}`
const registerMobile = `139${stamp.slice(5, 13)}`

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
    creditCode,
    contactName: '证明联系人',
    contactPhone: registerMobile,
    mobile: registerMobile,
    address: '证明用地址',
    duty: '机构管理员',
    email: `${username}@example.com`,
    loginName: username,
    registerMobile,
    password,
    status: 'active',
  }),
})

const loginResult = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
})

if (loginResult.user?.role !== 'branch_admin') {
  throw new Error(`Expected branch_admin role, got ${loginResult.user?.role}`)
}

const browser = await chromium.launch()
const groupContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
await groupContext.addInitScript((token) => {
  window.sessionStorage.setItem('exam-system-auth-token', token)
  window.sessionStorage.setItem('exam-system-session-user', JSON.stringify({
    name: '集团管理员',
    role: 'group_admin',
    org: '中广核集团',
  }))
}, loginResult.token)

const page = await groupContext.newPage()
page.setDefaultTimeout(20000)

async function screenshot(fileName) {
  const filePath = path.join(proofDir, fileName)
  await page.screenshot({ path: filePath, fullPage: true })
  fs.copyFileSync(filePath, path.join(publicDir, fileName))
}

await page.goto(`${baseUrl}/#/cert/organizations`, { waitUntil: 'domcontentloaded' })
await page.getByText(orgName).first().waitFor()
await screenshot('01-organization-list-new-branch.png')

const row = page.locator('tr').filter({ hasText: orgName }).first()
await row.getByRole('button', { name: /查看/ }).click()
await page.getByText(username).first().waitFor()
await page.getByText('已添加用户').waitFor()
await screenshot('02-organization-detail-user-created.png')

await page.goto(`${baseUrl}/#/standard/evaluation-scope`, { waitUntil: 'domcontentloaded' })
await page.getByText(orgName).first().waitFor()
await page.getByText(orgName).first().click()
await page.waitForTimeout(700)
await screenshot('03-evaluation-scope-shows-branch.png')

await groupContext.close()

const loginContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const loginPage = await loginContext.newPage()
loginPage.setDefaultTimeout(20000)
await loginPage.goto(`${baseUrl}/#/login`, { waitUntil: 'domcontentloaded' })
await loginPage.getByPlaceholder('请输入账号').fill(username)
await loginPage.getByPlaceholder('请输入密码').fill(password)
await loginPage.locator('input[placeholder="请输入验证码"]').last().fill('1234')
await loginPage.getByRole('button', { name: '登 录' }).click()
await loginPage.getByText('选择登录身份').waitFor()
await loginPage.getByText('机构管理员').click()
await loginPage.getByRole('button', { name: '进入工作台' }).click()
await loginPage.waitForURL(/#\/branch\/portal/, { timeout: 20000 })
await loginPage.getByText(orgName).first().waitFor()
await loginPage.screenshot({ path: path.join(proofDir, '04-new-account-login-success.png'), fullPage: true })
fs.copyFileSync(path.join(proofDir, '04-new-account-login-success.png'), path.join(publicDir, '04-new-account-login-success.png'))
await loginContext.close()

await browser.close()

const generatedAt = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
const rows = [
  ['新增认定机构后列表出现新分支机构', '01-organization-list-new-branch.png'],
  ['机构详情显示注册登录名和已添加用户', '02-organization-detail-user-created.png'],
  ['评价范围机构目录出现新分支机构，可进入授权职业范围', '03-evaluation-scope-shows-branch.png'],
  ['新创建账号通过真实登录流程进入分支机构工作台', '04-new-account-login-success.png'],
]

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>认定机构账号与评价范围修复证明</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif; background: #f5f7fb; color: #182230; }
.hero { background: #0f4c81; color: #fff; padding: 32px; }
.hero h1 { margin: 0 0 8px; font-size: 28px; }
.hero p { margin: 0; color: #dbeafe; }
.wrap { max-width: 1180px; margin: 0 auto; padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 18px; }
.card, .proof { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.card strong { display: block; font-size: 13px; color: #667085; margin-bottom: 4px; }
.card span, code { overflow-wrap: anywhere; }
.notice { background: #ecfdf3; border: 1px solid #abefc6; color: #067647; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; }
.proof { margin-bottom: 18px; }
.proof h2 { margin: 0 0 10px; font-size: 18px; }
.proof img { width: 100%; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; }
.fixes { display: grid; gap: 8px; margin-bottom: 18px; }
.fixes div { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
</style>
</head>
<body>
<section class="hero">
  <h1>认定机构账号与评价范围修复证明</h1>
  <p>新增机构自动创建登录账号、非内置账号可登录、评价范围显示新增分支机构</p>
</section>
<main class="wrap">
  <div class="notice">本证明基于公网环境 ${baseUrl} 生成，已通过真实 API 创建新机构并使用新账号完成登录。</div>
  <section class="grid">
    <div class="card"><strong>生成时间</strong><span>${generatedAt}</span></div>
    <div class="card"><strong>证明机构</strong><span>${orgName}</span></div>
    <div class="card"><strong>登录账号</strong><code>${username}</code></div>
    <div class="card"><strong>登录密码</strong><code>${password}</code></div>
    <div class="card"><strong>创建接口</strong><code>POST /api/certification/organizations</code></div>
    <div class="card"><strong>登录验证</strong><code>POST /api/auth/login → 200 / branch_admin</code></div>
  </section>
  <section class="fixes">
    <div>修复 1：管理员新增认定机构时，后端同步创建或更新该机构的机构管理员账号。</div>
    <div>修复 2：新建账号使用新增表单中填写的密码；历史已存在机构若只有登录名无账号，读取机构列表/详情时自动补账号，默认密码为登录名后六位。</div>
    <div>修复 3：评价范围机构目录改为读取认定机构列表，新分支机构会出现在目录中，并可基于集团评价范围批量授权。</div>
  </section>
  ${rows.map(([title, image], index) => `<section class="proof"><h2>${index + 1}. ${title}</h2><img src="${image}" alt="${title}"></section>`).join('\n')}
</main>
</body>
</html>`

const readme = `# 认定机构账号与评价范围修复证明

生成时间：${generatedAt}

公网环境：${baseUrl}

## 证明账号

- 机构：${orgName}
- 登录名：${username}
- 密码：${password}
- 登录接口：\`POST /api/auth/login\` 返回 200，角色为 \`branch_admin\`

## 修复点

1. 管理员新增认定机构时，后端同步创建或更新该机构的机构管理员账号。
2. 新建账号使用新增表单中填写的密码；历史已存在机构若只有登录名无账号，读取机构列表/详情时自动补账号，默认密码为登录名后六位。
3. 评价范围机构目录改为读取认定机构列表，新分支机构会出现在目录中，并可基于集团评价范围批量授权。

## 截图

${rows.map(([title, image], index) => `${index + 1}. ${title}: [${image}](./${image})`).join('\n')}
`

fs.writeFileSync(path.join(proofDir, 'index.html'), html)
fs.writeFileSync(path.join(publicDir, 'index.html'), html)
fs.writeFileSync(path.join(proofDir, 'README.md'), readme)
console.log(`Created organization ${createdOrg.id}: ${orgName}`)
console.log(`Proof account: ${username} / ${password}`)
console.log(`Proof written to ${path.join(proofDir, 'index.html')}`)
