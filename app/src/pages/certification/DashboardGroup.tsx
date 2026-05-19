import { useState } from 'react'
import { Users, FileCheck, Award, TrendingUp, Calendar, Search, RefreshCw } from 'lucide-react'

const stats = [
  { label: '本年度认定人数', value: 1256, change: '+12%', icon: Users },
  { label: '通过人数', value: 1089, change: '+8%', icon: FileCheck },
  { label: '获证人数', value: 1056, change: '+10%', icon: Award },
  { label: '通过率', value: '86.7%', change: '+2.3%', icon: TrendingUp },
]

const activities = [
  { id: '1', title: '2026年第一批技能认定', date: '2026-05-20', status: '进行中', count: 128 },
  { id: '2', title: '2026年第二批技能认定', date: '2026-06-15', status: '报名中', count: 95 },
  { id: '3', title: '2026年第三批技能认定', date: '2026-07-10', status: '计划中', count: 0 },
]

export default function DashboardGroup() {
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('本年')
  const [items, setItems] = useState(activities)

  const refresh = () => {
    setItems(prev => prev.map(a => ({ ...a, count: a.count + Math.floor(Math.random() * 10) })))
  }

  const filtered = items.filter(a => !search || a.title.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">集团工作台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.label}</span>
              <s.icon className="w-5 h-5 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{s.change}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">认定活动</h2>
          <div className="flex items-center gap-2">
            <select value={period} onChange={e => setPeriod(e.target.value)} className="h-8 px-2 border border-gray-200 rounded-md text-sm">
              <option>本年</option><option>本季度</option><option>本月</option>
            </select>
            <button onClick={refresh} className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索活动..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" />
        </div>
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Calendar className="w-4 h-4 text-[#1A56DB]" /></div>
                <div><div className="text-sm font-medium text-gray-900">{a.title}</div><div className="text-xs text-gray-500">考试日期: {a.date}</div></div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === '进行中' ? 'bg-blue-50 text-blue-700' : a.status === '报名中' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                <span className="text-sm text-gray-600">{a.count}人</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
