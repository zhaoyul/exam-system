import { useState } from 'react'
import { Search, Download, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'
import { downloadTextEndpoint } from '@/lib/download'

const data = [
  { id: '1', examRoom: '第一考场', location: '培训中心A栋301', capacity: 40, enrolled: 35, plan: '2026年第一批' },
  { id: '2', examRoom: '第二考场', location: '培训中心A栋302', capacity: 40, enrolled: 38, plan: '2026年第一批' },
  { id: '3', examRoom: '实操考场1', location: '实训基地B区', capacity: 20, enrolled: 18, plan: '2026年第一批' },
]

export default function ArrangementReport() {
  const [search, setSearch] = useState('')
  const [items] = useBackendListState(data)
  const filtered = items.filter(i => !search || i.examRoom.includes(search) || i.plan.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">编排报表</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考场/计划..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button variant="outline" className="h-9" onClick={() => downloadTextEndpoint('/report/arrangement/export', '编排报表.csv')}><Download className="w-4 h-4 mr-1" />导出</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filtered.map(i => (
          <div key={i.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#1A56DB]" /><span className="font-medium text-gray-900">{i.examRoom}</span></div>
            <div className="text-xs text-gray-500 mb-2">{i.location}</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">容量: {i.capacity}</span>
              <span className="text-gray-600">已编排: {i.enrolled}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#1A56DB] rounded-full" style={{ width: `${(i.enrolled / i.capacity * 100)}%` }} /></div>
            <div className="mt-2 text-xs text-gray-500">{i.plan}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
