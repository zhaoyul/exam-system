import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, CheckCircle, XCircle, Eye } from 'lucide-react'

interface SkillReq {
  id: number
  title: string
  subject: string
  level: string
  paperCount: number
  useType: string
  status: string
  applicant: string
  applyDate: string
}

const mockReqs: SkillReq[] = [
  { id: 1, title: '2026年4月控制棒操作实操A卷', subject: '反应堆控制棒操作', level: '三级', paperCount: 2, useType: '正式考试', status: 'approved', applicant: '张工', applyDate: '2026-03-10' },
  { id: 2, title: '2026年4月主泵检修实操B卷', subject: '主泵检修', level: '四级', paperCount: 1, useType: '正式考试', status: 'pending', applicant: '李工', applyDate: '2026-03-12' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-700' },
}

export default function SkillPaperRequirements() {
  const [reqs, setReqs] = useState<SkillReq[]>(mockReqs)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = reqs.filter(r => !search || r.title.includes(search) || r.subject.includes(search))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">试卷需求</h1>
          <p className="text-sm text-gray-500 mt-1">申请和管理技能实操试卷需求</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />申请试卷</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索需求标题、科目..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">需求标题</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">科目</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">套数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">用途</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">申请人</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r, idx) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-xs">{r.subject}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{r.level}</Badge></td>
                <td className="px-4 py-3 text-xs">{r.paperCount}套</td>
                <td className="px-4 py-3 text-xs">{r.useType}</td>
                <td className="px-4 py-3 text-xs">{r.applicant}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[r.status].color}`}>{statusMap[r.status].label}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Eye className="w-3 h-3" /></Button>
                    {r.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => { setReqs(prev => prev.map(x => x.id === r.id ? { ...x, status: 'approved' } : x)); toast.success('已通过'); }}><CheckCircle className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => { setReqs(prev => prev.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x)); toast.success('已驳回'); }}><XCircle className="w-3 h-3" /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>申请技能试卷</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddOpen(false); toast.success('试卷需求已提交'); }} className="space-y-3">
            <div className="space-y-1"><Label>需求标题 *</Label><Input placeholder="如：2026年4月控制棒操作实操A卷" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>科目 *</Label>
                <Select defaultValue="reactor">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reactor">反应堆控制棒操作</SelectItem>
                    <SelectItem value="pump">主泵检修</SelectItem>
                    <SelectItem value="turbine">汽轮机叶片检查</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>等级 *</Label>
                <Select defaultValue="三级">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="三级">三级</SelectItem>
                    <SelectItem value="四级">四级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">提交申请</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
