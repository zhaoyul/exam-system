import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const corrections = [
  { id: '1', name: '张三', idCard: '440301199001011234', item: '理论成绩', oldVal: '75', newVal: '85', reason: '阅卷误差', status: 'approved' },
  { id: '2', name: '李四', idCard: '440301199002022345', item: '实操成绩', oldVal: '70', newVal: '82', reason: '评分标准调整', status: 'pending' },
]

export default function ScoreCorrection() {
  const [items, setItems] = useState(corrections)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', idCard: '', item: '理论成绩', oldVal: '', newVal: '', reason: '', status: 'pending' })

  const filtered = items.filter(i => !search || i.name.includes(search) || i.idCard.includes(search))
  const openAdd = () => { setForm({ name: '', idCard: '', item: '理论成绩', oldVal: '', newVal: '', reason: '', status: 'pending' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const approve = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">成绩勘误</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 申请勘误</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">勘误项</th><th className="px-4 py-3 text-right">原值</th><th className="px-4 py-3 text-right">新值</th><th className="px-4 py-3 text-left">原因</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileEdit className="w-4 h-4 text-amber-500" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.item}</td>
                <td className="px-4 py-3 text-right text-red-600">{i.oldVal}</td>
                <td className="px-4 py-3 text-right text-green-600 font-medium">{i.newVal}</td>
                <td className="px-4 py-3 text-gray-600">{i.reason}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'approved' ? '已通过' : '待审批'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'pending' && <button onClick={() => approve(i.id)} className="text-xs text-green-600 hover:underline">通过</button>}<button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>申请勘误</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">姓名</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入姓名" /></div>
          <div><label className="text-sm font-medium text-gray-700">身份证号</label><input value={form.idCard} onChange={e => setForm({...form,idCard:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入身份证号" /></div>
          <div><label className="text-sm font-medium text-gray-700">勘误项</label><select value={form.item} onChange={e => setForm({...form,item:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>理论成绩</option><option>实操成绩</option></select></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">原值</label><input value={form.oldVal} onChange={e => setForm({...form,oldVal:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm text-center" /></div><div><label className="text-xs text-gray-500">新值</label><input value={form.newVal} onChange={e => setForm({...form,newVal:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm text-center" /></div></div>
          <div><label className="text-sm font-medium text-gray-700">原因</label><input value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入原因" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此勘误申请吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
