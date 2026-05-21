import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Award, BarChart3, CheckCircle2, FileSearch, Link2, Search, ShieldAlert, TrendingUp, User, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { stageOrder, traceAlerts, traceCases, traceSummary } from '@/pages/traceability/traceabilityData'
import { useBackendResourceList } from '@/hooks/useBackendListState'

const summary = traceSummary()

export default function TraceabilityWorkbench() {
  const navigate = useNavigate()
  const backendTraceCases = useBackendResourceList('/traceability/cases', traceCases)
  const backendTraceAlerts = useBackendResourceList('/traceability/alerts', traceAlerts)
  const backendOrgStats = Object.values(backendTraceCases.reduce<Record<string, { name: string; total: number; complete: number; abnormal: number }>>((acc, item) => {
    const key = item.org || '未分组机构'
    const current = acc[key] || { name: key, total: 0, complete: 0, abnormal: 0 }
    current.total += 1
    current.complete += item.status === '已完成' ? 100 : 80
    current.abnormal += item.status === '异常' ? 1 : 0
    acc[key] = current
    return acc
  }, {}))
  const [query, setQuery] = useState('')
  const quickSearch = () => {
    const match = backendTraceCases.find(item => [item.traceNo, item.candidateName, item.idCard, item.certNo].some(value => value.includes(query)))
    navigate(match ? `/traceability?q=${encodeURIComponent(query)}` : '/traceability')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">溯源中心</h1>
          <p className="mt-1 text-sm text-gray-500">对认定计划、报名、考场、实施、成绩、证书和归档进行全过程追溯</p>
        </div>
        <Button onClick={() => navigate('/traceability')} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Link2 className="mr-2 h-4 w-4" />进入溯源查询</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="追溯记录总数" value={summary.records.toLocaleString()} icon={FileSearch} tone="blue" />
        <Stat label="本月追溯" value={summary.thisMonth.toLocaleString()} icon={TrendingUp} tone="green" />
        <Stat label="链路完整率" value={`${summary.completeRate}%`} icon={CheckCircle2} tone="indigo" />
        <Stat label="待处理异常" value={summary.alerts.toString()} icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Workflow className="h-4 w-4 text-[#1A56DB]" />全流程节点覆盖</div>
            <Badge className="bg-blue-50 text-blue-700">7 个关键环节</Badge>
          </div>
          <div className="grid grid-cols-7 gap-2 p-4">
            {stageOrder.map((stage, index) => <button key={stage.key} onClick={() => navigate('/traceability')} className="rounded-md border border-gray-200 bg-[#F9FAFB] p-3 text-left hover:border-[#1A56DB] hover:bg-blue-50"><div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1A56DB]">{index + 1}</div><div className="text-sm font-medium text-gray-900">{stage.label}</div><div className="mt-1 text-xs text-gray-500">日志、材料、人员</div></button>)}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><ShieldAlert className="h-4 w-4 text-[#1A56DB]" />快速溯源查询</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && quickSearch()} placeholder="身份证号 / 证书编号 / 溯源编号" className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/traceability')}><Award className="mr-1 h-3.5 w-3.5" />证书</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/traceability')}><User className="mr-1 h-3.5 w-3.5" />人员</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/traceability')}><FileSearch className="mr-1 h-3.5 w-3.5" />认定</Button>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-4 font-semibold text-gray-900">最近追溯记录</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">溯源编号</th><th className="px-4 py-3 text-left font-medium">考生</th><th className="px-4 py-3 text-left font-medium">证书编号</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">机构</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{backendTraceCases.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-gray-600">{item.traceNo}</td><td className="px-4 py-3 font-medium text-gray-900">{item.candidateName}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{item.certNo}</td><td className="px-4 py-3 text-gray-600">{item.traceType}</td><td className="px-4 py-3 text-gray-600">{item.org}</td><td className="px-4 py-3"><Badge className={item.status === '已完成' ? 'bg-green-50 text-green-700' : item.status === '异常' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}>{item.status}</Badge></td><td className="px-4 py-3"><button onClick={() => navigate(`/traceability?q=${encodeURIComponent(item.traceNo)}`)} className="text-xs text-[#1A56DB] hover:underline">查看 <ArrowRight className="inline h-3.5 w-3.5" /></button></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><BarChart3 className="h-4 w-4 text-[#1A56DB]" />各单位追溯质量</div>
            <div className="space-y-3">{backendOrgStats.map(item => <div key={item.name}><div className="mb-1 flex items-center justify-between text-sm"><span>{item.name}</span><span className="text-xs text-gray-500">{item.total.toLocaleString()} 条 / 异常 {item.abnormal}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${item.complete}%` }} /></div></div>)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><AlertTriangle className="h-4 w-4 text-red-600" />异常记录</div>
            <div className="space-y-2">{backendTraceAlerts.map(item => <button key={item.id} onClick={() => navigate(`/traceability?q=${encodeURIComponent(item.traceNo)}`)} className="w-full rounded-md border border-gray-100 px-3 py-2 text-left hover:bg-gray-50"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900">{item.candidateName} / {item.stage}</span><Badge className={item.level === '高' ? 'bg-red-50 text-red-700' : item.level === '中' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}>{item.level}</Badge></div><div className="mt-1 text-xs text-gray-500">{item.problem}</div></button>)}</div>
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: 'blue' | 'green' | 'indigo' | 'red' }) {
  const color = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', indigo: 'bg-indigo-50 text-indigo-700', red: 'bg-red-50 text-red-700' }[tone]
  return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><div><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div><div className={`rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div></div></div>
}
