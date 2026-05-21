import { useMemo, useState } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendResourceState } from '@/hooks/useBackendListState'

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

const initialSpots: TestSpot[] = [
  {
    id: 'spot-1',
    name: '中广测试有限公司',
    recordArea: '广东省',
    address: '广东省深圳市大鹏新区大亚湾核电基地培训中心',
    phone: '0755-84212345',
    rooms: [
      { id: 'r1', name: '理论一考场', seats: 50, type: '笔试' },
      { id: 'r2', name: '理论二考场', seats: 45, type: '笔试' },
      { id: 'r3', name: '机考一考场', seats: 30, type: '机考' },
    ],
  },
]

export default function ExamRoomPage() {
  const [spots, setSpots] = useBackendResourceState<TestSpot>('/certification/execution/exam-rooms', initialSpots)
  const [search, setSearch] = useState('')
  const [activeSpot, setActiveSpot] = useState<TestSpot | null>(null)
  const [roomSpot, setRoomSpot] = useState<TestSpot | null>(null)
  const [recordArea, setRecordArea] = useState('全部')
  const [showSpotDialog, setShowSpotDialog] = useState(false)
  const [roomForm, setRoomForm] = useState({ name: '', seats: 30, type: '理论考场' as Room['type'] })

  const recordAreas = useMemo(() => ['全部', ...Array.from(new Set(spots.map(spot => spot.recordArea).filter(Boolean)))], [spots])

  const filteredSpots = useMemo(() => spots.filter(spot => {
    const bySearch = !search || [spot.name, spot.address, spot.phone].join(' ').includes(search)
    const byArea = recordArea === '全部' || spot.recordArea === recordArea
    return bySearch && byArea
  }), [recordArea, search, spots])

  const openAddRoom = (spot: TestSpot) => {
    setRoomSpot(spot)
    setRoomForm({ name: '', seats: 30, type: '理论考场' })
  }

  const addRoom = () => {
    if (!roomSpot || !roomForm.name.trim()) return
    const exists = roomSpot.rooms.some(room => room.name === roomForm.name.trim())
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
    setSpots(prev => prev.map(spot => spot.id === roomSpot.id ? { ...spot, rooms: [...spot.rooms, newRoom] } : spot))
    setActiveSpot(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev)
    setRoomSpot(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev)
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

  const openSpotRooms = (spot: TestSpot) => {
    setActiveSpot(spot)
    setShowSpotDialog(true)
  }

  const roomCount = (spot: TestSpot, type: 'written' | 'machine') => spot.rooms.filter(room => {
    if (type === 'written') return room.type === '笔试' || room.type === '理论考场'
    return room.type === '机考' || room.type === '技能考场'
  }).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">考场信息</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">考点名称</span>
          <div className="relative">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-9 w-56 rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <select value={recordArea} onChange={event => setRecordArea(event.target.value)} className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm">
            {recordAreas.map(area => <option key={area}>{area}</option>)}
          </select>
          <Button variant="outline" className="h-9">搜索</Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-gray-700">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">考点名称</th>
                <th className="px-4 py-3 text-left font-medium">考点地址</th>
                <th className="px-4 py-3 text-left font-medium">联系电话</th>
                <th className="px-4 py-3 text-center font-medium">笔试考场数</th>
                <th className="px-4 py-3 text-center font-medium">机考考场数</th>
                <th className="w-32 px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSpots.map((spot, index) => (
                <tr key={spot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900"><MapPin className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{spot.name}</td>
                  <td className="px-4 py-3 text-gray-600">{spot.address}</td>
                  <td className="px-4 py-3 text-gray-600">{spot.phone}</td>
                  <td className="px-4 py-3 text-center">{roomCount(spot, 'written')}</td>
                  <td className="px-4 py-3 text-center">{roomCount(spot, 'machine')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openSpotRooms(spot)} className="text-xs text-[#1A56DB] hover:underline">
                      查看
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSpots.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={showSpotDialog} onOpenChange={setShowSpotDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{activeSpot?.name || '考点'} - 考场维护</DialogTitle></DialogHeader>
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
                {activeSpot && (
                  <tr className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">1</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <MapPin className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{activeSpot.name}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activeSpot.rooms.map(room => (
                          <Badge key={room.id || room.name} variant="outline" className="bg-white text-[11px]">
                            {room.name} · {room.seats}座
                            <button onClick={() => removeRoom(activeSpot.id, room.id || room.name)} className="ml-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{activeSpot.recordArea || '-'}</td>
                    <td className="max-w-[240px] px-4 py-3 text-gray-600">{activeSpot.address}</td>
                    <td className="px-4 py-3 text-gray-600">{activeSpot.phone}</td>
                    <td className="px-4 py-3 text-center">{roomCount(activeSpot, 'written')}</td>
                    <td className="px-4 py-3 text-center">{roomCount(activeSpot, 'machine')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openAddRoom(activeSpot)} className="text-xs text-[#1A56DB] hover:underline">
                        <Plus className="mr-1 inline h-3.5 w-3.5" />添加考场
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roomSpot} onOpenChange={() => setRoomSpot(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>增加考场--{roomSpot?.name}</DialogTitle></DialogHeader>
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
              <Button variant="outline" onClick={() => setRoomSpot(null)}>返回</Button>
              <Button onClick={addRoom} className="bg-[#1A56DB] hover:bg-[#1748B5]">增加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
