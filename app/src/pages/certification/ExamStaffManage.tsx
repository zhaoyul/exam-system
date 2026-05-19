import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Users, Plus, Search, Trash2, Edit3, Eye
} from 'lucide-react'

interface ExamStaff {
  id: number
  name: string
  gender: string
  phone: string
  idCard: string
  role: string
  site: string
  org: string
  certNo: string
  status: 'active' | 'inactive'
  createdAt: string
}

const mockStaff: ExamStaff[] = [
  { id: 1, name: '张考评', gender: '男', phone: '13800138001', idCard: '440301198001011234', role: '考评组长', site: '职业技能培训中心', org: '大亚湾核电', certNo: 'KW-2026-001', status: 'active', createdAt: '2025-06-01' },
  { id: 2, name: '李考评', gender: '女', phone: '13800138002', idCard: '440301198502063456', role: '考评员', site: '职业技能培训中心', org: '大亚湾核电', certNo: 'KW-2026-002', status: 'active', createdAt: '2025-06-01' },
  { id: 3, name: '王考评', gender: '男', phone: '13800138003', idCard: '440301199003127890', role: '考评员', site: '实操训练基地', org: '阳江核电', certNo: 'KW-2026-003', status: 'active', createdAt: '2025-08-15' },
  { id: 4, name: '赵考评', gender: '女', phone: '13800138004', idCard: '440301198805064567', role: '监考员', site: '职业技能培训中心', org: '台山核电', certNo: 'KW-2026-004', status: 'inactive', createdAt: '2025-09-10' },
  { id: 5, name: '孙考评', gender: '男', phone: '13800138005', idCard: '440301199207088901', role: '质量督导员', site: '实操训练基地', org: '防城港核电', certNo: 'KW-2026-005', status: 'active', createdAt: '2025-10-20' },
]

const roleOptions = ['考评组长', '考评员', '监考员', '质量督导员', '考务管理员']

export default function ExamStaffManage() {
  const [staff, setStaff] = useState<ExamStaff[]>(mockStaff)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editStaff, setEditStaff] = useState<ExamStaff | null>(null)

  const filtered = staff.filter(s =>
    !search || s.name.includes(search) || s.phone.includes(search) || s.certNo.includes(search) || s.idCard.includes(search)
  )

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newStaff: ExamStaff = {
      id: Date.now(),
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      phone: fd.get('phone') as string,
      idCard: fd.get('idCard') as string,
      role: fd.get('role') as string,
      site: fd.get('site') as string,
      org: fd.get('org') as string,
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考务人员</h1>
          <p className="text-sm text-gray-500 mt-1">管理考务人员信息，包括考评组长、考评员、监考员等</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> 新增人员
        </Button>
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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索姓名、电话、证书编号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">姓名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">性别</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">证件号码</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">角色</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考点</th>
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
                <td className="px-4 py-3 text-xs text-gray-500">{s.phone}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.idCard}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">{s.role}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.site}</td>
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
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">
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
    </div>
  )
}
