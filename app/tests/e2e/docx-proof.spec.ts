import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

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

test.describe('Docx proof screenshots', () => {
  test('工作台 - 认定流程', async ({ page }) => {
    await loginAsGroup(page)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: '/tmp/docx_proof/01-dashboard.png', fullPage: false })
  })

  test('考场信息', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-rooms`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/02-exam-rooms.png', fullPage: false })
  })

  test('报名机构', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/registration-orgs`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/03-registration-orgs.png', fullPage: false })
  })

  test('考务人员', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-staff`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/04-exam-staff.png', fullPage: false })
  })

  test('认定计划', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/plans`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/05-plans.png', fullPage: false })
  })

  test('考试报名', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-registration`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/06-exam-registration.png', fullPage: false })
  })

  test('考场编排', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/exam-arrangement`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/07-exam-arrangement.png', fullPage: false })
  })

  test('试卷需求', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/paper-demand`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/08-paper-demand.png', fullPage: false })
  })

  test('成绩公示', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/score-publicity-manage`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/09-score-publicity.png', fullPage: false })
  })

  test('证书管理', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/certificates-group`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/10-certificates-group.png', fullPage: false })
  })

  test('证书打印', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/cert/certificates-print`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/11-certificates-print.png', fullPage: false })
  })

  test('溯源中心', async ({ page }) => {
    await loginAsGroup(page)
    await page.goto(`${BASE}/#/traceability`)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/12-traceability.png', fullPage: false })
  })

  test('分支机构工作台', async ({ page }) => {
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
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/docx_proof/13-branch-dashboard.png', fullPage: false })
  })
})
