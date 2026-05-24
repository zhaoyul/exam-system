import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'
const API = 'http://localhost:8080/api'

async function loginAsGroup(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('form', { timeout: 10000 })
  await page.locator('input[type="text"][placeholder^="请输入账"]').fill('cgnzx001')
  await page.locator('input[type="password"]').fill('cs@13311331')
  const captcha = await page.locator('text=/[0-9]{4}/').first().textContent() || '4567'
  await page.locator('input[placeholder="请输入验证码"]').fill(captcha.trim())
  await page.locator('button[type="submit"]').click()
  await page.waitForSelector('text=/选择登录身份|进入工作台/', { timeout: 10000 })
  await page.locator('text=集团管理员').first().click()
  await page.locator('button:has-text("进入工作台")').click()
  await page.waitForURL(/wb/, { timeout: 15000 })
}

async function loginAsBranch(page) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('form', { timeout: 10000 })
  await page.locator('input[type="text"][placeholder^="请输入账"]').fill('Csyxgs001')
  await page.locator('input[type="password"]').fill('cs@13311331')
  const captcha = await page.locator('text=/[0-9]{4}/').first().textContent() || '4567'
  await page.locator('input[placeholder="请输入验证码"]').fill(captcha.trim())
  await page.locator('button[type="submit"]').click()
  await page.waitForSelector('text=/选择登录身份|进入工作台/', { timeout: 10000 })
  await page.locator('text=机构管理员').first().click()
  await page.locator('button:has-text("进入工作台")').click()
  await page.waitForURL(/branch/, { timeout: 15000 })
}

// ── Health check ──
test('backend API health', async ({ request }) => {
  const res = await request.get(`${API}/health`)
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.app.status).toBe('up')
})

// ── 1. 登录 + 集团管理员权限 ──
test.describe('Group admin workflow', () => {
  test('login as group_admin and reach dashboard', async ({ page }) => {
    await loginAsGroup(page)
    await expect(page.locator('text=等级认定工作台')).toBeVisible()
    await page.screenshot({ path: '/tmp/e2e/01-dashboard.png' })
  })

  test('cert/plans page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/plans`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    // Look for a specific page heading or card title
    const body = await page.content()
    expect(body.includes('计划名称') || body.includes('添加计划')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/02-plans.png' })
  })

  test('cert/exam-rooms page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-rooms`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('考场信息') || body.includes('场地') || body.includes('备案地')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/03-exam-rooms.png' })
  })

  test('cert/registration-orgs page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/registration-orgs`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('报名机构') || body.includes('机构') || body.includes('组织')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/04-registration-orgs.png' })
  })

  test('cert/exam-staff page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-staff`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('人员安排') || body.includes('姓名')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/05-exam-staff.png' })
  })

  test('cert/exam-registration page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-registration`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('报名') || body.includes('考生') || body.includes('登记')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/06-exam-registration.png' })
  })

  test('cert/exam-arrangement page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-arrangement`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('编排') || body.includes('考场编排') || body.includes('场次')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/07-exam-arrangement.png' })
  })

  test('cert/score-publicity-manage page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/score-publicity-manage`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('成绩') || body.includes('公示') || body.includes('分数')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/08-score-publicity.png' })
  })

  test('cert/certificates-group page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/certificates-group`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('证书') || body.includes('证书管理') || body.includes('证书编号')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/09-certificates-group.png' })
  })

  test('cert/paper-demand page loads', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/paper-demand`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const body = await page.content()
    expect(body.includes('试卷') || body.includes('需求') || body.includes('组卷')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/10-paper-demand.png' })
  })
})

// ── 2. 分支机构权限 ──
test.describe('Branch admin permission restrictions', () => {
  test('branch_admin cannot access certificates-group', async ({ page }) => {
    await loginAsBranch(page)
    await page.goto(`${BASE}/#/cert/certificates-group`)
    await page.waitForTimeout(1500)
    const body = await page.content()
    const url = page.url()
    const hasNoAccess = body.includes('无权限') || body.includes('403') || url.includes('branch')
    await page.screenshot({ path: '/tmp/e2e/11-branch-no-cert.png' })
    expect(hasNoAccess).toBe(true)
  })

  test('branch_admin dashboard shows branch content', async ({ page }) => {
    await loginAsBranch(page)
    await page.waitForTimeout(1000)
    const body = await page.content()
    expect(body.includes('测试有限公司') || body.includes('工作台')).toBe(true)
    await page.screenshot({ path: '/tmp/e2e/12-branch-dashboard.png' })
  })
})
