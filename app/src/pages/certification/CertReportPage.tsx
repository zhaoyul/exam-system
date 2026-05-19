import { useState } from 'react'
import { Search, Upload, Download, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const reports = [
  { id: '1', name: '2026年第一批证书上报数据', org: '大亚湾核电', count: 128, date: '2026-05-25', status: 'pending' },
  { id: '2', name: '2026年第一批证书上报数据', org: '阳江核电', count: 95, date: '2026-05-25', status: 'uploaded' },
  { id: '3', name: '2025年第四批证书上报数据', org: '台山核电', count: 72, date: '2025-12-20', status: 'confirmed' },
]

export default function CertReportPage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(reports)
  const [viewItem, setViewItem] = useState<any>(null)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.org.includes(search))
  const upload = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'uploaded' } : i)) }
  const confirm = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'confirmed' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">证书上报</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button variant="outline" className="h-9"><Download className="w-4 h-4 mr-1" />下载模板</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">上报名称</th><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-right">证书数</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.org}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.count}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'confirmed' ? 'bg-green-50 text-green-700' : i.status === 'uploaded' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'confirmed' ? '已确认' : i.status === 'uploaded' ? '已上报' : '待上报'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">
                  {i.status === 'pending' && <button onClick={() => upload(i.id)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5"><Upload className="w-3.5 h-3.5" />上报</button>}
                  {i.status === 'uploaded' && <button onClick={() => confirm(i.id)} className="text-xs text-green-600 hover:underline">确认</button>}
                  <button onClick={() => setViewItem(i)} className="text-gray-500 hover:text-[#1A56DB]"><Eye className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>上报详情</DialogTitle></DialogHeader>
        {viewItem && <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">名称</span><span className="font-medium">{viewItem.name}</span></div><div className="flex justify-between"><span className="text-gray-500">机构</span><span className="font-medium">{viewItem.org}</span></div><div className="flex justify-between"><span className="text-gray-500">证书数</span><span className="font-medium">{viewItem.count}</span></div><div className="flex justify-between"><span className="text-gray-500">日期</span><span className="font-medium">{viewItem.date}</span></div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
