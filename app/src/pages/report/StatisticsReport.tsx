import { useState } from 'react'
import { Search, BarChart3, TrendingUp, Users, Award, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

const data = [
  { id: '1', org: '大亚湾核电', total: 320, pass: 280, cert: 275, rate: '87.5%' },
  { id: '2', org: '中广核工程', total: 256, pass: 210, cert: 208, rate: '82.0%' },
  { id: '3', org: '阳江核电', total: 180, pass: 160, cert: 158, rate: '88.9%' },
  { id: '4', org: '台山核电', total: 145, pass: 120, cert: 118, rate: '82.8%' },
  { id: '5', org: '中广核研究院', total: 198, pass: 175, cert: 172, rate: '88.4%' },
]

export default function StatisticsReport() {
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('2026 年')
  const [items, setItems] = useBackendListState(data)

  const refresh = () => { setItems(prev => prev.map(d => ({ ...d, total: d.total + Math.floor(Math.random() * 5) }))) }
  const filtered = items.filter(i => !search || i.org.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">统计报表</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">总认定人数</span><Users className="w-5 h-5 text-[#1A56DB]" /></div><div className="text-2xl font-bold text-gray-900">{items.reduce((a,b)=>a+b.total,0)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">通过人数</span><TrendingUp className="w-5 h-5 text-green-600" /></div><div className="text-2xl font-bold text-gray-900">{items.reduce((a,b)=>a+b.pass,0)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">获证人数</span><Award className="w-5 h-5 text-amber-600" /></div><div className="text-2xl font-bold text-gray-900">{items.reduce((a,b)=>a+b.cert,0)}</div></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">平均通过率</span><BarChart3 className="w-5 h-5 text-blue-600" /></div><div className="text-2xl font-bold text-gray-900">{(items.reduce((a,b)=>a+b.pass,0)/items.reduce((a,b)=>a+b.total,0)*100).toFixed(1)}%</div></div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">机构认定统计</h2>
          <div className="flex items-center gap-2">
            <select value={period} onChange={e => { setPeriod(e.target.value); refresh() }} className="h-8 px-2 border border-gray-200 rounded-md text-sm">
              <option>2026 年</option>
              <option>2025 年</option>
              <option>2024 年</option>
            </select>
            <Button onClick={refresh} variant="outline" className="h-8 text-xs"><FileText className="w-3.5 h-3.5 mr-1" />下载PDF</Button>
            <Button onClick={refresh} variant="outline" className="h-8 text-xs"><FileSpreadsheet className="w-3.5 h-3.5 mr-1" />下载XLS</Button>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-4 text-sm text-gray-600">
          当前报表年度：<span className="font-semibold text-gray-900">{period}</span>。支持按真实系统入口导出年度统计报表 PDF 或 XLS。
        </div>
        <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-right">认定人数</th><th className="px-4 py-3 text-right">通过人数</th><th className="px-4 py-3 text-right">获证人数</th><th className="px-4 py-3 text-right">通过率</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
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
      </div>
    </div>
  )
}
