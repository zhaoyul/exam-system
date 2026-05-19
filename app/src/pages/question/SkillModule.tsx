import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Search, Layers, Trash2, Edit3 } from 'lucide-react'

interface SkillModule {
  id: number
  subjectName: string
  code: string
  name: string
  description: string
  questionCount: number
  score: number
  time: number
}

const mockModules: SkillModule[] = [
  { id: 1, subjectName: '反应堆控制棒操作', code: 'M-001', name: '控制棒手动操作', description: '手动提升/插入控制棒的操作流程', questionCount: 8, score: 20, time: 30 },
  { id: 2, subjectName: '反应堆控制棒操作', code: 'M-002', name: '控制棒自动操作', description: '自动模式下控制棒的运行逻辑', questionCount: 6, score: 15, time: 25 },
  { id: 3, subjectName: '反应堆控制棒操作', code: 'M-003', name: '反应性控制原理', description: '反应性控制的基本原理和方法', questionCount: 10, score: 25, time: 35 },
  { id: 4, subjectName: '反应堆控制棒操作', code: 'M-004', name: '异常工况处理', description: '控制棒异常时的应急处理', questionCount: 5, score: 15, time: 20 },
  { id: 5, subjectName: '反应堆控制棒操作', code: 'M-005', name: '安全联锁检查', description: '控制棒安全联锁装置的检查', questionCount: 3, score: 10, time: 15 },
]

export default function SkillModuleManage() {
  const [modules, setModules] = useState<SkillModule[]>(mockModules)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = modules.filter(m => !search || m.name.includes(search) || m.subjectName.includes(search))

  const handleDelete = (id: number) => {
    setModules(prev => prev.filter(m => m.id !== id))
    toast.success('模块已删除')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">技能模块</h1>
          <p className="text-sm text-gray-500 mt-1">将技能科目分解为可考核的技能模块和项目</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增模块</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索模块名称、科目..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模块编码</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">所属科目</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模块名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模块描述</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">试题数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">分值</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">时长</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m, idx) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{m.code}</td>
                <td className="px-4 py-3 text-xs">{m.subjectName}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-2"><Layers className="w-4 h-4 text-green-500" />{m.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{m.description}</td>
                <td className="px-4 py-3 text-xs">{m.questionCount}道</td>
                <td className="px-4 py-3 text-xs">{m.score}分</td>
                <td className="px-4 py-3 text-xs">{m.time}分钟</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit3 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>新增技能模块</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddOpen(false); toast.success('模块已添加'); }} className="space-y-3">
            <div className="space-y-1"><Label>模块编码 *</Label><Input name="code" placeholder="如：M-001" required /></div>
            <div className="space-y-1"><Label>模块名称 *</Label><Input name="name" placeholder="如：控制棒手动操作" required /></div>
            <div className="space-y-1"><Label>模块描述</Label><Input name="desc" placeholder="简述模块考核内容" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>分值</Label><Input type="number" defaultValue="20" /></div>
              <div className="space-y-1"><Label>时长(分钟)</Label><Input type="number" defaultValue="30" /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
