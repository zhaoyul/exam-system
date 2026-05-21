# exam-system 后台交接文档

> 生成日期: 2026-05-21
> 状态: P0 API 完成，待前端联调测试

---

## 一、项目概览

| 项 | 值 |
|-----|-----|
| 前端 | React + TypeScript + Vite (`app/`) |
| 后端 | Clojure + Kit + Integrant + Reitit (`backend/`) |
| 数据库 | SQLite (开发) / 达梦 DM (生产) |
| 端口 | 8080 |
| Swagger | http://127.0.0.1:8080/api/docs/ |
| OpenAPI | http://127.0.0.1:8080/api/swagger.json |
| Git Remote | `github.com:zhaoyul/exam-system` |

---

## 二、启动 & 停止

### 启动

```bash
cd /home/kevin/gt/exam/mayor/rig/backend

# 删除旧数据库（首次启动或需要重置数据时）
rm -f data/exam-system-dev.db

# 前台启动（调试用）
clojure -M:dev -m zhaoyul.exam-system-backend.core

# 后台守护启动（推荐）
systemd-run --user --unit=exam-backend --same-dir --collect \
  clojure -M:dev -m zhaoyul.exam-system-backend.core
```

### 停止

```bash
systemctl --user stop exam-backend
```

### 状态检查

```bash
systemctl --user status exam-backend
curl http://127.0.0.1:8080/api/health
```

---

## 三、测试账号

| 用户名 | 密码 | 角色 | org_id | 说明 |
|--------|------|------|--------|------|
| `cgnzx001` | `cs@13311331` | group_admin | org-cgn | 中广核集团管理员，看全部数据 |
| `Csyxgs001` | `cs@13311331` | branch_admin | org-csyxgs | 测试有限公司，只看自己机构数据 |
| `Csyxgs001cs` | `cs@13311331` | branch_admin | org-csyxgs | 同上（兼容老账号） |

### 登录测试

```bash
curl -X POST http://127.0.0.1:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cgnzx001","password":"cs@13311331"}'
```

返回 `{"token":"...","user":{...}}`

---

## 四、API 接口清单

### 路由模块（18 个一级模块）

| 模块 | 路径前缀 | 说明 |
|------|---------|------|
| 认证 | `/api/auth/*` | login, me |
| 工作台 | `/api/dashboard/*` | summary, workbench-cards |
| 等级认定 | `/api/certification/*` | 计划/考场/报名/编排/证书/批复/违规等 |
| 机构端 | `/api/certification/execution/*` | exam-rooms, registration-orgs, exam-staff, supervisors, marking-leads |
| 题库 | `/api/question/*`, `/api/question-bank/*` | 理论/技能科目、试题、组卷规则、卷库 |
| 机构备案 | `/api/filing/*` | group, province, branch |
| 评价专家 | `/api/supervision/*`, `/api/experts/*` | 专家信息/聘用/培训/派遣/表单/统计 |
| 溯源中心 | `/api/traceability/*` | cases, alerts |
| 考生管理 | `/api/candidates/*` | manage |
| 个人中心 | `/api/personal/*` | register, score, cert, ticket |
| 文件传输 | `/api/file/*` | distribute, receive, viewer, private, settings |
| 系统管理 | `/api/system/*` | users, personnel, filing-group, announcements, logs, config |
| 职业标准 | `/api/standard/*` | evaluation-scope, settings, experts, templates, plans 等 |
| 财务 | `/api/finance/*` | workbench, charge, list, ledger, standard |
| 成绩 | `/api/score/*` | entry, review, publicity, correction |
| 证书 | `/api/certificate/*` | issue, view, reissue |
| 考试 | `/api/exam/*` | manage, online, seats |
| 通用 | `/api/resources/:resource` | 通用 CRUD 兜底 |

### 接口契约

所有列表接口返回：
```json
{"items": [...], "total": 0, "limit": 50, "offset": 0}
```

CRUD 模式：`GET/POST /api/{module}` + `GET/PUT/DELETE /api/{module}/{id}`

业务动作：`POST /api/actions/{resource}/{action}` 和 `POST /api/actions/{resource}/{id}/{action}`

---

## 五、数据库

### 表结构

| 迁移 | 表数 | 说明 |
|------|------|------|
| `001-init.up.sql` | 4 | app_user, organization, resource_item, audit_log |
| `002-domain-core.up.sql` | 41 | sys_*, cgn_recog_*, cgn_qb_*, cgn_qa_*, cgn_filing_*, 等 |

### 数据存储

当前 P0 接口全部通过 `resource_item` 表存储（JSON payload 模式），种子数据在 `domain/seed.clj` 中定义。

Domain 表（002 迁移的 41 张表）已建但种子数据未写入——这是后续工作。

### 迁移

SQL 语句用 `--;;` 分隔。SQLite 和达梦各有独立迁移文件：
- `backend/resources/migrations/sqlite/`
- `backend/resources/migrations/dm/`

