import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Plus, BookOpen, Trash2, Edit3 } from 'lucide-react'

interface Subject {
  id: number
  code: string
  name: string
  parentName: string
  type: string
  questionCount: number
  status: string
}

const mockSubjects: Subject[] = [
  { id: 1, code: '6-28-01-01', name: '核反应堆运行值班员', parentName: '核反应堆运行', type: '核工程', questionCount: 156, status: 'active' },
  { id: 2, code: '6-28-01-02', name: '电气值班员', parentName: '电气运行', type: '电气工程', questionCount: 128, status: 'active' },
  { id: 3, code: '6-28-01-03', name: '汽轮机运行值班员', parentName: '汽轮机运行', type: '热能动力', questionCount: 98, status: 'active' },
  { id: 4, code: '6-28-01-04', name: '仪器仪表维修工', parentName: '仪表检修', type: '自动化', questionCount: 86, status: 'active' },
  { id: 5, code: '6-28-01-05', name: '焊接工', parentName: '焊接技术', type: '机械工程', questionCount: 72, status: 'active' },
  { id: 6, code: '6-28-01-06', name: '机械设备检修工', parentName: '机械检修', type: '机械工程', questionCount: 112, status: 'active' },
]

export default function SubjectManage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editSub, setEditSub] = useState<Subject | null>(null)

  const filtered = subjects.filter(s => !search || s.name.includes(search) || s.code.includes(search))

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newSub: Subject = {
      id: Date.now(),
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      parentName: fd.get('parentName') as string,
      type: fd.get('type') as string,
      questionCount: 0,
      status: 'active',
    }
    setSubjects(prev => [...prev, newSub])
    setAddOpen(false)
    toast.success(`新增科目：${newSub.name}`)
    form.reset()
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editSub) return
    const form = e.currentTarget
    const fd = new FormData(form)
    setSubjects(prev => prev.map(s => s.id === editSub.id ? {
      ...s,
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      parentName: fd.get('parentName') as string,
      type: fd.get('type') as string,
    } : s))
    setEditSub(null)
    toast.success('科目已更新')
  }

  const handleDelete = (id: number) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
    toast.success('科目已删除')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">科目管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理理论题库的科目（职业工种）体系</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增科目</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索科目编码、名称..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">科目编码</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">科目名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">上级科目</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">专业类别</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">试题数量</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.code}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" />{s.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{s.parentName}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.type}</Badge></td>
                <td className="px-4 py-3 text-xs">{s.questionCount}道</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-green-100 text-green-700">启用</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditSub(s)}><Edit3 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(s.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>新增科目</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1"><Label>科目编码 *</Label><Input name="code" placeholder="如：6-28-01-01" required /></div>
            <div className="space-y-1"><Label>科目名称 *</Label><Input name="name" placeholder="如：核反应堆运行值班员" required /></div>
            <div className="space-y-1"><Label>上级科目</Label><Input name="parentName" placeholder="如：核反应堆运行" /></div>
            <div className="space-y-1"><Label>专业类别 *</Label>
              <Select name="type" defaultValue="核工程">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="核工程">核工程</SelectItem>
                  <SelectItem value="电气工程">电气工程</SelectItem>
                  <SelectItem value="热能动力">热能动力</SelectItem>
                  <SelectItem value="自动化">自动化</SelectItem>
                  <SelectItem value="机械工程">机械工程</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSub} onOpenChange={() => setEditSub(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>编辑科目</DialogTitle></DialogHeader>
          {editSub && (
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="space-y-1"><Label>科目编码 *</Label><Input name="code" defaultValue={editSub.code} required /></div>
              <div className="space-y-1"><Label>科目名称 *</Label><Input name="name" defaultValue={editSub.name} required /></div>
              <div className="space-y-1"><Label>上级科目</Label><Input name="parentName" defaultValue={editSub.parentName} /></div>
              <div className="space-y-1"><Label>专业类别</Label><Input name="type" defaultValue={editSub.type} /></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditSub(null)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
