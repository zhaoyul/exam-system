import { useState } from 'react'
import { Search, Eye, Award, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const history = [
  { id: '1', name: '2025年第四批技能认定', date: '2025-12-15', occupation: '核反应堆运行值班员', level: '三级', total: 120, pass: 105, status: 'completed' },
  { id: '2', name: '2025年第三批技能认定', date: '2025-10-20', occupation: '电气试验员', level: '四级', total: 95, pass: 82, status: 'completed' },
  { id: '3', name: '2025年第二批技能认定', date: '2025-07-15', occupation: '机械设备检修工', level: '三级', total: 156, pass: 138, status: 'completed' },
  { id: '4', name: '2025年第一批技能认定', date: '2025-04-20', occupation: '仪控设备检修工', level: '二级', total: 88, pass: 76, status: 'completed' },
  { id: '5', name: '2024年第四批技能认定', date: '2024-12-10', occupation: '焊接工', level: '三级', total: 72, pass: 61, status: 'completed' },
]

export default function HistoricalPage() {
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('全部')
  const [viewDetail, setViewDetail] = useState<any>(null)
  const [items] = useState(history)

  const filtered = items.filter(i => {
    const m = !search || i.name.includes(search) || i.occupation.includes(search)
    const y = year === '全部' || i.date.startsWith(year)
    return m && y
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">历次认定</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
          <select value={year} onChange={e => setYear(e.target.value)} className="h-9 px-2 border border-gray-200 rounded-md text-sm"><option>全部</option><option>2025</option><option>2024</option></select>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">计划名称</th><th className="px-4 py-3 text-left">考试日期</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">报名人数</th><th className="px-4 py-3 text-right">通过人数</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right text-gray-600">{i.total}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.pass}</td>
                <td className="px-4 py-3"><button onClick={() => setViewDetail(i)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" />查看</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewDetail} onOpenChange={() => setViewDetail(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>认定详情</DialogTitle></DialogHeader>
        {viewDetail && <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">计划名称</div><div className="text-sm font-medium text-gray-900">{viewDetail.name}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">考试日期</div><div className="text-sm font-medium text-gray-900">{viewDetail.date}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">职业(工种)</div><div className="text-sm font-medium text-gray-900">{viewDetail.occupation}</div></div>
            <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">等级</div><div className="text-sm font-medium text-gray-900">{viewDetail.level}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 border border-gray-200 rounded-lg text-center"><Users className="w-5 h-5 text-[#1A56DB] mx-auto mb-1" /><div className="text-lg font-bold">{viewDetail.total}</div><div className="text-xs text-gray-500">报名人数</div></div>
            <div className="p-3 border border-gray-200 rounded-lg text-center"><Award className="w-5 h-5 text-green-600 mx-auto mb-1" /><div className="text-lg font-bold">{viewDetail.pass}</div><div className="text-xs text-gray-500">通过人数</div></div>
          </div>
        </div>}
      </DialogContent></Dialog>
    </div>
  )
}
