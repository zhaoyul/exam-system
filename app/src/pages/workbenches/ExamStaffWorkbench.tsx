import { useNavigate } from 'react-router-dom'
import { Calendar, Monitor, ClipboardCheck, LayoutGrid, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useBackendResourceList } from '@/hooks/useBackendListState'

const tasks = [
  { id: 1, title: '2026年第二批理论考试考场编排', deadline: '2026-05-20', status: 'urgent', type: '编排' },
  { id: 2, title: '阳江核电成绩录入截止提醒', deadline: '2026-05-22', status: 'pending', type: '成绩' },
  { id: 3, title: '大亚湾核电技能考试监考安排', deadline: '2026-05-25', status: 'normal', type: '考务' },
  { id: 4, title: '考生准考证批量打印', deadline: '2026-05-28', status: 'normal', type: '打印' },
]

const todayExams = [
  { id: 1, name: '核反应堆运行值班员三级理论考试', time: '09:00-11:00', room: '101教室', count: 25, status: 'ready' },
  { id: 2, name: '电气试验员四级实操考试', time: '14:00-16:00', room: '实操车间A', count: 18, status: 'pending' },
]

export default function ExamStaffWorkbench() {
  const navigate = useNavigate()
  const backendTasks = useBackendResourceList('/certification/exam-arrangement', tasks)
  const backendTodayExams = useBackendResourceList('/exam/manage', todayExams)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">考务工作台</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">4</div>
          <div className="text-sm text-gray-500 mt-1">待安排考试</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">2</div>
          <div className="text-sm text-gray-500 mt-1">本周考试</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">56</div>
          <div className="text-sm text-gray-500 mt-1">待复核成绩</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">12</div>
          <div className="text-sm text-gray-500 mt-1">已完成编排</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />待办任务
            </h2>
          </div>
          <div className="space-y-3">
            {backendTasks.map(task => (
              <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                task.status === 'urgent' ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'urgent' ? 'bg-red-500' :
                  task.status === 'pending' ? 'bg-amber-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />截止: {task.deadline}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-white border border-gray-200 text-gray-600">{task.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Exams */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1A56DB]" />今日考试
            </h2>
            <button onClick={() => navigate('/monitor')} className="text-xs text-[#1A56DB] hover:underline">查看监控</button>
          </div>
          <div className="space-y-3">
            {backendTodayExams.map(exam => (
              <div key={exam.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{exam.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    exam.status === 'ready' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {exam.status === 'ready' ? '已就绪' : '准备中'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.time}</span>
                  <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3" />{exam.room}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{exam.count}人</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '考试管理', icon: Monitor, path: '/exam/manage' },
            { label: '座位编排', icon: LayoutGrid, path: '/exam/seats' },
            { label: '成绩复核', icon: ClipboardCheck, path: '/score/review' },
            { label: '考务监控', icon: Monitor, path: '/monitor' },
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
