import { useMemo, useState } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Eye,
  Network,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface OrgUnit {
  id: string
  name: string
  type: string
  creditCode: string
  area: string
  status: '正常' | '待完善' | '停用'
  contact: string
  phone: string
  mobile: string
  address: string
  contactTitle: string
  email: string
  fax: string
  postcode: string
  loginName: string
  registerMobile: string
  scopes: string[]
  users: OrgUser[]
}

interface OrgUser {
  id: string
  loginName: string
  phone: string
}

const treeNodes = [
  {
    id: 'root',
    name: '中国工业集团有限公司',
    children: [
      { id: 'national', name: '全国性用人单位分支机构' },
      { id: 'province', name: '省级备案分支机构' },
      { id: 'test', name: '测试机构' },
    ],
  },
]

const orgUnits: OrgUnit[] = [
  {
    id: '1',
    name: '中广测试有限公司',
    type: '全国性用人单位分支机构',
    creditCode: '123456789QWE123',
    area: '广东深圳',
    status: '正常',
    contact: '王老师',
    phone: '13800138001',
    mobile: '13800138001',
    address: '广东省深圳市大亚湾核电基地',
    contactTitle: '培训主管',
    email: 'wang@example.com',
    fax: '0755-10000001',
    postcode: '518000',
    loginName: 'zgcs001',
    registerMobile: '13800138001',
    scopes: ['电工（三级/四级）', '核电运行值班员（四级）'],
    users: [{ id: 'u1', loginName: 'zgcs001_lxr', phone: '13800138001' }],
  },
  {
    id: '2',
    name: '福建宁A电有限公司',
    type: '全国性用人单位分支机构',
    creditCode: '91350900786900747Q',
    area: '福建宁德',
    status: '正常',
    contact: '李老师',
    phone: '13900139001',
    mobile: '13900139001',
    address: '福建省宁德市核电基地',
    contactTitle: '人资专员',
    email: 'li@example.com',
    fax: '0593-10000001',
    postcode: '352000',
    loginName: 'fjnda001',
    registerMobile: '13900139001',
    scopes: ['仪器仪表维修工（三级）'],
    users: [{ id: 'u2', loginName: 'fjnda001_lxr', phone: '13900139001' }],
  },
  {
    id: '3',
    name: '防城港核电',
    type: '全国性用人单位分支机构',
    creditCode: '91450600677748862L',
    area: '广西防城港',
    status: '待完善',
    contact: '陈老师',
    phone: '13700137001',
    mobile: '13700137001',
    address: '广西防城港市港口区',
    contactTitle: '技能认定负责人',
    email: 'chen@example.com',
    fax: '0770-10000001',
    postcode: '538000',
    loginName: 'fcg001',
    registerMobile: '13700137001',
    scopes: ['起重装卸机械操作工（四级）'],
    users: [],
  },
  {
    id: '4',
    name: '宁德',
    type: '省级备案分支机构',
    creditCode: '91350900ND000001',
    area: '福建宁德',
    status: '正常',
    contact: '林老师',
    phone: '13600136001',
    mobile: '13600136001',
    address: '福建省宁德市蕉城区',
    contactTitle: '联系人',
    email: 'lin@example.com',
    fax: '0593-10000002',
    postcode: '352100',
    loginName: 'nd001',
    registerMobile: '13600136001',
    scopes: ['焊工（四级）'],
    users: [],
  },
  {
    id: '5',
    name: '002',
    type: '测试机构',
    creditCode: 'TEST00000000002',
    area: '广东深圳',
    status: '停用',
    contact: '测试员',
    phone: '13500135001',
    mobile: '13500135001',
    address: '广东深圳',
    contactTitle: '测试',
    email: 'test@example.com',
    fax: '0755-10000002',
    postcode: '518000',
    loginName: 'test002',
    registerMobile: '13500135001',
    scopes: [],
    users: [],
  },
]

