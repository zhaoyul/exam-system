import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Supervision() {
  const [items, setItems] = useState([
    { id: '1', name: '王督导', type: '内部督导', phone: '13800138001', status: 'active', org: '大亚湾核电' },
    { id: '2', name: '李督导', type: '外部督导', phone: '13900139001', status: 'active', org: '中广核工程' },
    { id: '3', name: '张督导', type: '内部督导', phone: '13700137001', status: 'inactive', org: '阳江核电' },
  ])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: '内部督导', phone: '', status: 'active', org: '' })

  const filtered = items.filter(i => !search || i.name.includes(search) || i.org.includes(search))

  const openAdd = () => { setForm({ name: '', type: '内部督导', phone: '', status: 'active', org: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const toggleStatus = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">督导管理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索督导..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加督导</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">所属机构</th><th className="px-4 py-3 text-left">联系电话</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><UserCheck className="w-4 h-4 text-gray-400" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.type}</td>
                <td className="px-4 py-3 text-gray-600">{i.org}</td>
                <td className="px-4 py-3 text-gray-600">{i.phone}</td>
                <td className="px-4 py-3"><button onClick={() => toggleStatus(i.id)} className={`px-2 py-0.5 rounded text-xs ${i.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{i.status === 'active' ? '启用' : '停用'}</button></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加督导</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">姓名</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入姓名" /></div>
          <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>内部督导</option><option>外部督导</option></select></div>
          <div><label className="text-sm font-medium text-gray-700">所属机构</label><input value={form.org} onChange={e => setForm({...form,org:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入所属机构" /></div>
          <div><label className="text-sm font-medium text-gray-700">联系电话</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入联系电话" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此督导吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
