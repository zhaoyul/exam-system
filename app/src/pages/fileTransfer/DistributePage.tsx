import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Send, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const items_init = [
  { id: '1', title: '2026年第一批认定通知', org: '大亚湾核电', date: '2026-05-01', type: '通知', status: 'sent' },
  { id: '2', title: '考场安排变更', org: '阳江核电', date: '2026-05-10', type: '公告', status: 'draft' },
]

export default function DistributePage() {
  const [items, setItems] = useState(items_init)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', org: '', type: '通知', status: 'draft' })

  const filtered = items.filter(i => !search || i.title.includes(search) || i.org.includes(search))
  const openAdd = () => { setForm({ title: '', org: '', type: '通知', status: 'draft' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.title) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id, date: showEdit.date } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString(), date: new Date().toISOString().slice(0,10) }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const send = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'sent' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">发文管理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 新增发文</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">标题</th><th className="px-4 py-3 text-left">接收机构</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.title}</td>
                <td className="px-4 py-3 text-gray-600">{i.org}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'sent' ? '已发送' : '草稿'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'draft' && <button onClick={() => send(i.id)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5"><Send className="w-3.5 h-3.5" />发送</button>}<button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>新增发文</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">标题</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入标题" /></div>
          <div><label className="text-sm font-medium text-gray-700">接收机构</label><input value={form.org} onChange={e => setForm({...form,org:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入接收机构" /></div>
          <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>通知</option><option>公告</option><option>文件</option></select></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此发文吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
