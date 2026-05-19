import { useState } from 'react'
import { Search, Eye, Download, Trash2, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const papers = [
  { id: '1', name: '2026年第一批-核反应堆运行值班员三级-A卷', occupation: '核反应堆运行值班员', level: '三级', questions: 80, status: 'published' },
  { id: '2', name: '2026年第一批-电气试验员四级-B卷', occupation: '电气试验员', level: '四级', questions: 85, status: 'published' },
  { id: '3', name: '2026年第一批-机械设备检修工三级-A卷', occupation: '机械设备检修工', level: '三级', questions: 80, status: 'draft' },
]

export default function PaperLibrary() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(papers)
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.occupation.includes(search))
  const del = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">试卷库</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索试卷..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">试卷名称</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">题数</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[300px] truncate flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB] flex-shrink-0" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right text-gray-600">{i.questions}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'published' ? '已发布' : '草稿'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => setViewItem(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button><button className="text-gray-500 hover:text-blue-600"><Download className="w-3.5 h-3.5" /></button><button onClick={() => del(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>试卷详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">试卷名称</span><span className="font-medium">{viewItem.name}</span></div><div className="flex justify-between"><span className="text-gray-500">职业(工种)</span><span className="font-medium">{viewItem.occupation}</span></div><div className="flex justify-between"><span className="text-gray-500">等级</span><span className="font-medium">{viewItem.level}</span></div><div className="flex justify-between"><span className="text-gray-500">题数</span><span className="font-medium">{viewItem.questions}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
