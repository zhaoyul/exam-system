import { useMemo, useState } from 'react'
import { Building2, ChevronDown, ChevronRight, MapPin, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendResourceState } from '@/hooks/useBackendListState'

// ─── Types ───

type RoomType = '笔试考场' | '机考考场'

interface Room {
  id: string
  name: string
  seats: number
  type: RoomType
}

interface TestSpot {
  id: string
  name: string
  recordArea: string
  address: string
  phone: string
  rooms: Room[]
}

interface TreeNode {
  id: string
  name: string
  parentId: string | null
  spotId?: string
  children?: TreeNode[]
}

// ─── Seed data ───

const initialSpots: TestSpot[] = [
  {
    id: 'spot-1',
    name: '中广测试有限公司',
    recordArea: '广东省',
    address: '广东省深圳市大鹏新区大亚湾核电基地培训中心',
    phone: '0755-84212345',
    rooms: [
      { id: 'r1', name: '理论一考场', seats: 50, type: '笔试考场' },
      { id: 'r2', name: '理论二考场', seats: 45, type: '笔试考场' },
      { id: 'r3', name: '机考一考场', seats: 30, type: '机考考场' },
    ],
  },
  {
    id: 'spot-2',
    name: '阳江核电有限公司',
    recordArea: '广东省',
    address: '广东省阳江市阳东区东平镇核电基地',
    phone: '0662-3335678',
    rooms: [
      { id: 'r4', name: '培训楼201', seats: 35, type: '笔试考场' },
      { id: 'r5', name: '实操焊接工位', seats: 15, type: '机考考场' },
    ],
  },
  {
    id: 'spot-3',
    name: '福建宁德核电有限公司',
    recordArea: '福建省',
    address: '福建省宁德市福鼎市太姥山镇',
    phone: '0593-5656789',
    rooms: [
      { id: 'r6', name: '培训中心301', seats: 40, type: '笔试考场' },
    ],
  },
]

// ─── Tree helpers ───

function buildTree(spots: TestSpot[]): TreeNode[] {
  const provinceMap = new Map<string, TreeNode>()

  spots.forEach(spot => {
    const province = spot.recordArea || '其他'
    if (!provinceMap.has(province)) {
      provinceMap.set(province, {
        id: `prov-${province}`,
        name: province,
        parentId: null,
        children: [],
      })
    }
    const provNode = provinceMap.get(province)!
    const siteNode: TreeNode = {
      id: spot.id,
      name: spot.name,
      parentId: provNode.id,
      spotId: spot.id,
    }
    provNode.children!.push(siteNode)
  })

  return Array.from(provinceMap.values())
}

// ─── Component ───

