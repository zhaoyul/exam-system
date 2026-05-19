import { useState } from 'react'
import { Building2, Users, FileCheck, Clock, CalendarDays } from 'lucide-react'

const branchStats = [
  { label: '本月认定人数', value: 156, icon: Users },
  { label: '通过人数', value: 134, icon: FileCheck },
  { label: '待审批', value: 8, icon: Clock },
  { label: '考场数', value: 6, icon: Building2 },
]

export default function DashboardBranch() {
  const [period, setPeriod] = useState('本月')
  const [stats, setStats] = useState(branchStats)

  const refresh = () => {
    setStats(prev => prev.map(s => ({ ...s, value: s.value + Math.floor(Math.random() * 5) })))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">单位工作台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">{s.label}</span><s.icon className="w-5 h-5 text-[#1A56DB]" /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">快捷操作</h2>
          <div className="flex items-center gap-2">
            <select value={period} onChange={e => { setPeriod(e.target.value); refresh() }} className="h-8 px-2 border border-gray-200 rounded-md text-sm">
              <option>本月</option><option>本季度</option><option>本年</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['考试报名', '考场编排', '成绩录入', '证书打印'].map((a, i) => (
            <button key={i} className="p-4 border border-gray-200 rounded-lg hover:border-[#1A56DB] hover:bg-blue-50/30 transition-all text-center">
              <CalendarDays className="w-6 h-6 text-[#1A56DB] mx-auto mb-2" />
              <span className="text-sm text-gray-700">{a}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">最近通知</h2>
        <div className="space-y-2">
          {['关于2026年第二批技能认定的通知', '考场安排变更公告', '督导人员培训安排'].map((n, i) => (
            <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm text-gray-700 cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-[#1A56DB]" />{n}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
