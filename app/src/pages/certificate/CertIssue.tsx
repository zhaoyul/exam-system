import { useState } from 'react'
import { Search, CheckCircle, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const certs = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', certNo: 'CGN-2026-001', status: 'issued' },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', certNo: 'CGN-2026-002', status: 'pending' },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', certNo: '', status: 'pending' },
]

export default function CertIssue() {
  const [items, setItems] = useState(certs)
  const [search, setSearch] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.idCard.includes(search))
  const issue = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'issued', certNo: `CGN-2026-${String(Math.floor(Math.random()*999)).padStart(3,'0')}` } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">证书颁发</h1>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-left">证书编号</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.certNo || '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'issued' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'issued' ? '已颁发' : '待颁发'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'pending' && <button onClick={() => issue(i.id)} className="text-xs text-green-600 hover:underline flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5" />颁发</button>}<button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>证书详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">姓名</span><span className="font-medium">{viewItem.name}</span></div><div className="flex justify-between"><span className="text-gray-500">身份证号</span><span className="font-medium">{viewItem.idCard}</span></div><div className="flex justify-between"><span className="text-gray-500">职业</span><span className="font-medium">{viewItem.occupation}</span></div><div className="flex justify-between"><span className="text-gray-500">等级</span><span className="font-medium">{viewItem.level}</span></div><div className="flex justify-between"><span className="text-gray-500">证书编号</span><span className="font-medium">{viewItem.certNo || '未颁发'}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
