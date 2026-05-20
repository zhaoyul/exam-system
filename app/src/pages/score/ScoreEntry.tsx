import { useMemo, useState } from 'react'
import { Search, Save, CheckCircle, Edit3, Upload, Download, AlertTriangle, FileCheck2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type ScoreStatus = '待录入' | '已录入' | '待复核' | '已提交' | '异常'

interface ScoreCandidate {
  id: string
  planName: string
  ticketNo: string
  name: string
  idCard: string
  occupation: string
  level: string
  theory: number
  skill: number
  comprehensive: number
  status: ScoreStatus
  abnormalReason: string
}

const initialCandidates: ScoreCandidate[] = [
  { id: '1', planName: '20220412第3批认定', ticketNo: '220412010001', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级/高级工', theory: 85, skill: 88, comprehensive: 0, status: '已录入', abnormalReason: '' },
  { id: '2', planName: '20220412第3批认定', ticketNo: '220412010002', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级/中级工', theory: 78, skill: 82, comprehensive: 0, status: '待复核', abnormalReason: '' },
  { id: '3', planName: '20220412第3批认定', ticketNo: '220412010003', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级/高级工', theory: 92, skill: 90, comprehensive: 0, status: '已录入', abnormalReason: '' },
  { id: '4', planName: '20220412第3批认定', ticketNo: '220412010004', name: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级/技师', theory: 0, skill: 0, comprehensive: 0, status: '待录入', abnormalReason: '' },
  { id: '5', planName: '20220412第3批认定', ticketNo: '220412010005', name: '孙七', idCard: '440301199005055678', occupation: '焊接工', level: '五级/初级工', theory: 65, skill: 70, comprehensive: 0, status: '异常', abnormalReason: '技能成绩低于合格线，需要复核原始记录' },
]

const statusColor: Record<ScoreStatus, string> = {
  待录入: 'bg-amber-50 text-amber-700',
  已录入: 'bg-blue-50 text-blue-700',
  待复核: 'bg-purple-50 text-purple-700',
  已提交: 'bg-green-50 text-green-700',
  异常: 'bg-red-50 text-red-700',
}

export default function ScoreEntry() {
  const [items, setItems] = useBackendListState(initialCandidates)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('全部计划')
  const [statusFilter, setStatusFilter] = useState<'全部' | ScoreStatus>('全部')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTheory, setEditTheory] = useState('')
  const [editSkill, setEditSkill] = useState('')
  const [editComprehensive, setEditComprehensive] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showReview, setShowReview] = useState<ScoreCandidate | null>(null)

  const plans = useMemo(() => ['全部计划', ...Array.from(new Set(items.map(i => i.planName)))], [items])
  const filtered = items.filter(i => {
    const bySearch = !search || i.name.includes(search) || i.idCard.includes(search) || i.ticketNo.includes(search)
    const byPlan = planFilter === '全部计划' || i.planName === planFilter
    const byStatus = statusFilter === '全部' || i.status === statusFilter
    return bySearch && byPlan && byStatus
  })

  const passCount = items.filter(i => i.theory >= 60 && i.skill >= 60 && (i.comprehensive === 0 || i.comprehensive >= 60)).length

  const startEdit = (item: ScoreCandidate) => {
    setEditingId(item.id)
    setEditTheory(String(item.theory || ''))
    setEditSkill(String(item.skill || ''))
    setEditComprehensive(String(item.comprehensive || ''))
  }

  const saveEdit = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? {
      ...item,
      theory: Number(editTheory) || 0,
      skill: Number(editSkill) || 0,
      comprehensive: Number(editComprehensive) || 0,
      status: '已录入' as ScoreStatus,
      abnormalReason: '',
    } : item))
    setEditingId(null)
    toast.success('成绩已保存')
  }

  const submitAll = () => {
    setItems(prev => prev.map(item => item.status === '异常' ? item : { ...item, status: '已提交' as ScoreStatus }))
    toast.success('成绩已提交审核')
  }

  const markReviewDone = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: '已录入' as ScoreStatus, abnormalReason: '' } : item))
    setShowReview(null)
    toast.success('复核结果已确认')
  }

  const totalScore = (item: ScoreCandidate) => {
    if (!item.theory || !item.skill) return '-'
    const base = item.comprehensive ? item.theory * 0.3 + item.skill * 0.5 + item.comprehensive * 0.2 : item.theory * 0.4 + item.skill * 0.6
    return base.toFixed(1)
  }

  const isPass = (item: ScoreCandidate) => item.theory >= 60 && item.skill >= 60 && (item.comprehensive === 0 || item.comprehensive >= 60)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">成绩管理</h1>
          <p className="text-sm text-gray-500 mt-1">录入理论、技能和综合评审成绩，完成复核后提交成绩审核</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}><Upload className="w-4 h-4 mr-2" />导入成绩</Button>
          <Button variant="outline" onClick={() => toast.success('成绩表已导出')}><Download className="w-4 h-4 mr-2" />导出成绩</Button>
          <Button onClick={submitAll} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />提交审核</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '考生总数', value: `${items.length} 人`, className: 'text-gray-900' },
          { label: '合格人数', value: `${passCount} 人`, className: 'text-green-700' },
          { label: '待录入', value: `${items.filter(i => i.status === '待录入').length} 人`, className: 'text-amber-700' },
          { label: '异常成绩', value: `${items.filter(i => i.status === '异常').length} 人`, className: 'text-red-700' },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`mt-1 text-2xl font-bold ${card.className}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
          {plans.map(plan => <option key={plan}>{plan}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
          {(['全部', '待录入', '已录入', '待复核', '已提交', '异常'] as const).map(status => <option key={status}>{status}</option>)}
        </select>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名 / 证件号码 / 准考证号" className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-72 focus:outline-none focus:border-[#1A56DB]" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">序号</th>
              <th className="px-4 py-3 text-left">准考证号</th>
              <th className="px-4 py-3 text-left">姓名</th>
              <th className="px-4 py-3 text-left">身份证号</th>
              <th className="px-4 py-3 text-left">职业(工种)</th>
              <th className="px-4 py-3 text-left">等级</th>
              <th className="px-4 py-3 text-right">理论成绩</th>
              <th className="px-4 py-3 text-right">技能成绩</th>
              <th className="px-4 py-3 text-right">综合评审</th>
              <th className="px-4 py-3 text-right">总分</th>
              <th className="px-4 py-3 text-left">结果</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.ticketNo}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{item.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.level}</span></td>
                <td className="px-4 py-3 text-right">{editingId === item.id ? <input type="number" value={editTheory} onChange={e => setEditTheory(e.target.value)} className="w-16 h-8 border border-gray-200 rounded-md text-sm text-center" /> : <span className={item.theory >= 60 ? 'text-gray-900' : 'text-red-600'}>{item.theory || '-'}</span>}</td>
                <td className="px-4 py-3 text-right">{editingId === item.id ? <input type="number" value={editSkill} onChange={e => setEditSkill(e.target.value)} className="w-16 h-8 border border-gray-200 rounded-md text-sm text-center" /> : <span className={item.skill >= 60 ? 'text-gray-900' : 'text-red-600'}>{item.skill || '-'}</span>}</td>
                <td className="px-4 py-3 text-right">{editingId === item.id ? <input type="number" value={editComprehensive} onChange={e => setEditComprehensive(e.target.value)} className="w-16 h-8 border border-gray-200 rounded-md text-sm text-center" /> : <span>{item.comprehensive || '-'}</span>}</td>
                <td className="px-4 py-3 text-right font-medium">{totalScore(item)}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-[10px] ${isPass(item) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isPass(item) ? '合格' : '不合格'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColor[item.status]}`}>{item.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <button onClick={() => saveEdit(item.id)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={() => startEdit(item)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    )}
                    <button onClick={() => setShowReview(item)} className="text-blue-600 hover:underline text-xs">复核</button>
                    {item.status === '异常' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入成绩</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => toast.success('成绩导入模板已下载')}><Download className="w-4 h-4 mr-2" />下载模板</Button>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传理论、技能或综合评审成绩 Excel</p>
              <p className="text-xs text-gray-400 mt-1">系统按准考证号匹配并覆盖成绩</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>取消</Button>
            <Button onClick={() => { setShowImport(false); toast.success('成绩导入完成') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showReview} onOpenChange={() => setShowReview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>成绩复核</DialogTitle></DialogHeader>
          {showReview && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-gray-50 p-3">考生：{showReview.name}（{showReview.ticketNo}）</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border p-3">理论：{showReview.theory || '-'}</div>
                <div className="rounded-md border p-3">技能：{showReview.skill || '-'}</div>
                <div className="rounded-md border p-3">综合：{showReview.comprehensive || '-'}</div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
                {showReview.abnormalReason || '复核无异常，可确认成绩。'}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(null)}><RotateCcw className="w-4 h-4 mr-1" />返回</Button>
            {showReview && <Button onClick={() => markReviewDone(showReview.id)}><FileCheck2 className="w-4 h-4 mr-1" />确认复核</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
