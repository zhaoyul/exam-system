import { useNavigate } from 'react-router-dom'
import { FileText, Award, BarChart3, Bell, CheckCircle, Clock } from 'lucide-react'
import { useBackendResourceList } from '@/hooks/useBackendListState'

const myRegistrations = [
  { id: 1, occupation: '核反应堆运行值班员', level: '三级', status: 'approved', date: '2026-03-15', examDate: '2026-05-20' },
  { id: 2, occupation: '电气试验员', level: '四级', status: 'pending', date: '2026-05-10', examDate: '待定' },
]

const notifications = [
  { id: 1, title: '考试通知：核反应堆运行值班员三级理论考试', date: '2026-05-15', type: 'exam', read: false },
  { id: 2, title: '报名成功：电气试验员四级认定', date: '2026-05-10', type: 'register', read: true },
  { id: 3, title: '准考证已生成，请下载打印', date: '2026-05-12', type: 'ticket', read: false },
]

const myCertificates = [
  { id: 1, occupation: '焊接工', level: '五级', certNo: 'CGN20250001234', issueDate: '2025-06-20' },
]

const examResults = [
  { id: 1, occupation: '焊接工', level: '五级', theory: 88, practical: 85, total: 86.2, status: 'passed' },
]

export default function CandidatePortal() {
  const navigate = useNavigate()
  const backendRegistrations = useBackendResourceList('/personal/register', myRegistrations)
  const backendNotifications = useBackendResourceList('/messages', notifications)
  const backendCertificates = useBackendResourceList('/personal/cert', myCertificates)
  const backendResults = useBackendResourceList('/personal/score', examResults)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">个人工作台</h1>

      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] rounded-lg p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">欢迎回来，考生</h2>
            <p className="text-sm text-white/70 mt-1">您有 1 条未读考试通知，请注意查看</p>
          </div>
          <Award className="w-12 h-12 text-white/20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#1A56DB]">2</div>
          <div className="text-sm text-gray-500 mt-1">我的报名</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-amber-600">1</div>
          <div className="text-sm text-gray-500 mt-1">考试通知</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">1</div>
          <div className="text-sm text-gray-500 mt-1">已获证书</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-500 mt-1">已通过考试</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Registrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1A56DB]" /> 我的报名
            </h2>
            <button onClick={() => navigate('/personal/register')} className="text-xs text-[#1A56DB] hover:underline">我要报名</button>
          </div>
          <div className="space-y-3">
            {backendRegistrations.map(r => (
              <div key={r.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{r.occupation} · {r.level}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    r.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {r.status === 'approved' ? '已通过' : '审核中'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>报名: {r.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />考试: {r.examDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> 消息通知
            </h2>
          </div>
          <div className="space-y-3">
            {backendNotifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                !n.read ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 ${!n.read ? 'bg-[#1A56DB]' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* My Certificates */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> 我的证书
            </h2>
            <button onClick={() => navigate('/personal/cert')} className="text-xs text-[#1A56DB] hover:underline">查看全部</button>
          </div>
          {backendCertificates.length > 0 ? (
            backendCertificates.map(c => (
              <div key={c.id} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{c.occupation} · {c.level}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xs text-gray-500">证书编号: {c.certNo}</div>
                <div className="text-xs text-gray-500">颁发日期: {c.issueDate}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">暂无证书</div>
          )}
        </div>

        {/* Exam Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> 成绩查询
            </h2>
            <button onClick={() => navigate('/personal/score')} className="text-xs text-[#1A56DB] hover:underline">查看全部</button>
          </div>
          {backendResults.map(r => (
            <div key={r.id} className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">{r.occupation} · {r.level}</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500">理论</div>
                  <div className="text-lg font-bold text-gray-900">{r.theory}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">实操</div>
                  <div className="text-lg font-bold text-gray-900">{r.practical}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">总分</div>
                  <div className="text-lg font-bold text-[#1A56DB]">{r.total}</div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                  {r.status === 'passed' ? '已通过' : '未通过'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '个人网报', icon: FileText, path: '/personal/register' },
            { label: '准考证', icon: Award, path: '/personal/ticket' },
            { label: '成绩查询', icon: BarChart3, path: '/personal/score' },
            { label: '证书查询', icon: Award, path: '/personal/cert' },
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
