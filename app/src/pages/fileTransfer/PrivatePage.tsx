import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const items_init = [
  { id: '1', title: '内部薪酬标准', level: '机密', category: '财务', date: '2026-01-01' },
  { id: '2', title: '考评标准细则', level: '秘密', category: '标准', date: '2026-03-15' },
  { id: '3', title: '人员花名册', level: '内部', category: '人事', date: '2026-05-01' },
]

export default function PrivatePage() {
  const [items, setItems] = useBackendListState(items_init)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', level: '内部', category: '', date: '' })

  const filtered = items.filter(i => !search || i.title.includes(search) || i.category.includes(search))
  const openAdd = () => { setForm({ title: '', level: '内部', category: '', date: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.title) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString(), date: new Date().toISOString().slice(0,10) }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  const levelCls: Record<string, string> = { '机密': 'bg-red-50 text-red-700', '秘密': 'bg-amber-50 text-amber-700', '内部': 'bg-blue-50 text-blue-700' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">隐私文档</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加文档</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">文档名称</th><th className="px-4 py-3 text-left">密级</th><th className="px-4 py-3 text-left">类别</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" />{i.title}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${levelCls[i.level]}`}>{i.level}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.category}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加隐私文档</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">文档名称</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入文档名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">密级</label><select value={form.level} onChange={e => setForm({...form,level:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>内部</option><option>秘密</option><option>机密</option></select></div>
          <div><label className="text-sm font-medium text-gray-700">类别</label><input value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入类别" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此文档吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
