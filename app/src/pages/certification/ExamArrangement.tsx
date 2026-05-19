import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  MapPin, Users, Plus, Clock, CheckCircle,
  Trash2, Eye, Printer, Ticket, FileSpreadsheet, LayoutGrid
} from 'lucide-react'

interface ExamRoom {
  id: number
  name: string
  totalSeats: number
  remainingSeats: number
  candidates: number
}

interface ExamSite {
  id: number
  name: string
  rooms: ExamRoom[]
}

interface ExamSession {
  id: number
  timeRange: string
}

const mockSessions: ExamSession[] = [
  { id: 1, timeRange: '2022-03-31 08:00~10:00' },
  { id: 2, timeRange: '2022-03-31 09:00~11:00' },
]

const mockSites: ExamSite[] = [
  {
    id: 1, name: '职业技能培训中心',
    rooms: [
      { id: 101, name: '101教室考场', totalSeats: 1000, remainingSeats: 1000, candidates: 0 },
      { id: 102, name: '102教室考场', totalSeats: 1000, remainingSeats: 1000, candidates: 0 },
    ]
  },
]

const allSites: ExamSite[] = [
  { id: 1, name: '职业技能培训中心', rooms: [] },
  { id: 2, name: '大亚湾培训中心', rooms: [] },
  { id: 3, name: '阳江培训中心', rooms: [] },
]

