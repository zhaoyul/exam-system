import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { toast } from 'sonner'
import {
  Plus, Search, Trash2, FileText, CheckCircle, Eye, ChevronDown, ChevronRight, Upload
} from 'lucide-react'

interface Declaration {
  id: string
  declNo: string
  planName: string
  filingOrg: string
  site: string
  profession: string
  level: string
  count: number
  status: 'draft' | 'submitted' | 'group_review' | 'approved' | 'rejected'
  materials: string[]
}

const mockDeclarations: Declaration[] = [
  { id: '1', declNo: 'DECL-2026-001', planName: '大亚湾核电2026年第1批认定', filingOrg: '广东省', site: '大亚湾核电', profession: '核反应堆运行值班员', level: '三级', count: 45, status: 'submitted', materials: ['备案材料.pdf', '考生名单.xlsx'] },
  { id: '2', declNo: 'DECL-2026-002', planName: '阳江核电2026年第1批认定', filingOrg: '广东省', site: '阳江核电', profession: '电气试验员', level: '四级', count: 32, status: 'group_review', materials: ['备案材料.pdf'] },
  { id: '3', declNo: 'DECL-2026-003', planName: '台山核电2026年第2批认定', filingOrg: '广东省', site: '台山核电', profession: '焊接工', level: '五级', count: 28, status: 'approved', materials: ['备案材料.pdf', '考生名单.xlsx', '考试方案.pdf'] },
]

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: '已提交', color: 'bg-blue-100 text-blue-700' },
  group_review: { label: '集团审核中', color: 'bg-amber-100 text-amber-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-700' },
}

export default function CertDeclaration() {
  const [declarations, setDeclarations] = useState<Declaration[]>(mockDeclarations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState<Declaration | null>(null)

  const filtered = declarations.filter(d => {
    const m = !search || d.planName.includes(search) || d.declNo.includes(search)
    const s = statusFilter === 'all' || d.status === statusFilter
    return m && s
  })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const newDecl: Declaration = {
      id: Date.now().toString(),
      declNo: `DECL-2026-${String(declarations.length + 1).padStart(3, '0')}`,
      planName: fd.get('planName') as string,
      filingOrg: fd.get('filingOrg') as string,
      site: fd.get('site') as string,
      profession: fd.get('profession') as string,
      level: fd.get('level') as string,
      count: Number(fd.get('count')),
      status: 'draft',
      materials: [],
    }
    setDeclarations(prev => [newDecl, ...prev])
    setAddOpen(false)
    toast.success('认定申报已创建')
  }

  const handleDelete = (id: string) => {
    setDeclarations(prev => prev.filter(d => d.id !== id))
    toast.success('申报已删除')
  }

  const handleStatusChange = (id: string, status: Declaration['status']) => {
    setDeclarations(prev => prev.map(d => d.id === id ? { ...d, status } : d))
    toast.success(`状态已更新为：${statusMap[status].label}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">认定申报</h1>
          <p className="text-sm text-gray-500 mt-1">向集团提交职业技能等级认定申报</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增申报</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索申报编号/计划名称..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="submitted">已提交</SelectItem>
            <SelectItem value="group_review">集团审核中</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已驳回</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusMap).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className={`p-3 rounded-lg border text-left transition-colors ${statusFilter === key ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="text-2xl font-bold text-gray-900">{declarations.filter(d => d.status === key).length}</div>
            <div className="text-xs text-gray-500 mt-1">{val.label}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-8"></th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">申报编号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">认定计划</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">站点</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">职业(工种)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">人数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">申报材料</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((decl, idx) => (
              <>
                <tr key={decl.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => setExpandedId(expandedId === decl.id ? null : decl.id)} className="text-gray-400 hover:text-gray-600">
                      {expandedId === decl.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{decl.declNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{decl.planName}</td>
                  <td className="px-4 py-3 text-gray-600">{decl.filingOrg}</td>
                  <td className="px-4 py-3 text-gray-600">{decl.site}</td>
                  <td className="px-4 py-3 text-gray-600">{decl.profession}（{decl.level}）</td>
                  <td className="px-4 py-3 text-gray-600">{decl.count}人</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${decl.materials.length >= 2 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {decl.materials.length}份
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] ${statusMap[decl.status].color}`}>{statusMap[decl.status].label}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowDetail(decl)}><Eye className="w-3 h-3 mr-1" />详情</Button>
                      {decl.status === 'draft' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleStatusChange(decl.id, 'submitted')}><Upload className="w-3 h-3 mr-1" />提交</Button>}
                      {decl.status === 'submitted' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handleStatusChange(decl.id, 'group_review')}><CheckCircle className="w-3 h-3 mr-1" />送审</Button>}
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDelete(decl.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
                {expandedId === decl.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={11} className="px-4 py-4">
                      <div className="text-xs text-gray-500 mb-2 font-medium">申报材料</div>
                      <div className="flex gap-2 flex-wrap">
                        {decl.materials.map((m, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                            <FileText className="w-3 h-3 text-blue-500" />{m}
                          </span>
                        ))}
                        <Button variant="outline" size="sm" className="h-7 text-xs"><Upload className="w-3 h-3 mr-1" />上传材料</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新增认定申报</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>认定计划 *</Label><Input name="planName" required placeholder="选择认定计划" /></div>
              <div className="space-y-1"><Label>备案地 *</Label>
                <Select name="filingOrg" defaultValue="广东省">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="北京市">北京市</SelectItem>
                    <SelectItem value="广东省">广东省</SelectItem>
                    <SelectItem value="福建省">福建省</SelectItem>
                    <SelectItem value="辽宁省">辽宁省</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>站点 *</Label><Input name="site" required placeholder="站点名称" /></div>
              <div className="space-y-1"><Label>职业(工种) *</Label><Input name="profession" required placeholder="输入职业工种" /></div>
              <div className="space-y-1"><Label>等级 *</Label>
                <Select name="level" defaultValue="三级">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="一级">一级/高级技师</SelectItem>
                    <SelectItem value="二级">二级/技师</SelectItem>
                    <SelectItem value="三级">三级/高级工</SelectItem>
                    <SelectItem value="四级">四级/中级工</SelectItem>
                    <SelectItem value="五级">五级/初级工</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>申报人数 *</Label><Input name="count" type="number" required placeholder="人数" defaultValue="1" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>认定申报详情</DialogTitle></DialogHeader>
          {showDetail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">申报编号：</span><span className="font-medium">{showDetail.declNo}</span></div>
                <div><span className="text-gray-500">状态：</span><Badge className={`text-[10px] ${statusMap[showDetail.status].color}`}>{statusMap[showDetail.status].label}</Badge></div>
                <div><span className="text-gray-500">认定计划：</span><span>{showDetail.planName}</span></div>
                <div><span className="text-gray-500">备案地：</span><span>{showDetail.filingOrg}</span></div>
                <div><span className="text-gray-500">站点：</span><span>{showDetail.site}</span></div>
                <div><span className="text-gray-500">职业工种：</span><span>{showDetail.profession}（{showDetail.level}）</span></div>
                <div><span className="text-gray-500">申报人数：</span><span>{showDetail.count}人</span></div>
              </div>
              <div>
                <span className="text-gray-500">申报材料：</span>
                <div className="flex gap-2 flex-wrap mt-1">
                  {showDetail.materials.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"><FileText className="w-3 h-3 text-blue-500" />{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
