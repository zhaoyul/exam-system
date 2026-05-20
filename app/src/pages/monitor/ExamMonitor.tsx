import { useState, useEffect } from 'react'
import { Monitor, Users, UserCheck, UserX, AlertTriangle, Clock, MapPin, RefreshCw, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

interface ExamRoom {
  id: string
  name: string
  location: string
  capacity: number
  present: number
  absent: number
  cheating: number
  status: 'active' | 'completed' | 'waiting'
  startTime: string
  endTime: string
  supervisor: string
}

const initialRooms: ExamRoom[] = [
  { id: '1', name: '第一考场', location: '培训中心A栋301', capacity: 40, present: 38, absent: 2, cheating: 0, status: 'active', startTime: '09:00', endTime: '11:00', supervisor: '监考员甲' },
  { id: '2', name: '第二考场', location: '培训中心A栋302', capacity: 40, present: 35, absent: 5, cheating: 1, status: 'active', startTime: '09:00', endTime: '11:00', supervisor: '监考员乙' },
  { id: '3', name: '实操考场1', location: '实训基地B区', capacity: 20, present: 18, absent: 2, cheating: 0, status: 'active', startTime: '14:00', endTime: '16:00', supervisor: '考评员丙' },
  { id: '4', name: '实操考场2', location: '实训基地C区', capacity: 15, present: 12, absent: 3, cheating: 0, status: 'waiting', startTime: '14:00', endTime: '16:00', supervisor: '考评员丁' },
  { id: '5', name: '第三考场', location: '培训中心B栋201', capacity: 50, present: 0, absent: 0, cheating: 0, status: 'completed', startTime: '09:00', endTime: '11:00', supervisor: '监考员戊' },
]

const alerts_init = [
  { id: 'a1', type: 'absent', msg: '第二考场考生赵六未到', time: '09:15', room: '第二考场', handled: false },
  { id: 'a2', type: 'cheating', msg: '第二考场发现疑似违规行为', time: '09:45', room: '第二考场', handled: false },
  { id: 'a3', type: 'late', msg: '第一考场考生钱七迟到', time: '09:05', room: '第一考场', handled: true },
]

export default function ExamMonitor() {
  const [rooms, setRooms] = useBackendListState<ExamRoom>(initialRooms)
  const [alerts, setAlerts] = useState(alerts_init)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const totalCapacity = rooms.reduce((a, b) => a + b.capacity, 0)
  const totalPresent = rooms.reduce((a, b) => a + b.present, 0)
  const totalAbsent = rooms.reduce((a, b) => a + b.absent, 0)
  const activeRooms = rooms.filter(r => r.status === 'active').length
  const unhandledAlerts = alerts.filter(a => !a.handled).length

  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      setRooms(prev => prev.map(r => {
        if (r.status !== 'active') return r
        const add = Math.floor(Math.random() * 2)
        return { ...r, present: Math.min(r.present + add, r.capacity - r.absent) }
      }))
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(timer)
  }, [autoRefresh])

  const refreshNow = () => {
    setRooms(prev => prev.map(r => r.status === 'active' ? { ...r, present: Math.min(r.present + Math.floor(Math.random() * 3), r.capacity - r.absent) } : r))
    setLastUpdate(new Date())
  }

  const handleAlert = (id: string) => { setAlerts(prev => prev.map(a => a.id === id ? { ...a, handled: true } : a)) }

  const statusCls: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    completed: 'bg-gray-100 text-gray-500',
    waiting: 'bg-amber-50 text-amber-700',
  }

  const alertCls: Record<string, string> = {
    absent: 'bg-amber-50 text-amber-700 border-amber-200',
    cheating: 'bg-red-50 text-red-700 border-red-200',
    late: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Monitor className="w-6 h-6 text-[#1A56DB]" />考务监控看板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">总考场数</span><MapPin className="w-4 h-4 text-[#1A56DB]" /></div><div className="text-xl font-bold text-gray-900">{rooms.length}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">考试中</span><Wifi className="w-4 h-4 text-green-600" /></div><div className="text-xl font-bold text-green-600">{activeRooms}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">应考人数</span><Users className="w-4 h-4 text-[#1A56DB]" /></div><div className="text-xl font-bold text-gray-900">{totalCapacity}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">实考人数</span><UserCheck className="w-4 h-4 text-green-600" /></div><div className="text-xl font-bold text-green-600">{totalPresent}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">缺考人数</span><UserX className="w-4 h-4 text-red-500" /></div><div className="text-xl font-bold text-red-500">{totalAbsent}</div></div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">上次更新: {lastUpdate.toLocaleTimeString()}</span>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`text-xs px-2 py-0.5 rounded ${autoRefresh ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{autoRefresh ? '自动刷新中' : '自动刷新已关闭'}</button>
        </div>
        <Button onClick={refreshNow} variant="outline" className="h-8 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />立即刷新</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 考场列表 */}
        <div className="lg:col-span-2 space-y-3">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1A56DB]" />
                  <span className="font-semibold text-gray-900">{room.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusCls[room.status]}`}>{room.status === 'active' ? '考试中' : room.status === 'completed' ? '已结束' : '等待中'}</span>
                </div>
                <span className="text-xs text-gray-400">{room.location} · 监考: {room.supervisor}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center mb-2">
                <div><div className="text-lg font-bold text-gray-900">{room.capacity}</div><div className="text-xs text-gray-500">容量</div></div>
                <div><div className="text-lg font-bold text-green-600">{room.present}</div><div className="text-xs text-gray-500">实到</div></div>
                <div><div className="text-lg font-bold text-red-500">{room.absent}</div><div className="text-xs text-gray-500">缺考</div></div>
                <div><div className="text-lg font-bold text-amber-600">{room.cheating}</div><div className="text-xs text-gray-500">违规</div></div>
              </div>
              {/* 进度条 */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(room.present / room.capacity * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{room.startTime} - {room.endTime}</span>
                <span>到场率 {(room.present / room.capacity * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 告警面板 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />异常告警</h2>
            {unhandledAlerts > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">{unhandledAlerts} 未处理</span>}
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {alerts.map(a => (
              <div key={a.id} className={`p-3 border rounded-lg ${a.handled ? 'border-gray-100 bg-gray-50 opacity-60' : alertCls[a.type]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{a.room}</span>
                  <span className="text-xs text-gray-400">{a.time}</span>
                </div>
                <p className="text-xs text-gray-700 mb-1">{a.msg}</p>
                {!a.handled && <button onClick={() => handleAlert(a.id)} className="text-xs text-[#1A56DB] hover:underline">标记已处理</button>}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setAlerts([])}>清除已处理告警</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
