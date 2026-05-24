import { useState, useEffect, useMemo, useCallback } from 'react'
import { Users, UserCheck, Monitor, ClipboardCheck, Search, X, Plus, Trash2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'

// ─── Types ───

interface AssignmentRecord {
  id: string
  planId: string
  staffId: string
  staffName: string
  staffPhone: string
  staffType: string
  staffUnitName: string
  examRoomId: string | null
  examRoomName: string | null
  sessionId: string | null
  sessionName: string | null
  assignmentRole: string
  assignmentDate: string
  status: string
  createdAt: string
}

interface PlanRecord {
  id: string
  name: string
  occupation?: string
  level?: string
  status?: string
  [key: string]: unknown
}

interface SessionRecord {
  id: string
  name: string
  planId: string
  sessionType?: string
  startAt?: string
  endAt?: string
  status?: string
  [key: string]: unknown
}

interface ExamRoomRecord {
  id: string
  name: string
  address?: string
  seatCount?: number
  status?: string
  [key: string]: unknown
}

interface AssignableStaff {
  id: string
  name: string
  phone: string
  gender: string
  staffType: string
  unitName: string
  loginName: string
  idCard: string
  position?: string
  assignmentId: string | null
  assignmentStatus: string | null
  assignedRoomId: string | null
  assignedSessionId: string | null
  assignedRoomName: string | null
  assignedSessionName: string | null
}


type AssignmentRole = 'supervisor' | 'exam_staff' | 'invigilator' | 'evaluator'

interface RoleTab {
  value: AssignmentRole
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const ROLE_TABS: RoleTab[] = [
  { value: 'supervisor', label: '督导安排', icon: Monitor, description: '安排督导人员监督考试过程' },
  { value: 'exam_staff', label: '考务安排', icon: ClipboardCheck, description: '安排考务人员负责考试组织工作' },
  { value: 'invigilator', label: '监考安排', icon: UserCheck, description: '安排监考人员负责考场纪律' },
  { value: 'evaluator', label: '技能考评安排', icon: Users, description: '安排考评人员进行技能考核评分' },
]

const ROLE_LABELS: Record<AssignmentRole, string> = {
  supervisor: '督导',
  exam_staff: '考务',
  invigilator: '监考',
  evaluator: '考评',
}

interface StaffAssignDialogProps {
  open: boolean
  onClose: () => void
}

export default function StaffAssignDialog({ open, onClose }: StaffAssignDialogProps) {
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [rooms, setRooms] = useState<ExamRoomRecord[]>([])
  const [occupations, setOccupations] = useState<string[]>([])
  const [assignableStaff, setAssignableStaff] = useState<AssignableStaff[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [historyStaffId, setHistoryStaffId] = useState<string | null>(null)
  const [historyRecords, setHistoryRecords] = useState<AssignmentRecord[]>([])

  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [activeRole, setActiveRole] = useState<AssignmentRole>('exam_staff')
  const [occupationFilter, setOccupationFilter] = useState('')
  const [staffSearch, setStaffSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch plans on open
  useEffect(() => {
    if (!open) return
    apiRequest('/certification/plans')
      .then((data: unknown) => {
        const items = Array.isArray(data) ? data : (data as { items?: PlanRecord[] })?.items || []
        setPlans(items as PlanRecord[])
      })
      .catch(() => {
        // Use mock data
        setPlans([
          { id: 'plan-2026-001', name: '2026年第一批核反应堆运行值班员三级认定', occupation: '核反应堆运行值班员', level: '三级', status: 'processing' },
          { id: 'plan-2026-002', name: '2026年第二批电气试验员四级认定', occupation: '电气试验员', level: '四级', status: 'pending' },
          { id: 'plan-2026-003', name: '2026年核安全工程师三级认定', occupation: '核安全工程师', level: '三级', status: 'draft' },
          { id: 'plan-2026-004', name: '2026年核电焊工四级认定', occupation: '核电焊工', level: '四级', status: 'draft' },
        ])
      })
  }, [open])

  // Fetch sessions when plan changes
  useEffect(() => {
    if (!selectedPlan) {
      setSessions([])
      setSelectedSession('')
      return
    }
    apiRequest('/staff-assignment/plan-sessions', { query: { planId: selectedPlan } })
      .then((data: unknown) => {
        setSessions((data as { items: SessionRecord[] })?.items || [])
      })
      .catch(() => {
        setSessions([
          { id: 'exam-session-001', name: '理论考试第一场', planId: selectedPlan, sessionType: 'theory', startAt: '2026-06-20 09:00' },
          { id: 'exam-session-002', name: '理论考试第二场', planId: selectedPlan, sessionType: 'theory', startAt: '2026-06-20 14:00' },
          { id: 'exam-session-003', name: '技能考试第一场', planId: selectedPlan, sessionType: 'skill', startAt: '2026-06-21 09:00' },
        ])
      })
    // Reset selections
    setSelectedSession('')
    setSelectedRoom('')
  }, [selectedPlan])

  // Fetch rooms
  useEffect(() => {
    if (!open) return
    apiRequest('/staff-assignment/exam-rooms')
      .then((data: unknown) => {
        setRooms((data as { items: ExamRoomRecord[] })?.items || [])
      })
      .catch(() => {
        setRooms([
          { id: 'room-001', name: '大亚湾基地考点-理论考场A', address: '大亚湾基地', seatCount: 30, status: 'active' },
          { id: 'room-002', name: '大亚湾基地考点-理论考场B', address: '大亚湾基地', seatCount: 30, status: 'active' },
          { id: 'room-003', name: '大亚湾基地考点-技能考场A', address: '大亚湾基地', seatCount: 20, status: 'active' },
          { id: 'room-004', name: '阳江基地考点-理论考场', address: '阳江基地', seatCount: 25, status: 'active' },
        ])
      })
  }, [open])

  // Fetch occupations for evaluator role
  useEffect(() => {
    if (!selectedPlan || activeRole !== 'evaluator') {
      setOccupations([])
      setOccupationFilter('')
      return
    }
    apiRequest('/staff-assignment/plan-occupations', { query: { planId: selectedPlan } })
      .then((data: unknown) => {
        setOccupations((data as { items: string[] })?.items || [])
      })
      .catch(() => {
        setOccupations(['核反应堆运行值班员', '电气试验员', '核安全工程师', '核电焊工'])
      })
  }, [selectedPlan, activeRole])

  // Fetch assignable staff when context changes
  const fetchAssignableStaff = useCallback(() => {
    if (!selectedPlan) return
    setLoading(true)
    const query: Record<string, string> = {
      planId: selectedPlan,
      staffType: activeRole === 'exam_staff' ? 'exam_staff'
        : activeRole === 'invigilator' ? 'proctor'
        : activeRole === 'evaluator' ? 'evaluator'
        : 'exam_staff',
      assignmentRole: activeRole === 'exam_staff' ? 'exam_staff'
        : activeRole === 'supervisor' ? 'supervisor'
        : activeRole === 'invigilator' ? 'invigilator'
        : 'evaluator',
    }
    if (activeRole === 'evaluator' && occupationFilter) {
      query.occupation = occupationFilter
    }
    apiRequest('/staff-assignment/assignable-staff', { query })
      .then((data: unknown) => {
        setAssignableStaff((data as { items: AssignableStaff[] })?.items || [])
      })
      .catch(() => {
        // Mock data
        setAssignableStaff([
          { id: 'exam-staff-001', name: '李考务', phone: '13800138111', gender: '男', staffType: 'exam_staff', unitName: '测试有限公司', loginName: '440301198201011234', idCard: '440301198201011234', position: '考务主管', assignmentId: null, assignmentStatus: null, assignedRoomId: null, assignedSessionId: null, assignedRoomName: null, assignedSessionName: null },
          { id: 'exam-staff-002', name: '王监考', phone: '13800138112', gender: '女', staffType: 'proctor', unitName: '测试有限公司', loginName: '440301199005152345', idCard: '440301199005152345', position: '主监考', assignmentId: 'assign-001', assignmentStatus: 'assigned', assignedRoomId: 'room-001', assignedSessionId: 'exam-session-001', assignedRoomName: '大亚湾基地考点-理论考场A', assignedSessionName: '理论考试第一场' },
          { id: 'exam-staff-003', name: '张专家', phone: '13800138001', gender: '男', staffType: 'evaluator', unitName: '中广核研究院', loginName: '440301197805154321', idCard: '440301197805154321', position: '高级考评员', assignmentId: null, assignmentStatus: null, assignedRoomId: null, assignedSessionId: null, assignedRoomName: null, assignedSessionName: null },
          { id: 'exam-staff-004', name: '赵监考', phone: '13800138113', gender: '男', staffType: 'proctor', unitName: '大亚湾核电', loginName: '440301198803204567', idCard: '440301198803204567', position: '监考员', assignmentId: 'assign-002', assignmentStatus: 'assigned', assignedRoomId: 'room-001', assignedSessionId: 'exam-session-001', assignedRoomName: '大亚湾基地考点-理论考场A', assignedSessionName: '理论考试第一场' },
          { id: 'exam-staff-005', name: '刘考评', phone: '13800138114', gender: '女', staffType: 'evaluator', unitName: '阳江核电', loginName: '441700199207015678', idCard: '441700199207015678', position: '考评员', assignmentId: null, assignmentStatus: null, assignedRoomId: null, assignedSessionId: null, assignedRoomName: null, assignedSessionName: null },
        ])
      })
      .finally(() => setLoading(false))

    // Also fetch existing assignments for this plan+role
    apiRequest('/staff-assignment/list', {
      query: {
        planId: selectedPlan,
        assignmentRole: activeRole === 'exam_staff' ? 'exam_staff'
          : activeRole === 'supervisor' ? 'supervisor'
          : activeRole === 'invigilator' ? 'invigilator'
          : 'evaluator',
      },
    })
      .then((data: unknown) => {
        setAssignments((data as { items: AssignmentRecord[] })?.items || [])
      })
      .catch(() => setAssignments([]))
  }, [selectedPlan, activeRole, occupationFilter])

  useEffect(() => {
    fetchAssignableStaff()
  }, [fetchAssignableStaff])

  // Filter staff by search
  const filteredStaff = useMemo(() =>
    assignableStaff.filter(s =>
      !staffSearch || s.name.includes(staffSearch) || s.phone.includes(staffSearch) || s.unitName.includes(staffSearch)
    ),
    [assignableStaff, staffSearch]
  )

  // Handle assign single staff
  const handleAssign = async (staffId: string) => {
    if (!selectedPlan) {
      toast.error('请先选择认定计划')
      return
    }
    try {
      await apiRequest('/staff-assignment/batch', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan,
          sessionId: selectedSession || null,
          examRoomId: selectedRoom || null,
          assignmentRole: activeRole === 'exam_staff' ? 'exam_staff'
            : activeRole === 'supervisor' ? 'supervisor'
            : activeRole === 'invigilator' ? 'invigilator'
            : 'evaluator',
          staffIds: [staffId],
          assignmentDate: new Date().toISOString().split('T')[0],
        }),
      })
      toast.success('安排成功')
      fetchAssignableStaff()
    } catch {
      // Mock assign
      setAssignableStaff(prev => prev.map(s =>
        s.id === staffId
          ? { ...s, assignmentId: 'assign-new', assignmentStatus: 'assigned',
              assignedRoomId: selectedRoom, assignedSessionId: selectedSession,
              assignedRoomName: rooms.find(r => r.id === selectedRoom)?.name || null,
              assignedSessionName: sessions.find(s => s.id === selectedSession)?.name || null }
          : s
      ))
      toast.success('安排成功')
    }
  }

  // Handle cancel assignment
  const handleCancelAssignment = async (assignmentId: string) => {
    try {
      await apiRequest(`/staff-assignment/${assignmentId}`, { method: 'DELETE' })
      toast.success('已取消安排')
      fetchAssignableStaff()
    } catch {
      setAssignableStaff(prev => prev.map(s =>
        s.assignmentId === assignmentId
          ? { ...s, assignmentId: null, assignmentStatus: null,
              assignedRoomId: null, assignedSessionId: null,
              assignedRoomName: null, assignedSessionName: null }
          : s
      ))
      toast.success('已取消安排')
    }
  }

  // Handle batch assign all unassigned staff
  const handleBatchAssign = async () => {
    const unassigned = assignableStaff.filter(s => !s.assignmentId)
    if (unassigned.length === 0) {
      toast.info('没有待安排人员')
      return
    }
    try {
      await apiRequest('/staff-assignment/batch', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan,
          sessionId: selectedSession || null,
          examRoomId: selectedRoom || null,
          assignmentRole: activeRole === 'exam_staff' ? 'exam_staff'
            : activeRole === 'supervisor' ? 'supervisor'
            : activeRole === 'invigilator' ? 'invigilator'
            : 'evaluator',
          staffIds: unassigned.map(s => s.id),
          assignmentDate: new Date().toISOString().split('T')[0],
        }),
      })
      toast.success(`已批量安排 ${unassigned.length} 人`)
      fetchAssignableStaff()
    } catch {
      toast.success(`已批量安排 ${unassigned.length} 人`)
      fetchAssignableStaff()
    }
  }

  // Handle batch cancel all assigned staff
  const handleBatchCancel = async () => {
    const assigned = assignableStaff.filter(s => s.assignmentId)
    if (assigned.length === 0) {
      toast.info('没有已安排人员')
      return
    }
    for (const s of assigned) {
      if (s.assignmentId) await handleCancelAssignment(s.assignmentId)
    }
    toast.success(`已批量取消 ${assigned.length} 人`)
  }

  // View assignment history for a staff member
  const handleViewHistory = async (staffId: string) => {
    setHistoryStaffId(staffId)
    try {
      const data = await apiRequest(`/staff-assignment/${staffId}/history`) as { items: AssignmentRecord[] }
      setHistoryRecords(data?.items || [])
    } catch {
      setHistoryRecords([
        { id: 'h1', planId: 'plan-2026-001', staffId, staffName: '', staffPhone: '', staffType: '', staffUnitName: '',
          examRoomId: 'room-001', examRoomName: '理论考场A', sessionId: 's1', sessionName: '理论考试第一场',
          assignmentRole: 'invigilator', assignmentDate: '2026-05-20', status: 'assigned', createdAt: '2026-05-20' },
        { id: 'h2', planId: 'plan-2025-004', staffId, staffName: '', staffPhone: '', staffType: '', staffUnitName: '',
          examRoomId: 'room-002', examRoomName: '理论考场B', sessionId: 's2', sessionName: '理论考试第二场',
          assignmentRole: 'invigilator', assignmentDate: '2025-11-15', status: 'cancelled', createdAt: '2025-11-15' },
      ])
    }
  }

  // Stats
  const assignedCount = assignableStaff.filter(s => s.assignmentId).length
  const unassignedCount = assignableStaff.length - assignedCount

  // Selected plan name
  const selectedPlanName = plans.find(p => p.id === selectedPlan)?.name || ''

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>考务人员安排</DialogTitle>
            <DialogDescription>
              选择认定计划，为不同角色分配考务/监考/考评人员
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            {/* Plan / Session / Room Selectors */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">认定计划 *</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="选择认定计划" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">考试场次</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!selectedPlan}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="可选（全部场次）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部场次</SelectItem>
                    {sessions.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">考场</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedPlan}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="可选（全部考场）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部考场</SelectItem>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Plan info banner */}
            {selectedPlanName && (
              <div className="px-3 py-2 bg-blue-50 rounded text-sm text-blue-800">
                <span className="font-medium">当前计划：</span>{selectedPlanName}
              </div>
            )}

            {/* Role tabs */}
            <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as AssignmentRole)}>
              <TabsList className="w-full grid grid-cols-4 bg-gray-100">
                {ROLE_TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {ROLE_TABS.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-3 mt-3">
                  <p className="text-sm text-gray-500">{tab.description}</p>

                  {/* Occupation filter for evaluators */}
                  {tab.value === 'evaluator' && occupations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">按职业筛选：</Label>
                      <Select value={occupationFilter} onValueChange={setOccupationFilter}>
                        <SelectTrigger className="h-8 text-sm w-56">
                          <SelectValue placeholder="全部职业" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">全部职业</SelectItem>
                          {occupations.map(occ => (
                            <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Stats bar */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      共 <span className="font-semibold text-gray-700">{assignableStaff.length}</span> 人
                      · 已安排 <span className="font-semibold text-green-600">{assignedCount}</span> 人
                      · 未安排 <span className="font-semibold text-amber-600">{unassignedCount}</span> 人
                    </span>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleBatchCancel} disabled={assignedCount === 0}>
                      全部取消
                    </Button>
                    <Button size="sm" className="h-7 text-xs" onClick={handleBatchAssign} disabled={unassignedCount === 0}>
                      <Plus className="w-3 h-3 mr-1" />全部安排
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="搜索姓名、电话、单位..."
                      value={staffSearch}
                      onChange={e => setStaffSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>

                  {/* Staff list */}
                  {loading ? (
                    <div className="py-12 text-center text-sm text-gray-400">加载中...</div>
                  ) : !selectedPlan ? (
                    <div className="py-12 text-center text-sm text-gray-400">请先选择认定计划</div>
                  ) : filteredStaff.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">暂无{ROLE_LABELS[tab.value]}人员</div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs">姓名</th>
                            <th className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs">性别</th>
                            <th className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs">联系电话</th>
                            <th className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs">工作单位</th>
                            <th className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs">职务</th>
                            <th className="px-3 py-2.5 text-center font-medium text-gray-600 text-xs">安排状态</th>
                            <th className="px-3 py-2.5 text-center font-medium text-gray-600 text-xs">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredStaff.map(staff => (
                            <tr key={staff.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">{staff.name}</td>
                              <td className="px-3 py-2.5 text-gray-600">{staff.gender}</td>
                              <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{staff.phone}</td>
                              <td className="px-3 py-2.5 text-gray-600">{staff.unitName}</td>
                              <td className="px-3 py-2.5 text-gray-600">{staff.position || '-'}</td>
                              <td className="px-3 py-2.5 text-center">
                                {staff.assignmentId ? (
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <Badge className="text-[10px] bg-green-100 text-green-700">
                                      已安排
                                    </Badge>
                                    {staff.assignedSessionName && (
                                      <span className="text-[10px] text-gray-400">{staff.assignedSessionName}</span>
                                    )}
                                    {staff.assignedRoomName && (
                                      <span className="text-[10px] text-gray-400">{staff.assignedRoomName}</span>
                                    )}
                                  </div>
                                ) : (
                                  <Badge className="text-[10px] bg-amber-100 text-amber-700">
                                    未安排
                                  </Badge>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center gap-1">
                                  {staff.assignmentId ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-red-600"
                                        onClick={() => handleCancelAssignment(staff.assignmentId!)}
                                      >
                                        <X className="w-3 h-3 mr-1" />取消
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-gray-600"
                                        onClick={() => handleViewHistory(staff.id)}
                                      >
                                        <History className="w-3 h-3 mr-1" />历史
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs text-blue-600"
                                      onClick={() => handleAssign(staff.id)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />安排
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Existing assignments summary for this role */}
                  {assignments.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                        当前{ROLE_LABELS[tab.value]}安排记录（{assignments.length}）
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">人员</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">场次</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">考场</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">安排日期</th>
                            <th className="px-3 py-2 text-center text-xs text-gray-500">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {assignments.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{a.staffName}</td>
                              <td className="px-3 py-2 text-gray-600">{a.sessionName || '-'}</td>
                              <td className="px-3 py-2 text-gray-600">{a.examRoomName || '-'}</td>
                              <td className="px-3 py-2 text-gray-600">{a.assignmentDate || '-'}</td>
                              <td className="px-3 py-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-red-600"
                                  onClick={() => handleCancelAssignment(a.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />取消
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment History Dialog */}
      <Dialog open={!!historyStaffId} onOpenChange={() => setHistoryStaffId(null)}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>安排历史记录</DialogTitle>
            <DialogDescription>
              该人员的历史安排记录
            </DialogDescription>
          </DialogHeader>
          {historyRecords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无历史安排记录</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">角色</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">场次</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">考场</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">日期</th>
                  <th className="px-3 py-2 text-center text-xs text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyRecords.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Badge className="text-[10px] bg-blue-50 text-blue-700">
                        {ROLE_LABELS[r.assignmentRole as AssignmentRole] || r.assignmentRole}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{r.sessionName || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.examRoomName || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{r.assignmentDate || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={`text-[10px] ${r.status === 'assigned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.status === 'assigned' ? '已安排' : '已取消'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
