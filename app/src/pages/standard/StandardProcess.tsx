import { useState } from 'react'
import { Plus, Edit3, Trash2, Save, CheckCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const steps_init = [
  { id: '1', name: '标准立项', desc: '提交标准立项申请', completed: true },
  { id: '2', name: '起草标准', desc: '组织专家起草标准文本', completed: true },
  { id: '3', name: '征求意见', desc: '向相关单位征求意见', completed: true },
  { id: '4', name: '专家评审', desc: '召开专家评审会', completed: false },
  { id: '5', name: '标准发布', desc: '正式发布实施', completed: false },
]

export default function StandardProcess() {
  const [items, setItems] = useState(steps_init)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', desc: '', completed: false })

  const toggle = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i)) }
  const openAdd = () => { setForm({ name: '', desc: '', completed: false }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [...prev, { ...form, id: Date.now().toString() }]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">标准制修订</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加阶段</Button>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-4 relative">
          {items.map((i) => (
            <div key={i.id} className="flex items-start gap-4 ml-1">
              <button onClick={() => toggle(i.id)} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${i.completed ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                {i.completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{i.name}</h3>
                  <div className="flex items-center gap-1"><button onClick={() => openEdit(i)} className="p-1 hover:bg-gray-100 rounded"><Edit3 className="w-3.5 h-3.5 text-gray-500" /></button><button onClick={() => setShowDelete(i.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-3.5 h-3.5 text-gray-500" /></button></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加阶段</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">阶段名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入阶段名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">描述</label><input value={form.desc} onChange={e => setForm({...form,desc:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入描述" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此阶段吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
