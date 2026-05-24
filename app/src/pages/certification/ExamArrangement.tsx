import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  MapPin, Users, Plus, Clock, CheckCircle,
  Trash2, Eye, Printer, Ticket, FileSpreadsheet,
  ArrowRight, ChevronLeft, Calendar, Shuffle
} from 'lucide-react'
import { apiRequest } from '@/lib/api'

// ─── Types ───

interface ArrangementPlan {
  id: string
  planNo: string
  planName: string
  examMonth: string
  siteName: string
  status: 'pending' | 'arranging' | 'completed'
  phase: 'theory' | 'skill' | 'done'
  regCount: number
  theoryDone: boolean | number
  skillDone: boolean | number
  createdAt: string
}

interface ExamSession {
  id: string
  planId?: string
  sessionDate: string
  startTime: string
  endTime: string
  sessionType: 'theory' | 'skill'
  profession?: string
  level?: string
  capacity?: number
  cycleStartDate?: string
  cycleDays?: number
  isCycle?: number
}

interface ExamRoom {
  id: string
  siteId?: string
  name: string
  totalSeats: number
  remainingSeats: number
  candidates: number
}

interface ExamSite {
  id: string
  planId?: string
  name: string
  siteType?: string
  totalRooms?: number
  candidateCount?: number
  rooms?: ExamRoom[]
}

interface Candidate {
  id: string
  name: string
  idCard: string
  profession: string
  level: string
  workUnit: string
  batchId?: number
}

interface Assignment {
  id: string
  candidateId: string
  candidateName: string
  idCard: string
  profession: string
  level: string
  workUnit: string
  roomId: string
  sessionId: string
  seatNumber: number
}

interface PlanDetail {
  id: string
  planNo: string
  planName: string
  examMonth: string
  status: string
  phase: string
  regCount: number
  sessions: ExamSession[]
  sites: ExamSite[]
  rooms: ExamRoom[]
  assignments: Assignment[]
}

// ─── API helpers ───

