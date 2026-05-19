import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, MapPin, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ExamRoomPage() {
  const [items, setItems] = useState([
    { id: '1', name: '第一考场', location: '培训中心A栋301', capacity: 40, type: '理论', status: 'active' },
    { id: '2', name: '第二考场', location: '培训中心A栋302', capacity: 40, type: '理论', status: 'active' },
    { id: '3', name: '实操考场1', location: '实训基地B区', capacity: 20, type: '实操', status: 'active' },
    { id: '4', name: '实操考场2', location: '实训基地C区', capacity: 15, type: '实操', status: 'inactive' },
  ])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', location: '', capacity: 30, type: '理论', status: 'active' })

  const filtered = items.filter(i => !search || i.name.includes(search) || i.location.includes(search))
  const openAdd = () => { setForm({ name: '', location: '', capacity: 30, type: '理论', status: 'active' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name || !form.location) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const toggleStatus = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i)) }

  const FormFields = () => (
    <div className="space-y-3">
      <div><label className="text-sm font-medium text-gray-700">考场名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入考场名称" /></div>
      <div><label className="text-sm font-medium text-gray-700">位置</label><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入位置" /></div>
      <div><label className="text-sm font-medium text-gray-700">容量</label><input type="number" value={form.capacity} onChange={e => setForm({...form,capacity:parseInt(e.target.value)||0})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
      <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>理论</option><option>实操</option></select></div>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">考场信息</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考场..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加考场</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(i => (
          <div key={i.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-[#1A56DB]" /><span className="font-medium text-gray-900">{i.name}</span></div>
              <div className="flex items-center gap-1"><button onClick={() => openEdit(i)} className="p-1 hover:bg-gray-100 rounded"><Edit3 className="w-3.5 h-3.5 text-gray-500" /></button><button onClick={() => setShowDelete(i.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-3.5 h-3.5 text-gray-500" /></button></div>
            </div>
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{i.location}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">容量: {i.capacity}人</span>
              <span className={`px-2 py-0.5 rounded text-xs ${i.type === '理论' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{i.type}</span>
              <button onClick={() => toggleStatus(i.id)} className={`px-2 py-0.5 rounded text-xs ${i.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{i.status === 'active' ? '启用' : '停用'}</button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加考场</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑考场</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此考场吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
