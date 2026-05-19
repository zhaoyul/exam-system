import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ViolationsPage() {
  const [items, setItems] = useState([
    { id: '1', candidate: '考生A', idCard: '440301199001011234', type: '携带通讯工具', date: '2026-05-20', plan: '2026年第一批', penalty: '成绩作废' },
    { id: '2', candidate: '考生B', idCard: '440301199002022345', type: '抄袭', date: '2026-05-20', plan: '2026年第一批', penalty: '成绩作废，禁考一年' },
  ])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('全部')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ candidate: '', idCard: '', type: '携带通讯工具', date: '', plan: '', penalty: '' })

  const categories = ['全部', '携带通讯工具', '抄袭', '替考', '扰乱考场秩序']
  const filtered = items.filter(i => {
    const m = !search || i.candidate.includes(search) || i.idCard.includes(search)
    const c = activeCat === '全部' || i.type === activeCat
    return m && c
  })
  const openAdd = () => { setForm({ candidate: '', idCard: '', type: '携带通讯工具', date: '', plan: '', penalty: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.candidate) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">违规处理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(c => (<button key={c} onClick={() => setActiveCat(c)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeCat === c ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>))}
        </div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加违规</Button>
      </div>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">考生姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">违规类型</th><th className="px-4 py-3 text-left">违规日期</th><th className="px-4 py-3 text-left">认定计划</th><th className="px-4 py-3 text-left">处罚措施</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />{i.candidate}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600">{i.plan}</td>
                <td className="px-4 py-3 text-gray-600">{i.penalty}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加违规记录</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">考生姓名</label><input value={form.candidate} onChange={e => setForm({...form,candidate:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入考生姓名" /></div>
          <div><label className="text-sm font-medium text-gray-700">身份证号</label><input value={form.idCard} onChange={e => setForm({...form,idCard:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入身份证号" /></div>
          <div><label className="text-sm font-medium text-gray-700">违规类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm">{categories.filter(c=>c!=='全部').map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-700">违规日期</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">处罚措施</label><input value={form.penalty} onChange={e => setForm({...form,penalty:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入处罚措施" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此违规记录吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
