import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  UserCheck, Plus, Search, Shield, Trash2, Eye, Download, Upload, KeyRound
} from 'lucide-react'

interface Supervisor {
  id: number
  loginName: string
  password: string
  name: string
  gender: string
  phone: string
  idCard: string
  org: string
  site: string
  role: string
  status: 'active' | 'inactive'
  certNo: string
}

const mockSupervisors: Supervisor[] = [
  { id: 1, loginName: '440301198001011234', password: '123456', name: '张监考', gender: '男', phone: '13800138001', idCard: '440301198001011234', org: '大亚湾核电', site: '职业技能培训中心', role: '主监考', status: 'active', certNo: 'JK-2026-001' },
  { id: 2, loginName: '440301198502063456', password: '123456', name: '李监考', gender: '女', phone: '13800138002', idCard: '440301198502063456', org: '大亚湾核电', site: '职业技能培训中心', role: '副监考', status: 'active', certNo: 'JK-2026-002' },
  { id: 3, loginName: '440301199003127890', password: '123456', name: '王监考', gender: '男', phone: '13800138003', idCard: '440301199003127890', org: '阳江核电', site: '实操训练基地', role: '流动监考', status: 'active', certNo: 'JK-2026-003' },
  { id: 4, loginName: '440301198805064567', password: '123456', name: '赵监考', gender: '女', phone: '13800138004', idCard: '440301198805064567', org: '台山核电', site: '职业技能培训中心', role: '主监考', status: 'inactive', certNo: 'JK-2026-004' },
]

export default function SupervisorManage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = supervisors.filter(s =>
    !search || s.name.includes(search) || s.loginName.includes(search) || s.phone.includes(search) || s.certNo.includes(search)
  )

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newSup: Supervisor = {
      id: Date.now(),
      loginName: (fd.get('loginName') as string) || (fd.get('idCard') as string),
      password: '123456',
      name: fd.get('name') as string,
      gender: fd.get('gender') as string,
      phone: fd.get('phone') as string,
      idCard: fd.get('idCard') as string,
      org: fd.get('org') as string,
      site: fd.get('site') as string,
      role: fd.get('role') as string,
      status: 'active',
      certNo: `JK-${Date.now()}`,
    }
    setSupervisors(prev => [...prev, newSup])
    setAddOpen(false)
    toast.success(`添加监考人员：${newSup.name}`)
    form.reset()
  }

  const handleDelete = (id: number) => {
    setSupervisors(prev => prev.filter(s => s.id !== id))
    toast.success('监考人员已删除')
  }

  const handleResetPassword = (item: Supervisor) => {
    setSupervisors(prev => prev.map(s => s.id === item.id ? { ...s, password: '123456' } : s))
    toast.success('重置成功，密码已重置为 123456')
  }

  const handleToggleStatus = (id: number) => {
    setSupervisors(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const } : s))
    toast.success('设置成功')
  }

  const stats = {
    total: supervisors.length,
    active: supervisors.filter(s => s.status === 'active').length,
    inactive: supervisors.filter(s => s.status === 'inactive').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">监考人员</h1>
          <p className="text-sm text-gray-500 mt-1">管理各考点的监考人员信息</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('监考人员导入模板已下载')}>
            <Download className="w-4 h-4 mr-2" /> 下载模板
          </Button>
          <Button variant="outline" onClick={() => toast.success('批量导入监考人员完成')}>
            <Upload className="w-4 h-4 mr-2" /> 批量导入
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> 添加监考人员
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总人数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">在职</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">停用</p>
                <p className="text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
              <th className="px-4 py-3 text-left font-medium text-gray-600">登录名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">身份证号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">单位</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考点</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">角色</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-xs">{s.gender}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.loginName}</td>
                <td className="px-4 py-3 text-xs">{s.phone}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.idCard}</td>
                <td className="px-4 py-3 text-xs">{s.org}</td>
                <td className="px-4 py-3 text-xs">{s.site}</td>
                <td className="px-4 py-3 text-xs">{s.role}</td>
                <td className="px-4 py-3">
                  <Badge onClick={() => handleToggleStatus(s.id)} variant="outline" className={`text-[10px] cursor-pointer ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {s.status === 'active' ? '在职' : '停用'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Eye className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" onClick={() => handleResetPassword(s)}><KeyRound className="w-3 h-3 mr-1" />重置密码</Button>
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
          <DialogHeader>
            <DialogTitle>添加监考人员</DialogTitle>
          </DialogHeader>
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
              <div className="space-y-1"><Label>所属单位 *</Label><Input name="org" required /></div>
              <div className="space-y-1"><Label>考点 *</Label><Input name="site" required /></div>
              <div className="space-y-1"><Label>角色 *</Label>
                <Select name="role" defaultValue="主监考">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="主监考">主监考</SelectItem>
                    <SelectItem value="副监考">副监考</SelectItem>
                    <SelectItem value="流动监考">流动监考</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
