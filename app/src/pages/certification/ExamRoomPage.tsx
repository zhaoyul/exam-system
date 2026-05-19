import { useMemo, useState } from 'react'
import { MapPin, Plus, Save, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  seats: number
  type: '笔试' | '机考'
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
    name: '中广核职业技能培训中心',
    recordArea: '广东省深圳市',
    address: '深圳市大鹏新区核电基地培训中心A栋',
    phone: '0755-82345678',
    rooms: [
      { id: 'r1', name: '第一考场', seats: 40, type: '笔试' },
      { id: 'r2', name: '机考一室', seats: 36, type: '机考' },
    ],
  },
  {
    id: 'spot-2',
    name: '阳江实操训练基地',
    recordArea: '广东省阳江市',
    address: '阳江市江城区实操训练基地B区',
    phone: '0662-2234567',
    rooms: [
      { id: 'r3', name: '实操考场1', seats: 20, type: '笔试' },
    ],
  },
]

export default function ExamRoomPage() {
  const [spots, setSpots] = useState<TestSpot[]>(initialSpots)
  const [search, setSearch] = useState('')
  const [activeSpot, setActiveSpot] = useState<TestSpot | null>(null)
  const [roomForm, setRoomForm] = useState({ name: '', seats: 30, type: '笔试' as Room['type'] })
  const [dirty, setDirty] = useState(false)

  const filtered = useMemo(() => spots.filter(spot => {
    return !search || spot.name.includes(search) || spot.recordArea.includes(search) || spot.address.includes(search)
  }), [spots, search])

  const openAddRoom = (spot: TestSpot) => {
    setActiveSpot(spot)
    setRoomForm({ name: '', seats: 30, type: '笔试' })
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
    setRoomForm({ name: '', seats: 30, type: '笔试' })
    setDirty(true)
    toast.success('增加考场成功，执行完操作后请点击保存')
  }

  const removeRoom = (spotId: string, roomId: string) => {
    setSpots(prev => prev.map(spot => spot.id === spotId ? { ...spot, rooms: spot.rooms.filter(room => room.id !== roomId) } : spot))
    if (activeSpot?.id === spotId) {
      setActiveSpot({ ...activeSpot, rooms: activeSpot.rooms.filter(room => room.id !== roomId) })
    }
    setDirty(true)
    toast.success('成功移除考场，执行完操作后请点击保存')
  }

  const saveRooms = () => {
    setDirty(false)
    toast.success('考场信息已保存')
  }

  const roomCount = (spot: TestSpot, type: Room['type']) => spot.rooms.filter(room => room.type === type).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考场信息</h1>
          <p className="mt-1 text-sm text-gray-500">按原站维护备案地考点，并在考点下增加笔试/机考考场和座位数</p>
        </div>
        <Button onClick={saveRooms} disabled={!dirty} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Save className="mr-2 h-4 w-4" />保存
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="搜索考点名称 / 备案地 / 地址"
              className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <div className="text-sm text-gray-500">共计 {filtered.length} 条数据</div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">考点名称</th>
                <th className="px-4 py-3 text-left font-medium">备案地</th>
                <th className="px-4 py-3 text-left font-medium">考点地址</th>
                <th className="px-4 py-3 text-left font-medium">联系电话</th>
                <th className="px-4 py-3 text-center font-medium">笔试考场数</th>
                <th className="px-4 py-3 text-center font-medium">机考考场数</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((spot, index) => (
                <tr key={spot.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <MapPin className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{spot.name}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {spot.rooms.map(room => (
                        <Badge key={room.id} variant="outline" className="bg-white text-[11px]">
                          {room.name} · {room.seats}座
                          <button onClick={() => removeRoom(spot.id, room.id)} className="ml-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{spot.recordArea}</td>
                  <td className="max-w-[280px] px-4 py-3 text-gray-600">{spot.address}</td>
                  <td className="px-4 py-3 text-gray-600">{spot.phone}</td>
                  <td className="px-4 py-3 text-center">{roomCount(spot, '笔试')}</td>
                  <td className="px-4 py-3 text-center">{roomCount(spot, '机考')}</td>
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
      </section>

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
                <option>笔试</option>
                <option>机考</option>
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
