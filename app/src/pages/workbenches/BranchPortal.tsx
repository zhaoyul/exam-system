import { useNavigate } from 'react-router-dom'
import { Building2, LayoutGrid, PenTool, Award, AlertCircle, Clock, ChevronRight, FileText } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'
import { useApp } from '@/context/AppContext'

const flowSteps = [
  { id: 1, label: '制定计划', count: 1, status: 'completed', path: '/cert/exec/plans' },
  { id: 2, label: '考试报名', count: 2, status: 'active', path: '/cert/exec/registration' },
  { id: 3, label: '考场编排', count: 1, status: 'active', path: '/cert/exec/arrangement' },
  { id: 4, label: '考务安排', count: 0, status: 'pending', path: '/cert/exec/session' },
  { id: 5, label: '成绩管理', count: 0, status: 'pending', path: '/cert/exec/score' },
  { id: 6, label: '成绩公示', count: 0, status: 'pending', path: '/cert/exec/publicity' },
  { id: 7, label: '证书管理', count: 0, status: 'pending', path: '/cert/exec/cert' },
  { id: 8, label: '证书打印', count: 0, status: 'pending', path: '/cert/exec/print' },
]

const urgentTasks = [
  { id: 1, title: '考场编排截止倒计时3天', type: 'urgent', date: '2026-05-20' },
  { id: 2, title: '待审核报名申请5条', type: 'warning', date: '' },
  { id: 3, title: '成绩录入待完成', type: 'normal', date: '2026-05-25' },
]

export default function BranchPortal() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [backendFlowSteps] = useBackendListState(flowSteps)
  const [backendUrgentTasks] = useBackendListState(urgentTasks)
  const orgName = user?.org || '测试有限公司'

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#1A56DB] text-white flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">机构工作台</h1>
          <p className="text-xs text-gray-500">{orgName} · 备案地：广东省</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">56</div>
          <div className="text-sm text-gray-500 mt-1">本月报名考生</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">3</div>
          <div className="text-sm text-gray-500 mt-1">待编排考场</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">45</div>
          <div className="text-sm text-gray-500 mt-1">待录入成绩</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">38</div>
          <div className="text-sm text-gray-500 mt-1">已发证人数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Steps */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1A56DB]" /> 认定流程
            </h2>
            <span className="text-xs text-gray-400">2026年第二批认定进行中</span>
          </div>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />
            <div className="space-y-2">
              {backendFlowSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => navigate(step.path)}
                  className="relative w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Dot */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'active' ? 'bg-[#1A56DB] text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{step.label}</div>
                    <div className="text-xs text-gray-500">
                      {step.count > 0 ? `${step.count}个进行中` : '暂无数据'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.count > 0 && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        step.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {step.count}个
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> 待办事项
            </h2>
          </div>
          <div className="space-y-3">
            {backendUrgentTasks.map(task => (
              <div key={task.id} className={`p-3 rounded-lg ${
                task.type === 'urgent' ? 'bg-red-50 border border-red-100' :
                task.type === 'warning' ? 'bg-amber-50 border border-amber-100' :
                'bg-gray-50'
              }`}>
                <div className="text-sm text-gray-900">{task.title}</div>
                {task.date && <div className="text-xs text-gray-500 mt-1">截止: {task.date}</div>}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-700 mb-3">常用功能</h3>
            <div className="space-y-2">
              {[
                { label: '考试报名管理', path: '/cert/exec/registration', icon: FileText },
                { label: '考场编排', path: '/cert/exec/arrangement', icon: LayoutGrid },
                { label: '成绩录入', path: '/cert/exec/score', icon: PenTool },
                { label: '证书打印', path: '/cert/exec/print', icon: Award },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                >
                  <link.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
