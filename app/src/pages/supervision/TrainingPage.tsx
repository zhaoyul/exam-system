import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const trainings = [
  { id: '1', name: '督导人员岗前培训', date: '2026-04-10', location: '培训中心', teacher: '王教授', hours: 16, status: 'completed' },
  { id: '2', name: '考评人员业务培训', date: '2026-04-15', location: '培训中心', teacher: '李教授', hours: 24, status: 'completed' },
  { id: '3', name: '2026年下半年督导培训', date: '2026-09-01', location: '待定', teacher: '待定', hours: 16, status: 'planned' },
]

export default function TrainingPage() {
  const [items, setItems] = useState(trainings)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', date: '', location: '', teacher: '', hours: 16, status: 'planned' })

  const filtered = items.filter(i => !search || i.name.includes(search))
  const openAdd = () => { setForm({ name: '', date: '', location: '', teacher: '', hours: 16, status: 'planned' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">人员培训</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索培训..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加培训</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">培训名称</th><th className="px-4 py-3 text-left">培训日期</th><th className="px-4 py-3 text-left">地点</th><th className="px-4 py-3 text-left">讲师</th><th className="px-4 py-3 text-right">学时</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600">{i.location}</td>
                <td className="px-4 py-3 text-gray-600">{i.teacher}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.hours}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{i.status === 'completed' ? '已完成' : '计划中'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加培训</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">培训名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入培训名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">培训日期</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">地点</label><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入地点" /></div>
          <div><label className="text-sm font-medium text-gray-700">讲师</label><input value={form.teacher} onChange={e => setForm({...form,teacher:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入讲师" /></div>
          <div><label className="text-sm font-medium text-gray-700">学时</label><input type="number" value={form.hours} onChange={e => setForm({...form,hours:parseInt(e.target.value)||0})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此培训吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
