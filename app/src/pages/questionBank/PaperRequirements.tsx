import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const reqs = [
  { id: '1', name: '三级理论考试A卷出题要求', occupation: '核反应堆运行值班员', level: '三级', single: 40, multi: 20, judge: 20, total: 100 },
  { id: '2', name: '四级理论考试B卷出题要求', occupation: '电气试验员', level: '四级', single: 50, multi: 15, judge: 20, total: 100 },
]

export default function PaperRequirements() {
  const [items, setItems] = useBackendListState(reqs)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', occupation: '', level: '三级', single: 0, multi: 0, judge: 0 })

  const filtered = items.filter(i => !search || i.name.includes(search) || i.occupation.includes(search))
  const openAdd = () => { setForm({ name: '', occupation: '', level: '三级', single: 0, multi: 0, judge: 0 }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    const total = form.single + form.multi + form.judge
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, total, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, total, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  const FormFields = () => (
    <div className="space-y-3">
      <div><label className="text-sm font-medium text-gray-700">要求名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入要求名称" /></div>
      <div><label className="text-sm font-medium text-gray-700">职业(工种)</label><input value={form.occupation} onChange={e => setForm({...form,occupation:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入职业(工种)" /></div>
      <div><label className="text-sm font-medium text-gray-700">等级</label><select value={form.level} onChange={e => setForm({...form,level:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>一级</option><option>二级</option><option>三级</option><option>四级</option><option>五级</option></select></div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs text-gray-500">单选题数</label><input type="number" value={form.single} onChange={e => setForm({...form,single:parseInt(e.target.value)||0})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm text-center" /></div>
        <div><label className="text-xs text-gray-500">多选题数</label><input type="number" value={form.multi} onChange={e => setForm({...form,multi:parseInt(e.target.value)||0})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm text-center" /></div>
        <div><label className="text-xs text-gray-500">判断题数</label><input type="number" value={form.judge} onChange={e => setForm({...form,judge:parseInt(e.target.value)||0})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm text-center" /></div>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">出题要求</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加要求</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">要求名称</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">单选</th><th className="px-4 py-3 text-right">多选</th><th className="px-4 py-3 text-right">判断</th><th className="px-4 py-3 text-right">总计</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right text-gray-600">{i.single}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.multi}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.judge}</td>
                <td className="px-4 py-3 text-right font-medium text-[#1A56DB]">{i.total}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加出题要求</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑出题要求</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此要求吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
