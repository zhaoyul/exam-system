import { useState } from 'react'
import { Search, Eye, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const scores = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', theory: 85, practical: 88, total: 86.8, result: '合格' },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', theory: 78, practical: 82, total: 80.4, result: '合格' },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', theory: 55, practical: 58, total: 56.8, result: '不合格' },
  { id: '4', name: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级', theory: 92, practical: 90, total: 90.8, result: '合格' },
]

export default function ScorePublicity() {
  const [search, setSearch] = useState('')
  const [items] = useBackendListState(scores)
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.idCard.includes(search))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">成绩公示</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-amber-800">
        <Calendar className="w-4 h-4" />
        <span>公示期: 2026年05月25日 - 2026年06月01日</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button variant="outline" className="h-9"><Download className="w-4 h-4 mr-1" />导出</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">理论</th><th className="px-4 py-3 text-right">实操</th><th className="px-4 py-3 text-right">总分</th><th className="px-4 py-3 text-left">结果</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right">{i.theory}</td>
                <td className="px-4 py-3 text-right">{i.practical}</td>
                <td className="px-4 py-3 text-right font-medium">{i.total.toFixed(1)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.result === '合格' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{i.result}</span></td>
                <td className="px-4 py-3"><button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>成绩详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">姓名</span><span className="font-medium">{viewItem.name}</span></div><div className="flex justify-between"><span className="text-gray-500">身份证号</span><span className="font-medium">{viewItem.idCard}</span></div><div className="flex justify-between"><span className="text-gray-500">职业</span><span className="font-medium">{viewItem.occupation}</span></div><div className="flex justify-between"><span className="text-gray-500">理论</span><span className="font-medium">{viewItem.theory}</span></div><div className="flex justify-between"><span className="text-gray-500">实操</span><span className="font-medium">{viewItem.practical}</span></div><div className="flex justify-between"><span className="text-gray-500">总分</span><span className="font-bold text-[#1A56DB]">{viewItem.total.toFixed(1)}</span></div><div className="flex justify-between"><span className="text-gray-500">结果</span><span className={`font-medium ${viewItem.result === '合格' ? 'text-green-600' : 'text-red-600'}`}>{viewItem.result}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