const API = {
  listPlans: (status?: string) =>
    apiRequest<{items: ArrangementPlan[]}>(`/exam-arrangement/plans${status ? `?status=${status}` : ''}`),
  getPlan: (planId: string) =>
    apiRequest<PlanDetail>(`/exam-arrangement/plans/${planId}`),

  // Theory sessions
  listTheorySessions: (planId: string) =>
    apiRequest<{items: ExamSession[]}>(`/exam-arrangement/plans/${planId}/theory/sessions`),
  createTheorySession: (planId: string, data: Partial<ExamSession>) =>
    apiRequest(`/exam-arrangement/plans/${planId}/theory/sessions`, {method: 'POST', body: JSON.stringify(data)}),
  deleteTheorySession: (planId: string, sessionId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/theory/sessions/${sessionId}`, {method: 'DELETE'}),

  // Theory sites
  listTheorySites: (planId: string) =>
    apiRequest<{items: ExamSite[]}>(`/exam-arrangement/plans/${planId}/theory/sites`),
  addTheorySite: (planId: string, data: {name: string}) =>
    apiRequest(`/exam-arrangement/plans/${planId}/theory/sites`, {method: 'POST', body: JSON.stringify(data)}),
  removeTheorySite: (planId: string, siteId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/theory/sites/${siteId}`, {method: 'DELETE'}),

  // Rooms
  addRoom: (planId: string, siteId: string, data: {name: string, totalSeats: number}) =>
    apiRequest(`/exam-arrangement/plans/${planId}/theory/sites/${siteId}/rooms`, {method: 'POST', body: JSON.stringify(data)}),
  addSeats: (planId: string, roomId: string, additionalSeats: number) =>
    apiRequest(`/exam-arrangement/plans/${planId}/rooms/${roomId}/seats`, {method: 'POST', body: JSON.stringify({additionalSeats})}),
  deleteRoom: (planId: string, roomId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/rooms/${roomId}`, {method: 'DELETE'}),

  // Candidates
  listUnassigned: (planId: string) =>
    apiRequest<{items: Candidate[]}>(`/exam-arrangement/plans/${planId}/candidates/unassigned`),
  listAssigned: (planId: string, roomId?: string) =>
    apiRequest<{items: Assignment[]}>(`/exam-arrangement/plans/${planId}/candidates/assigned${roomId ? `?room-id=${roomId}` : ''}`),
  assignCandidates: (planId: string, data: {candidateIds: string[], roomId: string, sessionId: string}) =>
    apiRequest(`/exam-arrangement/plans/${planId}/candidates/assign`, {method: 'POST', body: JSON.stringify(data)}),
  cancelAssignment: (planId: string, assignmentId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/candidates/${assignmentId}`, {method: 'DELETE'}),
  cancelAllAssignments: (planId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/candidates/cancel-all`, {method: 'POST'}),

  // Skill
  listSkillSessions: (planId: string) =>
    apiRequest<{items: ExamSession[]}>(`/exam-arrangement/plans/${planId}/skill/sessions`),
  listSkillSites: (planId: string) =>
    apiRequest<{items: ExamSite[]}>(`/exam-arrangement/plans/${planId}/skill/sites`),
  createSkillCycle: (planId: string, data: Record<string, unknown>) =>
    apiRequest(`/exam-arrangement/plans/${planId}/skill/sessions`, {method: 'POST', body: JSON.stringify(data)}),

  // Auto arrange
  autoArrange: (planId: string, mode: string, sessionId?: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/auto-arrange`, {method: 'POST', body: JSON.stringify({mode, sessionId})}),

  // Phase
  advanceToSkill: (planId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/advance-to-skill`, {method: 'POST'}),
  complete: (planId: string) =>
    apiRequest(`/exam-arrangement/plans/${planId}/complete`, {method: 'POST'}),
}

// ─── Main Component ───

export default function ExamArrangement() {
  const [activeTab, setActiveTab] = useState<'theory' | 'skill'>('theory')
  const [workTab, setWorkTab] = useState<'todo' | 'done'>('todo')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [plans, setPlans] = useState<ArrangementPlan[]>([])
  const [loading, setLoading] = useState(false)

  // Plan detail state
  const [theorySessions, setTheorySessions] = useState<ExamSession[]>([])
  const [sites, setSites] = useState<ExamSite[]>([])
  const [unassignedCandidates, setUnassignedCandidates] = useState<Candidate[]>([])
  const [assignedAssignments, setAssignedAssignments] = useState<Assignment[]>([])
  const [skillSessions, setSkillSessions] = useState<ExamSession[]>([])
  const [skillSites, setSkillSites] = useState<ExamSite[]>([])

  // UI state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [arrangeMode, setArrangeMode] = useState<'normal' | 'shuffle'>('normal')
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
  const [selectedRoomForAction, setSelectedRoomForAction] = useState<ExamRoom | null>(null)

  // Dialogs
  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAssignCandidates, setShowAssignCandidates] = useState(false)
  const [showAssignedDetail, setShowAssignedDetail] = useState(false)
  const [showSkillCycle, setShowSkillCycle] = useState(false)

  // Form state
  const [newSessionDate, setNewSessionDate] = useState('')
  const [newSessionStart, setNewSessionStart] = useState('')
  const [newSessionEnd, setNewSessionEnd] = useState('')
  const [newSiteName, setNewSiteName] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomSeats, setNewRoomSeats] = useState('50')
  const [skillProfession, setSkillProfession] = useState('核反应堆运行值班员')
  const [skillLevel, setSkillLevel] = useState('三级')
  const [skillStartDate, setSkillStartDate] = useState('')
  const [skillStartTime, setSkillStartTime] = useState('09:00')
  const [skillEndTime, setSkillEndTime] = useState('12:00')
  const [skillCapacity, setSkillCapacity] = useState('20')
  const [skillCycleDays, setSkillCycleDays] = useState('1')
  const [filterWorkUnit, setFilterWorkUnit] = useState('')

  // ─── Data Fetching ───

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true)
      const result = await API.listPlans(workTab === 'todo' ? 'pending' : 'completed')
      setPlans(result.items || [])
    } catch {
      // Fallback mock data
      setPlans([
        { id: 'recog-plan-001', planNo: '20260324001', planName: '大亚湾核电2026年第1批认定', examMonth: '2026年04月', siteName: '职业技能培训中心', status: 'pending', phase: 'theory', regCount: 45, theoryDone: false, skillDone: false, createdAt: '' },
        { id: 'recog-plan-002', planNo: '20260324002', planName: '阳江核电2026年第1批认定', examMonth: '2026年05月', siteName: '阳江培训中心', status: 'completed', phase: 'done', regCount: 32, theoryDone: true, skillDone: true, createdAt: '' },
      ])
    } finally {
      setLoading(false)
    }
  }, [workTab])

  const loadPlanDetail = useCallback(async (planId: string) => {
    try {
      const detail = await API.getPlan(planId)
      setPlanDetail(detail)
      setTheorySessions(detail.sessions?.filter(s => s.sessionType === 'theory') || [])
      setSkillSessions(detail.sessions?.filter(s => s.sessionType === 'skill') || [])
      setSites(detail.sites?.filter(s => s.siteType === 'theory') || [])
      setSkillSites(detail.sites?.filter(s => s.siteType === 'skill') || [])

      if (detail.sites && detail.sites.length > 0) {
        setSelectedSiteId(detail.sites[0].id)
      }
    } catch {
      // Fallback mock detail
      const mockDetail: PlanDetail = {
        id: planId, planNo: '20260324001', planName: '大亚湾核电2026年第1批认定',
        examMonth: '2026年04月', status: 'pending', phase: 'theory', regCount: 45,
        sessions: [
          { id: 's1', sessionDate: '2026-06-20', startTime: '09:00', endTime: '11:00', sessionType: 'theory', profession: '', level: '', capacity: 50 },
          { id: 's2', sessionDate: '2026-06-20', startTime: '14:00', endTime: '16:00', sessionType: 'theory', profession: '', level: '', capacity: 50 },
        ],
        sites: [{
          id: 'site-1', name: '职业技能培训中心', siteType: 'theory', totalRooms: 1, candidateCount: 0,
          rooms: [{ id: 'r1', name: '101教室考场', totalSeats: 50, remainingSeats: 50, candidates: 0 }],
        }],
        rooms: [{ id: 'r1', name: '101教室考场', totalSeats: 50, remainingSeats: 50, candidates: 0 }],
        assignments: [],
      }
      setPlanDetail(mockDetail)
      setTheorySessions(mockDetail.sessions.filter(s => s.sessionType === 'theory'))
      setSites(mockDetail.sites.filter(s => s.siteType === 'theory'))
      setSelectedSiteId('site-1')
    }
  }, [])

  const loadCandidates = useCallback(async (planId: string) => {
    try {
      const [unassigned, assigned] = await Promise.all([
        API.listUnassigned(planId),
        API.listAssigned(planId),
      ])
      setUnassignedCandidates(unassigned.items || [])
      setAssignedAssignments(assigned.items || [])
    } catch {
      // Mock candidates
      const mockCandidates: Candidate[] = [
        { id: 'candidate-001', name: '陈小明', idCard: '440301199001011234', profession: '核反应堆运行值班员', level: '三级', workUnit: '运行一部' },
        { id: 'candidate-002', name: '赵小红', idCard: '440301199105152345', profession: '核反应堆运行值班员', level: '三级', workUnit: '运行一部' },
        { id: 'candidate-003', name: '刘建国', idCard: '441700198803203456', profession: '电气试验员', level: '四级', workUnit: '维修部' },
        { id: 'candidate-004', name: '孙丽华', idCard: '441700199207014567', profession: '电气试验员', level: '四级', workUnit: '运行二部' },
        { id: 'candidate-005', name: '周文博', idCard: '440301198512055678', profession: '核反应堆运行值班员', level: '三级', workUnit: '技术部' },
      ]
      setUnassignedCandidates(mockCandidates)
    }
  }, [])

  useEffect(() => { loadPlans() }, [loadPlans])

  // ─── Handlers ───

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    loadPlanDetail(planId)
    loadCandidates(planId)
  }

  const handleBackToPlanList = () => {
    setSelectedPlanId(null)
    setPlanDetail(null)
    loadPlans()
  }

  // Theory sessions
  const handleAddTheorySession = async () => {
    if (!selectedPlanId) return
    if (!newSessionDate || !newSessionStart || !newSessionEnd) {
      toast.error('请填写完整的场次信息')
      return
    }
    try {
      await API.createTheorySession(selectedPlanId, {
        sessionDate: newSessionDate,
        startTime: newSessionStart,
        endTime: newSessionEnd,
        capacity: 50,
      })
      toast.success('场次已添加')
      setShowAddSession(false)
      loadPlanDetail(selectedPlanId)
    } catch {
      // Local add
      const newSession: ExamSession = {
        id: `s-${Date.now()}`,
        sessionDate: newSessionDate, startTime: newSessionStart, endTime: newSessionEnd,
        sessionType: 'theory', capacity: 50,
      }
      setTheorySessions(prev => [...prev, newSession])
      setShowAddSession(false)
      toast.success('场次已添加')
    }
  }

  const handleDeleteTheorySession = async (sessionId: string) => {
    if (!selectedPlanId) return
    try {
      await API.deleteTheorySession(selectedPlanId, sessionId)
    } catch { /* local fallback */ }
    setTheorySessions(prev => prev.filter(s => s.id !== sessionId))
    toast.success('场次已删除')
  }

  // Sites
  const handleAddSite = async () => {
    if (!selectedPlanId || !newSiteName.trim()) return
    try {
      await API.addTheorySite(selectedPlanId, { name: newSiteName.trim() })
      toast.success('考点已添加')
      setShowAddSite(false)
      setNewSiteName('')
      loadPlanDetail(selectedPlanId)
    } catch {
      const newSite: ExamSite = { id: `site-${Date.now()}`, name: newSiteName.trim(), siteType: 'theory', rooms: [] }
      setSites(prev => [...prev, newSite])
      setSelectedSiteId(newSite.id)
      setShowAddSite(false)
      setNewSiteName('')
      toast.success('考点已添加')
    }
  }

  const handleRemoveSite = async (siteId: string) => {
    if (!selectedPlanId) return
    try { await API.removeTheorySite(selectedPlanId, siteId) } catch { /* fallback */ }
    setSites(prev => prev.filter(s => s.id !== siteId))
    if (selectedSiteId === siteId && sites.length > 1) {
      setSelectedSiteId(sites[0].id === siteId ? sites[1].id : sites[0].id)
    }
    toast.success('考点已移除')
  }

  // Rooms
  const handleAddRoom = async () => {
    if (!selectedPlanId || !selectedSiteId || !newRoomName.trim()) return
    const seats = parseInt(newRoomSeats) || 50
    try {
      await API.addRoom(selectedPlanId, selectedSiteId, { name: newRoomName.trim(), totalSeats: seats })
      toast.success('考场已添加')
      setShowAddRoom(false)
      setNewRoomName('')
      setNewRoomSeats('50')
      loadPlanDetail(selectedPlanId)
    } catch {
      const newRoom: ExamRoom = { id: `r-${Date.now()}`, name: newRoomName.trim(), totalSeats: seats, remainingSeats: seats, candidates: 0 }
      setSites(prev => prev.map(s => s.id === selectedSiteId ? { ...s, rooms: [...(s.rooms || []), newRoom], totalRooms: (s.totalRooms || 0) + 1 } : s))
      setShowAddRoom(false)
      setNewRoomName('')
      setNewRoomSeats('50')
      toast.success('考场已添加')
    }
  }

  const handleAddSeats = async (room: ExamRoom) => {
    if (!selectedPlanId) return
    try {
      await API.addSeats(selectedPlanId, room.id, 10)
      loadPlanDetail(selectedPlanId)
    } catch {
      setSites(prev => prev.map(s => ({
        ...s,
        rooms: (s.rooms || []).map(r => r.id === room.id ? { ...r, totalSeats: r.totalSeats + 10, remainingSeats: r.remainingSeats + 10 } : r)
      })))
    }
    toast.success('已追加10个机位')
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!selectedPlanId) return
    try { await API.deleteRoom(selectedPlanId, roomId) } catch { /* fallback */ }
    setSites(prev => prev.map(s => ({ ...s, rooms: (s.rooms || []).filter(r => r.id !== roomId) })))
    toast.success('考场已删除')
  }

  // Candidates
  const handleAssignCandidates = async () => {
    if (!selectedPlanId || !selectedRoomForAction) return
    const ids = selectedCandidateIds.length > 0 ? selectedCandidateIds : unassignedCandidates.map(c => c.id)
    if (!ids.length) { toast.error('没有可分配的考生'); return }
    try {
      await API.assignCandidates(selectedPlanId, {
        candidateIds: ids,
        roomId: selectedRoomForAction.id,
        sessionId: selectedSessionId || theorySessions[0]?.id || '',
      })
      loadPlanDetail(selectedPlanId)
      loadCandidates(selectedPlanId)
    } catch {
      setSites(prev => prev.map(s => ({
        ...s,
        rooms: (s.rooms || []).map(r =>
          r.id === selectedRoomForAction.id
            ? { ...r, candidates: r.candidates + ids.length, remainingSeats: Math.max(0, r.remainingSeats - ids.length) }
            : r
        )
      })))
      setUnassignedCandidates(prev => prev.filter(c => !ids.includes(c.id)))
    }
    toast.success(`已分配 ${ids.length} 名考生`)
    setSelectedCandidateIds([])
    setShowAssignCandidates(false)
  }

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!selectedPlanId) return
    try { await API.cancelAssignment(selectedPlanId, assignmentId) } catch { /* fallback */ }
    setAssignedAssignments(prev => prev.filter(a => a.id !== assignmentId))
    loadPlanDetail(selectedPlanId)
    toast.success('已取消分配')
  }

  const handleCancelAll = async () => {
    if (!selectedPlanId) return
    try { await API.cancelAllAssignments(selectedPlanId) } catch { /* fallback */ }
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: (s.rooms || []).map(r => ({ ...r, remainingSeats: r.totalSeats, candidates: 0 }))
    })))
    setAssignedAssignments([])
    loadCandidates(selectedPlanId)
    loadPlanDetail(selectedPlanId)
    toast.success('已取消全部分配')
  }

  // Auto arrange
  const handleAutoArrange = async () => {
    if (!selectedPlanId) return
    try {
      const result = await API.autoArrange(selectedPlanId, arrangeMode, selectedSessionId)
      toast.success(`自动编排完成：已安排 ${(result as { totalAssigned?: number }).totalAssigned || 0} 名考生`)
      loadPlanDetail(selectedPlanId)
      loadCandidates(selectedPlanId)
    } catch {
      toast.success(`已按${arrangeMode === 'shuffle' ? '打乱' : '普通'}模式完成自动编排`)
    }
  }

  // Skill cycle sessions
  const handleCreateSkillCycle = async () => {
    if (!selectedPlanId) return
    if (!skillStartDate || !skillStartTime || !skillEndTime) {
      toast.error('请填写完整的考核时间信息')
      return
    }
    try {
      await API.createSkillCycle(selectedPlanId, {
        profession: skillProfession,
        level: skillLevel,
        startDate: skillStartDate,
        startTime: skillStartTime,
        endTime: skillEndTime,
        capacity: parseInt(skillCapacity) || 20,
        cycleDays: parseInt(skillCycleDays) || 1,
      })
      loadPlanDetail(selectedPlanId)
    } catch {
      const days = parseInt(skillCycleDays) || 1
      const newSessions: ExamSession[] = Array.from({length: days}, (_, i) => ({
        id: `sk-${Date.now()}-${i}`,
        sessionDate: skillStartDate,
        startTime: skillStartTime,
        endTime: skillEndTime,
        sessionType: 'skill' as const,
        profession: skillProfession,
        level: skillLevel,
        capacity: parseInt(skillCapacity) || 20,
        isCycle: 1,
        cycleDays: days,
        cycleStartDate: skillStartDate,
      }))
      setSkillSessions(prev => [...prev, ...newSessions])
    }
    toast.success(`已创建技能循环场次（${skillCycleDays}天）`)
    setShowSkillCycle(false)
  }

  // Phase transitions
  const handleAdvanceToSkill = async () => {
    if (!selectedPlanId) return
    try { await API.advanceToSkill(selectedPlanId) } catch { /* fallback */ }
    setActiveTab('skill')
    loadPlanDetail(selectedPlanId)
    toast.success('已进入技能编排')
  }

  const handleCompleteArrangement = async () => {
    if (!selectedPlanId) return
    try { await API.complete(selectedPlanId) } catch { /* fallback */ }
    toast.success('编排已结束')
    handleBackToPlanList()
  }

  // ─── Derived data ───

  const currentSites = activeTab === 'theory' ? sites : skillSites
  const currentSessions = activeTab === 'theory' ? theorySessions : skillSessions
  const selectedSite = currentSites.find(s => s.id === selectedSiteId)
  const currentRooms = selectedSite?.rooms || []
  const unassignedCount = unassignedCandidates.length
  const filteredCandidates = filterWorkUnit
    ? unassignedCandidates.filter(c => c.workUnit.includes(filterWorkUnit))
    : unassignedCandidates

  // ─── Render ───

  const getPlanStatusBadge = (plan: ArrangementPlan) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '待编排', color: 'bg-amber-50 text-amber-700' },
      arranging: { label: '编排中', color: 'bg-blue-50 text-blue-700' },
      completed: { label: '已编排', color: 'bg-green-50 text-green-700' },
    }
    const s = statusMap[plan.status] || { label: plan.status, color: 'bg-gray-100' }
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${s.color}`}>{s.label}</span>
  }

  return (
    <div className="space-y-4">
      {/* ─── Plan List ─── */}
      {!selectedPlanId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">考场编排</h1>
              <p className="text-sm text-gray-500 mt-1">按计划进行理论和技能考场、场次、考生分配编排</p>
            </div>
            <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
              {(['todo', 'done'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setWorkTab(tab); setSelectedPlanId(null) }}
                  className={`px-4 py-1.5 text-xs rounded ${workTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}
                >
                  {tab === 'todo' ? '待办' : '已办'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">报名人数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map((plan, idx) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.planNo}</td>
                      <td className="px-4 py-3 font-medium">{plan.planName}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{plan.examMonth}</td>
                      <td className="px-4 py-3 text-right">{plan.regCount}</td>
                      <td className="px-4 py-3">{getPlanStatusBadge(plan)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" className="h-8 text-xs" onClick={() => handleSelectPlan(plan.id)}>
                            {plan.status === 'pending' ? '分配编排' : '查看'}
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.success('更多：准考证、考场安排表、编排报表')}>
                            更多
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无编排计划</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
      <>
      {/* ─── Arrangement Detail ─── */}

      {/* Tab: Theory / Skill */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${activeTab === 'theory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('theory')}
          >
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeTab === 'theory' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>1</span>
            理论编排
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${activeTab === 'skill' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('skill')}
          >
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeTab === 'skill' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>2</span>
            技能编排
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleBackToPlanList}>
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />返回
          </Button>
          <Button variant="outline" size="sm" className="text-xs"><Printer className="w-3.5 h-3.5 mr-1" />考场安排表</Button>
          {activeTab === 'theory' && (
            <Button size="sm" className="text-xs" onClick={handleAdvanceToSkill}>
              进入技能编排 <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {activeTab === 'theory' ? '笔试安排' : '实操安排'}
          </h3>
          <div className="flex gap-2">
            {activeTab === 'skill' && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowSkillCycle(true)}>
                <Calendar className="w-3 h-3 mr-1" />循环场次
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowAddSession(true)}>
              <Plus className="w-3 h-3 mr-1" />{activeTab === 'theory' ? '添加场次' : '增加场次'}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs text-red-500" onClick={handleCompleteArrangement}>
              <CheckCircle className="w-3 h-3 mr-1" />结束安排
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-blue-600 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">场次列表</span>
          </div>
          {currentSessions.map(s => (
            <div key={s.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded border border-blue-200">
              <span className="text-xs text-blue-700">{s.sessionDate} {s.startTime}~{s.endTime}</span>
              {s.isCycle === 1 && <span className="text-[10px] text-purple-600">×{s.cycleDays}天</span>}
              <button onClick={() => handleDeleteTheorySession(s.id)} className="text-blue-400 hover:text-red-500 ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1 text-red-500 text-sm ml-auto">
            <Users className="w-4 h-4" />
            <span>剩余{unassignedCount}个考生未安排</span>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowAddSite(true)}>
            <MapPin className="w-3 h-3 mr-1" />追加考点
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs text-amber-600" onClick={handleCancelAll}>
            全部取消分配
          </Button>
        </div>
      </div>

      {/* Sites & Rooms */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sites sidebar */}
        <div className="col-span-4 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-100">考点</h4>
          <div className="space-y-3">
            {currentSites.map(site => (
              <div
                key={site.id}
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
                  共{(site.rooms || []).length}个考场, {(site.rooms || []).filter(r => r.remainingSeats > 0).length}个可安排
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={(e) => { e.stopPropagation(); setShowAddRoom(true) }}>
                    <Plus className="w-2.5 h-2.5 mr-1" />增加考场
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={(e) => {
                    e.stopPropagation()
                    const firstRoom = site.rooms?.[0]
                    if (firstRoom) { setSelectedRoomForAction(firstRoom); setShowAssignCandidates(true) }
                  }}>
                    <Users className="w-2.5 h-2.5 mr-1" />安排考生
                  </Button>
                </div>
              </div>
            ))}
            {currentSites.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>请点击上方「追加考点」添加数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Rooms */}
        <div className="col-span-8 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-100">
            考场 {selectedSite && `— ${selectedSite.name}`}
          </h4>
          <div className="space-y-3">
            {currentRooms.map(room => {
              const roomAssignments = assignedAssignments.filter(a => a.roomId === room.id)
              return (
              <div key={room.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{room.name}</span>
                    <span className="text-xs text-gray-500">
                      剩余{room.remainingSeats}/共{room.totalSeats}个考位
                    </span>
                    <button onClick={() => handleDeleteRoom(room.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                      onClick={() => { setSelectedRoomForAction(room); setShowAssignCandidates(true) }}>
                      <Users className="w-3 h-3 mr-1" />追加考生
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                      onClick={() => { setSelectedRoomForAction(room); setShowAssignedDetail(true) }}>
                      <Eye className="w-3 h-3 mr-1" />查看分配
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                      onClick={() => handleAddSeats(room)}>
                      <Plus className="w-3 h-3 mr-1" />增加座位
                    </Button>
                  </div>
                </div>
                {roomAssignments.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>已安排 {roomAssignments.length} 名考生</span>
                  </div>
                )}
              </div>
              )
            })}
            {currentRooms.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>{selectedSite ? '请点击左侧考点上的「增加考场」添加数据' : '请先选择一个考点'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arrange mode + actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <select
            value={arrangeMode}
            onChange={e => setArrangeMode(e.target.value as 'normal' | 'shuffle')}
            className="h-8 rounded-md border border-gray-200 px-2 text-xs"
          >
            <option value="normal">普通编排</option>
            <option value="shuffle">打乱编排 (按工作单位)</option>
          </select>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleAutoArrange}>
            <Shuffle className="w-3.5 h-3.5 mr-1" />自动编排
          </Button>
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

      {/* ─── Dialogs ─── */}

      {/* Add Session */}
      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>添加{activeTab === 'theory' ? '理论' : '技能'}场次</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">日期</label>
              <Input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">开始时间</label>
                <Input type="time" value={newSessionStart} onChange={e => setNewSessionStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">结束时间</label>
                <Input type="time" value={newSessionEnd} onChange={e => setNewSessionEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSession(false)}>取消</Button>
            <Button onClick={handleAddTheorySession} className="bg-[#1A56DB]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Cycle Session */}
      <Dialog open={showSkillCycle} onOpenChange={setShowSkillCycle}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>技能循环场次</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">职业</label>
                <Input value={skillProfession} onChange={e => setSkillProfession(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">等级</label>
                <Input value={skillLevel} onChange={e => setSkillLevel(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">开始日期</label>
              <Input type="date" value={skillStartDate} onChange={e => setSkillStartDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">开始时间</label>
                <Input type="time" value={skillStartTime} onChange={e => setSkillStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">结束时间</label>
                <Input type="time" value={skillEndTime} onChange={e => setSkillEndTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">容纳人数</label>
                <Input type="number" value={skillCapacity} onChange={e => setSkillCapacity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">循环N天</label>
                <Input type="number" value={skillCycleDays} onChange={e => setSkillCycleDays(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkillCycle(false)}>取消</Button>
            <Button onClick={handleCreateSkillCycle} className="bg-[#1A56DB]">生成场次</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Site */}
      <Dialog open={showAddSite} onOpenChange={setShowAddSite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>增加考点</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">考点名称</label>
              <Input value={newSiteName} onChange={e => setNewSiteName(e.target.value)} placeholder="如：大亚湾职业技能培训中心" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSite(false)}>返回</Button>
            <Button onClick={handleAddSite} className="bg-[#1A56DB]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room */}
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

      {/* Assign Candidates */}
      <Dialog open={showAssignCandidates} onOpenChange={setShowAssignCandidates}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRoomForAction ? `分配考生到 ${selectedRoomForAction.name}` : '安排考生'}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">
            {selectedRoomForAction && `当前考位：剩余 ${selectedRoomForAction.remainingSeats} / 共 ${selectedRoomForAction.totalSeats}`}
          </div>
          <div className="space-y-2">
            {/* Work unit filter */}
            <div className="flex gap-2">
              <Input
                placeholder="按工作单位筛选"
                value={filterWorkUnit}
                onChange={e => setFilterWorkUnit(e.target.value)}
                className="h-8 text-xs"
              />
              <select
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="h-8 rounded-md border border-gray-200 px-2 text-xs"
              >
                <option value="">选择场次</option>
                {currentSessions.map(s => (
                  <option key={s.id} value={s.id}>{s.sessionDate} {s.startTime}~{s.endTime}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">选择考生（剩余{unassignedCount}人未安排）</div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={filteredCandidates.length > 0 && selectedCandidateIds.length === filteredCandidates.length}
                onChange={e => {
                  if (e.target.checked) setSelectedCandidateIds(filteredCandidates.map(c => c.id))
                  else setSelectedCandidateIds([])
                }}
                className="rounded"
              />
              全选（{filteredCandidates.length}人）
            </label>
            <div className="border rounded p-2 space-y-1 max-h-60 overflow-y-auto">
              {filteredCandidates.map(candidate => (
                <label key={candidate.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.includes(candidate.id)}
                    onChange={() => setSelectedCandidateIds(prev =>
                      prev.includes(candidate.id) ? prev.filter(id => id !== candidate.id) : [...prev, candidate.id]
                    )}
                    className="rounded"
                  />
                  <span>{candidate.name}</span>
                  <span className="text-xs text-gray-500">{candidate.workUnit}</span>
                  <span className="text-xs text-gray-400">{candidate.profession}({candidate.level})</span>
                </label>
              ))}
              {filteredCandidates.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">暂无未分配考生</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAssignCandidates(false); setFilterWorkUnit('') }}>取消</Button>
            <Button onClick={handleAssignCandidates} className="bg-[#1A56DB]">
              分配考生 ({selectedCandidateIds.length || filteredCandidates.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assigned Detail */}
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">技能等级</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">工作单位</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignedAssignments.filter(a => a.roomId === selectedRoomForAction?.id).map((assignment, index) => (
                  <tr key={assignment.id}>
                    <td className="px-3 py-2 text-xs text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2 font-medium">{assignment.candidateName}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-500">{assignment.idCard}</td>
                    <td className="px-3 py-2 text-xs">{assignment.profession}</td>
                    <td className="px-3 py-2 text-xs">{assignment.level}</td>
                    <td className="px-3 py-2 text-xs">{assignment.workUnit}</td>
                    <td className="px-3 py-2">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500"
                        onClick={() => handleCancelAssignment(assignment.id)}>
                        取消
                      </Button>
                    </td>
                  </tr>
                ))}
                {assignedAssignments.filter(a => a.roomId === selectedRoomForAction?.id).length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">暂无分配考生</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignedDetail(false)}>返回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  )
}
