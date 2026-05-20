import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Users, Plus, Search, Trash2, Edit3, Eye, Download, Send, ShieldCheck, Upload, KeyRound
} from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

interface ExamStaff {
  id: number
  loginName: string
  password: string
  name: string
  gender: string
  phone: string
  idCard: string
  role: string
  site: string
  org: string
  assignStatus: '待安排' | '已安排' | '已确认'
  session: string
  certNo: string
  status: 'active' | 'inactive'
  createdAt: string
}

const mockStaff: ExamStaff[] = [
  { id: 1, loginName: '440301198001011234', password: '011234', name: '张考评', gender: '男', phone: '13800138001', idCard: '440301198001011234', role: '考评组长', site: '职业技能培训中心', org: '大亚湾核电', assignStatus: '已确认', session: '2022-03-31 08:00~10:00', certNo: 'KW-2026-001', status: 'active', createdAt: '2025-06-01' },
  { id: 2, loginName: '440301198502063456', password: '063456', name: '李考评', gender: '女', phone: '13800138002', idCard: '440301198502063456', role: '考评员', site: '职业技能培训中心', org: '大亚湾核电', assignStatus: '已安排', session: '2022-03-31 09:00~11:00', certNo: 'KW-2026-002', status: 'active', createdAt: '2025-06-01' },
  { id: 3, loginName: '440301199003127890', password: '127890', name: '王考评', gender: '男', phone: '13800138003', idCard: '440301199003127890', role: '考评员', site: '实操训练基地', org: '阳江核电', assignStatus: '待安排', session: '-', certNo: 'KW-2026-003', status: 'active', createdAt: '2025-08-15' },
  { id: 4, loginName: '440301198805064567', password: '064567', name: '赵考评', gender: '女', phone: '13800138004', idCard: '440301198805064567', role: '监考员', site: '职业技能培训中心', org: '台山核电', assignStatus: '已安排', session: '2022-03-31 08:00~10:00', certNo: 'KW-2026-004', status: 'inactive', createdAt: '2025-09-10' },
  { id: 5, loginName: '440301199207088901', password: '088901', name: '孙考评', gender: '男', phone: '13800138005', idCard: '440301199207088901', role: '质量督导员', site: '实操训练基地', org: '防城港核电', assignStatus: '待安排', session: '-', certNo: 'KW-2026-005', status: 'active', createdAt: '2025-10-20' },
]

const roleOptions = ['考评组长', '考评员', '监考员', '质量督导员', '考务管理员']

