import { useState } from 'react'
import { Search, Eye, FileText, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const docs = [
  { id: '1', name: '2026年认定工作计划.pdf', type: 'PDF', size: '2.5MB', date: '2026-01-15' },
  { id: '2', name: '考务手册.docx', type: 'Word', size: '1.8MB', date: '2026-03-20' },
  { id: '3', name: '成绩汇总表.xlsx', type: 'Excel', size: '856KB', date: '2026-05-25' },
  { id: '4', name: '考场安排表.pdf', type: 'PDF', size: '320KB', date: '2026-05-18' },
]

const typeColors: Record<string, string> = { 'PDF': 'bg-red-50 text-red-700', 'Word': 'bg-blue-50 text-blue-700', 'Excel': 'bg-green-50 text-green-700' }

export default function DocViewerPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(docs)
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.name.includes(search))
  const del = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">文档阅览</h1>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文档..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">文档名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-right">大小</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${typeColors[i.type]}`}>{i.type}</span></td>
                <td className="px-4 py-3 text-right text-gray-600">{i.size}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />预览</button><button onClick={() => del(i.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>文档预览</DialogTitle></DialogHeader>
        {viewItem && <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center"><FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" /><div className="font-medium text-gray-900">{viewItem.name}</div><div className="text-xs text-gray-500 mt-1">{viewItem.type} · {viewItem.size} · {viewItem.date}</div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