export default function ExamArrangement() {
  const [activeTab, setActiveTab] = useState<'theory' | 'skill'>('theory')
  const [selectedSite, setSelectedSite] = useState<number>(1)
  const [sites, setSites] = useState<ExamSite[]>(mockSites)
  const [sessions, setSessions] = useState<ExamSession[]>(mockSessions)
  const [, setArranged] = useState(false)
  const [showAddSite, setShowAddSite] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAssignCandidates, setShowAssignCandidates] = useState(false)
  const [siteSearch, setSiteSearch] = useState('')
  const [selectedRoomForAction, setSelectedRoomForAction] = useState<ExamRoom | null>(null)

  const handleAutoArrange = () => {
    setArranged(true)
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.map(r => ({
        ...r,
        candidates: Math.floor(Math.random() * 20) + 5,
        remainingSeats: r.totalSeats - Math.floor(Math.random() * 20) - 5
      }))
    })))
    toast.success('考场编排完成：座位和准考证已自动生成')
  }

  const handleAddSession = () => {
    const newSession: ExamSession = {
      id: Date.now(),
      timeRange: `2022-03-31 ${10 + sessions.length}:00~${12 + sessions.length}:00`
    }
    setSessions(prev => [...prev, newSession])
    toast.success('新增场次')
  }

  const handleRemoveSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const handleAddSite = (site: ExamSite) => {
    if (sites.find(s => s.id === site.id)) {
      toast.error('该考点已添加')
      return
    }
    setSites(prev => [...prev, { ...site, rooms: [] }])
    setShowAddSite(false)
    toast.success(`已添加考点：${site.name}`)
  }

  const handleAddRoom = () => {
    if (!newRoomName.trim()) {
      toast.error('请输入考场名称')
      return
    }
    const newRoom: ExamRoom = {
      id: Date.now(),
      name: newRoomName.trim(),
      totalSeats: parseInt(newRoomSeats) || 50,
      remainingSeats: parseInt(newRoomSeats) || 50,
      candidates: 0
    }
    setSites(prev => prev.map(s =>
      s.id === selectedSite ? { ...s, rooms: [...s.rooms, newRoom] } : s
    ))
    setShowAddRoom(false)
    setNewRoomName('')
    setNewRoomSeats('50')
    toast.success('考场已添加')
  }

  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomSeats, setNewRoomSeats] = useState('50')

  const handleAddCandidates = (room: ExamRoom) => {
    setSites(prev => prev.map(s => ({
      ...s,
      rooms: s.rooms.map(r =>
        r.id === room.id ? { ...r, candidates: r.candidates + 5, remainingSeats: Math.max(0, r.remainingSeats - 5) } : r
      )
    })))
    toast.success(`已为 ${room.name} 追加5名考生`)
    setShowAssignCandidates(false)
  }

  const unassignedCount = 10 // 模拟剩余考生数

  const filteredSites = allSites.filter(s => !siteSearch || s.name.includes(siteSearch))

  return (
    <div className="space-y-4">
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
          <Button variant="outline" size="sm" className="text-xs"><Printer className="w-3.5 h-3.5 mr-1" />考场安排表</Button>
          <Button size="sm" className="text-xs"><LayoutGrid className="w-3.5 h-3.5 mr-1" />编排</Button>
        </div>
      </div>

      {/* Exam Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {activeTab === 'theory' ? '笔试安排' : '实操安排'}
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.success('编排已结束')}>
            <CheckCircle className="w-3 h-3 mr-1" />结束安排
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-blue-600 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">添加场次</span>
          </div>
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded border border-blue-200">
              <span className="text-xs text-blue-700">{s.timeRange}</span>
              <button onClick={() => handleRemoveSession(s.id)} className="text-blue-400 hover:text-red-500 ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-blue-600" onClick={handleAddSession}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <div className="flex items-center gap-1 text-red-500 text-sm ml-auto">
            <Users className="w-4 h-4" />
            <span>剩余{unassignedCount}个考生未安排</span>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowAddSite(true)}>
            <MapPin className="w-3 h-3 mr-1" />追加考点
          </Button>
        </div>
      </div>

      {/* Sites & Rooms */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sites */}
        <div className="col-span-4 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-100">考点</h4>
          <div className="space-y-3">
            {sites.map(site => (
              <div
                key={site.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSite === site.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSite(site.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{site.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSites(prev => prev.filter(s => s.id !== site.id)) }}
                    className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  共{site.rooms.length}个考场, {site.rooms.filter(r => r.remainingSeats > 0).length}个可安排
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddRoom(true)}>
                    <Plus className="w-2.5 h-2.5 mr-1" />增加考场
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px]">
                    <Users className="w-2.5 h-2.5 mr-1" />安排考生
                  </Button>
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>请点击右上方追加考点添加数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Rooms */}
        <div className="col-span-8 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-100">考场</h4>
          <div className="space-y-3">
            {sites.find(s => s.id === selectedSite)?.rooms.map(room => (
              <div key={room.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{room.name}</span>
                    <span className="text-xs text-gray-500">
                      剩余{room.remainingSeats}/共{room.totalSeats}个考位
                    </span>
                    <button onClick={() => {
                      setSites(prev => prev.map(s => ({
                        ...s,
                        rooms: s.rooms.filter(r => r.id !== room.id)
                      })))
                    }} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                      onClick={() => { setSelectedRoomForAction(room); setShowAssignCandidates(true) }}>
                      <Users className="w-3 h-3 mr-1" />追加考生
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                      <Eye className="w-3 h-3 mr-1" />查看分配
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600" onClick={() => {
                      setSites(prev => prev.map(s => ({
                        ...s,
                        rooms: s.rooms.map(r =>
                          r.id === room.id ? { ...r, totalSeats: r.totalSeats + 10, remainingSeats: r.remainingSeats + 10 } : r
                        )
                      })))
                      toast.success('座位已增加')
                    }}>
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
            {(!sites.find(s => s.id === selectedSite)?.rooms.length) && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>请点击左侧考点上的增加考场添加数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" className="text-xs" onClick={handleAutoArrange}>
          <LayoutGrid className="w-3.5 h-3.5 mr-1" />自动编排
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('编排报表已导出')}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />编排报表
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success('准考证已生成PDF')}>
            <Ticket className="w-3.5 h-3.5 mr-1" />准考证
          </Button>
        </div>
      </div>

      {/* Add Site Dialog */}
      <Dialog open={showAddSite} onOpenChange={setShowAddSite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>增加考点</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="考点名称" value={siteSearch} onChange={e => setSiteSearch(e.target.value)} className="flex-1" />
              <Button variant="outline" size="sm" className="text-xs">搜索</Button>
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
                  {filteredSites.map((site, idx) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2 text-gray-900">{site.name}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => handleAddSite(site)} className="text-blue-600 hover:underline text-xs">
                          选择
                        </button>
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
          <DialogHeader><DialogTitle>追加考生到 {selectedRoomForAction?.name}</DialogTitle></DialogHeader>
          <div className="text-sm text-gray-600">
            当前考位：剩余 {selectedRoomForAction?.remainingSeats} / 共 {selectedRoomForAction?.totalSeats}
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">选择考生（剩余{unassignedCount}人未安排）</div>
            <div className="border rounded p-2 space-y-1 max-h-40 overflow-y-auto">
              {Array.from({ length: Math.min(5, unassignedCount) }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span>考生{String.fromCharCode(65 + i)}</span>
                  <span className="text-xs text-gray-500">核反应堆运行值班员(三级)</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignCandidates(false)}>取消</Button>
            <Button onClick={() => selectedRoomForAction && handleAddCandidates(selectedRoomForAction)} className="bg-[#1A56DB]">
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
