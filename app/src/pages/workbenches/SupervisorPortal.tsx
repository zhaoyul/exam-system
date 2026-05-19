import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckSquare, FileText, Clock, Send, Star, AlertCircle } from 'lucide-react'

const pendingSupervisions = [
  { id: 1, plan: '2026年第二批技能认定-大亚湾核电', date: '2026-05-20', type: '现场督导', status: 'pending' },
  { id: 2, plan: '2026年第三批技能认定-阳江核电', date: '2026-05-28', type: '质量督导', status: 'pending' },
]

const forms = [
  { id: 1, name: '督导人员工作评价表', plan: '2026年第二批认定', deadline: '2026-05-22', status: 'pending' },
  { id: 2, name: '评价督导人员工作填表', plan: '2026年第一批认定', deadline: '2026-05-18', status: 'completed' },
]

const completedList = [
  { id: 1, plan: '2026年第一批技能认定-台山核电', date: '2026-04-15', type: '现场督导', score: 95 },
  { id: 2, plan: '2026年第一批技能认定-红沿河核电', date: '2026-04-10', type: '质量督导', score: 92 },
  { id: 3, plan: '2025年第四批技能认定-大亚湾核电', date: '2025-12-20', type: '现场督导', score: 88 },
]

export default function SupervisorPortal() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">督导工作台</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">5</div>
          <div className="text-sm text-gray-500 mt-1">待督导计划</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">23</div>
          <div className="text-sm text-gray-500 mt-1">已完成督导</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">2</div>
          <div className="text-sm text-gray-500 mt-1">待填表单</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">16</div>
          <div className="text-sm text-gray-500 mt-1">培训学时</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Supervisions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#1A56DB]" /> 待督导计划
            </h2>
          </div>
          <div className="space-y-3">
            {pendingSupervisions.map(s => (
              <div key={s.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">{s.plan}</div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.date}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{s.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> 待填表单
            </h2>
            <button onClick={() => navigate('/supervision/forms')} className="text-xs text-[#1A56DB] hover:underline">查看全部</button>
          </div>
          <div className="space-y-3">
            {forms.map(f => (
              <div key={f.id} className={`p-3 rounded-lg ${
                f.status === 'pending' ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
              }`}>
                <div className="text-sm font-medium text-gray-900 mb-1">{f.name}</div>
                <div className="text-xs text-gray-500">{f.plan}</div>
                {f.status === 'pending' && (
                  <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />截止: {f.deadline}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" /> 已完成督导
            </h2>
          </div>
          <div className="space-y-3">
            {completedList.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-900 mb-1">{c.plan}</div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{c.date}</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="w-3 h-3 fill-current" />{c.score}分
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: '督导培训', icon: Clock, path: '/supervision/training' },
            { label: '专家信息', icon: ClipboardList, path: '/supervision/expert-info' },
            { label: '专家聘用', icon: Star, path: '/supervision/hiring' },
            { label: '派遣管理', icon: Send, path: '/supervision/dispatch' },
            { label: '表单管理', icon: FileText, path: '/supervision/forms' },
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
