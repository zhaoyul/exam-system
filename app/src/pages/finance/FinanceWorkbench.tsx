import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react'

export default function FinanceWorkbench() {
  const navigate = useNavigate()

  const stats = [
    { title: '应收总额', value: '¥1,250', color: 'text-blue-700', bg: 'bg-blue-50', icon: DollarSign },
    { title: '已收金额', value: '¥700', color: 'text-green-700', bg: 'bg-green-50', icon: TrendingUp },
    { title: '待收金额', value: '¥550', color: 'text-red-700', bg: 'bg-red-50', icon: TrendingDown },
    { title: '退款金额', value: '¥150', color: 'text-amber-700', bg: 'bg-amber-50', icon: AlertCircle },
  ]

  const menuItems = [
    { title: '财务收费', desc: '管理考生缴费、确认收款', path: '/finance/charge', icon: DollarSign },
    { title: '收费清单', desc: '查看所有收费记录明细', path: '/finance/list', icon: FileText },
    { title: '记账清单', desc: '财务收支记账流水', path: '/finance/ledger', icon: FileText },
    { title: '收费标准', desc: '按职业工种×等级设置费用', path: '/finance/standard', icon: DollarSign },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">财务系统工作台</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.title} className={`${s.bg} rounded-lg p-4 border border-gray-200`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-sm text-gray-600">{s.title}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">功能导航</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="text-sm font-semibold text-gray-700 mt-6 mb-3">最近缴费记录</h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">考生</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">职业工种</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">2022-03-25</td>
              <td className="px-4 py-3 font-medium text-gray-900">孙考生</td>
              <td className="px-4 py-3 text-gray-600">核反应堆运行值班员（三级）</td>
              <td className="px-4 py-3 text-right font-medium text-green-700">+¥400</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">已缴费</span></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">2022-03-25</td>
              <td className="px-4 py-3 font-medium text-gray-900">李考生</td>
              <td className="px-4 py-3 text-gray-600">电气试验员（四级）</td>
              <td className="px-4 py-3 text-right font-medium text-green-700">+¥300</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">已缴费</span></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">2022-04-01</td>
              <td className="px-4 py-3 font-medium text-gray-900">王考生</td>
              <td className="px-4 py-3 text-gray-600">焊接工（五级）</td>
              <td className="px-4 py-3 text-right font-medium text-red-700">-¥150</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">已退款</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
