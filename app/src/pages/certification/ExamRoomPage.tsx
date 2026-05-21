import { useMemo, useState } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendResourceList, useBackendResourceState } from '@/hooks/useBackendListState'

interface ExamPlan {
  id: string
  name: string
  planNo?: string
  recogPlan?: string
  regDeadline?: string
  deadline?: string
  status?: string
  statusLabel?: string
}

interface Room {
  id: string
  name: string
  seats: number
  type: '笔试' | '机考' | '理论考场' | '技能考场'
}

interface TestSpot {
  id: string
  name: string
  recordArea: string
  address: string
  phone: string
  rooms: Room[]
}

const initialPlans: ExamPlan[] = [
  {
    id: 'plan-001',
    name: '2026年第一批技能认定',
    planNo: '22111100840009',
    recogPlan: '2026年第一批技能认定',
    regDeadline: '2026-04-20',
    status: 'published',
    statusLabel: '已发布',
  },
  {
    id: 'plan-002',
    name: '2026年第二批技能认定',
    planNo: '22111100840010',
    recogPlan: '2026年第二批技能认定',
    regDeadline: '2026-05-20',
    status: 'draft',
    statusLabel: '待发布',
  },
]

const initialSpots: TestSpot[] = [
  {
    id: 'spot-1',
    name: '大亚湾基地考点',
    recordArea: '广东省深圳市',
    address: '大亚湾基地培训中心',
    phone: '0755-00000000',
    rooms: [
      { id: 'r1', name: '101教室考场', seats: 50, type: '理论考场' },
      { id: 'r2', name: '实操一号工位', seats: 20, type: '技能考场' },
    ],
  },
]

export default function ExamRoomPage() {
  const plans = useBackendResourceList<ExamPlan>('/certification/plans', initialPlans)
  const [spots, setSpots] = useBackendResourceState<TestSpot>('/certification/execution/exam-rooms', initialSpots)
  const [search, setSearch] = useState('')
  const [activeSpot, setActiveSpot] = useState<TestSpot | null>(null)
  const [activePlan, setActivePlan] = useState<ExamPlan | null>(null)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [roomForm, setRoomForm] = useState({ name: '', seats: 30, type: '理论考场' as Room['type'] })

  const filteredPlans = useMemo(() => plans.filter(plan => {
    const keyword = [plan.name, plan.planNo, plan.recogPlan].filter(Boolean).join(' ')
    return !search || keyword.includes(search)
  }), [plans, search])

  const openAddRoom = (spot: TestSpot) => {
    setActiveSpot(spot)
    setRoomForm({ name: '', seats: 30, type: '理论考场' })
  }

  const addRoom = () => {
    if (!activeSpot || !roomForm.name.trim()) return
    const exists = activeSpot.rooms.some(room => room.name === roomForm.name.trim())
    if (exists) {
      toast.error('请勿重复添加考场')
      return
    }
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: roomForm.name.trim(),
      seats: roomForm.seats,
      type: roomForm.type,
    }
    setSpots(prev => prev.map(spot => spot.id === activeSpot.id ? { ...spot, rooms: [...spot.rooms, newRoom] } : spot))
    setActiveSpot(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev)
    setRoomForm({ name: '', seats: 30, type: '理论考场' })
    toast.success('考场已增加')
  }

  const removeRoom = (spotId: string, roomId: string) => {
    setSpots(prev => prev.map(spot => spot.id === spotId ? { ...spot, rooms: spot.rooms.filter(room => room.id !== roomId) } : spot))
    if (activeSpot?.id === spotId) {
      setActiveSpot({ ...activeSpot, rooms: activeSpot.rooms.filter(room => room.id !== roomId) })
    }
    toast.success('考场已移除')
  }

  const openPlanRooms = (plan: ExamPlan) => {
    setActivePlan(plan)
    setShowPlanDialog(true)
  }

  const roomCount = (spot: TestSpot, type: 'written' | 'machine') => spot.rooms.filter(room => {
    if (type === 'written') return room.type === '笔试' || room.type === '理论考场'
    return room.type === '机考' || room.type === '技能考场'
  }).length

  const displayStatus = (plan: ExamPlan) => {
    if (plan.statusLabel) return plan.statusLabel
    if (plan.status === 'published') return '已发布'
    if (plan.status === 'done') return '已完成'
    return '待发布'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>计划名称</option>
          </select>
          <div className="relative">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
        <Button onClick={() => toast.success('新增考场计划入口已打开')} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Plus className="mr-2 h-4 w-4" />添加
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-gray-700">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-medium">序号</th>
                <th className="px-4 py-3 text-center font-medium">计划名称</th>
                <th className="px-4 py-3 text-center font-medium">认定计划</th>
                <th className="px-4 py-3 text-center font-medium">截止日期</th>
                <th className="w-28 px-4 py-3 text-center font-medium">状态</th>
                <th className="w-32 px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlans.map((plan, index) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{plan.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{plan.recogPlan || plan.planNo || plan.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{plan.deadline || plan.regDeadline || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{displayStatus(plan)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openPlanRooms(plan)} className="text-xs text-[#1A56DB] hover:underline">
                      查看
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{activePlan?.name || '认定计划'} - 考场维护</DialogTitle></DialogHeader>
          <div className="max-h-[62vh] overflow-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">考点名称</th>
                  <th className="px-4 py-3 text-left font-medium">备案地</th>
                  <th className="px-4 py-3 text-left font-medium">考点地址</th>
                  <th className="px-4 py-3 text-left font-medium">联系电话</th>
                  <th className="px-4 py-3 text-center font-medium">理论考场</th>
                  <th className="px-4 py-3 text-center font-medium">技能考场</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {spots.map((spot, index) => (
                  <tr key={spot.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <MapPin className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{spot.name}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {spot.rooms.map(room => (
                          <Badge key={room.id || room.name} variant="outline" className="bg-white text-[11px]">
                            {room.name} · {room.seats}座
                            <button onClick={() => removeRoom(spot.id, room.id || room.name)} className="ml-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{spot.recordArea || '-'}</td>
                    <td className="max-w-[240px] px-4 py-3 text-gray-600">{spot.address}</td>
                    <td className="px-4 py-3 text-gray-600">{spot.phone}</td>
                    <td className="px-4 py-3 text-center">{roomCount(spot, 'written')}</td>
                    <td className="px-4 py-3 text-center">{roomCount(spot, 'machine')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openAddRoom(spot)} className="text-xs text-[#1A56DB] hover:underline">
                        <Plus className="mr-1 inline h-3.5 w-3.5" />添加考场
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeSpot} onOpenChange={() => setActiveSpot(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>增加考场--{activeSpot?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="font-medium text-gray-700">考场名称：</label>
              <input
                value={roomForm.name}
                onChange={event => setRoomForm(prev => ({ ...prev, name: event.target.value.slice(0, 25) }))}
                placeholder="请输入考场名称"
                className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-700">座位总数：</label>
              <input
                type="number"
                min={1}
                value={roomForm.seats}
                onChange={event => setRoomForm(prev => ({ ...prev, seats: Number(event.target.value) || 0 }))}
                className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-700">考场类型：</label>
              <select
                value={roomForm.type}
                onChange={event => setRoomForm(prev => ({ ...prev, type: event.target.value as Room['type'] }))}
                className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3"
              >
                <option>理论考场</option>
                <option>技能考场</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveSpot(null)}>返回</Button>
              <Button onClick={addRoom} className="bg-[#1A56DB] hover:bg-[#1748B5]">增加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
