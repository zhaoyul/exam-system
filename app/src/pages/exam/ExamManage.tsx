import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Monitor, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'

const exams = [
  { id: '1', name: '2026年第一批理论考试', type: '理论', date: '2026-05-20', time: '09:00-11:00', rooms: 3, status: 'active' },
  { id: '2', name: '2026年第一批实操考试', type: '实操', date: '2026-05-20', time: '14:00-16:00', rooms: 2, status: 'waiting' },
  { id: '3', name: '2026年第二批理论考试', type: '理论', date: '2026-06-15', time: '09:00-11:00', rooms: 3, status: 'planned' },
]

export default function ExamManage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(exams)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: '理论', date: '', time: '', rooms: 1, status: 'planned' })

  const filtered = items.filter(i => !search || i.name.includes(search))
  const openAdd = () => { setForm({ name: '', type: '理论', date: '', time: '', rooms: 1, status: 'planned' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const startExam = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'active' } : i)) }
  const stopExam = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'completed' } : i)) }

  const statusCls: Record<string, string> = { active: 'bg-green-50 text-green-700', waiting: 'bg-amber-50 text-amber-700', planned: 'bg-blue-50 text-blue-700', completed: 'bg-gray-100 text-gray-500' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Monitor className="w-6 h-6 text-[#1A56DB]" />考试管理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考试..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64" /></div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/exam/online')} variant="outline" className="h-9 text-xs"><Play className="w-3.5 h-3.5 mr-1" />进入考试</Button>
          <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加考试</Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">考试名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">时间</th><th className="px-4 py-3 text-right">考场数</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600">{i.time}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.rooms}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusCls[i.status]}`}>{i.status === 'active' ? '进行中' : i.status === 'waiting' ? '待开始' : i.status === 'completed' ? '已结束' : '计划中'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'planned' && <button onClick={() => startExam(i.id)} className="text-xs text-green-600 hover:underline flex items-center gap-0.5"><Play className="w-3.5 h-3.5" />开始</button>}{i.status === 'active' && <button onClick={() => stopExam(i.id)} className="text-xs text-red-600 hover:underline flex items-center gap-0.5"><Square className="w-3.5 h-3.5" />结束</button>}<button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加考试</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">考试名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入考试名称" /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm"><option>理论</option><option>实操</option></select></div><div><label className="text-xs text-gray-500">考场数</label><input type="number" value={form.rooms} onChange={e => setForm({...form,rooms:parseInt(e.target.value)||1})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm" /></div></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">日期</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm" /></div><div><label className="text-xs text-gray-500">时间</label><input value={form.time} onChange={e => setForm({...form,time:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm" placeholder="如 09:00-11:00" /></div></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此考试吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
