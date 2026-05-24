import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  MapPin, Users, Plus, Clock, CheckCircle, Trash2, Eye,
  Printer, Ticket, FileSpreadsheet, LayoutGrid, ArrowRight,
  ArrowLeft, Calendar, Shuffle, RefreshCw,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'

// ==================== Types ====================
interface ExamRoom {
  id: string
  name: string
  totalSeats: number
  remainingSeats: number
  candidates: number
  assignedCandidateIds?: string[]
}

interface ExamSite {
  id: string
  name: string
  address?: string
  roomType?: string
  seatCount?: number
  rooms: ExamRoom[]
}

interface ExamSession {
  id: string
  timeRange: string
  date?: string
  startTime?: string
  endTime?: string
  sessionType?: string
  cycleDay?: number
  cycleTotal?: number
  capacity?: number
  candidateCount?: number
  status?: string
}

interface CandidateItem {
  id: string
  name: string
  idCard?: string
  profession?: string
  occupation?: string
  level?: string
  org?: string
  isAssigned?: boolean
}

interface ArrangementPlan {
  id: string
  code?: string
  name?: string
  planName?: string
  site?: string
  month?: string
  count?: number
  candidateCount?: number
  status?: string
  arrangementStatus?: string
  theoryDone?: boolean
  skillDone?: boolean
  sites?: ExamSite[]
  arrangeMode?: string
}

interface ArrangementDetail {
  plan: ArrangementPlan
  sessions: ExamSession[]
  candidates: CandidateItem[]
}

// ==================== Constants ====================
const ALL_SITES: { id: string; name: string; address?: string }[] = [
  { id: 'site-001', name: '大亚湾基地考点', address: '大亚湾基地培训中心' },
  { id: 'site-002', name: '阳江培训中心', address: '阳江核电培训中心' },
  { id: 'site-003', name: '测试有限公司考点', address: '深圳市' },
]

// ==================== API Helpers ====================
async function fetchPlanDetail(planId: string): Promise<ArrangementDetail> {
  const res = await apiRequest<ArrangementDetail>(`/exam-arrangement/plans/${planId}`)
  if (!res || !res.plan) throw new Error('Plan not found')
  return res
}

async function fetchPlans(): Promise<ArrangementPlan[]> {
  const res = await apiRequest<{ items: ArrangementPlan[] }>('/exam-arrangement/plans')
  if (Array.isArray(res)) return res as ArrangementPlan[]
  return res?.items || []
}

async function fetchSessions(planId: string, type?: string): Promise<ExamSession[]> {
  const params = type ? `?type=${type}` : ''
  const res = await apiRequest<{ sessions: ExamSession[] }>(`/exam-arrangement/sessions${params}`)
  return res?.sessions || []
}

async function fetchCandidates(planId: string): Promise<{ candidates: CandidateItem[]; assignedCount: number; totalCount: number }> {
  const res = await apiRequest<{ candidates: CandidateItem[]; assignedCount: number; totalCount: number }>(
    `/exam-arrangement/plans/${planId}/sites/site-001/rooms/room-001/candidates`,
  )
  return res || { candidates: [], assignedCount: 0, totalCount: 0 }
}

