import { useState } from 'react'
import { Search, CheckCircle, XCircle, Eye, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const approvals = [
  { id: '1', title: '2026年第一批认定计划审批', submitter: '张三', org: '大亚湾核电', date: '2026-05-01', status: 'pending' },
  { id: '2', title: '考场编排审批', submitter: '李四', org: '阳江核电', date: '2026-05-10', status: 'pending' },
  { id: '3', title: '成绩发布审批', submitter: '王五', org: '台山核电', date: '2026-05-22', status: 'approved' },
  { id: '4', title: '证书打印审批', submitter: '赵六', org: '中广核工程', date: '2026-05-28', status: 'rejected' },
]

export default function ApprovalPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(approvals)
  const [filter, setFilter] = useState('全部')
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => {
    const m = !search || i.title.includes(search) || i.submitter.includes(search)
    const f = filter === '全部' || i.status === filter
    return m && f
  })
  const approve = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i)) }
  const reject = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'rejected' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">认定审批</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 px-2 border border-gray-200 rounded-md text-sm"><option>全部</option><option value="pending">待审批</option><option value="approved">已通过</option><option value="rejected">已驳回</option></select>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">审批事项</th><th className="px-4 py-3 text-left">提交人</th><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-left">提交日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.title}</td>
                <td className="px-4 py-3 text-gray-600">{i.submitter}</td>
                <td className="px-4 py-3 text-gray-600">{i.org}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'approved' ? 'bg-green-50 text-green-700' : i.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'approved' ? '已通过' : i.status === 'rejected' ? '已驳回' : '待审批'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">
                  {i.status === 'pending' && <><button onClick={() => approve(i.id)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button><button onClick={() => reject(i.id)} className="text-red-600 hover:text-red-700"><XCircle className="w-4 h-4" /></button></>}
                  <button onClick={() => setViewItem(i)} className="text-gray-500 hover:text-[#1A56DB]"><Eye className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>审批详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">事项</span><span className="font-medium">{viewItem.title}</span></div><div className="flex justify-between"><span className="text-gray-500">提交人</span><span className="font-medium">{viewItem.submitter}</span></div><div className="flex justify-between"><span className="text-gray-500">机构</span><span className="font-medium">{viewItem.org}</span></div><div className="flex justify-between"><span className="text-gray-500">日期</span><span className="font-medium">{viewItem.date}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