export default function ExamRoomPage() {
  const [spots, setSpots] = useBackendResourceState<TestSpot>(
    '/certification/execution/exam-rooms',
    initialSpots,
  )
  const [search, setSearch] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set())

  // Room dialog
  const [roomSpot, setRoomSpot] = useState<TestSpot | null>(null)
  const [roomForm, setRoomForm] = useState({ name: '', seats: 30, type: '笔试考场' as RoomType })

  // ─── Tree ───

  const tree = useMemo(() => buildTree(spots), [spots])

  // ─── Filtered spots ───

  const filteredSpots = useMemo(() => {
    let result = spots

    if (selectedSiteId) {
      result = result.filter(s => s.id === selectedSiteId)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.phone.includes(q),
      )
    }

    return result
  }, [spots, selectedSiteId, search])

  // ─── Room CRUD ───

  const openAddRoom = (spot: TestSpot) => {
    setRoomSpot(spot)
    setRoomForm({ name: '', seats: 30, type: '笔试考场' })
  }

  const addRoom = () => {
    if (!roomSpot || !roomForm.name.trim()) return
    const exists = roomSpot.rooms.some(r => r.name === roomForm.name.trim())
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
    setSpots(prev =>
      prev.map(s =>
        s.id === roomSpot.id ? { ...s, rooms: [...s.rooms, newRoom] } : s,
      ),
    )
    setRoomSpot(prev =>
      prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev,
    )
    setRoomForm({ name: '', seats: 30, type: '笔试考场' })
    toast.success('考场已增加')
  }

  const removeRoom = (spotId: string, roomId: string) => {
    setSpots(prev =>
      prev.map(s =>
        s.id === spotId
          ? { ...s, rooms: s.rooms.filter(r => r.id !== roomId) }
          : s,
      ),
    )
    toast.success('考场已移除')
  }

  // ─── Count helpers ───

  const writtenCount = (spot: TestSpot) =>
    spot.rooms.filter(r => r.type === '笔试考场').length

  const machineCount = (spot: TestSpot) =>
    spot.rooms.filter(r => r.type === '机考考场').length

  // ─── Tree toggles ───

  const toggleProvince = (provId: string) => {
    setExpandedProvinces(prev => {
      const next = new Set(prev)
      if (next.has(provId)) next.delete(provId)
      else next.add(provId)
      return next
    })
  }

  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(prev => (prev === siteId ? null : siteId))
  }

  // ─── Render ───

  return (
    <div className="flex h-full gap-0">
      {/* ═══════════════════ LEFT PANEL — 备案地树 ═══════════════════ */}
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white">
        <div className="flex h-12 items-center border-b border-gray-200 px-4">
          <h2 className="text-sm font-semibold text-gray-700">备案地树</h2>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {tree.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">暂无备案数据</div>
          ) : (
            <div>
              {tree.map(province => {
                const isProvOpen = expandedProvinces.has(province.id)
                const isProvSelected = province.children?.some(
                  c => c.spotId === selectedSiteId,
                )
                return (
                  <div key={province.id}>
                    {/* Province header */}
                    <button
                      type="button"
                      onClick={() => toggleProvince(province.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-blue-50 ${
                        isProvSelected ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {isProvOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                      <Building2 className="h-4 w-4 shrink-0 text-blue-500" />
                      <span>{province.name}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {province.children?.length ?? 0}
                      </span>
                    </button>

                    {/* Sites under province */}
                    {isProvOpen &&
                      province.children?.map(site => {
                        const isSiteSelected = selectedSiteId === site.spotId
                        return (
                          <button
                            key={site.id}
                            type="button"
                            onClick={() => handleSiteSelect(site.spotId!)}
                            className={`flex w-full items-center gap-2 py-2 pl-10 pr-3 text-sm transition-colors hover:bg-blue-50 ${
                              isSiteSelected
                                ? 'bg-blue-100 font-medium text-blue-700'
                                : 'text-gray-600'
                            }`}
                          >
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="truncate text-left">{site.name}</span>
                            {isSiteSelected && (
                              <span className="ml-auto shrink-0 text-xs text-blue-500">✓</span>
                            )}
                          </button>
                        )
                      })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════ RIGHT PANEL — 考点卡片式表格 ═══════════════════ */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">
            考点信息
            {selectedSiteId && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                — {spots.find(s => s.id === selectedSiteId)?.name ?? ''}
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索考点名称/地址/电话"
                className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            {selectedSiteId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSiteId(null)}
                className="text-xs text-gray-500"
              >
                清除筛选
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="w-14 px-4 py-3 text-center font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">考点名称</th>
                  <th className="px-4 py-3 text-left font-medium">考点地址</th>
                  <th className="px-4 py-3 text-left font-medium">联系电话</th>
                  <th className="w-24 px-3 py-3 text-center font-medium">笔试考场数</th>
                  <th className="w-24 px-3 py-3 text-center font-medium">机考考场数</th>
                  <th className="w-28 px-4 py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSpots.map((spot, index) => (
                  <>
                      {/* Site row */}
                      <tr
                        key={spot.id}
                        className="group transition-colors hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="font-medium text-gray-900">{spot.name}</span>
                          </div>
                          {/* Room tag cards inline */}
                          {spot.rooms.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {spot.rooms.map(room => (
                                <Badge
                                  key={room.id || room.name}
                                  variant={room.type === '笔试考场' ? 'default' : 'secondary'}
                                  className={`text-[11px] ${
                                    room.type === '笔试考场'
                                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  {room.name} · {room.seats}座
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      removeRoom(spot.id, room.id || room.name)
                                    }}
                                    className="ml-1 text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-gray-600">
                          {spot.address}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{spot.phone}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-medium text-blue-600">{writtenCount(spot)}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-medium text-amber-600">{machineCount(spot)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openAddRoom(spot)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            添加考场
                          </button>
                        </td>
                      </tr>
                  </>
                ))}
                {filteredSpots.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center text-gray-400">
                      <MapPin className="mx-auto mb-2 h-8 w-8 opacity-30" />
                      暂无考点数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ═══════════════════ Add Room Dialog ═══════════════════ */}
      <Dialog open={!!roomSpot} onOpenChange={open => !open && setRoomSpot(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>增加考场 — {roomSpot?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">考场名称：</label>
              <input
                value={roomForm.name}
                onChange={e =>
                  setRoomForm(prev => ({ ...prev, name: e.target.value.slice(0, 25) }))
                }
                placeholder="请输入考场名称"
                className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-700">座位总数：</label>
              <input
                type="number"
                min={1}
                value={roomForm.seats}
                onChange={e =>
                  setRoomForm(prev => ({
                    ...prev,
                    seats: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-700">考场类型：</label>
              <select
                value={roomForm.type}
                onChange={e =>
                  setRoomForm(prev => ({
                    ...prev,
                    type: e.target.value as RoomType,
                  }))
                }
                className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3"
              >
                <option value="笔试考场">笔试考场</option>
                <option value="机考考场">机考考场</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRoomSpot(null)}>
                返回
              </Button>
              <Button onClick={addRoom} className="bg-[#1A56DB] hover:bg-[#1748B5]">
                增加
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
