import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Search, Printer, ChevronDown, ChevronRight, MoreHorizontal, CheckCircle, Users
} from 'lucide-react'

interface PrintPlan {
  id: string
  planNo: string
  name: string
  filingOrg: string
  site: string
  examMonth: string
  regDeadline: string
  status: string
  children: PrintChild[]
}

interface PrintChild {
  id: string
  profession: string
  level: string
  theoryEnrolled: number
  groupEnrolled: number
}

interface CandidatePrint {
  id: string
  name: string
  profession: string
  level: string
  idCard: string
  certNo: string
  issueDate: string
  status: 'pending' | 'printed'
}

type BorderType = 'none' | 'border' | 'photo'

const mockPlans: PrintPlan[] = [
  {
    id: '1', planNo: '21119999660044', name: '2021-04-27年第28批认定', filingOrg: '北京市', site: '北京市', examMonth: '2021年04月', regDeadline: '2021-04-27', status: '--',
    children: [
      { id: 'c1', profession: '道路客运汽车驾驶员', level: '五级/初级工', theoryEnrolled: 0, groupEnrolled: 1 },
    ]
  },
]

const mockCandidates: CandidatePrint[] = [
  { id: '1', name: '张三', profession: '秘书', level: '五级', idCard: '460321191001015633', certNo: 'Y001011999966215000001', issueDate: '2021-04-27', status: 'pending' },
  { id: '2', name: '李四', profession: '秘书', level: '五级', idCard: '460321191001016572', certNo: 'Y001011999966215000002', issueDate: '2021-04-27', status: 'pending' },
  { id: '3', name: '王五', profession: '秘书', level: '五级', idCard: '460321191001015414', certNo: 'Y001011999966215000003', issueDate: '2021-04-27', status: 'pending' },
]

export default function CertificatesPrint() {
  const [plans] = useState<PrintPlan[]>(mockPlans)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [borderType, setBorderType] = useState<BorderType>('border')
  const [printPhoto, setPrintPhoto] = useState(true)
  const [showCandidates, setShowCandidates] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PrintPlan | null>(null)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [candidateList] = useState<CandidatePrint[]>(mockCandidates)

  const filtered = plans.filter(p => !search || p.name.includes(search) || p.planNo.includes(search))

  const handlePrint = () => {
    toast.success(`证书打印完成！边框：${borderType === 'none' ? '无边框' : borderType === 'border' ? '打印边框' : '图文边框'}，${printPhoto ? '打印照片' : '不打印照片'}`)
  }

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const openCandidates = (plan: PrintPlan) => {
    setSelectedPlan(plan)
    setShowCandidates(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">证书打印</h1>

      {/* Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">计划名称</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">证书边框设置：</span>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="border" checked={borderType === 'none'} onChange={() => setBorderType('none')} className="w-4 h-4" />
              <span>不打印边框</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="border" checked={borderType === 'border'} onChange={() => setBorderType('border')} className="w-4 h-4" />
              <span>打印边框</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="border" checked={borderType === 'photo'} onChange={() => setBorderType('photo')} className="w-4 h-4" />
              <span>图文边框</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">是否打印照片：</span>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="photo" checked={!printPhoto} onChange={() => setPrintPhoto(false)} className="w-4 h-4" />
              <span>否</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" name="photo" checked={printPhoto} onChange={() => setPrintPhoto(true)} className="w-4 h-4" />
              <span>是</span>
            </label>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left w-8"></th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划编号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">站点名称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">考试月份</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">报名截止</th>
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
                  <td className="px-3 py-3 text-gray-600">{plan.site}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.examMonth}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.regDeadline}</td>
                  <td className="px-3 py-3 text-gray-500">{plan.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCandidates(plan)} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <Users className="w-3 h-3" />考生
                      </button>
                      <button onClick={() => toast.success('认定已结束')} className="text-blue-600 hover:underline text-xs flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" />结束
                      </button>
                      <button onClick={() => {}} className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === plan.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-3 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="px-3 py-2 text-left">职业工种</th>
                            <th className="px-3 py-2 text-left">技能等级</th>
                            <th className="px-3 py-2 text-left">网报人数</th>
                            <th className="px-3 py-2 text-left">集体报名</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.children.map(child => (
                            <tr key={child.id} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-gray-900">{child.profession}</td>
                              <td className="px-3 py-2"><Badge className="text-[10px] bg-blue-50 text-blue-700">{child.level}</Badge></td>
                              <td className="px-3 py-2 text-gray-600">{child.theoryEnrolled}</td>
                              <td className="px-3 py-2 text-gray-600">{child.groupEnrolled}</td>
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

      {/* Candidate Print Dialog */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>考生证书 - {selectedPlan?.name}</DialogTitle></DialogHeader>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">已选择 {selectedCandidates.length} 人</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedCandidates(candidateList.map(c => c.id))}>
                <CheckCircle className="w-3.5 h-3.5 mr-1" />全选
              </Button>
              <Button size="sm" className="text-xs bg-[#1A56DB]" onClick={handlePrint} disabled={selectedCandidates.length === 0}>
                <Printer className="w-3.5 h-3.5 mr-1" />打印选中
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">选择</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">姓名</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">证件号码</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">证书编号</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidateList.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.id)}
                        onChange={() => toggleSelectCandidate(c.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-3 py-3 text-gray-600">{c.profession}（{c.level}）</td>
                    <td className="px-3 py-3 text-gray-600 font-mono text-xs">{c.idCard}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{c.certNo}</td>
                    <td className="px-3 py-3">
                      <Badge className={`text-[10px] ${c.status === 'printed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status === 'printed' ? '已打印' : '待打印'}
                      </Badge>
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
