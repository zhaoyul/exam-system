import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Trash2, FileSpreadsheet, Copy } from 'lucide-react'

interface PaperRule {
  id: number
  name: string
  subject: string
  level: string
  types: string
  totalScore: number
  passScore: number
  questionCount: number
  duration: number
  status: string
}

const mockRules: PaperRule[] = [
  { id: 1, name: '核反应堆运行三级-A卷规则', subject: '核反应堆运行值班员', level: '三级', types: '单选/多选/判断', totalScore: 100, passScore: 60, questionCount: 80, duration: 120, status: 'active' },
  { id: 2, name: '电气值班四级-B卷规则', subject: '电气值班员', level: '四级', types: '单选/多选/判断/填空', totalScore: 100, passScore: 60, questionCount: 100, duration: 120, status: 'active' },
  { id: 3, name: '汽轮机运行三级-实操规则', subject: '汽轮机运行值班员', level: '三级', types: '单选/判断/简答', totalScore: 100, passScore: 60, questionCount: 60, duration: 90, status: 'draft' },
]

export default function PaperRules() {
  const [rules, setRules] = useState<PaperRule[]>(mockRules)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = rules.filter(r => !search || r.name.includes(search) || r.subject.includes(search))

  const handleDelete = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id))
    toast.success('规则已删除')
  }

  const handleCopy = (rule: PaperRule) => {
    const newRule = { ...rule, id: Date.now(), name: rule.name + '（副本）', status: 'draft' }
    setRules(prev => [...prev, newRule])
    toast.success('规则已复制')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">组卷规则</h1>
          <p className="text-sm text-gray-500 mt-1">配置自动组卷的规则，包括题型分布、分值设置等</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('导入规则')}><FileSpreadsheet className="w-4 h-4 mr-2" />导入</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增规则</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索规则名称、科目..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">规则名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">科目</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">题型</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">总分</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">及格线</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">题数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">时长</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r, idx) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-xs">{r.subject}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{r.level}</Badge></td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.types}</td>
                <td className="px-4 py-3 text-xs">{r.totalScore}分</td>
                <td className="px-4 py-3 text-xs">{r.passScore}分</td>
                <td className="px-4 py-3 text-xs">{r.questionCount}道</td>
                <td className="px-4 py-3 text-xs">{r.duration}分钟</td>
                <td className="px-4 py-3">
                  <Badge className={`text-[10px] ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {r.status === 'active' ? '启用' : '草稿'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">详情</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy(r)}><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新增组卷规则</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddOpen(false); toast.success('组卷规则已创建'); }} className="space-y-3">
            <div className="space-y-1"><Label>规则名称 *</Label><Input name="name" placeholder="如：核反应堆运行三级-A卷规则" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>科目 *</Label>
                <Select name="subject" defaultValue="reactor">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reactor">核反应堆运行值班员</SelectItem>
                    <SelectItem value="electrical">电气值班员</SelectItem>
                    <SelectItem value="turbine">汽轮机运行值班员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>等级 *</Label>
                <Select name="level" defaultValue="三级">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一级">一级</SelectItem>
                    <SelectItem value="二级">二级</SelectItem>
                    <SelectItem value="三级">三级</SelectItem>
                    <SelectItem value="四级">四级</SelectItem>
                    <SelectItem value="五级">五级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>总分 *</Label><Input type="number" defaultValue="100" /></div>
              <div className="space-y-1"><Label>及格线 *</Label><Input type="number" defaultValue="60" /></div>
              <div className="space-y-1"><Label>考试时长(分钟)</Label><Input type="number" defaultValue="120" /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
