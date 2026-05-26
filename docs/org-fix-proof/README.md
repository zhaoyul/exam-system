# 认定机构账号与评价范围修复证明

生成时间：2026/5/26 15:11:43

公网环境：http://106.12.6.24:29527

## 证明账号

- 机构：修复证明机构071139
- 登录名：fixorg071139
- 密码：Fix@071139
- 登录接口：`POST /api/auth/login` 返回 200，角色为 `branch_admin`

## 修复点

1. 管理员新增认定机构时，后端同步创建或更新该机构的机构管理员账号。
2. 新建账号使用新增表单中填写的密码；历史已存在机构若只有登录名无账号，读取机构列表/详情时自动补账号，默认密码为登录名后六位。
3. 评价范围机构目录改为读取认定机构列表，新分支机构会出现在目录中，并可基于集团评价范围批量授权。

## 截图

1. 新增认定机构后列表出现新分支机构: [01-organization-list-new-branch.png](./01-organization-list-new-branch.png)
2. 机构详情显示注册登录名和已添加用户: [02-organization-detail-user-created.png](./02-organization-detail-user-created.png)
3. 评价范围机构目录出现新分支机构，可进入授权职业范围: [03-evaluation-scope-shows-branch.png](./03-evaluation-scope-shows-branch.png)
4. 新创建账号通过真实登录流程进入分支机构工作台: [04-new-account-login-success.png](./04-new-account-login-success.png)
