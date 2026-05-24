import { useMemo, useState, useCallback, useEffect } from 'react'
import { Search, CheckCircle, Edit3, Upload, Download, RotateCcw, Plus, Lock, Unlock, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'

interface PublicityStatus {
  status: string
  label: string
  publicityStart?: string
  publicityEnd?: string
  publicityDays?: number
}

// ─── Types matching backend cgn_score table (camelCase from scores controller) ───

interface ScoreRecord {
  id?: string
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
  createdAt?: string
  updatedAt?: string
}

const statusMeta: Record<string, { label: string; color: string }> = {
  draft:       { label: '可修改', color: 'bg-blue-50 text-blue-700' },
  locked:      { label: '已锁定', color: 'bg-gray-50 text-gray-500' },
  publicizing: { label: '公示中', color: 'bg-amber-50 text-amber-700' },
}

const publicityLabelMeta: Record<string, { label: string; color: string }> = {
  pending:     { label: '待公示', color: 'bg-slate-50 text-slate-500' },
  publicizing: { label: '公示中（可修改）', color: 'bg-amber-50 text-amber-700' },
  expired:     { label: '公示已结束', color: 'bg-gray-100 text-gray-500' },
  locked:      { label: '已锁定', color: 'bg-gray-100 text-gray-500' },
  none:        { label: '未配置公示', color: 'bg-gray-50 text-gray-400' },
}

const initialTemplate: ScoreRecord[] = [
  { candidateId: '', candidateName: '', code: '', planId: '', planName: '20220412第3批认定', occupation: '核反应堆运行值班员', level: '三级/高级工', idCard: '440301199001011234', theoryScore: null, skillScore: null, totalScore: null, status: 'draft' },
]

// ─── ScoreEntry Component ───

export default function ScoreEntry() {
  const [items, setItems] = useBackendListState<ScoreRecord>(initialTemplate)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('全部计划')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTheory, setEditTheory] = useState('')
  const [editSkill, setEditSkill] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showBatch, setShowBatch] = useState(false)
  const [batchForm, setBatchForm] = useState<{ candidateId: string; theoryScore: string; skillScore: string }>({ candidateId: '', theoryScore: '', skillScore: '' })
  const [publicityStatus, setPublicityStatus] = useState<PublicityStatus | null>(null)
  const [loadingPublicity, setLoadingPublicity] = useState(false)

  // ─── Derived data ───

  const plans = useMemo(() => {
    const names = Array.from(new Set(items.map(i => i.planName).filter(Boolean)))
    return ['全部计划', ...names]
  }, [items])

  const filtered = useMemo(() => items.filter(i => {
    const bySearch = !search || (i.candidateName || '').includes(search) || (i.code || '').includes(search) || (i.idCard || '').includes(search)
    const byPlan = planFilter === '全部计划' || i.planName === planFilter
    return bySearch && byPlan
  }), [items, search, planFilter])

  const passCount = useMemo(() => {
    return items.filter(i => {
      const t = i.theoryScore ?? 0
      const s = i.skillScore ?? 0
      return t >= 60 && s >= 60
    }).length
  }, [items])

  // ─── Publicity status fetch ───

  useEffect(() => {
    const fetchPublicity = async () => {
      const planId = items[0]?.planId
      if (!planId) return
      setLoadingPublicity(true)
      try {
        const res = await apiRequest<PublicityStatus>(`/score/publicity-status/${encodeURIComponent(planId)}`)
        setPublicityStatus(res)
      } catch {
        setPublicityStatus(null)
      } finally {
        setLoadingPublicity(false)
      }
    }
    fetchPublicity()
  }, [items])

  const canEdit = useMemo(() => {
    if (!publicityStatus) return true // fallback: allow if unknown
    return publicityStatus.status === 'publicizing' || publicityStatus.status === 'none' || publicityStatus.status === 'pending'
  }, [publicityStatus])

  // ─── Inline editing ───

  const startEdit = useCallback((item: ScoreRecord) => {
    setEditingId(item.id || item.candidateId)
    setEditTheory(item.theoryScore != null ? String(item.theoryScore) : '')
    setEditSkill(item.skillScore != null ? String(item.skillScore) : '')
  }, [])

  const saveEdit = useCallback((item: ScoreRecord) => {
    const theory = editTheory !== '' ? Number(editTheory) : null
    const skill = editSkill !== '' ? Number(editSkill) : null
    setItems((prev: ScoreRecord[]) => prev.map(i => {
      if ((i.id || i.candidateId) === (item.id || item.candidateId)) {
        return { ...i, theoryScore: theory, skillScore: skill, totalScore: (theory && skill) ? theory * 0.4 + skill * 0.6 : i.totalScore }
      }
      return i
    }))
    setEditingId(null)
    toast.success('成绩已保存')
  }, [editTheory, editSkill, setItems])

  const cancelEdit = useCallback(() => setEditingId(null), [])

  // ─── Batch entry ───

  const addBatchRow = useCallback(() => {
    if (!batchForm.candidateId) { toast.error('请输入考生编号'); return }
    const theory = batchForm.theoryScore !== '' ? Number(batchForm.theoryScore) : null
    const skill = batchForm.skillScore !== '' ? Number(batchForm.skillScore) : null
    setItems((prev: ScoreRecord[]) => {
      const exists = prev.find(i => i.candidateId === batchForm.candidateId)
      if (exists) {
        return prev.map(i => i.candidateId === batchForm.candidateId
          ? { ...i, theoryScore: theory, skillScore: skill, totalScore: (theory && skill) ? theory * 0.4 + skill * 0.6 : i.totalScore }
          : i)
      }
      return [...prev, {
        candidateId: batchForm.candidateId,
        candidateName: batchForm.candidateId,
        code: batchForm.candidateId,
        planId: planFilter !== '全部计划' ? plans.indexOf(planFilter).toString() : '',
        theoryScore: theory,
        skillScore: skill,
        totalScore: (theory && skill) ? theory * 0.4 + skill * 0.6 : null,
        status: 'draft',
      }]
    })
    setBatchForm({ candidateId: '', theoryScore: '', skillScore: '' })
    toast.success('成绩已录入')
  }, [batchForm, planFilter, plans, setItems])

  // ─── Lock / Unlock ───

  const handleLockPlan = useCallback(async () => {
    const planId = items[0]?.planId
    if (!planId) { toast.error('无可用计划'); return }
    try {
      await apiRequest(`/score/scoring/${planId}/lock`, { method: 'POST' })
      setItems((prev: ScoreRecord[]) => prev.map(i => ({ ...i, status: 'locked' })))
      toast.success('计划成绩已锁定')
    } catch { toast.error('锁定失败') }
  }, [items, setItems])

  const handleUnlockPlan = useCallback(async () => {
    const planId = items[0]?.planId
    if (!planId) { toast.error('无可用计划'); return }
    try {
      await apiRequest(`/score/scoring/${planId}/unlock`, { method: 'POST' })
      setItems((prev: ScoreRecord[]) => prev.map(i => ({ ...i, status: 'draft' })))
      toast.success('计划成绩已解锁')
    } catch { toast.error('解锁失败') }
  }, [items, setItems])

  // ─── Compute total ───

  const totalScore = useCallback((item: ScoreRecord) => {
    if (item.totalScore != null) return item.totalScore.toFixed(1)
    const t = item.theoryScore
    const s = item.skillScore
    if (t == null || s == null) return '-'
    return (t * 0.4 + s * 0.6).toFixed(1)
  }, [])

  const isPass = useCallback((item: ScoreRecord) => {
    const t = item.theoryScore ?? 0
    const s = item.skillScore ?? 0
    return t >= 60 && s >= 60
  }, [])

  // ─── Render ───

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">成绩管理</h1>
          <p className="text-sm text-gray-500 mt-1">录入理论、技能成绩，公示期支持修改并自动记录变更</p>
          {publicityStatus && publicityStatus.status !== 'none' && (
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-xs ${(publicityLabelMeta[publicityStatus.status] || publicityLabelMeta.none).color}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {(publicityLabelMeta[publicityStatus.status] || publicityLabelMeta.none).label}
              </Badge>
              {publicityStatus.publicityStart && publicityStatus.publicityEnd && (
                <span className="text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-0.5" />
                  {publicityStatus.publicityStart?.slice(0, 10)} ~ {publicityStatus.publicityEnd?.slice(0, 10)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBatch(true)}><Plus className="w-4 h-4 mr-2" />批量录入</Button>
          <Button variant="outline" onClick={() => setShowImport(true)}><Upload className="w-4 h-4 mr-2" />导入成绩</Button>
          <Button variant="outline" onClick={() => toast.success('成绩表已导出')}><Download className="w-4 h-4 mr-2" />导出成绩</Button>
          <Button variant="outline" onClick={handleLockPlan} disabled={items.length === 0}><Lock className="w-4 h-4 mr-1" />锁定</Button>
          <Button variant="outline" onClick={handleUnlockPlan} disabled={items.length === 0}><Unlock className="w-4 h-4 mr-1" />解锁</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '考生总数', value: `${filtered.length} 人`, className: 'text-gray-900' },
          { label: '合格人数', value: `${passCount} 人`, className: 'text-green-700' },
          { label: '可修改', value: `${items.filter(i => i.status === 'draft').length} 人`, className: 'text-blue-700' },
          { label: '已锁定', value: `${items.filter(i => i.status === 'locked').length} 人`, className: 'text-gray-500' },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`mt-1 text-2xl font-bold ${card.className}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
          {plans.map(plan => <option key={plan}>{plan}</option>)}
        </select>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名 / 考生编号 / 证件号码" className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-72 focus:outline-none focus:border-[#1A56DB]" />
        </div>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">序号</th>
              <th className="px-4 py-3 text-left">考生编号</th>
              <th className="px-4 py-3 text-left">姓名</th>
              <th className="px-4 py-3 text-left">身份证号</th>
              <th className="px-4 py-3 text-left">职业(工种)</th>
              <th className="px-4 py-3 text-left">等级</th>
              <th className="px-4 py-3 text-right">理论成绩</th>
              <th className="px-4 py-3 text-right">技能成绩</th>
              <th className="px-4 py-3 text-right">总分</th>
              <th className="px-4 py-3 text-left">结果</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">暂无成绩数据，请导入或批量录入</td></tr>
            )}
            {filtered.map((item, index) => {
              const id = item.id || item.candidateId
              const editing = editingId === id
              const meta = statusMeta[item.status] || statusMeta.draft
              return (
                <tr key={id} className={`hover:bg-gray-50 ${editing ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.candidateName}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.idCard || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.occupation || '-'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.level || '-'}</span></td>
                  <td className="px-4 py-3 text-right">
                    {editing
                      ? <input type="number" value={editTheory} onChange={e => setEditTheory(e.target.value)} className="w-20 h-8 border border-blue-300 rounded-md text-sm text-center focus:outline-none focus:border-[#1A56DB]" />
                      : <span className={(item.theoryScore ?? 0) >= 60 ? 'text-gray-900' : 'text-red-600 font-medium'}>{item.theoryScore != null ? item.theoryScore : '-'}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing
                      ? <input type="number" value={editSkill} onChange={e => setEditSkill(e.target.value)} className="w-20 h-8 border border-blue-300 rounded-md text-sm text-center focus:outline-none focus:border-[#1A56DB]" />
                      : <span className={(item.skillScore ?? 0) >= 60 ? 'text-gray-900' : 'text-red-600 font-medium'}>{item.skillScore != null ? item.skillScore : '-'}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{totalScore(item)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] ${isPass(item) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isPass(item) ? '合格' : '不合格'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${meta.color}`}>{meta.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editing ? (
                        <>
                          <button onClick={() => saveEdit(item)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><RotateCcw className="w-4 h-4" /></button>
                        </>
                      ) : canEdit ? (
                        <button onClick={() => startEdit(item)} className="text-gray-500 hover:text-amber-600" title="编辑成绩"><Edit3 className="w-3.5 h-3.5" /></button>
                      ) : (
                        <button disabled className="text-gray-300 cursor-not-allowed" title="公示期已结束，成绩已锁定"><Edit3 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入成绩</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => toast.success('成绩导入模板已下载')}><Download className="w-4 h-4 mr-2" />下载模板</Button>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传理论、技能成绩 Excel</p>
              <p className="text-xs text-gray-400 mt-1">系统按考生编号匹配并覆盖成绩</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>取消</Button>
            <Button onClick={() => { setShowImport(false); toast.success('成绩导入完成') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Entry Dialog */}
      <Dialog open={showBatch} onOpenChange={setShowBatch}>
        <DialogContent>
          <DialogHeader><DialogTitle>批量录入成绩</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">考生编号</label><input value={batchForm.candidateId} onChange={e => setBatchForm(p => ({ ...p, candidateId: e.target.value }))} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入考生编号" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">理论成绩</label><input type="number" value={batchForm.theoryScore} onChange={e => setBatchForm(p => ({ ...p, theoryScore: e.target.value }))} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm text-center" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">技能成绩</label><input type="number" value={batchForm.skillScore} onChange={e => setBatchForm(p => ({ ...p, skillScore: e.target.value }))} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm text-center" /></div>
            </div>
            <Button onClick={addBatchRow} className="w-full bg-[#1A56DB] hover:bg-[#1748B5]"><Plus className="w-4 h-4 mr-1" />添加记录</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatch(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
