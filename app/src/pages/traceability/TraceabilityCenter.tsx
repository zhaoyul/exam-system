import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  ChevronRight,
  Clock3,
  Download,
  FileArchive,
  FileText,
  Link2,
  MapPin,
  RotateCcw,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { findTraceCase, stageOrder, traceAlerts, traceCases, type TraceCase, type TraceStage, type TraceStageKey, type TraceStatus } from './traceabilityData'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

const stageIcons: Record<TraceStageKey, typeof FileText> = {
  plan: FileText,
  register: UserCheck,
  arrange: MapPin,
  execute: Clock3,
  score: FileText,
  cert: Award,
  archive: FileArchive,
}

const statusClass: Record<TraceStatus, string> = {
  已完成: 'bg-green-50 text-green-700',
  进行中: 'bg-blue-50 text-blue-700',
  待处理: 'bg-gray-100 text-gray-600',
  异常: 'bg-red-50 text-red-700',
}

export default function TraceabilityCenter() {
  const [params] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState<'全部' | TraceCase['traceType']>('全部')
  const [activeStatus, setActiveStatus] = useState<'全部' | TraceStatus>('全部')
  const [selected, setSelected] = useState<TraceCase | null>(initialQuery ? findTraceCase(initialQuery) : traceCases[0])
  const [searched, setSearched] = useState(Boolean(initialQuery))
  const [viewStage, setViewStage] = useState<TraceStage | null>(null)
  const [alertDialog, setAlertDialog] = useState(false)
  const [cases] = useBackendListState<TraceCase>(traceCases)
  const alerts = useBackendResourceList('/traceability/alerts', traceAlerts)

  const findCase = (value: string) => cases.find(item =>
    [item.traceNo, item.candidateName, item.idCard, item.certNo, item.ticketNo, item.planName].some(field => field.includes(value)),
  ) || null

  useEffect(() => {
    if (!selected && cases.length) setSelected(initialQuery ? findCase(initialQuery) : cases[0])
  }, [cases, initialQuery, selected])

  const filteredCases = useMemo(() => cases.filter(item => {
    const byType = activeType === '全部' || item.traceType === activeType
    const byStatus = activeStatus === '全部' || item.status === activeStatus
    const byQuery = !query || [item.traceNo, item.candidateName, item.idCard, item.certNo, item.ticketNo, item.planName].some(value => value.includes(query))
    return byType && byStatus && byQuery
  }), [activeStatus, activeType, cases, query])

  const runSearch = () => {
    setSearched(true)
    const result = findCase(query)
    if (result) setSelected(result)
    else setSelected(null)
  }

  const reset = () => {
    setQuery('')
    setActiveType('全部')
    setActiveStatus('全部')
    setSelected(cases[0] || null)
    setSearched(false)
  }

  const exportReport = () => {
    if (!selected) return
    const content = [
      `溯源编号：${selected.traceNo}`,
      `考生：${selected.candidateName} ${selected.idCard}`,
      `认定计划：${selected.planName}`,
      `证书编号：${selected.certNo}`,
      '',
      ...selected.stages.map(stage => `${stage.date} | ${stage.name} | ${stage.status} | ${stage.org} | ${stage.operator} | ${stage.detail}${stage.exception ? ` | 异常：${stage.exception}` : ''}`),
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `溯源报告_${selected.traceNo}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('溯源报告已导出')
  }

  const stageStats = selected ? {
    total: selected.stages.length,
    completed: selected.stages.filter(item => item.status === '已完成').length,
    pending: selected.stages.filter(item => item.status === '待处理' || item.status === '进行中').length,
    abnormal: selected.stages.filter(item => item.status === '异常').length,
  } : { total: 0, completed: 0, pending: 0, abnormal: 0 }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Link2 className="h-5 w-5 text-[#1A56DB]" />溯源查询</h1>
          <p className="mt-1 text-sm text-gray-500">按身份证号、证书编号、准考证号、溯源编号或计划名称追踪认定全流程</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAlertDialog(true)}><ShieldAlert className="mr-2 h-4 w-4" />异常处理</Button>
          <Button variant="outline" onClick={exportReport} disabled={!selected}><Download className="mr-2 h-4 w-4" />导出报告</Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && runSearch()} placeholder="身份证号 / 证书编号 / 准考证号 / 溯源编号 / 姓名 / 计划名称" className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button onClick={runSearch} className="h-10 bg-[#1A56DB] hover:bg-[#1748B5]">查询</Button>
          <Button onClick={reset} variant="outline" className="h-10"><RotateCcw className="h-4 w-4" /></Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {['440301199001011234', 'CGN-2026-001', 'TR-2026-0003'].map(item => <button key={item} onClick={() => { setQuery(item); setSelected(findCase(item)) }} className="rounded border border-gray-200 px-2 py-1 text-gray-600 hover:border-[#1A56DB] hover:text-[#1A56DB]">{item}</button>)}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {(['全部', '证书溯源', '人员溯源', '认定溯源'] as const).map(item => <button key={item} onClick={() => setActiveType(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${activeType === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {(['全部', '已完成', '进行中', '待处理', '异常'] as const).map(item => <button key={item} onClick={() => setActiveStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${activeStatus === item ? 'border border-[#1A56DB] text-[#1A56DB]' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>)}
              </div>
            </div>
            <div className="max-h-[620px] overflow-auto p-2">
              {filteredCases.map(item => <button key={item.id} onClick={() => { setSelected(item); setSearched(true) }} className={`mb-2 w-full rounded-md border p-3 text-left ${selected?.id === item.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}><div className="flex items-center justify-between gap-2"><span className="font-medium text-gray-900">{item.candidateName}</span><Badge className={statusClass[item.status]}>{item.status}</Badge></div><div className="mt-1 text-xs text-gray-500">{item.traceNo} / {item.certNo}</div><div className="mt-1 text-xs text-gray-500">{item.occupation} · {item.level}</div></button>)}
            </div>
          </section>
        </aside>

        <main className="space-y-4">
          {selected ? (
            <>
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{selected.candidateName} - {selected.occupation}</h2>
                      <Badge className={statusClass[selected.status]}>{selected.status}</Badge>
                      <Badge className="bg-blue-50 text-blue-700">{selected.traceType}</Badge>
                    </div>
                    <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-gray-600 md:grid-cols-2">
                      <span>身份证号：{selected.idCard}</span>
                      <span>证书编号：{selected.certNo}</span>
                      <span>准考证号：{selected.ticketNo}</span>
                      <span>评价机构：{selected.org}</span>
                      <span className="md:col-span-2">认定计划：{selected.planName}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <Metric label="环节" value={stageStats.total} />
                    <Metric label="完成" value={stageStats.completed} />
                    <Metric label="待处理" value={stageStats.pending} />
                    <Metric label="异常" value={stageStats.abnormal} tone="red" />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between"><div className="font-semibold text-gray-900">全过程追溯链条</div><div className="text-xs text-gray-500">评价计划 → 考生报名 → 考场安排 → 组织实施 → 成绩管理 → 证书颁发 → 档案归档</div></div>
                <div className="grid gap-2 lg:grid-cols-7">
                  {stageOrder.map(order => {
                    const stage = selected.stages.find(item => item.key === order.key)
                    const Icon = stageIcons[order.key]
                    return <button key={order.key} onClick={() => stage && setViewStage(stage)} className={`rounded-md border p-3 text-left ${stage?.status === '已完成' ? 'border-green-200 bg-green-50' : stage?.status === '异常' ? 'border-red-200 bg-red-50' : stage?.status === '进行中' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}><Icon className={`mb-2 h-5 w-5 ${stage?.status === '异常' ? 'text-red-600' : stage?.status === '已完成' ? 'text-green-600' : 'text-[#1A56DB]'}`} /><div className="text-sm font-medium text-gray-900">{order.label}</div><div className="mt-1 text-xs text-gray-500">{stage?.status || '待处理'}</div></button>
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 p-4 font-semibold text-gray-900">环节日志</div>
                <div className="divide-y divide-gray-100">
                  {selected.stages.map(stage => {
                    const Icon = stageIcons[stage.key]
                    return <button key={stage.id} onClick={() => setViewStage(stage)} className="grid w-full grid-cols-[36px_1fr_120px] items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"><div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${statusClass[stage.status]}`}><Icon className="h-4 w-4" /></div><div><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-gray-900">{stage.name}</span><Badge className={statusClass[stage.status]}>{stage.status}</Badge>{stage.exception && <Badge className="bg-red-50 text-red-700">异常标记</Badge>}</div><div className="mt-1 text-sm text-gray-500">{stage.detail}</div>{stage.exception && <div className="mt-1 text-sm text-red-600">异常说明：{stage.exception}</div>}<div className="mt-1 text-xs text-gray-400">{stage.businessNo} / {stage.dataSource} / {stage.material}</div></div><div className="text-right text-xs text-gray-500">{stage.date}<ChevronRight className="ml-auto mt-2 h-4 w-4" /></div></button>
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <div className="text-sm text-gray-600">{searched ? '未找到匹配的认定溯源记录' : '请输入查询条件或选择左侧记录'}</div>
            </section>
          )}
        </main>
      </div>

      <Dialog open={!!viewStage} onOpenChange={() => setViewStage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>环节详情</DialogTitle></DialogHeader>
          {viewStage && <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3"><Info label="环节名称" value={viewStage.name} /><Info label="业务编号" value={viewStage.businessNo} /><Info label="处理时间" value={viewStage.date} /><Info label="处理机构" value={viewStage.org} /><Info label="操作人" value={viewStage.operator} /><Info label="数据来源" value={viewStage.dataSource} /></div>
            <Info label="关联材料" value={viewStage.material} />
            <Info label="处理说明" value={viewStage.detail} />
            {viewStage.exception && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-red-700"><div className="text-xs">异常说明</div><div className="font-medium">{viewStage.exception}</div></div>}
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={alertDialog} onOpenChange={setAlertDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>异常处理</DialogTitle></DialogHeader>
          <div className="space-y-2">{alerts.map(item => <div key={item.id} className="grid grid-cols-[1fr_80px_80px] items-center gap-3 rounded-md border border-gray-100 px-3 py-2 text-sm"><div><div className="font-medium text-gray-900">{item.candidateName} / {item.traceNo} / {item.stage}</div><div className="text-xs text-gray-500">{item.org}：{item.problem}</div></div><Badge className={item.level === '高' ? 'bg-red-50 text-red-700' : item.level === '中' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}>{item.level}</Badge><Button size="sm" variant="outline" onClick={() => toast.success('异常处理状态已更新')}>{item.status}</Button></div>)}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Metric({ label, value, tone = 'blue' }: { label: string; value: number; tone?: 'blue' | 'red' }) {
  return <div className="min-w-16 rounded-md border border-gray-100 px-3 py-2"><div className={`text-xl font-bold ${tone === 'red' ? 'text-red-600' : 'text-[#1A56DB]'}`}>{value}</div><div className="text-xs text-gray-500">{label}</div></div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-[#F9FAFB] px-3 py-2"><div className="text-xs text-gray-500">{label}</div><div className="font-medium text-gray-900">{value}</div></div>
}