---

## 六、机构隔离

- 所有业务数据有 `org_id` 列
- JWT token 包含 `org_id` claim
- 集团管理员 (group_admin)：不强制过滤，看全部
- 分支管理员 (branch_admin)：自动过滤只看自己 org_id 的数据
- 创建资源时自动绑定当前用户 org_id
- 前端可通过 `?org-id=xxx` 参数显式指定

### 验证

```bash
# 集团管理员看全部
curl http://127.0.0.1:8080/api/certification/plans \
  -H "Authorization: Bearer $GROUP_TOKEN"
# → total: 2

# 分支管理员只看自己机构
curl http://127.0.0.1:8080/api/certification/plans \
  -H "Authorization: Bearer $BRANCH_TOKEN"  
# → total: 1
```

---

## 七、代码结构

```
backend/
├── src/clj/zhaoyul/exam_system_backend/
│   ├── core.clj              # 入口，Integrant 系统启动
│   ├── config.clj            # 配置加载
│   ├── domain/
│   │   ├── auth.clj          # 认证逻辑 (JWT, 密码哈希)
│   │   ├── resources.clj     # 通用资源 CRUD (resource_item 表)
│   │   └── seed.clj          # 种子数据
│   ├── infra/
│   │   ├── datasource.clj    # HikariCP 连接池
│   │   ├── db.clj            # next.jdbc 封装
│   │   ├── dialect.clj       # 数据库方言
│   │   └── migrations.clj    # 迁移执行
│   └── web/
│       ├── handler.clj        # Ring handler
│       ├── middleware_auth.clj # JWT 认证中间件
│       ├── response.clj       # HTTP 响应工具
│       ├── controllers/
│       │   ├── auth.clj       # 登录/当前用户
│       │   ├── health.clj     # 健康检查
│       │   ├── resources.clj  # 通用资源控制器 (含 org 隔离)
│       │   ├── organizations.clj # 认定机构
│       │   ├── catalog.clj    # 菜单/字典
│       │   └── supervision.clj # 督导(脚手架)
│       └── routes/
│           └── api.clj        # 全部路由定义
├── resources/
│   ├── system.edn            # Integrant 系统配置
│   └── migrations/           # SQL 迁移
└── test/                     # 测试
```

---

## 八、前端 API 调用方式

前端通过 `/app/src/config/pageApiEndpoints.ts` 映射页面路径到后端 API：
```typescript
'/cert/plans': '/certification/plans',
```

请求封装在 `/app/src/lib/api.ts`，通过 `VITE_API_BASE_URL=/api` 代理。

### 前端启动

```bash
cd /home/kevin/gt/exam/mayor/rig/app
npm run dev -- --host 0.0.0.0
```

---

## 九、已知问题 & 后续工作

### 高优先级

| 问题 | 说明 |
|------|------|
| Domain 表 seed | 41 张业务表已建但未写入种子数据，当前靠 resource_item JSON 承载 |
| 前端联调 | 未用 React 前端实际验证各页面数据显示 |
| 测试 | 未跑 `clojure -M:test` (后台) / `npm test` (前端) |

### 中优先级

| 问题 | 说明 |
|------|------|
| 达梦数据库 | 迁移文件已有，但未在达梦环境实测 |
| 性能 | resource_item JSON 查询在大数据量下有性能风险 |
| Swagger 参数 | POST/PUT 缺少 JSON body 示例 |

### 低优先级

| 问题 | 说明 |
|------|------|
| ns 前缀 | `zhaoyul.exam-system-backend` → 建议改为 `com.cgn.exam-system.backend` |
| 自定义捏拢材料 | demo rig 的 Pinching4 MOOSE 材料待实现 |

---

## 十、Git 提交历史

```
db76670 fix: add org_id to JWT token for org isolation
d961595 fix: rewrite list-items with string key params for org-id filter
d1c9f01 fix: org_id filter + auth-org-id fix
742cbd0 feat: org_id isolation in resource controller
16fac50 fix: seed data column names + add missing routes
65b6c5c Align branch admin pages with reference system
d38791d scaffold: supervision controller skeleton
...
```

---

## 十一、验收清单

- [ ] `GET /api/health` → 200
- [ ] `POST /api/auth/login` 三个账号都能登录
- [ ] Swagger UI 可打开 (`/api/docs/`)
- [ ] `GET /api/dashboard/summary` 返回数据
- [ ] 集团管理员看全部计划，分支管理员只看自己机构
- [ ] `GET /api/certification/plans` → 200 且有数据
- [ ] `GET /api/question/subjects` → 200
- [ ] `GET /api/filing/group` → 200
- [ ] `GET /api/supervision/expert-info` → 200
- [ ] `GET /api/traceability/cases` → 200
- [ ] `GET /api/candidates/manage` → 200
- [ ] `POST /api/certification/plans` 创建 → 刷新后仍存在
- [ ] 前端 `npm run dev` 启动后页面不空白，数据来自后端
