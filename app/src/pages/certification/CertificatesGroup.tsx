import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Search, Award, FileText, ChevronDown, ChevronRight, Eye, FileSpreadsheet, MoreHorizontal, Download, CheckCircle
} from 'lucide-react'

interface CertPlan {
  id: string
  planNo: string
  name: string
  filingOrg: string
  examMonth: string
  status: '待生成' | '已生成' | '部分生成'
  certCount: number
  children: CertChild[]
}

interface CertChild {
  id: string
  profession: string
  level: string
  theoryEnrolled: number
  groupEnrolled: number
  examSubjects: string
}

interface CandidateCert {
  id: string
  profession: string
  name: string
  idCard: string
  ticketNo: string
  certNo: string
  issueDate: string
  theoryScore: number
  skillScore: number
}

const mockPlans: CertPlan[] = [
  {
    id: '1', planNo: '22118800880003', name: '20220324中国同辐股份有限公司第2批认定', filingOrg: '北京市', examMonth: '2022年04月', status: '部分生成', certCount: 2,
    children: [
      { id: 'c1', profession: '道路客运汽车驾驶员', level: '五级/初级工', theoryEnrolled: 0, groupEnrolled: 1, examSubjects: '理论（知识）技能（实操）' },
      { id: 'c2', profession: '抄表核算收费员', level: '五级/初级工', theoryEnrolled: 0, groupEnrolled: 1, examSubjects: '理论（知识）技能（实操）' },
      { id: 'c3', profession: '抄表核算收费员', level: '四级/中级工', theoryEnrolled: 0, groupEnrolled: 1, examSubjects: '理论（知识）技能（实操）' },
    ]
  },
  {
    id: '2', planNo: '22119999660044', name: '2021-04-27年第28批认定', filingOrg: '北京市', examMonth: '2021年04月', status: '已生成', certCount: 3,
    children: [
      { id: 'c4', profession: '秘书', level: '五级/初级工', theoryEnrolled: 0, groupEnrolled: 1, examSubjects: '理论（知识）技能（实操）' },
    ]
  },
]

const mockCandidateCerts: CandidateCert[] = [
  { id: '1', profession: '秘书', name: '张三', idCard: '460321191001015633', ticketNo: '2104271199996600001', certNo: 'Y001011999966215000001', issueDate: '2021-04-27', theoryScore: 100.0, skillScore: 100.0 },
  { id: '2', profession: '秘书', name: '李四', idCard: '460321191001016572', ticketNo: '2104271199996600002', certNo: 'Y001011999966215000002', issueDate: '2021-04-27', theoryScore: 100.0, skillScore: 100.0 },
  { id: '3', profession: '秘书', name: '王五', idCard: '460321191001015414', ticketNo: '2104271199996600003', certNo: 'Y001011999966215000003', issueDate: '2021-04-27', theoryScore: 100.0, skillScore: 100.0 },
]

