import { useMemo, useState, useEffect } from 'react'
import { Search, Eye, Download, Calendar, History, Lock, Unlock, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'
import { toast } from 'sonner'

interface PublicityStatusInfo {
  status: string
  label: string
  planId?: string
  publicityStart?: string
  publicityEnd?: string
  publicityDays?: number
}

// ─── Types ───

interface PublicityScore {
  id: string
  candidateId: string
  candidateName: string
  code: string
  planId: string
  planName?: string
  occupation?: string
  level?: string
  idCard?: string
  theoryScore: number | null
  skillScore: number | null
  totalScore: number | null
  status: string
  updatedAt?: string
}

interface AuditLogEntry {
  id: string
  actorId: string
  action: string
  resource: string
  resourceId: string
  payload: {
    candidate_id?: string
    plan_id?: string
    subject_type?: string
    old_score?: number
    new_score?: number
    reason?: string
    theory_score?: number
    skill_score?: number
  }
  createdAt: string
}

const initialTemplate: PublicityScore[] = []

// ─── Component ───

export default function ScorePublicity() {
  const [items] = useBackendListState<PublicityScore>(initialTemplate)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('全部计划')
  const [viewItem, setViewItem] = useState<PublicityScore | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [showAuditLogs, setShowAuditLogs] = useState(false)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [publicityStatuses, setPublicityStatuses] = useState<Record<string, PublicityStatusInfo>>({})

  // ─── Fetch publicity status per plan ───

  const planIds = useMemo(() => Array.from(new Set(items.map(i => i.planId).filter(Boolean))), [items])

  useEffect(() => {
    if (planIds.length === 0) return
    Promise.all(
      planIds.map(async (planId) => {
        try {
          const res = await apiRequest<PublicityStatusInfo>(`/score/publicity-status/${encodeURIComponent(planId)}`)
          return { planId, status: res }
        } catch {
          return { planId, status: { status: 'none', label: '未配置公示' } as PublicityStatusInfo }
        }
      })
    ).then((results) => {
      const map: Record<string, PublicityStatusInfo> = {}
      results.forEach(({ planId, status }) => { map[planId] = status })
      setPublicityStatuses(map)
    }).catch(() => {})
  }, [planIds])

  const getPubStatus = (planId?: string): PublicityStatusInfo => {
    if (!planId) return { status: 'none', label: '未配置公示' }
    return publicityStatuses[planId] || { status: 'none', label: '未配置公示' }
  }

  const plans = useMemo(() => {
    const names = Array.from(new Set(items.map(i => i.planName).filter(Boolean)))
    return ['全部计划', ...names]
  }, [items])

  const filtered = useMemo(() => items.filter(i => {
    const bySearch = !search || (i.candidateName || '').includes(search) || (i.code || '').includes(search) || (i.idCard || '').includes(search)
    const byPlan = planFilter === '全部计划' || i.planName === planFilter
    return bySearch && byPlan
  }), [items, search, planFilter])

  const stats = useMemo(() => {
    const byPlan: Record<string, { total: number; pass: number; fail: number }> = {}
    items.forEach(i => {
      const pn = i.planName || '未知计划'
      if (!byPlan[pn]) byPlan[pn] = { total: 0, pass: 0, fail: 0 }
      byPlan[pn].total++
      const t = i.theoryScore ?? 0
      const s = i.skillScore ?? 0
      if (t >= 60 && s >= 60) byPlan[pn].pass++
      else byPlan[pn].fail++
    })
    return byPlan
  }, [items])

  const isPass = (item: PublicityScore) => (item.theoryScore ?? 0) >= 60 && (item.skillScore ?? 0) >= 60

  const total = (item: PublicityScore) => {
    if (item.totalScore != null) return item.totalScore.toFixed(1)
    const t = item.theoryScore ?? 0
    const s = item.skillScore ?? 0
    return (t * 0.4 + s * 0.6).toFixed(1)
  }

  const fetchAuditLogs = async (item: PublicityScore) => {
    setLoadingAudit(true)
    try {
      const res = await apiRequest<AuditLogEntry[] | { items: AuditLogEntry[] }>(
        `/score/audit-logs?resource-id=${encodeURIComponent(item.id)}&candidate-id=${encodeURIComponent(item.candidateId)}`
      )
      const logs = Array.isArray(res) ? res : (res as { items: AuditLogEntry[] }).items || []
      setAuditLogs(logs)
      setShowAuditLogs(true)
    } catch {
      setAuditLogs([])
      setShowAuditLogs(true)
    } finally {
      setLoadingAudit(false)
    }
  }

  const pubLabelMeta: Record<string, { label: string; color: string }> = {
    pending:     { label: '待公示', color: 'bg-slate-50 text-slate-500' },
    publicizing: { label: '可修改', color: 'bg-amber-50 text-amber-700' },
    expired:     { label: '已结束', color: 'bg-gray-100 text-gray-500' },
    locked:      { label: '已锁定', color: 'bg-gray-100 text-gray-500' },
    none:        { label: '未配置', color: 'bg-gray-50 text-gray-400' },
  }

  const handleLock = async (planId: string) => {
    try {
      await apiRequest(`/score/scoring/${planId}/lock`, { method: 'POST' })
      toast.success('公示期已结束，成绩已锁定')
      // Refresh publicity status
      try {
        const res = await apiRequest<PublicityStatusInfo>(`/score/publicity-status/${encodeURIComponent(planId)}`)
        setPublicityStatuses(prev => ({ ...prev, [planId]: res }))
      } catch { /* ignore */ }
    } catch { toast.error('锁定失败') }
  }

  const handleUnlock = async (planId: string) => {
    try {
      await apiRequest(`/score/scoring/${planId}/unlock`, { method: 'POST' })
      toast.success('成绩已解锁，可在公示期修改')
      try {
        const res = await apiRequest<PublicityStatusInfo>(`/score/publicity-status/${encodeURIComponent(planId)}`)
        setPublicityStatuses(prev => ({ ...prev, [planId]: res }))
      } catch { /* ignore */ }
    } catch { toast.error('解锁失败') }
  }

  const formatTime = (ts?: string) => {
    if (!ts) return '-'
    try {
      return new Date(ts).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch { return ts }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">成绩公示</h1>
          <p className="text-sm text-gray-500 mt-1">按计划批次展示成绩，公示期支持在线修改</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('公示名单已导出')}>
            <Download className="w-4 h-4 mr-1" />导出公示名单
          </Button>
        </div>
      </div>

      {/* Plan batch summary cards */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(stats).map(([planName, s]) => {
            const planId = items.find(i => i.planName === planName)?.planId
            const ps = getPubStatus(planId)
            const pubMeta = pubLabelMeta[ps.status] || pubLabelMeta.none
            return (
            <div key={planName} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-900 truncate flex-1">{planName}</div>
                <Badge className={`text-[10px] ${pubMeta.color}`}>{pubMeta.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div><span className="text-xs text-gray-500">考生</span><p className="text-lg font-bold text-gray-900">{s.total}</p></div>
                <div><span className="text-xs text-gray-500">合格</span><p className="text-lg font-bold text-green-600">{s.pass}</p></div>
                <div><span className="text-xs text-gray-500">不合格</span><p className="text-lg font-bold text-red-600">{s.fail}</p></div>
              </div>
              {ps.publicityStart && ps.publicityEnd && (
                <div className="text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-0.5" />
                  {ps.publicityStart?.slice(0, 10)} ~ {ps.publicityEnd?.slice(0, 10)}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleLock(planId || planName)} disabled={ps.status === 'locked' || ps.status === 'expired' || ps.status === 'none'} className="h-7 text-xs"><Lock className="w-3 h-3 mr-1" />锁定</Button>
                <Button variant="outline" size="sm" onClick={() => handleUnlock(planId || planName)} disabled={ps.status !== 'locked'} className="h-7 text-xs"><Unlock className="w-3 h-3 mr-1" />解锁</Button>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
          {plans.map(plan => <option key={plan}>{plan}</option>)}
        </select>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">姓名</th>
              <th className="px-4 py-3 text-left">身份证号</th>
              <th className="px-4 py-3 text-left">职业(工种)</th>
              <th className="px-4 py-3 text-left">等级</th>
              <th className="px-4 py-3 text-right">理论</th>
              <th className="px-4 py-3 text-right">技能</th>
              <th className="px-4 py-3 text-right">总分</th>
              <th className="px-4 py-3 text-left">结果</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">暂无公示数据</td></tr>
            )}
            {filtered.map(i => (
              <tr key={i.id || i.candidateId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.candidateName}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{i.idCard || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation || '-'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level || '-'}</span></td>
                <td className="px-4 py-3 text-right">{i.theoryScore ?? '-'}</td>
                <td className="px-4 py-3 text-right">{i.skillScore ?? '-'}</td>
                <td className="px-4 py-3 text-right font-medium">{total(i)}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-[10px] ${isPass(i) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isPass(i) ? '合格' : '不合格'}</Badge>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const ps = getPubStatus(i.planId)
                    const meta = pubLabelMeta[ps.status] || pubLabelMeta.none
                    return (
                      <Badge className={`${meta.color} text-[10px]`}>
                        {ps.status === 'publicizing' && <Calendar className="w-3 h-3 mr-1" />}
                        {ps.status === 'expired' && <Clock className="w-3 h-3 mr-1" />}
                        {meta.label}
                      </Badge>
                    )
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button>
                    <button onClick={() => fetchAuditLogs(i)} className="text-gray-500 hover:text-amber-600 text-xs" title="修改记录"><History className="w-3.5 h-3.5 inline mr-0.5" />记录</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>成绩详情</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">姓名</span><span className="font-medium">{viewItem.candidateName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">身份证号</span><span className="font-medium font-mono text-xs">{viewItem.idCard || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">职业</span><span className="font-medium">{viewItem.occupation || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">等级</span><span className="font-medium">{viewItem.level || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">理论</span><span className="font-medium">{viewItem.theoryScore ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">技能</span><span className="font-medium">{viewItem.skillScore ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">总分</span><span className="font-bold text-[#1A56DB]">{total(viewItem)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">状态</span>
                {(() => {
                  const ps = getPubStatus(viewItem.planId)
                  const meta = pubLabelMeta[ps.status] || pubLabelMeta.none
                  return <Badge className={`text-xs ${meta.color}`}>{ps.label || meta.label}</Badge>
                })()}
              </div>
              <div className="flex justify-between"><span className="text-gray-500">最后更新</span><span className="text-xs text-gray-400">{formatTime(viewItem.updatedAt)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
        <DialogContent className="sm:max-w-2xl max-h-[70vh] overflow-auto">
          <DialogHeader><DialogTitle>修改记录</DialogTitle></DialogHeader>
          {loadingAudit ? (
            <div className="py-8 text-center text-gray-400">加载中...</div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-400">暂无修改记录</div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map(log => (
                <div key={log.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      {log.action === 'create_score' ? '新增成绩' : '修改成绩'}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(log.createdAt)}</span>
                  </div>
                  {log.payload.subject_type && (
                    <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                      <div>
                        <span className="text-gray-500">{log.payload.subject_type === 'theory' ? '理论成绩' : '技能成绩'}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-red-500 line-through">{log.payload.old_score}</span>
                          <span className="text-gray-300">→</span>
                          <span className="text-green-600 font-medium">{log.payload.new_score}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">原因</span>
                        <p className="text-gray-700 mt-0.5">{log.payload.reason || '-'}</p>
                      </div>
                    </div>
                  )}
                  {!log.payload.subject_type && log.payload.theory_score != null && (
                    <div className="text-xs text-gray-500">
                      初始录入: 理论 {log.payload.theory_score} / 技能 {log.payload.skill_score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
