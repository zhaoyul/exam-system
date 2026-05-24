import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { TraceTimeline } from '@/components/shared/TraceTimeline'
import { useBackendResourceList } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'
import type { TimelineEvent } from '@/types/traceTimeline'

interface TraceRecord {
  id: string
  name: string
  idType: string
  idNo: string
  certNo: string
  issuer: string
  generatedAt: string
  occupation: string
  level: string
  province: string
}

interface TimelineResponse {
  candidateId: string
  events: TimelineEvent[]
}

interface AuditLogItem {
  id: string
  createdAt: string
  actorId: string
  actorName: string
  action: string
  theoryScore?: { old: number; new: number }
  skillScore?: { old: number; new: number }
  reason?: string
  candidateId: string
  planId: string
}

interface AuditLogResponse {
  candidateId: string
  items: AuditLogItem[]
}

const initialRecords: TraceRecord[] = [
  { id: 'candidate-001', name: '陈小明', idType: '居民身份证', idNo: '440301199001011234', certNo: 'Y0041GD0000012603001001', issuer: '中广核集团', generatedAt: '2026-07-15', occupation: '核反应堆运行值班员', level: '三级/高级工', province: '广东省' },
  { id: 'candidate-002', name: '赵小红', idType: '居民身份证', idNo: '440301199105152345', certNo: 'Y0041GD0000012603001002', issuer: '中广核集团', generatedAt: '2026-07-15', occupation: '核反应堆运行值班员', level: '三级/高级工', province: '广东省' },
  { id: 'candidate-003', name: '刘建国', idType: '居民身份证', idNo: '441700198803203456', certNo: '', issuer: '阳江核电', generatedAt: '--', occupation: '电气试验员', level: '四级/中级工', province: '广东省' },
]