export default function Organizations() {
  const [units, setUnits] = useState<OrgUnit[]>(orgUnits)
  const [expanded, setExpanded] = useState(true)
  const [selectedTree, setSelectedTree] = useState('root')
  const [searchType, setSearchType] = useState('评价机构')
  const [query, setQuery] = useState('')
  const [viewItem, setViewItem] = useState<OrgUnit | null>(null)
  const [userItem, setUserItem] = useState<OrgUnit | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'detail' | 'edit'>('detail')

  const filtered = useMemo(() => {
    return units.filter(item => {
      const treeMatch =
        selectedTree === 'root' ||
        (selectedTree === 'national' && item.type === '全国性用人单位分支机构') ||
        (selectedTree === 'province' && item.type === '省级备案分支机构') ||
        (selectedTree === 'test' && item.type === '测试机构')
      const source = searchType === '评价机构' ? item.name : item.creditCode
      return treeMatch && (!query || source.includes(query))
    })
  }, [query, searchType, selectedTree, units])

  const handleAddOrg = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const creditCode = String(fd.get('creditCode') || '').trim()
    if (!name || !creditCode) {
      toast.error('请填写机构名称和社会统一信用代码')
      return
    }
    const newOrg: OrgUnit = {
      id: String(Date.now()),
      type: String(fd.get('type') || '全国性用人单位分支机构'),
      name,
      creditCode,
      area: String(fd.get('address') || '').slice(0, 12) || '未填写',
      status: '待完善',
      contact: String(fd.get('contact') || ''),
      phone: String(fd.get('phone') || ''),
      mobile: String(fd.get('mobile') || ''),
      address: String(fd.get('address') || ''),
      contactTitle: String(fd.get('contactTitle') || ''),
      email: String(fd.get('email') || ''),
      fax: String(fd.get('fax') || ''),
      postcode: String(fd.get('postcode') || ''),
      loginName: String(fd.get('loginName') || ''),
      registerMobile: String(fd.get('registerMobile') || ''),
      scopes: [],
      users: [],
    }
    setUnits(prev => [newOrg, ...prev])
    setAddOpen(false)
    toast.success(`已新增认定机构：${name}`)
    event.currentTarget.reset()
  }

  const handleUpdateOrg = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!viewItem) return
    const fd = new FormData(event.currentTarget)
    const updated: OrgUnit = {
      ...viewItem,
      type: String(fd.get('type') || viewItem.type),
      name: String(fd.get('name') || viewItem.name),
      creditCode: String(fd.get('creditCode') || viewItem.creditCode),
      area: String(fd.get('address') || viewItem.area).slice(0, 12) || viewItem.area,
      contact: String(fd.get('contact') || ''),
      phone: String(fd.get('phone') || ''),
      mobile: String(fd.get('mobile') || ''),
      address: String(fd.get('address') || ''),
      contactTitle: String(fd.get('contactTitle') || ''),
      email: String(fd.get('email') || ''),
      fax: String(fd.get('fax') || ''),
      postcode: String(fd.get('postcode') || ''),
      loginName: String(fd.get('loginName') || ''),
      registerMobile: String(fd.get('registerMobile') || ''),
    }
    setUnits(prev => prev.map(item => item.id === updated.id ? updated : item))
    setViewItem(updated)
    setViewMode('detail')
    toast.success('认定机构信息已保存')
  }

  const handleToggleOrgStatus = (id: string) => {
    setUnits(prev => prev.map(item => item.id === id ? { ...item, status: item.status === '停用' ? '正常' : '停用' } : item))
    setViewItem(prev => prev && prev.id === id ? { ...prev, status: prev.status === '停用' ? '正常' : '停用' } : prev)
    toast.success('机构状态已更新')
  }

  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userItem) return
    const fd = new FormData(event.currentTarget)
    const loginName = String(fd.get('loginName') || '').trim()
    const password = String(fd.get('password') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    if (!loginName || !password || !phone) {
      toast.error('请填写登录名、密码和联系电话')
      return
    }
    const nextUser: OrgUser = { id: String(Date.now()), loginName, phone }
    setUnits(prev => prev.map(item => item.id === userItem.id ? { ...item, users: [...item.users, nextUser] } : item))
    setViewItem(prev => prev && prev.id === userItem.id ? { ...prev, users: [...prev.users, nextUser] } : prev)
    setUserItem(null)
    toast.success(`已为 ${userItem.name} 新增用户：${loginName}`)
  }

  const statusClass: Record<OrgUnit['status'], string> = {
    正常: 'bg-green-50 text-green-700',
    待完善: 'bg-amber-50 text-amber-700',
    停用: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-[#1A56DB]" />
        <h1 className="text-xl font-bold text-gray-900">认定机构</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
            <Network className="h-4 w-4 text-[#1A56DB]" />
            机构目录
          </div>
          <div className="p-3">
            {treeNodes.map(root => (
              <div key={root.id}>
                <button
                  onClick={() => {
                    setExpanded(!expanded)
                    setSelectedTree(root.id)
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                    selectedTree === root.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium">{root.name}</span>
                </button>
                {expanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-gray-100 pl-2">
                    {root.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedTree(child.id)}
                        className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                          selectedTree === child.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <select
                value={searchType}
                onChange={event => setSearchType(event.target.value)}
                className="h-9 rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
              >
                <option>评价机构</option>
                <option>统一社会信用代码</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
                  placeholder="输入查询内容"
                />
              </div>
              <Button className="h-9 bg-[#1A56DB] text-sm hover:bg-[#1748B5]">搜索</Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">共 {filtered.length} 条数据</div>
              <Button className="h-9 bg-[#1A56DB] text-sm hover:bg-[#1748B5]" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />添加认定机构
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="w-16 px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">机构类型</th>
                  <th className="px-4 py-3 text-left font-medium">统一社会信用代码</th>
                  <th className="px-4 py-3 text-left font-medium">机构名称</th>
                  <th className="px-4 py-3 text-left font-medium">所属地区</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.creditCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.area}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs ${statusClass[item.status]}`}>{item.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setViewItem(item); setViewMode('detail') }} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                          <Eye className="h-3.5 w-3.5" />查看
                        </button>
                        <button onClick={() => setUserItem(item)} className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline">
                          <UserPlus className="h-3.5 w-3.5" />添加
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>查看认定机构信息</DialogTitle></DialogHeader>
          {viewItem && (
            viewMode === 'detail' ? (
              <div className="space-y-4 text-sm">
                <div className="rounded-lg bg-[#F9FAFB] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{viewItem.name}</div>
                      <div className="mt-1 font-mono text-xs text-gray-500">{viewItem.creditCode}</div>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-xs ${statusClass[viewItem.status]}`}>{viewItem.status}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">单位信息</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Info label="机构类型" value={viewItem.type} />
                    <Info label="机构名称" value={viewItem.name} />
                    <Info label="社会统一信用代码" value={viewItem.creditCode} />
                    <Info label="联 系 人" value={viewItem.contact} />
                    <Info label="联系电话" value={viewItem.phone} />
                    <Info label="联系人手机" value={viewItem.mobile} />
                    <Info label="联系地址" value={viewItem.address} />
                    <Info label="联系人职务" value={viewItem.contactTitle} />
                    <Info label="联系人邮箱" value={viewItem.email} />
                    <Info label="传　　真" value={viewItem.fax} />
                    <Info label="邮　　编" value={viewItem.postcode} />
                  </div>
                </div>
                <div>
                  <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">注册信息</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Info label="登 录 名" value={viewItem.loginName} />
                    <Info label="手 机 号" value={viewItem.registerMobile} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <UserPlus className="h-4 w-4 text-[#1A56DB]" />
                    已添加用户
                  </div>
                  <div className="overflow-hidden rounded-md border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F9FAFB] text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">登录名</th>
                          <th className="px-3 py-2 text-left font-medium">联系电话</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewItem.users.length > 0 ? viewItem.users.map(user => (
                          <tr key={user.id}>
                            <td className="px-3 py-2 font-medium text-gray-900">{user.loginName}</td>
                            <td className="px-3 py-2 text-gray-600">{user.phone}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={2} className="px-3 py-3 text-center text-xs text-gray-500">暂无用户</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <ShieldCheck className="h-4 w-4 text-[#1A56DB]" />
                    已备案评价范围
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.scopes.length > 0
                      ? viewItem.scopes.map(scope => <span key={scope} className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600">{scope}</span>)
                      : <span className="text-xs text-gray-500">暂无评价范围</span>}
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <Button variant="outline" onClick={() => toast.success('密码已重置为登录名后六位')}>重置密码</Button>
                  <Button variant="outline" onClick={() => handleToggleOrgStatus(viewItem.id)}>{viewItem.status === '停用' ? '启用' : '停用'}</Button>
                  <Button variant="outline" onClick={() => setViewMode('edit')}>编辑</Button>
                  <Button className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => setViewItem(null)}>返回</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateOrg} className="space-y-5">
                <div>
                  <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">单位信息</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="机构类型" name="type" type="select" required defaultValue={viewItem.type} options={['全国性用人单位分支机构', '省级备案分支机构', '测试机构']} />
                    <Field label="机构名称" name="name" required defaultValue={viewItem.name} />
                    <Field label="社会统一信用代码" name="creditCode" required defaultValue={viewItem.creditCode} />
                    <Field label="联 系 人" name="contact" defaultValue={viewItem.contact} />
                    <Field label="联系电话" name="phone" defaultValue={viewItem.phone} />
                    <Field label="联系人手机" name="mobile" defaultValue={viewItem.mobile} />
                    <Field label="联系地址" name="address" defaultValue={viewItem.address} />
                    <Field label="联系人职务" name="contactTitle" defaultValue={viewItem.contactTitle} />
                    <Field label="联系人邮箱" name="email" defaultValue={viewItem.email} />
                    <Field label="传　　真" name="fax" defaultValue={viewItem.fax} />
                    <Field label="邮　　编" name="postcode" defaultValue={viewItem.postcode} />
                  </div>
                </div>
                <div>
                  <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">注册信息</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="登 录 名" name="loginName" required defaultValue={viewItem.loginName} />
                    <Field label="手 机 号" name="registerMobile" required defaultValue={viewItem.registerMobile} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setViewMode('detail')}>取消</Button>
                  <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
                </div>
              </form>
            )
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>新增认定机构信息</DialogTitle></DialogHeader>
          <form onSubmit={handleAddOrg} className="space-y-5">
            <div>
              <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">单位信息</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="机构类型" name="type" type="select" required options={['全国性用人单位分支机构', '省级备案分支机构', '测试机构']} />
                <Field label="机构名称" name="name" required placeholder="请输入机构名称" />
                <Field label="社会统一信用代码" name="creditCode" required placeholder="请输入统一社会信用代码" />
                <Field label="联 系 人" name="contact" placeholder="请输入联系人" />
                <Field label="联系电话" name="phone" placeholder="请输入联系电话" />
                <Field label="联系人手机" name="mobile" placeholder="请输入联系人手机" />
                <Field label="联系地址" name="address" placeholder="请输入联系地址" />
                <Field label="联系人职务" name="contactTitle" placeholder="请输入联系人职务" />
                <Field label="联系人邮箱" name="email" placeholder="请输入联系人邮箱" />
                <Field label="传　　真" name="fax" placeholder="请输入传真" />
                <Field label="邮　　编" name="postcode" placeholder="请输入邮编" />
              </div>
            </div>

            <div>
              <div className="mb-3 border-l-4 border-[#1A56DB] pl-2 text-sm font-semibold text-gray-900">注册信息</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="登 录 名" name="loginName" required placeholder="请输入登录名" />
                <Field label="密　　码" name="password" type="password" required placeholder="请输入密码" />
                <Field label="手 机 号" name="registerMobile" required placeholder="请输入注册手机号" />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userItem} onOpenChange={() => setUserItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>新增用户</DialogTitle></DialogHeader>
          {userItem && (
            <form onSubmit={handleAddUser} className="space-y-3 text-sm">
              <Info label="认定机构" value={userItem.name} />
              <Field label="登 录 名" name="loginName" required placeholder="请输入登录名" />
              <Field label="密　　码" name="password" type="password" required placeholder="请输入密码" />
              <Field label="联系电话" name="phone" required placeholder="请输入联系电话" />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setUserItem(null)}>返回</Button>
                <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900">{value || '-'}</div>
    </div>
  )
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = 'text',
  options = [],
  defaultValue,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  type?: 'text' | 'password' | 'select'
  options?: string[]
  defaultValue?: string
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-gray-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {type === 'select' ? (
        <select name={name} required={required} defaultValue={defaultValue} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none">
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
        />
      )}
    </label>
  )
}
