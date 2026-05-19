import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const questions = [
  { id: '1', content: '核反应堆冷却泵的检修步骤', type: '实操题', occupation: '机械设备检修工', level: '三级', status: 'published' },
  { id: '2', content: '电气设备绝缘测试操作', type: '实操题', occupation: '电气试验员', level: '四级', status: 'published' },
  { id: '3', content: '焊接质量检验方法', type: '实操题', occupation: '焊接工', level: '三级', status: 'draft' },
]

export default function SkillQB() {
  const [items, setItems] = useState(questions)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ content: '', type: '实操题', occupation: '', level: '三级', status: 'draft' })

  const filtered = items.filter(i => !search || i.content.includes(search) || i.occupation.includes(search))
  const openAdd = () => { setForm({ content: '', type: '实操题', occupation: '', level: '三级', status: 'draft' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.content) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const publish = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'published' } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">技能题库</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索题目..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加实操题</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">题目内容</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 max-w-[300px] truncate flex items-center gap-2"><Wrench className="w-4 h-4 text-[#1A56DB] flex-shrink-0" />{i.content}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'published' ? '已发布' : '草稿'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'draft' && <button onClick={() => publish(i.id)} className="text-xs text-green-600 hover:underline">发布</button>}<button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>添加实操题</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">题目内容</label><textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} className="w-full mt-1 p-3 border border-gray-200 rounded-md text-sm min-h-[80px]" placeholder="输入题目内容" /></div>
          <div><label className="text-sm font-medium text-gray-700">职业(工种)</label><input value={form.occupation} onChange={e => setForm({...form,occupation:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入职业(工种)" /></div>
          <div><label className="text-sm font-medium text-gray-700">等级</label><select value={form.level} onChange={e => setForm({...form,level:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>一级</option><option>二级</option><option>三级</option><option>四级</option><option>五级</option></select></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此题目吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
