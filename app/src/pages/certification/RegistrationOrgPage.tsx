import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function RegistrationOrgPage() {
  const [items, setItems] = useState([
    { id: '1', name: '大亚湾核电', code: 'DYG', contact: '张三', phone: '0755-84212345', status: 'confirmed' },
    { id: '2', name: '阳江核电', code: 'YJ', contact: '李四', phone: '0662-7654321', status: 'pending' },
    { id: '3', name: '台山核电', code: 'TS', contact: '王五', phone: '0750-5551234', status: 'confirmed' },
    { id: '4', name: '中广核工程', code: 'GCGS', contact: '赵六', phone: '0755-84323456', status: 'pending' },
  ])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', contact: '', phone: '', status: 'pending' })

  const filtered = items.filter(i => !search || i.name.includes(search) || i.code.includes(search))
  const openAdd = () => { setForm({ name: '', code: '', contact: '', phone: '', status: 'pending' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name || !form.code) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const confirmOrg = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'confirmed' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">报名机构</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加机构</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构名称</th><th className="px-4 py-3 text-left">机构代码</th><th className="px-4 py-3 text-left">联系人</th><th className="px-4 py-3 text-left">联系电话</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.code}</td>
                <td className="px-4 py-3 text-gray-600">{i.contact}</td>
                <td className="px-4 py-3 text-gray-600">{i.phone}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'confirmed' ? '已确认' : '待确认'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'pending' && <button onClick={() => confirmOrg(i.id)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>}<button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加报名机构</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">机构名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入机构名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">机构代码</label><input value={form.code} onChange={e => setForm({...form,code:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入机构代码" /></div>
          <div><label className="text-sm font-medium text-gray-700">联系人</label><input value={form.contact} onChange={e => setForm({...form,contact:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入联系人" /></div>
          <div><label className="text-sm font-medium text-gray-700">联系电话</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入联系电话" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑机构</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">机构名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">机构代码</label><input value={form.code} onChange={e => setForm({...form,code:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">联系人</label><input value={form.contact} onChange={e => setForm({...form,contact:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">联系电话</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此机构吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