export default function ExamStaffManage() {
  const [staff, setStaff] = useBackendListState<ExamStaff>(mockStaff)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('全部')
  const [assignFilter, setAssignFilter] = useState('全部')
  const [addOpen, setAddOpen] = useState(false)
  const [editStaff, setEditStaff] = useState<ExamStaff | null>(null)
  const [detailStaff, setDetailStaff] = useState<ExamStaff | null>(null)

  const filtered = staff.filter(s =>
    (!search || s.name.includes(search) || s.loginName.includes(search) || s.phone.includes(search) || s.certNo.includes(search) || s.idCard.includes(search)) &&
    (roleFilter === '全部' || s.role === roleFilter) &&
    (assignFilter === '全部' || s.assignStatus === assignFilter)
  )

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newStaff: ExamStaff = {
      id: Date.now(),
      loginName: (fd.get('loginName') as string) || (fd.get('idCard') as string),
      password: String(fd.get('idCard') || '').slice(-6),
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      phone: fd.get('phone') as string,
      idCard: fd.get('idCard') as string,
      role: fd.get('role') as string,
      site: fd.get('site') as string,
      org: fd.get('org') as string,
      assignStatus: '待安排',
      session: '-',
      certNo: `KW-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setStaff(prev => [...prev, newStaff])
    setAddOpen(false)
    toast.success(`新增考务人员：${newStaff.name}`)
    form.reset()
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editStaff) return
    const form = e.currentTarget
    const fd = new FormData(form)
    setStaff(prev => prev.map(s => s.id === editStaff.id ? {
      ...s,
      loginName: fd.get('loginName') as string,
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      phone: fd.get('phone') as string,
      idCard: fd.get('idCard') as string,
      role: fd.get('role') as string,
      site: fd.get('site') as string,
      org: fd.get('org') as string,
    } : s))
    setEditStaff(null)
    toast.success('考务人员信息已更新')
  }

  const handleDelete = (id: number) => {
    setStaff(prev => prev.filter(s => s.id !== id))
    toast.success('已删除')
  }

  const handleToggleStatus = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const } : s))
    toast.success('状态已更新')
  }

  const handleDispatch = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, assignStatus: '已安排' as const, session: '2022-03-31 08:00~10:00' } : s))
    toast.success('已派遣到当前认定计划')
  }

  const handleConfirm = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, assignStatus: '已确认' as const } : s))
    toast.success('人员已确认')
  }

  const handleResetPassword = (item: ExamStaff) => {
    const password = item.idCard.slice(-6) || '123456'
    setStaff(prev => prev.map(s => s.id === item.id ? { ...s, password } : s))
    toast.success(`密码已重置为 ${password}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考务人员</h1>
          <p className="text-sm text-gray-500 mt-1">管理考务人员信息，包括考评组长、考评员、监考员等</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('考务人员导入模板已下载')}><Download className="w-4 h-4 mr-2" />下载模板</Button>
          <Button variant="outline" onClick={() => toast.success('批量导入考务人员完成')}><Upload className="w-4 h-4 mr-2" />批量导入</Button>
          <Button variant="outline" onClick={() => toast.success('考务人员清单已导出')}><Download className="w-4 h-4 mr-2" />导出</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> 新增人员</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">人员总数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{staff.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">在职</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{staff.filter(s => s.status === 'active').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">考评组长</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{staff.filter(s => s.role === '考评组长').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">考评员</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{staff.filter(s => s.role === '考评员').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-600">监考员</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{staff.filter(s => s.role === '监考员').length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
              <option>全部</option>
              {roleOptions.map(role => <option key={role}>{role}</option>)}
            </select>
            <select value={assignFilter} onChange={e => setAssignFilter(e.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
              <option>全部</option>
              <option>待安排</option>
              <option>已安排</option>
              <option>已确认</option>
            </select>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索姓名、电话、证书编号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-72" />
            </div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">姓名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">性别</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">登录名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">证件号码</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">角色</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考点</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">场次</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">安排状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">单位</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{s.gender}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.loginName}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{s.phone}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.idCard}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">{s.role}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.site}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.session}</td>
                <td className="px-4 py-3"><Badge className={`text-[10px] ${s.assignStatus === '已确认' ? 'bg-green-50 text-green-700' : s.assignStatus === '已安排' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{s.assignStatus}</Badge></td>
                <td className="px-4 py-3 text-xs text-gray-500">{s.org}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleStatus(s.id)}>
                    <Badge className={`text-[10px] cursor-pointer ${s.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {s.status === 'active' ? '在职' : '停用'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditStaff(s)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    {s.assignStatus === '待安排' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleDispatch(s.id)}><Send className="w-3 h-3 mr-1" />派遣</Button>}
                    {s.assignStatus === '已安排' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handleConfirm(s.id)}><ShieldCheck className="w-3 h-3 mr-1" />确认</Button>}
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" onClick={() => handleResetPassword(s)}><KeyRound className="w-3 h-3 mr-1" />重置密码</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => setDetailStaff(s)}>
                      <Eye className="w-3 h-3 mr-1" /> 查看
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新增考务人员</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>姓名 *</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>登录名</Label><Input name="loginName" placeholder="默认使用身份证号" /></div>
              <div className="space-y-1"><Label>性别 *</Label>
                <Select name="gender" defaultValue="男">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" required /></div>
              <div className="space-y-1"><Label>身份证号 *</Label><Input name="idCard" required /></div>
              <div className="space-y-1"><Label>角色 *</Label>
                <Select name="role" defaultValue="考评员">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>考点 *</Label><Input name="site" required /></div>
              <div className="space-y-1"><Label>所属单位 *</Label><Input name="org" required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>编辑考务人员</DialogTitle></DialogHeader>
          {editStaff && (
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>姓名 *</Label><Input name="name" defaultValue={editStaff.name} required /></div>
                <div className="space-y-1"><Label>登录名 *</Label><Input name="loginName" defaultValue={editStaff.loginName} required /></div>
                <div className="space-y-1"><Label>性别 *</Label>
                  <Select name="gender" defaultValue={editStaff.gender}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" defaultValue={editStaff.phone} required /></div>
                <div className="space-y-1"><Label>身份证号 *</Label><Input name="idCard" defaultValue={editStaff.idCard} required /></div>
                <div className="space-y-1"><Label>角色 *</Label>
                  <Select name="role" defaultValue={editStaff.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>考点 *</Label><Input name="site" defaultValue={editStaff.site} required /></div>
                <div className="space-y-1"><Label>所属单位 *</Label><Input name="org" defaultValue={editStaff.org} required /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditStaff(null)}>取消</Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailStaff} onOpenChange={() => setDetailStaff(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>考务人员详情</DialogTitle></DialogHeader>
          {detailStaff && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-gray-50 p-3 font-medium">{detailStaff.name} · {detailStaff.role}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">性别：</span>{detailStaff.gender}</div>
                <div><span className="text-gray-500">登录名：</span>{detailStaff.loginName}</div>
                <div><span className="text-gray-500">电话：</span>{detailStaff.phone}</div>
                <div><span className="text-gray-500">证件号码：</span>{detailStaff.idCard}</div>
                <div><span className="text-gray-500">证卡编号：</span>{detailStaff.certNo}</div>
                <div><span className="text-gray-500">考点：</span>{detailStaff.site}</div>
                <div><span className="text-gray-500">场次：</span>{detailStaff.session}</div>
                <div><span className="text-gray-500">安排状态：</span>{detailStaff.assignStatus}</div>
                <div><span className="text-gray-500">所属单位：</span>{detailStaff.org}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
