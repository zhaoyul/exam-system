import { useNavigate } from 'react-router-dom'
import { Eye, CheckCircle, Clock, Monitor, Calendar, MapPin, Users } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

const upcomingProctor = [
  { id: 1, name: '核反应堆运行值班员三级理论考试', date: '2026-05-20', time: '09:00-11:00', location: '大亚湾核电培训中心', room: '101教室', count: 25 },
  { id: 2, name: '电气试验员四级理论考试', date: '2026-05-22', time: '14:00-16:00', location: '阳江核电培训中心', room: '201教室', count: 18 },
  { id: 3, name: '焊接工五级实操考试', date: '2026-05-25', time: '09:00-12:00', location: '台山核电实操基地', room: '焊接车间', count: 12 },
]

const history = [
  { id: 1, name: '机械设备检修工三级理论考试', date: '2026-05-10', location: '大亚湾核电', status: 'normal' },
  { id: 2, name: '仪控设备检修工二级实操考试', date: '2026-05-08', location: '大亚湾核电', status: 'abnormal' },
  { id: 3, name: '核反应堆运行值班员四级理论考试', date: '2026-05-05', location: '阳江核电', status: 'normal' },
]

export default function ProctorWorkbench() {
  const navigate = useNavigate()
  const [backendUpcomingProctor] = useBackendListState(upcomingProctor)
  const [backendHistory] = useBackendListState(history)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">监考工作台</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">3</div>
          <div className="text-sm text-gray-500 mt-1">待监考场次</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">15</div>
          <div className="text-sm text-gray-500 mt-1">已完成监考</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">1</div>
          <div className="text-sm text-gray-500 mt-1">异常记录</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">48</div>
          <div className="text-sm text-gray-500 mt-1">累计监考场次</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Proctoring */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1A56DB]" /> upcoming监考安排
            </h2>
          </div>
          <div className="space-y-3">
            {backendUpcomingProctor.map(exam => (
              <div key={exam.id} className="p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                <div className="text-sm font-medium text-gray-900 mb-2">{exam.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{exam.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />{exam.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{exam.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" />{exam.count}人</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> 监考历史
            </h2>
          </div>
          <div className="space-y-3">
            {backendHistory.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${h.status === 'normal' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{h.name}</div>
                  <div className="text-xs text-gray-500">{h.date} · {h.location}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  h.status === 'normal' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {h.status === 'normal' ? '正常' : '有异常'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: '考务监控', icon: Monitor, path: '/monitor' },
            { label: '在线考试', icon: Eye, path: '/exam/online' },
            { label: '准考证查询', icon: Calendar, path: '/personal/ticket' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-[#1A56DB] hover:bg-blue-50 transition-all text-left"
            >
              <action.icon className="w-5 h-5 text-[#1A56DB]" />
              <span className="text-sm text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
