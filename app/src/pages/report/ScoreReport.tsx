import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'
import { downloadTextEndpoint } from '@/lib/download'

const data = [
  { id: '1', org: '大亚湾核电', total: 120, pass: 105, fail: 15, avg: 82.5 },
  { id: '2', org: '中广核工程', total: 95, pass: 82, fail: 13, avg: 79.8 },
  { id: '3', org: '阳江核电', total: 68, pass: 62, fail: 6, avg: 85.2 },
  { id: '4', org: '台山核电', total: 45, pass: 38, fail: 7, avg: 81.0 },
]

export default function ScoreReport() {
  const [search, setSearch] = useState('')
  const [items] = useBackendListState(data)
  const filtered = items.filter(i => !search || i.org.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">成绩报表</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button variant="outline" className="h-9" onClick={() => downloadTextEndpoint('/report/score/export', '成绩报表.csv')}><Download className="w-4 h-4 mr-1" />导出</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-right">考试人数</th><th className="px-4 py-3 text-right">通过人数</th><th className="px-4 py-3 text-right">未通过人数</th><th className="px-4 py-3 text-right">通过率</th><th className="px-4 py-3 text-right">平均分</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.org}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.total}</td>
                <td className="px-4 py-3 text-right text-green-600">{i.pass}</td>
                <td className="px-4 py-3 text-right text-red-600">{i.fail}</td>
                <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{(i.pass/i.total*100).toFixed(1)}%</span></td>
                <td className="px-4 py-3 text-right font-medium">{i.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
