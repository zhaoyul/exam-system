import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Search, Wrench, Trash2, Edit3 } from 'lucide-react'

interface SkillSubject {
  id: number
  code: string
  name: string
  category: string
  moduleCount: number
  questionCount: number
  status: string
}

const mockSubs: SkillSubject[] = [
  { id: 1, code: 'SK-001', name: '反应堆控制棒操作', category: '运行操作', moduleCount: 5, questionCount: 32, status: 'active' },
  { id: 2, code: 'SK-002', name: '主泵检修', category: '机械维修', moduleCount: 4, questionCount: 28, status: 'active' },
  { id: 3, code: 'SK-003', name: '汽轮机叶片检查', category: '机械维修', moduleCount: 3, questionCount: 18, status: 'active' },
  { id: 4, code: 'SK-004', name: '电气设备继电保护校验', category: '电气维修', moduleCount: 6, questionCount: 24, status: 'active' },
  { id: 5, code: 'SK-005', name: '仪控系统故障处理', category: '仪控维修', moduleCount: 4, questionCount: 20, status: 'active' },
]

export default function SkillSubjectManage() {
  const [subs, setSubs] = useState<SkillSubject[]>(mockSubs)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = subs.filter(s => !search || s.name.includes(search) || s.code.includes(search))

  const handleDelete = (id: number) => {
    setSubs(prev => prev.filter(s => s.id !== id))
    toast.success('科目已删除')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">技能科目</h1>
          <p className="text-sm text-gray-500 mt-1">管理技能题库的技能科目（职业工种）体系</p>
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
              <th className="px-4 py-3 text-left font-medium text-gray-600">专业类别</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">技能模块</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">试题数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.code}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-2"><Wrench className="w-4 h-4 text-green-500" />{s.name}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.category}</Badge></td>
                <td className="px-4 py-3 text-xs">{s.moduleCount}个</td>
                <td className="px-4 py-3 text-xs">{s.questionCount}道</td>
                <td className="px-4 py-3"><Badge className="text-[10px] bg-green-100 text-green-700">启用</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit3 className="w-3 h-3" /></Button>
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
          <DialogHeader><DialogTitle>新增技能科目</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddOpen(false); toast.success('科目已添加'); }} className="space-y-3">
            <div className="space-y-1"><Label>科目编码 *</Label><Input name="code" placeholder="如：SK-001" required /></div>
            <div className="space-y-1"><Label>科目名称 *</Label><Input name="name" placeholder="如：反应堆控制棒操作" required /></div>
            <div className="space-y-1"><Label>专业类别 *</Label><Input name="category" placeholder="如：运行操作" required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
