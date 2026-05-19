import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Building2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Organizations() {
  const [items, setItems] = useState([
    { id: '1', name: '大亚湾核电运营管理有限责任公司', code: 'DYG', type: '集团', contact: '张三', phone: '0755-84212345' },
    { id: '2', name: '中广核工程有限公司', code: 'GCGS', type: '集团', contact: '李四', phone: '0755-84323456' },
    { id: '3', name: '中广核研究院有限公司', code: 'YJY', type: '集团', contact: '王五', phone: '0755-84434567' },
    { id: '4', name: '阳江核电有限公司', code: 'YJ', type: '单位', contact: '赵六', phone: '0662-7654321' },
    { id: '5', name: '台山核电合营有限公司', code: 'TS', type: '单位', contact: '孙七', phone: '0750-5551234' },
  ])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', type: '单位', contact: '', phone: '' })

  const filtered = items.filter(i => {
    const m = !search || i.name.includes(search) || i.code.includes(search)
    const t = filterType === '全部' || i.type === filterType
    return m && t
  })

  const openAdd = () => { setForm({ name: '', code: '', type: '单位', contact: '', phone: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name || !form.code) return
    if (showEdit) {
      setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i))
      setShowEdit(null)
    } else {
      setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev])
      setShowAdd(false)
    }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  const FormFields = () => (
    <div className="space-y-3">
      <div><label className="text-sm font-medium text-gray-700">机构名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" placeholder="输入机构名称" /></div>
      <div><label className="text-sm font-medium text-gray-700">机构代码</label><input value={form.code} onChange={e => setForm({...form,code:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" placeholder="输入机构代码" /></div>
      <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>集团</option><option>单位</option></select></div>
      <div><label className="text-sm font-medium text-gray-700">联系人</label><input value={form.contact} onChange={e => setForm({...form,contact:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入联系人" /></div>
      <div><label className="text-sm font-medium text-gray-700">联系电话</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入联系电话" /></div>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">机构管理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-md text-sm"><option>全部</option><option>集团</option><option>单位</option></select>
        </div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加机构</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构名称</th><th className="px-4 py-3 text-left">代码</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">联系人</th><th className="px-4 py-3 text-left">联系电话</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.code}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.type === '集团' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.contact}</td>
                <td className="px-4 py-3 text-gray-600">{i.phone}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加机构</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑机构</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此机构吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
