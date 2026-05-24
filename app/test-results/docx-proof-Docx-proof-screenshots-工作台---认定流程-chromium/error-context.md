# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: docx-proof.spec.ts >> Docx proof screenshots >> 工作台 - 认定流程
- Location: tests/e2e/docx-proof.spec.ts:20:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e7]:
    - generic [ref=e9]:
      - img [ref=e11]
      - generic [ref=e15]:
        - heading "中广核职业技能等级认定平台" [level=1] [ref=e16]
        - paragraph [ref=e17]: CGN Vocational Skill Level Certification Platform
    - generic [ref=e19]:
      - generic [ref=e20]:
        - img [ref=e22]
        - heading "评价中心" [level=2] [ref=e26]
      - paragraph [ref=e27]: 从评价计划发布、考生报名、考场编排到考试组织实施的全流程管理。
      - generic [ref=e28]:
        - button [ref=e29] [cursor=pointer]
        - button [ref=e30] [cursor=pointer]
        - button [ref=e31] [cursor=pointer]
        - button [ref=e32] [cursor=pointer]
        - button [ref=e33] [cursor=pointer]
        - button [ref=e34] [cursor=pointer]
        - button [ref=e35] [cursor=pointer]
      - generic [ref=e36]:
        - button [ref=e37] [cursor=pointer]:
          - img [ref=e38]
        - button [ref=e40] [cursor=pointer]:
          - img [ref=e41]
    - generic [ref=e43]:
      - paragraph [ref=e44]: 技术支持：中广核集团人力资源部
      - paragraph [ref=e45]: 京ICP备XXXXXXXX号
  - generic [ref=e47]:
    - generic [ref=e48]:
      - generic [ref=e49]:
        - button [ref=e50] [cursor=pointer]:
          - img [ref=e51]
        - heading "选择登录身份" [level=2] [ref=e53]
      - paragraph [ref=e54]: 请选择您的角色进入对应的工作台
      - generic [ref=e55]: 接口请求失败：500
      - generic [ref=e57]:
        - button "集团管理员 集团端系统管理，拥有全部权限" [ref=e58] [cursor=pointer]:
          - img [ref=e60]
          - generic [ref=e62]:
            - generic [ref=e63]: 集团管理员
            - generic [ref=e64]: 集团端系统管理，拥有全部权限
        - button "机构管理员 分支机构管理，负责本单位认定工作" [ref=e67] [cursor=pointer]:
          - img [ref=e69]
          - generic [ref=e73]:
            - generic [ref=e74]: 机构管理员
            - generic [ref=e75]: 分支机构管理，负责本单位认定工作
        - button "评价专家 参与命题、阅卷、考评工作" [ref=e77] [cursor=pointer]:
          - img [ref=e79]
          - generic [ref=e82]:
            - generic [ref=e83]: 评价专家
            - generic [ref=e84]: 参与命题、阅卷、考评工作
        - button "督导人员 质量督导、现场监督、评价工作" [ref=e86] [cursor=pointer]:
          - img [ref=e88]
          - generic [ref=e91]:
            - generic [ref=e92]: 督导人员
            - generic [ref=e93]: 质量督导、现场监督、评价工作
        - button "考务人员 考务安排、考试组织管理" [ref=e95] [cursor=pointer]:
          - img [ref=e97]
          - generic [ref=e100]:
            - generic [ref=e101]: 考务人员
            - generic [ref=e102]: 考务安排、考试组织管理
        - button "监考人员 考场监考、秩序维护" [ref=e104] [cursor=pointer]:
          - img [ref=e106]
          - generic [ref=e109]:
            - generic [ref=e110]: 监考人员
            - generic [ref=e111]: 考场监考、秩序维护
        - button "考生 个人报名、成绩查询、证书查询" [ref=e113] [cursor=pointer]:
          - img [ref=e115]
          - generic [ref=e120]:
            - generic [ref=e121]: 考生
            - generic [ref=e122]: 个人报名、成绩查询、证书查询
        - button "进入工作台" [ref=e124] [cursor=pointer]
    - paragraph [ref=e125]: 建议使用 Chrome、Firefox、Edge 浏览器访问
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE = 'http://localhost:5173'
  4   | 
  5   | async function loginAsGroup(page) {
  6   |   await page.goto(`${BASE}/login`)
  7   |   await page.waitForSelector('form', { timeout: 10000 })
  8   |   await page.locator('input[type="text"][placeholder^="请输入账"]').fill('cgnzx001')
  9   |   await page.locator('input[type="password"]').fill('cs@13311331')
  10  |   const captcha = await page.locator('text=/[0-9]{4}/').first().textContent() || '4567'
  11  |   await page.locator('input[placeholder="请输入验证码"]').fill(captcha.trim())
  12  |   await page.locator('button[type="submit"]').click()
  13  |   await page.waitForSelector('text=/选择登录身份|进入工作台/', { timeout: 10000 })
  14  |   await page.locator('text=集团管理员').first().click()
  15  |   await page.locator('button:has-text("进入工作台")').click()
> 16  |   await page.waitForURL(/wb/, { timeout: 15000 })
      |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  17  | }
  18  | 
  19  | test.describe('Docx proof screenshots', () => {
  20  |   test('工作台 - 认定流程', async ({ page }) => {
  21  |     await loginAsGroup(page)
  22  |     await page.waitForTimeout(1500)
  23  |     await page.screenshot({ path: '/tmp/docx_proof/01-dashboard.png', fullPage: false })
  24  |   })
  25  | 
  26  |   test('考场信息', async ({ page }) => {
  27  |     await loginAsGroup(page)
  28  |     await page.goto(`${BASE}/#/cert/exam-rooms`)
  29  |     await page.waitForTimeout(2000)
  30  |     await page.screenshot({ path: '/tmp/docx_proof/02-exam-rooms.png', fullPage: false })
  31  |   })
  32  | 
  33  |   test('报名机构', async ({ page }) => {
  34  |     await loginAsGroup(page)
  35  |     await page.goto(`${BASE}/#/cert/registration-orgs`)
  36  |     await page.waitForTimeout(2000)
  37  |     await page.screenshot({ path: '/tmp/docx_proof/03-registration-orgs.png', fullPage: false })
  38  |   })
  39  | 
  40  |   test('考务人员', async ({ page }) => {
  41  |     await loginAsGroup(page)
  42  |     await page.goto(`${BASE}/#/cert/exam-staff`)
  43  |     await page.waitForTimeout(2000)
  44  |     await page.screenshot({ path: '/tmp/docx_proof/04-exam-staff.png', fullPage: false })
  45  |   })
  46  | 
  47  |   test('认定计划', async ({ page }) => {
  48  |     await loginAsGroup(page)
  49  |     await page.goto(`${BASE}/#/cert/plans`)
  50  |     await page.waitForTimeout(2000)
  51  |     await page.screenshot({ path: '/tmp/docx_proof/05-plans.png', fullPage: false })
  52  |   })
  53  | 
  54  |   test('考试报名', async ({ page }) => {
  55  |     await loginAsGroup(page)
  56  |     await page.goto(`${BASE}/#/cert/exam-registration`)
  57  |     await page.waitForTimeout(2000)
  58  |     await page.screenshot({ path: '/tmp/docx_proof/06-exam-registration.png', fullPage: false })
  59  |   })
  60  | 
  61  |   test('考场编排', async ({ page }) => {
  62  |     await loginAsGroup(page)
  63  |     await page.goto(`${BASE}/#/cert/exam-arrangement`)
  64  |     await page.waitForTimeout(2000)
  65  |     await page.screenshot({ path: '/tmp/docx_proof/07-exam-arrangement.png', fullPage: false })
  66  |   })
  67  | 
  68  |   test('试卷需求', async ({ page }) => {
  69  |     await loginAsGroup(page)
  70  |     await page.goto(`${BASE}/#/cert/paper-demand`)
  71  |     await page.waitForTimeout(2000)
  72  |     await page.screenshot({ path: '/tmp/docx_proof/08-paper-demand.png', fullPage: false })
  73  |   })
  74  | 
  75  |   test('成绩公示', async ({ page }) => {
  76  |     await loginAsGroup(page)
  77  |     await page.goto(`${BASE}/#/cert/score-publicity-manage`)
  78  |     await page.waitForTimeout(2000)
  79  |     await page.screenshot({ path: '/tmp/docx_proof/09-score-publicity.png', fullPage: false })
  80  |   })
  81  | 
  82  |   test('证书管理', async ({ page }) => {
  83  |     await loginAsGroup(page)
  84  |     await page.goto(`${BASE}/#/cert/certificates-group`)
  85  |     await page.waitForTimeout(2000)
  86  |     await page.screenshot({ path: '/tmp/docx_proof/10-certificates-group.png', fullPage: false })
  87  |   })
  88  | 
  89  |   test('证书打印', async ({ page }) => {
  90  |     await loginAsGroup(page)
  91  |     await page.goto(`${BASE}/#/cert/certificates-print`)
  92  |     await page.waitForTimeout(2000)
  93  |     await page.screenshot({ path: '/tmp/docx_proof/11-certificates-print.png', fullPage: false })
  94  |   })
  95  | 
  96  |   test('溯源中心', async ({ page }) => {
  97  |     await loginAsGroup(page)
  98  |     await page.goto(`${BASE}/#/traceability`)
  99  |     await page.waitForTimeout(2000)
  100 |     await page.screenshot({ path: '/tmp/docx_proof/12-traceability.png', fullPage: false })
  101 |   })
  102 | 
  103 |   test('分支机构工作台', async ({ page }) => {
  104 |     await page.goto(`${BASE}/login`)
  105 |     await page.waitForSelector('form', { timeout: 10000 })
  106 |     await page.locator('input[type="text"][placeholder^="请输入账"]').fill('Csyxgs001')
  107 |     await page.locator('input[type="password"]').fill('cs@13311331')
  108 |     const captcha = await page.locator('text=/[0-9]{4}/').first().textContent() || '4567'
  109 |     await page.locator('input[placeholder="请输入验证码"]').fill(captcha.trim())
  110 |     await page.locator('button[type="submit"]').click()
  111 |     await page.waitForSelector('text=/选择登录身份|进入工作台/', { timeout: 10000 })
  112 |     await page.locator('text=机构管理员').first().click()
  113 |     await page.locator('button:has-text("进入工作台")').click()
  114 |     await page.waitForURL(/branch/, { timeout: 15000 })
  115 |     await page.waitForTimeout(2000)
  116 |     await page.screenshot({ path: '/tmp/docx_proof/13-branch-dashboard.png', fullPage: false })
```