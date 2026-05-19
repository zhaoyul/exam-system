import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Building2, Plus, Search, Trash2, Edit3, Eye
} from 'lucide-react'

interface RegOrg {
  id: number
  name: string
  contact: string
  phone: string
  address: string
  batchCount: number
  candidateCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

const mockOrgs: RegOrg[] = [
  { id: 1, name: '运行一部', contact: '张主任', phone: '0755-12345678', address: '大亚湾基地1号厂房', batchCount: 2, candidateCount: 45, status: 'active', createdAt: '2025-01-15' },
  { id: 2, name: '维修部', contact: '李部长', phone: '0755-12345679', address: '大亚湾基地维修楼', batchCount: 1, candidateCount: 32, status: 'active', createdAt: '2025-02-20' },
  { id: 3, name: '仪控部', contact: '王主任', phone: '0755-12345680', address: '大亚湾基地仪控楼', batchCount: 1, candidateCount: 28, status: 'active', createdAt: '2025-03-10' },
  { id: 4, name: '运行二部', contact: '赵主任', phone: '0755-12345681', address: '阳江基地运行楼', batchCount: 0, candidateCount: 0, status: 'inactive', createdAt: '2025-04-05' },
]

export default function RegistrationOrgManage() {
  const [orgs, setOrgs] = useState<RegOrg[]>(mockOrgs)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOrg, setEditOrg] = useState<RegOrg | null>(null)

  const filtered = orgs.filter(o => !search || o.name.includes(search) || o.contact.includes(search) || o.phone.includes(search))

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newOrg: RegOrg = {
      id: Date.now(),
      name: fd.get('name') as string,
      contact: fd.get('contact') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      batchCount: 0,
      candidateCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setOrgs(prev => [...prev, newOrg])
    setAddOpen(false)
    toast.success(`新增报名机构：${newOrg.name}`)
    form.reset()
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editOrg) return
    const form = e.currentTarget
    const fd = new FormData(form)
    setOrgs(prev => prev.map(o => o.id === editOrg.id ? {
      ...o,
      name: fd.get('name') as string,
      contact: fd.get('contact') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
    } : o))
    setEditOrg(null)
    toast.success('机构信息已更新')
  }

  const handleDelete = (id: number) => {
    setOrgs(prev => prev.filter(o => o.id !== id))
    toast.success('机构已删除')
  }

  const handleToggleStatus = (id: number) => {
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' as const : 'active' as const } : o))
    toast.success('状态已更新')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">报名机构</h1>
          <p className="text-sm text-gray-500 mt-1">管理报名机构信息，机构下的报名批次</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> 新增机构
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">机构总数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{orgs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">启用中</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{orgs.filter(o => o.status === 'active').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">报名批次</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{orgs.reduce((a, o) => a + o.batchCount, 0)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600">考生总数</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{orgs.reduce((a, o) => a + o.candidateCount, 0)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索机构名称、联系人、电话..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">机构名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">联系人</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">地址</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">报名批次</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考生数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{o.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{o.contact}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{o.phone}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{o.address}</td>
                <td className="px-4 py-3">{o.batchCount}个</td>
                <td className="px-4 py-3">{o.candidateCount}人</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleStatus(o.id)}>
                    <Badge className={`text-[10px] cursor-pointer ${o.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {o.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditOrg(o)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">
                      <Eye className="w-3 h-3 mr-1" /> 查看
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(o.id)}>
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
        <DialogContent>
          <DialogHeader><DialogTitle>新增报名机构</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1"><Label>机构名称 *</Label><Input name="name" required /></div>
            <div className="space-y-1"><Label>联系人 *</Label><Input name="contact" required /></div>
            <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" required /></div>
            <div className="space-y-1"><Label>地址</Label><Input name="address" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOrg} onOpenChange={() => setEditOrg(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>编辑机构</DialogTitle></DialogHeader>
          {editOrg && (
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="space-y-1"><Label>机构名称 *</Label><Input name="name" defaultValue={editOrg.name} required /></div>
              <div className="space-y-1"><Label>联系人 *</Label><Input name="contact" defaultValue={editOrg.contact} required /></div>
              <div className="space-y-1"><Label>联系电话 *</Label><Input name="phone" defaultValue={editOrg.phone} required /></div>
              <div className="space-y-1"><Label>地址</Label><Input name="address" defaultValue={editOrg.address} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOrg(null)}>取消</Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
