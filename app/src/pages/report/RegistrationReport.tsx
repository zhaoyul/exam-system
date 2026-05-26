import { useState } from 'react'
import { Search, Download, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'
import { downloadTextEndpoint } from '@/lib/download'

const data = [
  { id: '1', org: '大亚湾核电', occupation: '核反应堆运行值班员', level: '三级', count: 45 },
  { id: '2', org: '大亚湾核电', occupation: '电气试验员', level: '四级', count: 32 },
  { id: '3', org: '阳江核电', occupation: '机械设备检修工', level: '三级', count: 28 },
  { id: '4', org: '台山核电', occupation: '仪控设备检修工', level: '二级', count: 18 },
]

export default function RegistrationReport() {
  const [search, setSearch] = useState('')
  const [items] = useBackendListState(data)
  const filtered = items.filter(i => !search || i.org.includes(search) || i.occupation.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">报名报表</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        </div>
        <Button variant="outline" className="h-9" onClick={() => downloadTextEndpoint('/report/registration/export', '报名报表.csv')}><Download className="w-4 h-4 mr-1" />导出</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">报名人数</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.org}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right"><span className="font-medium">{i.count}</span> <Users className="w-3 h-3 inline text-gray-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
