import { useState } from 'react'
import { Search, CheckCircle, Eye, FileText, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const items_init = [
  { id: '1', title: '2026年第一批认定申请', org: '阳江核电', date: '2026-05-05', type: '申请', status: 'unread' },
  { id: '2', title: '考场资源确认函', org: '台山核电', date: '2026-05-08', type: '确认函', status: 'read' },
  { id: '3', title: '督导人员推荐表', org: '中广核工程', date: '2026-05-12', type: '表格', status: 'read' },
]

export default function ReceivePage() {
  const [items, setItems] = useState(items_init)
  const [search, setSearch] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.title.includes(search) || i.org.includes(search))
  const markRead = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i)) }
  const del = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">收文管理</h1>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">标题</th><th className="px-4 py-3 text-left">发文机构</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className={`hover:bg-gray-50 ${i.status === 'unread' ? 'bg-blue-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.title}{i.status === 'unread' && <span className="w-2 h-2 bg-red-500 rounded-full" />}</td>
                <td className="px-4 py-3 text-gray-600">{i.org}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'unread' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{i.status === 'unread' ? '未读' : '已读'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'unread' && <button onClick={() => markRead(i.id)} className="text-xs text-green-600 hover:underline flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5" />标记已读</button>}<button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button><button onClick={() => del(i.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>收文详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">标题</span><span className="font-medium">{viewItem.title}</span></div><div className="flex justify-between"><span className="text-gray-500">发文机构</span><span className="font-medium">{viewItem.org}</span></div><div className="flex justify-between"><span className="text-gray-500">类型</span><span className="font-medium">{viewItem.type}</span></div><div className="flex justify-between"><span className="text-gray-500">日期</span><span className="font-medium">{viewItem.date}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