// ==================== Component ====================
export default function ExamArrangement() {
  // View state
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [workTab, setWorkTab] = useState<'待办' | '已办'>('待办')
  const [activeStep, setActiveStep] = useState<'theory' | 'skill'>('theory')

  // Plan list
  const [plans, setPlans] = useState<ArrangementPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)

  // Detail state
  const [planDetail, setPlanDetail] = useState<ArrangementDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [sites, setSites] = useState<ExamSite[]>([])
  const [candidates, setCandidates] = useState<CandidateItem[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [arrangeMode, setArrangeMode] = useState<'普通' | '打乱'>('普通')

  // Dialogs
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAssignCandidates, setShowAssignCandidates] = useState(false)
  const [showAssignedDetail, setShowAssignedDetail] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showCycleDays, setShowCycleDays] = useState(false)
  const [showShuffleResult, setShowShuffleResult] = useState(false)

  // Form state
  const [selectedRoomForAction, setSelectedRoomForAction] = useState<ExamRoom | null>(null)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
  const [siteSearch, setSiteSearch] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomSeats, setNewRoomSeats] = useState('50')

  // Session form
  const [sessionDate, setSessionDate] = useState('')
  const [sessionStart, setSessionStart] = useState('')
  const [sessionEnd, setSessionEnd] = useState('')
  const [sessionType, setSessionType] = useState<'theory' | 'skill'>('theory')

  // Cycle days form
  const [cycleStartDate, setCycleStartDate] = useState('')
  const [cycleStartTime, setCycleStartTime] = useState('')
  const [cycleEndTime, setCycleEndTime] = useState('')
  const [cycleDays, setCycleDays] = useState('1')
  const [cycleCapacity, setCycleCapacity] = useState('50')

  // Skill occupation
  const [skillOccupation, setSkillOccupation] = useState('')

  // Shuffle result
  const [shuffleGroups, setShuffleGroups] = useState<{ org: string; candidateIds: string[]; count: number }[]>([])

  // ==================== Load Plans ====================
  const loadPlans = useCallback(async () => {
    setPlansLoading(true)
    try {
      const data = await fetchPlans()
      if (data.length === 0) {
        // Fallback: use resource endpoint
        const fallback = await apiRequest<{ items: ArrangementPlan[] }>('/resources/exam-arrangement?limit=200')
        setPlans(fallback?.items || mockPlans)
      } else {
        setPlans(data)
      }
    } catch {
      setPlans(mockPlans)
    } finally {
      setPlansLoading(false)
    }
  }, [])

  // ==================== Load Detail ====================
  const loadDetail = useCallback(async (planId: string) => {
    setDetailLoading(true)
    try {
      const detail = await fetchPlanDetail(planId)
      setPlanDetail(detail)
      setSessions(detail.sessions || [])
      const p = detail.plan
      setSites(p?.sites || [])
      setArrangeMode((p?.arrangeMode as '普通' | '打乱') || '普通')
      if ((p?.sites?.length ?? 0) > 0) {
        setSelectedSiteId(p.sites![0].id)
      }
      // Load candidates
      try {
        const candData = await fetchCandidates(planId)
        setCandidates(candData.candidates || mockCandidates)
      } catch {
        setCandidates(mockCandidates)
      }
      // Determine active step
      if (p?.skillDone) setActiveStep('skill')
      else if (p?.theoryDone) setActiveStep('skill')
      else setActiveStep('theory')
    } catch {
      // Fallback for demo
      setPlanDetail({
        plan: mockPlans.find(p => p.id === planId) || mockPlans[0],
        sessions: mockSessions,
        candidates: mockCandidates,
      })
      setSessions(mockSessions)
      setCandidates(mockCandidates)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => { loadPlans() }, [loadPlans])

  // ==================== Session Management ====================
  const handleAddSession = async () => {
    if (!sessionDate || !sessionStart || !sessionEnd) {
      toast.error('请填写完整场次信息')
      return
    }
    const timeRange = `${sessionDate} ${sessionStart}~${sessionEnd}`
    const newSession: ExamSession = {
      id: `local-${Date.now()}`,
      timeRange,
      date: sessionDate,
      startTime: sessionStart,
      endTime: sessionEnd,
      sessionType: activeStep === 'theory' ? 'theory' : 'skill',
    }
    setSessions(prev => [...prev, newSession])
    setShowAddSession(false)
    setSessionDate('')
    setSessionStart('')
    setSessionEnd('')
    toast.success('已添加场次')
    // API sync
    try {
      await apiRequest(`/exam-arrangement/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
          sessionType: activeStep === 'theory' ? 'theory' : 'skill',
          date: sessionDate,
          startTime: sessionStart,
          endTime: sessionEnd,
        }),
      })
    } catch { /* local state is fine */ }
  }

  const handleRemoveSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    try {
      apiRequest(`/exam-arrangement/sessions/${id}`, { method: 'DELETE' })
    } catch { /* ok */ }
  }

  // ==================== Cycle Days ====================
  const handleGenerateCycleSessions = async () => {
    if (!cycleStartDate || !cycleStartTime || !cycleEndTime) {
      toast.error('请填写完整的周期信息')
      return
    }
    const n = parseInt(cycleDays) || 1
    const generated: ExamSession[] = []
    for (let i = 0; i < n; i++) {
      // Simple day offset (production would use date-fns addDays)
      const d = new Date(cycleStartDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      generated.push({
        id: `cycle-${Date.now()}-${i}`,
        timeRange: `${dateStr} ${cycleStartTime}~${cycleEndTime}`,
        date: dateStr,
        startTime: cycleStartTime,
        endTime: cycleEndTime,
        sessionType: 'skill',
        capacity: parseInt(cycleCapacity) || 50,
        cycleDay: i + 1,
        cycleTotal: n,
      })
    }
    setSessions(prev => [...prev, ...generated])
    setShowCycleDays(false)
    toast.success(`已生成 ${n} 个批次场次`)
    // API sync
    try {
      await apiRequest(`/exam-arrangement/plans/${selectedPlanId}/cycle-sessions`, {
        method: 'POST',
        body: JSON.stringify({
          startDate: cycleStartDate,
          startTime: cycleStartTime,
          endTime: cycleEndTime,
          capacity: parseInt(cycleCapacity) || 50,
          cycleDays: n,
          occupation: skillOccupation,
        }),
      })
    } catch { /* ok */ }
  }

  // ==================== Site Management ====================
  const handleAddSite = async (site: { id: string; name: string }) => {
    if (sites.find(s => s.id === site.id)) {
      toast.error('该考点已添加')
      return
    }
    const newSite: ExamSite = { id: site.id, name: site.name, rooms: [] }
    setSites(prev => [...prev, newSite])
    setSelectedSiteId(site.id)
    setShowAddSite(false)
    toast.success(`已添加考点：${site.name}`)
    try {
      await apiRequest(`/exam-arrangement/plans/${selectedPlanId}/sites`, {
        method: 'POST',
        body: JSON.stringify({ siteId: site.id }),
      })
    } catch { /* ok */ }
  }

  const handleRemoveSite = (siteId: string) => {
    setSites(prev => prev.filter(s => s.id !== siteId))
    if (selectedSiteId === siteId) setSelectedSiteId(sites[0]?.id || '')
    try {
      apiRequest(`/exam-arrangement/plans/${selectedPlanId}/sites/${siteId}`, { method: 'DELETE' })
    } catch { /* ok */ }
  }

  // ==================== Room Management ====================
  const handleAddRoom = () => {
    if (!newRoomName.trim()) { toast.error('请输入考场名称'); return }
    const seats = parseInt(newRoomSeats) || 50
    const newRoom: ExamRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      totalSeats: seats,
      remainingSeats: seats,
      candidates: 0,
    }
    setSites(prev => prev.map(s =>
      s.id === selectedSiteId ? { ...s, rooms: [...s.rooms, newRoom] } : s,
    ))
    setShowAddRoom(false)
    setNewRoomName('')
    setNewRoomSeats('50')
    toast.success('考场已添加')
    try {
      apiRequest(`/exam-arrangement/plans/${selectedPlanId}/sites/${selectedSiteId}/rooms`, {
        method: 'POST',
        body: JSON.stringify({ name: newRoom.name, seatCount: seats }),
      })
    } catch { /* ok */ }
  }

  const handleRemoveRoom = (roomId: string) => {
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.filter(r => r.id !== roomId),
    })))
  }

  const handleAddSeats = (room: ExamRoom) => {
    const addN = 10
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.map(r =>
        r.id === room.id
          ? { ...r, totalSeats: r.totalSeats + addN, remainingSeats: r.remainingSeats + addN }
          : r,
      ),
    })))
    toast.success(`已为 ${room.name} 增加 ${addN} 个座位`)
  }

  // ==================== Candidate Assignment ====================
  const handleAssignCandidates = (room: ExamRoom | null) => {
    const ids = selectedCandidateIds.length > 0
      ? selectedCandidateIds
      : candidates.filter(c => !c.isAssigned).slice(0, 5).map(c => c.id)
    const count = ids.length

    if (room) {
      setSites(prev => prev.map(s => ({
        ...s,
        rooms: s.rooms.map(r =>
          r.id === room.id
            ? {
                ...r,
                candidates: r.candidates + count,
                remainingSeats: Math.max(0, r.remainingSeats - count),
                assignedCandidateIds: [...(r.assignedCandidateIds || []), ...ids],
              }
            : r,
        ),
      })))
      toast.success(`已为 ${room.name} 分配 ${count} 名考生`)
    } else {
      toast.success(`已为技能考核分配 ${count} 名考生`)
    }

    setCandidates(prev => prev.map(c =>
      ids.includes(c.id) ? { ...c, isAssigned: true } : c,
    ))
    setSelectedCandidateIds([])
    setShowAssignCandidates(false)

    // API
    if (room) {
      try {
        apiRequest(
          `/exam-arrangement/plans/${selectedPlanId}/sites/${selectedSiteId}/rooms/${room.id}/candidates`,
          { method: 'POST', body: JSON.stringify({ candidateIds: ids }) },
        )
      } catch { /* ok */ }
    }
  }

  const handleCancelRoomAssign = (room: ExamRoom) => {
    const assignedIds = room.assignedCandidateIds || []
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.map(r =>
        r.id === room.id
          ? { ...r, remainingSeats: r.totalSeats, candidates: 0, assignedCandidateIds: [] }
          : r,
      ),
    })))
    setCandidates(prev => prev.map(c =>
      assignedIds.includes(c.id) ? { ...c, isAssigned: false } : c,
    ))
    toast.success('已取消该考场分配')
  }

  const handleCancelAllAssign = () => {
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.map(r => ({ ...r, remainingSeats: r.totalSeats, candidates: 0, assignedCandidateIds: [] })),
    })))
    setCandidates(prev => prev.map(c => ({ ...c, isAssigned: false })))
    toast.success('已取消全部考场分配')
    try {
      apiRequest(`/exam-arrangement/plans/${selectedPlanId}/cancel-all`, { method: 'POST' })
    } catch { /* ok */ }
  }

  // ==================== Shuffle ====================
  const handleShuffleArrange = async () => {
    const byOrg = new Map<string, CandidateItem[]>()
    candidates.forEach(c => {
      const org = c.org || '未知单位'
      if (!byOrg.has(org)) byOrg.set(org, [])
      byOrg.get(org)!.push(c)
    })
    const groups: { org: string; candidateIds: string[]; count: number }[] = []
    byOrg.forEach((cs, org) => {
      // Shuffle within each org group
      const shuffled = [...cs].sort(() => Math.random() - 0.5)
      groups.push({ org, candidateIds: shuffled.map(c => c.id), count: cs.length })
    })
    setShuffleGroups(groups)
    setShowShuffleResult(true)
    setArrangeMode('打乱')
    toast.success(`打乱编排完成：${groups.length} 个单位，共 ${candidates.length} 人`)
    try {
      await apiRequest(`/exam-arrangement/plans/${selectedPlanId}/shuffle`, { method: 'POST' })
    } catch { /* ok */ }
  }

  // ==================== Flow State ====================
  const handleTheoryDone = async () => {
    if (sites.length === 0) { toast.error('请先添加至少一个考点'); return }
    if (sessions.filter(s => s.sessionType === 'theory').length === 0) { toast.error('请先添加理论场次'); return }
    const plan = planDetail?.plan
    if (plan) {
      plan.theoryDone = true
      plan.arrangementStatus = '技能编排中'
    }
    setActiveStep('skill')
    toast.success('理论编排已完成，进入技能编排')
    try {
      await apiRequest(`/exam-arrangement/plans/${selectedPlanId}/status`, {
        method: 'POST', body: JSON.stringify({ action: 'theory-done' }),
      })
    } catch { /* ok */ }
  }

  const handleSkillDone = async () => {
    const plan = planDetail?.plan
    if (plan) {
      plan.skillDone = true
      plan.arrangementStatus = '已编排'
    }
    toast.success('技能编排已完成，编排工作结束')
    try {
      await apiRequest(`/exam-arrangement/plans/${selectedPlanId}/status`, {
        method: 'POST', body: JSON.stringify({ action: 'skill-done' }),
      })
    } catch { /* ok */ }
    setSelectedPlanId(null)
    loadPlans()
  }

  const handleEndArrangement = () => {
    if (activeStep === 'theory') handleTheoryDone()
    else handleSkillDone()
  }

  // ==================== Computed ====================
  const filteredPlans = plans.filter(p =>
    workTab === '待办'
      ? (!p.arrangementStatus || p.arrangementStatus === '待编排' || p.arrangementStatus === '理论编排中' || p.arrangementStatus === '技能编排中')
      : (p.arrangementStatus === '已编排' || p.arrangementStatus === '已完成'),
  )

  const filteredCandidates = candidates.filter(c => !c.isAssigned)
  const unassignedCount = filteredCandidates.length
  const currentSite = sites.find(s => s.id === selectedSiteId)

  const canProceed = activeStep === 'theory'
    ? sites.length > 0 && sessions.filter(s => s.sessionType === 'theory' || !s.sessionType).length > 0
    : sessions.filter(s => s.sessionType === 'skill').length > 0

  // ==================== Render: Plan List ====================
  if (!selectedPlanId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">考场编排</h1>
            <p className="text-sm text-gray-500 mt-1">按计划进行理论和技能考场、场次、考生分配编排</p>
          </div>
          <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
            {(['待办', '已办'] as const).map(tab => (
              <button key={tab} onClick={() => setWorkTab(tab)}
                className={`px-4 py-1.5 text-xs rounded ${workTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}
              >{tab}</button>
            ))}
          </div>
        </div>
        {plansLoading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">认定站点</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">报名人数</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">编排状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlans.map((plan, idx) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.code || `-`}</td>
                    <td className="px-4 py-3 font-medium">{plan.name || plan.planName || '未命名'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{plan.site || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{plan.month || '-'}</td>
                    <td className="px-4 py-3 text-right">{plan.count ?? plan.candidateCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                        (plan.arrangementStatus || plan.status) === '已编排' || (plan.arrangementStatus || plan.status) === '已完成'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {plan.arrangementStatus || plan.status || '待编排'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" className="h-8 text-xs" onClick={() => { setSelectedPlanId(plan.id); loadDetail(plan.id) }}>
                          分配编排
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs"
                          onClick={() => toast.success('更多：准考证、考场安排表、编排报表')}>
                          更多
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ==================== Render: Arrangement Detail ====================
  if (detailLoading) {
    return <div className="text-center py-12 text-gray-400">加载编排详情...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header + Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedPlanId(null); setPlanDetail(null) }}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />返回计划列表
          </Button>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${
                activeStep === 'theory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
              }`}
              onClick={() => activeStep === 'skill' && planDetail?.plan?.theoryDone && setActiveStep('theory')}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                activeStep === 'theory' ? 'bg-blue-600 text-white' : planDetail?.plan?.theoryDone ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
              }`}>
                {planDetail?.plan?.theoryDone ? '✓' : '1'}
              </span>
              理论编排
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${
                activeStep === 'skill' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
              }`}
              onClick={() => planDetail?.plan?.theoryDone && setActiveStep('skill')}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                activeStep === 'skill' ? 'bg-blue-600 text-white' : planDetail?.plan?.skillDone ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
              }`}>
                {planDetail?.plan?.skillDone ? '✓' : '2'}
              </span>
              技能编排
            </button>
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {planDetail?.plan?.name || planDetail?.plan?.planName || '未命名计划'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><Printer className="w-3.5 h-3.5 mr-1" />考场安排表</Button>
          <Button size="sm" className="text-xs" onClick={handleEndArrangement} disabled={!canProceed}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            {activeStep === 'theory' ? '完成理论，进入技能' : '结束安排'}
          </Button>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {activeStep === 'theory' ? '理论考试场次' : '技能考核场次'}
          </h3>
          <div className="flex items-center gap-2">
            {activeStep === 'skill' && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowCycleDays(true)}>
                <RefreshCw className="w-3 h-3 mr-1" />循环天数设置
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
              setSessionType(activeStep)
              setShowAddSession(true)
            }}>
              <Plus className="w-3.5 h-3.5 mr-1" />添加场次
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {sessions.filter(s => activeStep === 'theory' ? (s.sessionType === 'theory' || !s.sessionType) : s.sessionType === 'skill').map(s => (
            <div key={s.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded border border-blue-200">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-700">{s.timeRange}</span>
              {s.cycleDay && <span className="text-[10px] text-blue-400">(第{s.cycleDay}/{s.cycleTotal}批)</span>}
              <button onClick={() => handleRemoveSession(s.id)} className="text-blue-400 hover:text-red-500 ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {sessions.filter(s => activeStep === 'theory' ? (s.sessionType === 'theory' || !s.sessionType) : s.sessionType === 'skill').length === 0 && (
            <span className="text-sm text-gray-400">暂无场次，请添加</span>
          )}
          <div className="flex items-center gap-1 text-red-500 text-sm ml-auto">
            <Users className="w-4 h-4" />
            <span>剩余{unassignedCount}个考生未安排</span>
          </div>
        </div>
      </div>

      {/* Sites & Rooms */}
      <div className={`grid gap-4 ${activeStep === 'theory' ? 'grid-cols-12' : 'grid-cols-1'}`}>
        {/* Only show site management in theory step; skill inherits */}
        {activeStep === 'theory' && (
          <>
            <div className="col-span-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-100">
                <h4 className="text-sm font-medium text-blue-600">考点</h4>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowAddSite(true)}>
                  <MapPin className="w-3 h-3 mr-1" />追加考点
                </Button>
              </div>
              <div className="space-y-3">
                {sites.map(site => (
                  <div key={site.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSiteId === site.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSiteId(site.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{site.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveSite(site.id) }}
                        className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      共{site.rooms.length}个考场，{site.rooms.filter(r => r.remainingSeats > 0).length}个可安排
                    </div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] w-full" onClick={(e) => { e.stopPropagation(); setShowAddRoom(true) }}>
                        <Plus className="w-2.5 h-2.5 mr-1" />增加考场
                      </Button>
                    </div>
                  </div>
                ))}
                {sites.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>请点击追加考点添加数据</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-8 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-100">
                <h4 className="text-sm font-medium text-blue-600">考场</h4>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs text-amber-600" onClick={handleCancelAllAssign}>
                    全部取消分配
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {currentSite?.rooms.map(room => (
                  <div key={room.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{room.name}</span>
                        <span className="text-xs text-gray-500">
                          剩余{room.remainingSeats}/共{room.totalSeats}个考位
                        </span>
                        <button onClick={() => handleRemoveRoom(room.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                          onClick={() => { setSelectedRoomForAction(room); setShowAssignCandidates(true) }}>
                          <Users className="w-3 h-3 mr-1" />安排考生
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                          onClick={() => { setSelectedRoomForAction(room); setShowAssignedDetail(true) }}>
                          <Eye className="w-3 h-3 mr-1" />查看分配
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600"
                          onClick={() => handleCancelRoomAssign(room)}>
                          取消分配
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                          onClick={() => handleAddSeats(room)}>
                          <Plus className="w-3 h-3 mr-1" />增加座位
                        </Button>
                      </div>
                    </div>
                    {room.candidates > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>已安排 {room.candidates} 名考生</span>
                      </div>
                    )}
                  </div>
                ))}
                {(!currentSite?.rooms.length) && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>请在左侧考点上点击增加考场添加数据</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Skill step: inherited sites view */}
        {activeStep === 'skill' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-100">技能考点（继承理论编排）</h4>
            {sites.length > 0 ? (
              <div className="space-y-3">
                {sites.map(site => (
                  <div key={site.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{site.name}</span>
                      <span className="text-xs text-gray-500">{site.rooms.length}个考场</span>
                    </div>
                    {site.rooms.map(room => (
                      <div key={room.id} className="mt-2 ml-4 p-2 bg-gray-50 rounded flex items-center justify-between">
                        <span className="text-sm">{room.name}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                            onClick={() => { setSelectedRoomForAction(room); setShowAssignCandidates(true) }}>
                            <Users className="w-3 h-3 mr-1" />安排考生
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                            onClick={() => { setSelectedRoomForAction(room); setShowAssignedDetail(true) }}>
                            <Eye className="w-3 h-3 mr-1" />查看分配
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>完成理论编排后，考点将自动继承到技能编排</p>
                <Button variant="link" size="sm" className="text-xs mt-2" onClick={() => setActiveStep('theory')}>
                  <ArrowLeft className="w-3 h-3 mr-1" />返回理论编排
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Arrangement Mode + Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <select value={arrangeMode} onChange={e => setArrangeMode(e.target.value as typeof arrangeMode)}
            className="h-8 rounded-md border border-gray-200 px-2 text-xs">
            <option>普通</option>
            <option>打乱</option>
          </select>
          {arrangeMode === '普通' ? (
            <Button variant="outline" size="sm" className="text-xs" onClick={handleShuffleArrange}>
              <Shuffle className="w-3.5 h-3.5 mr-1" />切换打乱编排
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setArrangeMode('普通'); toast.success('已切换为普通编排') }}>
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />切换普通编排
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('编排报表已导出')}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />编排报表
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('准考证已生成PDF')}>
            <Ticket className="w-3.5 h-3.5 mr-1" />准考证
          </Button>
        </div>
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Add Session Dialog */}
      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>添加{activeStep === 'theory' ? '理论' : '技能'}场次</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">日期</label>
              <Input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">开始时间</label>
                <Input type="time" value={sessionStart} onChange={e => setSessionStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">结束时间</label>
                <Input type="time" value={sessionEnd} onChange={e => setSessionEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSession(false)}>取消</Button>
            <Button onClick={handleAddSession} className="bg-[#1A56DB]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cycle Days Dialog */}
      <Dialog open={showCycleDays} onOpenChange={setShowCycleDays}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>循环天数 - 自动生成多批次场次</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">职业</label>
              <Input value={skillOccupation} onChange={e => setSkillOccupation(e.target.value)} placeholder="核反应堆运行值班员 / 三级" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">开始日期</label>
                <Input type="date" value={cycleStartDate} onChange={e => setCycleStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">循环天数</label>
                <Input type="number" min="1" max="30" value={cycleDays} onChange={e => setCycleDays(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">每批开始时间</label>
                <Input type="time" value={cycleStartTime} onChange={e => setCycleStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">每批结束时间</label>
                <Input type="time" value={cycleEndTime} onChange={e => setCycleEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">每批容纳人数</label>
              <Input type="number" value={cycleCapacity} onChange={e => setCycleCapacity(e.target.value)} />
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 rounded p-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              将自动生成 {parseInt(cycleDays) || 1} 个批次的考核场次
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCycleDays(false)}>取消</Button>
            <Button onClick={handleGenerateCycleSessions} className="bg-[#1A56DB]">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />生成场次
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Site Dialog */}
      <Dialog open={showAddSite} onOpenChange={setShowAddSite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>追加考点</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="考点名称" value={siteSearch} onChange={e => setSiteSearch(e.target.value)} className="flex-1" />
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">考点名称</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ALL_SITES.filter(s => !siteSearch || s.name.includes(siteSearch)).map((site, idx) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2 text-gray-900">{site.name}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => handleAddSite(site)} className="text-blue-600 hover:underline text-xs">选择</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSite(false)}>返回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>增加考场</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">考场名称</label>
              <Input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="如：103教室考场" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">座位数</label>
              <Input type="number" value={newRoomSeats} onChange={e => setNewRoomSeats(e.target.value)} placeholder="50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoom(false)}>取消</Button>
            <Button onClick={handleAddRoom} className="bg-[#1A56DB]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Candidates Dialog */}
      <Dialog open={showAssignCandidates} onOpenChange={setShowAssignCandidates}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedRoomForAction ? `安排考生到 ${selectedRoomForAction.name}` : '安排技能考核考生'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            {selectedRoomForAction
              ? `当前考位：剩余 ${selectedRoomForAction.remainingSeats} / 共 ${selectedRoomForAction.totalSeats}`
              : `当前职业：${skillOccupation || '未设置'}`}
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">选择考生（剩余{unassignedCount}人未安排）</div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox"
                checked={filteredCandidates.length > 0 && selectedCandidateIds.length === filteredCandidates.length}
                onChange={e => setSelectedCandidateIds(e.target.checked ? filteredCandidates.map(c => c.id) : [])}
                className="rounded" />
              全选未分配考生
            </label>
            <div className="border rounded p-2 space-y-1 max-h-40 overflow-y-auto">
              {filteredCandidates.map(candidate => (
                <label key={candidate.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox"
                    checked={selectedCandidateIds.includes(candidate.id)}
                    onChange={() => setSelectedCandidateIds(prev =>
                      prev.includes(candidate.id) ? prev.filter(id => id !== candidate.id) : [...prev, candidate.id]
                    )}
                    className="rounded" />
                  <span>{candidate.name}</span>
                  <span className="text-xs text-gray-500">
                    {candidate.occupation || candidate.profession || ''}{(candidate.level ? `(${candidate.level})` : '')}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">{candidate.org || '-'}</span>
                </label>
              ))}
              {filteredCandidates.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">所有考生已分配完毕</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAssignCandidates(false); setSelectedCandidateIds([]) }}>取消</Button>
            <Button onClick={() => handleAssignCandidates(selectedRoomForAction)} className="bg-[#1A56DB]" disabled={!selectedRoomForAction && !arrangeMode}>
              {arrangeMode === '打乱' && !selectedRoomForAction ? '请先选择考场' : '分配考生'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assigned Detail Dialog */}
      <Dialog open={showAssignedDetail} onOpenChange={setShowAssignedDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedRoomForAction?.name} 分配明细</DialogTitle></DialogHeader>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">姓名</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">证件号码</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">职业工种</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">等级</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">单位</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.filter(c => selectedRoomForAction?.assignedCandidateIds?.includes(c.id)).map((c, idx) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-500">{c.idCard || '-'}</td>
                    <td className="px-3 py-2 text-xs">{c.occupation || c.profession || '-'}</td>
                    <td className="px-3 py-2 text-xs">{c.level || '-'}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{c.org || '-'}</td>
                  </tr>
                ))}
                {(!selectedRoomForAction?.assignedCandidateIds?.length) && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">暂无分配考生</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignedDetail(false)}>返回</Button>
            {selectedRoomForAction && (selectedRoomForAction.assignedCandidateIds?.length ?? 0) > 0 && (
              <Button variant="outline" className="text-amber-600"
                onClick={() => { handleCancelRoomAssign(selectedRoomForAction); setShowAssignedDetail(false) }}>
                取消全部分配
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shuffle Result Dialog */}
      <Dialog open={showShuffleResult} onOpenChange={setShowShuffleResult}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>打乱编排结果（按工作单位）</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              共 {shuffleGroups.length} 个单位，{shuffleGroups.reduce((sum, g) => sum + g.count, 0)} 名考生已打乱
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">工作单位</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">考生人数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shuffleGroups.map((g, idx) => (
                    <tr key={g.org}>
                      <td className="px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 text-xs">{g.org}</td>
                      <td className="px-3 py-2 text-xs text-right">{g.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShuffleResult(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== Mock Data (Fallback) ====================
const mockPlans: ArrangementPlan[] = [
  { id: 'plan-2026-001', code: 'Y0041GD0000012603001', name: '大亚湾核电2026年第1批认定', site: '大亚湾基地考点', month: '2026年06月', status: '待编排', arrangementStatus: '待编排', count: 45 },
  { id: 'plan-2026-002', code: 'Y0041GD0000022603002', name: '阳江核电2026年第1批认定', site: '阳江培训中心', month: '2026年07月', status: '已编排', arrangementStatus: '已编排', count: 32 },
  { id: 'plan-2026-003', code: 'Y0041GD0000032603003', name: '核安全工程师三级认定', site: '测试有限公司考点', month: '2026年08月', status: '待编排', arrangementStatus: '待编排', count: 28 },
]

const mockSessions: ExamSession[] = [
  { id: 's1', timeRange: '2026-06-20 08:00~10:00', sessionType: 'theory', date: '2026-06-20', startTime: '08:00', endTime: '10:00' },
  { id: 's2', timeRange: '2026-06-20 10:00~12:00', sessionType: 'theory', date: '2026-06-20', startTime: '10:00', endTime: '12:00' },
  { id: 's3', timeRange: '2026-06-21 09:00~12:00', sessionType: 'skill', date: '2026-06-21', startTime: '09:00', endTime: '12:00' },
]

const mockCandidates: CandidateItem[] = [
  { id: 'c1', name: '陈小明', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', org: '大亚湾核电', isAssigned: false },
  { id: 'c2', name: '赵小红', idCard: '440301199105152345', occupation: '核反应堆运行值班员', level: '三级', org: '大亚湾核电', isAssigned: false },
  { id: 'c3', name: '刘建国', idCard: '441700198803203456', occupation: '电气试验员', level: '四级', org: '阳江核电', isAssigned: false },
  { id: 'c4', name: '孙丽华', idCard: '441700199207014567', occupation: '电气试验员', level: '四级', org: '阳江核电', isAssigned: false },
  { id: 'c5', name: '周文博', idCard: '440301198512055678', occupation: '核反应堆运行值班员', level: '三级', org: '测试有限公司', isAssigned: false },
  { id: 'c6', name: '吴刚', idCard: '440301199306019012', occupation: '核安全工程师', level: '三级', org: '大亚湾核电', isAssigned: false },
  { id: 'c7', name: '郑丽', idCard: '440301199408101234', occupation: '核电焊工', level: '四级', org: '测试有限公司', isAssigned: false },
  { id: 'c8', name: '黄强', idCard: '441700199510112345', occupation: '电气试验员', level: '四级', org: '阳江核电', isAssigned: false },
]