export default function TraceabilityCenter() {
  const records = useBackendResourceList<TraceRecord>('/traceability/cert-records', initialRecords)
  const [query, setQuery] = useState('')
  const [activeProvince, setActiveProvince] = useState('全部')
  const [activeMode, setActiveMode] = useState<'认定' | '申报'>('认定')
  const [active, setActive] = useState<TraceRecord | null>(null)
  const [dialog, setDialog] = useState<'process' | 'score' | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [auditHasData, setAuditHasData] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => records.filter(record => {
    const byProvince = activeProvince === '全部' || record.province === activeProvince
    const byQuery = !query || record.name.includes(query) || record.certNo.includes(query) || record.idNo.includes(query)
    return byProvince && byQuery
  }), [activeProvince, query, records])

  const provinceStats = [
    { label: '全部', count: records.length },
    { label: '广东省', count: records.filter(item => item.province === '广东省').length },
    { label: '广西壮族自治区', count: records.filter(item => item.province === '广西壮族自治区').length },
  ]

  const openProcessDialog = useCallback(async (record: TraceRecord) => {
    setActive(record)
    setDialog('process')
    setTimelineLoading(true)
    try {
      const data = await apiRequest<TimelineResponse>(`/traceability/timeline/${encodeURIComponent(record.id)}`)
      setTimelineEvents(data.events || [])
    } catch {
      setTimelineEvents([])
    } finally {
      setTimelineLoading(false)
    }
  }, [])

  const openScoreDialog = useCallback(async (record: TraceRecord) => {
    setActive(record)
    setDialog('score')
    if (auditHasData[record.id]) {
      try {
        const data = await apiRequest<AuditLogResponse>(`/traceability/audit-logs/${encodeURIComponent(record.id)}`)
        setAuditLogs(data.items || [])
      } catch {
        setAuditLogs([])
      }
    }
  }, [auditHasData])

  // Check which candidates have audit logs on mount
  useEffect(() => {
    const checkAuditLogs = async () => {
      const hasData: Record<string, boolean> = {}
      await Promise.all(records.map(async (record) => {
        try {
          const data = await apiRequest<AuditLogResponse>(`/traceability/audit-logs/${encodeURIComponent(record.id)}`)
          hasData[record.id] = (data.items && data.items.length > 0) || false
        } catch {
          hasData[record.id] = false
        }
      }))
      setAuditHasData(prev => ({ ...prev, ...hasData }))
    }
    checkAuditLogs()
  }, [records])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">溯源中心</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">姓　　名</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <span className="text-sm text-gray-600">机构：全部</span>
          <div className="flex gap-2">
            {(['认定', '申报'] as const).map(mode => <button key={mode} onClick={() => setActiveMode(mode)} className={`h-8 rounded-md px-3 text-xs ${activeMode === mode ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{mode}</button>)}
          </div>
        </div>

        <div className="grid grid-cols-[220px_1fr]">
          <aside className="border-r border-gray-100 p-3">
            <div className="mb-3 text-sm font-medium text-gray-700">备案地</div>
            {provinceStats.map((item, index) => (
              <button key={item.label} onClick={() => setActiveProvince(item.label)} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm ${activeProvince === item.label ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + (index > 0 ? 18 : 0) }}>
                {item.label} ({item.count}个)
              </button>
            ))}
          </aside>
          <div className="overflow-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">姓名</th>
                  <th className="px-4 py-3 text-left font-medium">证件类型</th>
                  <th className="px-4 py-3 text-left font-medium">证件号码</th>
                  <th className="px-4 py-3 text-left font-medium">证书编号</th>
                  <th className="px-4 py-3 text-left font-medium">发证单位</th>
                  <th className="px-4 py-3 text-left font-medium">生成时间</th>
                  <th className="px-4 py-3 text-left font-medium">职业工种</th>
                  <th className="px-4 py-3 text-left font-medium">技能等级</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.name}</td>
                    <td className="px-4 py-3 text-gray-600">{record.idType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{record.idNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{record.certNo || '--'}</td>
                    <td className="px-4 py-3 text-gray-600">{record.issuer}</td>
                    <td className="px-4 py-3 text-gray-600">{record.generatedAt}</td>
                    <td className="px-4 py-3 text-gray-600">{record.occupation}</td>
                    <td className="px-4 py-3 text-gray-600">{record.level}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => openProcessDialog(record)} className="text-[#1A56DB] hover:underline">认定过程</button>
                        <button
                          onClick={() => auditHasData[record.id] ? openScoreDialog(record) : undefined}
                          className={auditHasData[record.id] ? 'text-[#1A56DB] hover:underline cursor-pointer' : 'text-gray-400 cursor-default'}
                          disabled={!auditHasData[record.id]}
                        >
                          修改成绩记录
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据　1　20 条/页</div>
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'process'} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>认定过程 — {active?.name}</DialogTitle></DialogHeader>
          {timelineLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <TraceTimeline events={timelineEvents} className="py-2" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'score'} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>修改成绩记录</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Info label="姓名" value={active?.name || ''} />
            <Info label="证件号码" value={active?.idNo || ''} />
            <Info label="证书编号" value={active?.certNo || '--'} />
            {auditLogs.length > 0 ? (
              <div className="space-y-2 mt-3">
                <div className="text-sm font-medium text-gray-700">修改记录：</div>
                {auditLogs.map((log) => (
                  <div key={log.id} className="rounded-md border border-gray-100 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{log.createdAt}</span>
                      <Badge variant="outline" className="text-xs">{log.actorName}</Badge>
                    </div>
                    {log.theoryScore && (
                      <div className="text-xs text-gray-700">
                        理论成绩: <span className="line-through text-gray-400">{log.theoryScore.old}</span> → <span className="text-blue-600 font-medium">{log.theoryScore.new}</span>
                      </div>
                    )}
                    {log.skillScore && (
                      <div className="text-xs text-gray-700">
                        技能成绩: <span className="line-through text-gray-400">{log.skillScore.old}</span> → <span className="text-blue-600 font-medium">{log.skillScore.new}</span>
                      </div>
                    )}
                    {log.reason && (
                      <div className="text-xs text-gray-500">修改理由: {log.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-gray-100 p-4 text-center text-sm text-gray-400">
                暂无成绩修改记录
              </div>
            )}
            <div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('记录已确认') }}>确定</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