export default function CertificatesGroup() {
  const [plans, setPlans] = useState<CertPlan[]>(mockPlans)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全部' | CertPlan['status']>('全部')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)
  const [showCandidates, setShowCandidates] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<CertPlan | null>(null)
  const [issueDate, setIssueDate] = useState('2022-03-27')
  const [candidateCerts] = useState<CandidateCert[]>(mockCandidateCerts)

  const filtered = plans.filter(p => {
    const bySearch = !search || p.name.includes(search) || p.planNo.includes(search)
    const byStatus = statusFilter === '全部' || p.status === statusFilter
    return bySearch && byStatus
  })

  const handleGenerate = () => {
    setPlans(prev => prev.map(p => selectedPlan && p.id !== selectedPlan.id ? p : { ...p, status: '已生成' as const, certCount: Math.max(p.certCount, 3) }))
    setShowGenerate(false)
    toast.success(`证书生成成功！发证日期：${issueDate}`)
  }

  const openCandidates = (plan: CertPlan) => {
    setSelectedPlan(plan)
    setShowCandidates(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">证书管理</h1>
          <p className="text-sm text-gray-500 mt-1">生成职业技能等级证书，查看考生证书编号和成绩</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('证书数据已导出')}><Download className="w-4 h-4 mr-2" />导出证书数据</Button>
          <Button onClick={() => setShowGenerate(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Award className="w-4 h-4 mr-2" />批量生成证书
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
            <option>全部</option>
            <option>待生成</option>
            <option>部分生成</option>
            <option>已生成</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="计划名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left w-8"></th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划编号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">考试月份</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">证书数</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((plan, idx) => (
              <>
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <button onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)} className="text-gray-400 hover:text-gray-600">
                      {expandedId === plan.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">{plan.planNo}</td>
                  <td className="px-3 py-3 font-medium text-gray-900">{plan.name}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.filingOrg}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.examMonth}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.certCount}本</td>
                  <td className="px-3 py-3">
                    <Badge className={`text-[10px] ${plan.status === '已生成' ? 'bg-green-50 text-green-700' : plan.status === '部分生成' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{plan.status}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCandidates(plan)} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />考生
                      </button>
                      <button onClick={() => { setSelectedPlan(plan); setShowGenerate(true) }} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <Award className="w-3 h-3" />生成证书
                      </button>
                      <button onClick={() => toast.success('证书生成状态已确认')} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" />确认
                      </button>
                      <button onClick={() => toast.success('申报表已导出')} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <FileSpreadsheet className="w-3 h-3" />申报表
                      </button>
                      <button onClick={() => {}} className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === plan.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="px-3 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="px-3 py-2 text-left w-8">序号</th>
                            <th className="px-3 py-2 text-left">职业工种</th>
                            <th className="px-3 py-2 text-left">技能等级</th>
                            <th className="px-3 py-2 text-left">网报人数</th>
                            <th className="px-3 py-2 text-left">集体报名</th>
                            <th className="px-3 py-2 text-left">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.children.map((child, cIdx) => (
                            <tr key={child.id} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-gray-600">{idx + 1}-{cIdx + 1}</td>
                              <td className="px-3 py-2 text-gray-900">{child.profession}</td>
                              <td className="px-3 py-2"><Badge className="text-[10px] bg-blue-50 text-blue-700">{child.level}</Badge></td>
                              <td className="px-3 py-2 text-gray-600">{child.theoryEnrolled}</td>
                              <td className="px-3 py-2 text-gray-600">{child.groupEnrolled}</td>
                              <td className="px-3 py-2">
                                <button onClick={() => openCandidates(plan)} className="text-blue-600 hover:underline text-xs">
                                  考生
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Certificate Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>生成证书</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
              {selectedPlan ? `当前计划：${selectedPlan.name}` : '批量生成当前筛选范围内的证书'}
            </div>
            <div className="space-y-1">
              <Label><span className="text-red-500">*</span> 发证日期</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleGenerate} className="bg-[#1A56DB] hover:bg-[#1748B5]">
              <Award className="w-4 h-4 mr-1" />生成证书
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Certs Dialog */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>考生证书 - {selectedPlan?.name}</DialogTitle></DialogHeader>
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('报表已导出')}>
              <FileText className="w-3.5 h-3.5 mr-1" />报表
            </Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">姓名</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">证件号码</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">准考证号</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">证书编号</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">颁证时间</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">考试成绩</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidateCerts.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-3 text-gray-900">{c.profession}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-3 py-3 text-gray-600 font-mono text-xs">{c.idCard}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{c.ticketNo}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{c.certNo}</td>
                    <td className="px-3 py-3 text-gray-600">{c.issueDate}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">
                      <div>理论成绩：{c.theoryScore}</div>
                      <div>技能成绩：{c.skillScore}</div>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => toast.success('正在查看证书...')} className="text-blue-600 hover:underline text-xs">
                        证书
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
