import { useState, useCallback } from 'react'
import { Search, Eye, History, Filter, RotateCcw, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'

// ─── Types ───

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
    old_theory_score?: number
    old_skill_score?: number
  }
  createdAt: string
}

// ─── Component ───

export default function ScoreReview() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [hasQueried, setHasQueried] = useState(false)

  // Filters
  const [resourceId, setResourceId] = useState('')
  const [planId, setPlanId] = useState('')
  const [candidateId, setCandidateId] = useState('')

  const [viewLog, setViewLog] = useState<AuditLogEntry | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!resourceId && !planId && !candidateId) {
      toast.error('请至少输入一项查询条件')
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (resourceId) params.set('resource-id', resourceId)
      if (planId) params.set('plan-id', planId)
      if (candidateId) params.set('candidate-id', candidateId)

      const res = await apiRequest<AuditLogEntry[] | { items: AuditLogEntry[] }>(
        `/score/audit-logs?${params.toString()}`
      )
      const items = Array.isArray(res) ? res : (res as { items: AuditLogEntry[] }).items || []
      setLogs(items)
      setHasQueried(true)
      if (items.length === 0) {
        toast.info('未找到修改记录')
      }
    } catch (err) {
      toast.error('查询修改记录失败')
    } finally {
      setLoading(false)
    }
  }, [resourceId, planId, candidateId])

  const clearFilters = useCallback(() => {
    setResourceId('')
    setPlanId('')
    setCandidateId('')
    setLogs([])
    setHasQueried(false)
  }, [])

  const formatTime = (ts?: string) => {
    if (!ts) return '-'
    try {
      return new Date(ts).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch { return ts }
  }

  const actionLabel = (action: string) => {
    switch (action) {
      case 'create_score': return '新增成绩'
      case 'update_score': return '修改成绩'
      case 'delete_score': return '删除成绩'
      default: return action
    }
  }

  const actionColor = (action: string) => {
    switch (action) {
      case 'create_score': return 'bg-green-50 text-green-700'
      case 'update_score': return 'bg-amber-50 text-amber-700'
      case 'delete_score': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">成绩修改记录</h1>
        <p className="text-sm text-gray-500 mt-1">查询成绩修改历史，包含每次变更的修改前/修改后值和修改原因</p>
      </div>

      {/* Query Panel */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">查询条件（至少填写一项）</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">成绩记录 ID</label>
            <input value={resourceId} onChange={e => setResourceId(e.target.value)} placeholder="cgn_score 的 id" className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">计划 ID</label>
            <input value={planId} onChange={e => setPlanId(e.target.value)} placeholder="认定计划 id" className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">考生 ID</label>
            <input value={candidateId} onChange={e => setCandidateId(e.target.value)} placeholder="考生 candidate_id" className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={fetchLogs} disabled={loading} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Search className="w-4 h-4 mr-1" />{loading ? '查询中...' : '查询'}
          </Button>
          <Button variant="outline" onClick={clearFilters} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-1" />清除
          </Button>
        </div>
      </div>

      {/* Results */}
      {hasQueried && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">共 {logs.length} 条修改记录</span>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-400">
              <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>未找到匹配的修改记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${actionColor(log.action)}`}>{actionLabel(log.action)}</Badge>
                      {log.payload.subject_type && (
                        <Badge className="text-[10px] bg-blue-50 text-blue-700">
                          {log.payload.subject_type === 'theory' ? '理论成绩' : '技能成绩'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(log.createdAt)}</span>
                  </div>

                  {/* Change details */}
                  {log.payload.subject_type ? (
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">变更前:</span>
                        <span className="font-medium text-red-600">{log.payload.old_score}</span>
                      </div>
                      <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">变更后:</span>
                        <span className="font-bold text-green-600">{log.payload.new_score}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <span className="text-xs text-gray-500">原因:</span>
                        <span className="text-sm text-gray-700">{log.payload.reason || '-'}</span>
                      </div>
                    </div>
                  ) : log.action === 'create_score' ? (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">初始录入: </span>
                      <span className="text-gray-700">
                        理论 {log.payload.theory_score ?? '-'} / 技能 {log.payload.skill_score ?? '-'}
                      </span>
                    </div>
                  ) : log.action === 'delete_score' ? (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">删除成绩: </span>
                      <span className="text-red-600">
                        理论 {log.payload.old_theory_score ?? '-'} / 技能 {log.payload.old_skill_score ?? '-'}
                      </span>
                    </div>
                  ) : null}

                  {/* Meta */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    {log.payload.candidate_id && <span>考生: {log.payload.candidate_id}</span>}
                    {log.payload.plan_id && <span>计划: {log.payload.plan_id}</span>}
                    <span>记录ID: {log.resourceId}</span>
                  </div>

                  <button onClick={() => setViewLog(log)} className="mt-2 text-xs text-[#1A56DB] hover:underline">
                    <Eye className="w-3.5 h-3.5 inline mr-0.5" />查看完整记录
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Full Log Dialog */}
      <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>修改记录详情</DialogTitle></DialogHeader>
          {viewLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-gray-500">操作</span><p className="font-medium">{actionLabel(viewLog.action)}</p></div>
                <div><span className="text-xs text-gray-500">操作人</span><p className="font-medium">{viewLog.actorId || '-'}</p></div>
                <div><span className="text-xs text-gray-500">资源</span><p className="font-medium">{viewLog.resource}</p></div>
                <div><span className="text-xs text-gray-500">记录ID</span><p className="font-mono text-xs">{viewLog.resourceId}</p></div>
                <div><span className="text-xs text-gray-500">时间</span><p className="font-medium">{formatTime(viewLog.createdAt)}</p></div>
              </div>
              {viewLog.payload.subject_type && (
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">{viewLog.payload.subject_type === 'theory' ? '理论成绩' : '技能成绩'}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-red-600 line-through">{viewLog.payload.old_score}</span>
                        <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                        <span className="text-lg font-bold text-green-600">{viewLog.payload.new_score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">原因</span>
                      <p className="text-sm mt-1">{viewLog.payload.reason || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
              {!viewLog.payload.subject_type && viewLog.action === 'create_score' && (
                <div className="rounded-md bg-green-50 border border-green-100 p-3">
                  <span className="text-xs text-green-600 font-medium">初始录入</span>
                  <p className="text-sm mt-1">理论: {viewLog.payload.theory_score ?? '-'} / 技能: {viewLog.payload.skill_score ?? '-'}</p>
                </div>
              )}
              {!viewLog.payload.subject_type && viewLog.action === 'delete_score' && (
                <div className="rounded-md bg-red-50 border border-red-100 p-3">
                  <span className="text-xs text-red-600 font-medium">删除记录</span>
                  <p className="text-sm mt-1">理论: {viewLog.payload.old_theory_score ?? '-'} / 技能: {viewLog.payload.old_skill_score ?? '-'}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">完整 Payload</span>
                <pre className="mt-1 text-xs bg-gray-50 rounded-md p-2 overflow-auto max-h-48">{JSON.stringify(viewLog.payload, null, 2)}</pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLog(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
