import { useState } from 'react'
import { Download, RefreshCw, TrendingUp, Users, Award, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

const data = [
  { id: '1', org: '大亚湾核电', total: 320, pass: 280, cert: 275, rate: '87.5%' },
  { id: '2', org: '中广核工程', total: 256, pass: 210, cert: 208, rate: '82.0%' },
  { id: '3', org: '阳江核电', total: 180, pass: 160, cert: 158, rate: '88.9%' },
  { id: '4', org: '台山核电', total: 145, pass: 120, cert: 118, rate: '82.8%' },
  { id: '5', org: '中广核研究院', total: 198, pass: 175, cert: 172, rate: '88.4%' },
]

const occupationData = [
  { id: 'o1', occupation: '企业人力资源管理师', plans: 2, registered: 2, exams: 2, passed: 2, certified: 2, rate: '100.0%' },
  { id: 'o2', occupation: '发电厂发电机检修工', plans: 1, registered: 1, exams: 1, passed: 1, certified: 1, rate: '100.0%' },
  { id: 'o3', occupation: '电气试验员', plans: 3, registered: 126, exams: 118, passed: 96, certified: 94, rate: '81.4%' },
]

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('等级认定')
  const [mode, setMode] = useState<'按职业统计' | '按机构统计'>('按职业统计')
  const [startMonth, setStartMonth] = useState('2026-01')
  const [endMonth, setEndMonth] = useState('2026-05')
  const [items, setItems] = useBackendListState(data)

  const refresh = () => {
    setItems(prev => prev.map(d => ({ ...d, total: d.total + Math.floor(Math.random() * 10), pass: d.pass + Math.floor(Math.random() * 8) })))
  }

  const totalSum = items.reduce((a, b) => a + b.total, 0)
  const passSum = items.reduce((a, b) => a + b.pass, 0)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">认定统计</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">总认定人数</span><Users className="w-5 h-5 text-[#1A56DB]" /></div><div className="text-2xl font-bold text-gray-900">{totalSum}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">通过人数</span><FileCheck className="w-5 h-5 text-green-600" /></div><div className="text-2xl font-bold text-gray-900">{passSum}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">获证人数</span><Award className="w-5 h-5 text-amber-600" /></div><div className="text-2xl font-bold text-gray-900">{items.reduce((a,b)=>a+b.cert,0)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">平均通过率</span><TrendingUp className="w-5 h-5 text-blue-600" /></div><div className="text-2xl font-bold text-gray-900">{(passSum/totalSum*100).toFixed(1)}%</div></div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {['等级认定', '认定申报'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`h-8 rounded-md px-4 text-sm font-medium ${activeTab === tab ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{tab}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} className="h-8 px-2 border border-gray-200 rounded-md text-sm" aria-label="开始月份" />
            <span className="text-xs text-gray-400">~</span>
            <input type="month" value={endMonth} onChange={e => setEndMonth(e.target.value)} className="h-8 px-2 border border-gray-200 rounded-md text-sm" aria-label="结束月份" />
            <Button onClick={refresh} variant="outline" className="h-8 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />刷新</Button>
            <Button variant="outline" className="h-8 text-xs"><Download className="w-3.5 h-3.5 mr-1" />导出</Button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#F9FAFB] p-3">
          <div className="text-sm text-gray-600">开始月份 {startMonth} ~ 结束月份 {endMonth}</div>
          <div className="flex items-center gap-2">
            {(['按职业统计', '按机构统计'] as const).map(item => (
              <button key={item} onClick={() => setMode(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${mode === item ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>{item}</button>
            ))}
            <button className="text-xs text-[#1A56DB] hover:underline">查看报表</button>
          </div>
        </div>
        {mode === '按职业统计' ? (
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">职业</th><th className="px-4 py-3 text-right">计划数</th><th className="px-4 py-3 text-right">报名人数</th><th className="px-4 py-3 text-right">参考人数</th><th className="px-4 py-3 text-right">通过人数</th><th className="px-4 py-3 text-right">获证人数</th><th className="px-4 py-3 text-right">通过率</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {occupationData.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.occupation}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.plans}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.registered}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.exams}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.passed}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.certified}</td>
                  <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-right">认定人数</th><th className="px-4 py-3 text-right">通过人数</th><th className="px-4 py-3 text-right">获证人数</th><th className="px-4 py-3 text-right">通过率</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.org}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.total}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.pass}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{i.cert}</td>
                  <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
