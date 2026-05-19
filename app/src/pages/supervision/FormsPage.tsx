import { useState } from 'react'
import { FileSpreadsheet, Plus, Edit3, Trash2, Save, Settings, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const forms = [
  { id: '1', name: '督导人员工作评价表', type: '督导评价', status: 'published', date: '2025-12-01' },
  { id: '2', name: '考评人员工作评价表', type: '考评评价', status: 'published', date: '2025-12-01' },
  { id: '3', name: '现场督导记录表', type: '督导记录', status: 'draft', date: '2026-04-15' },
]

const useSettings = [
  { id: '1', label: '督导人员工作填表', current: '督导人员工作评价表' },
  { id: '2', label: '评价督导人员工作填表', current: '现场督导记录表' },
]

export default function FormsPage() {
  const [tab, setTab] = useState<'define' | 'settings'>('define')
  const [items, setItems] = useState(forms)
  const [settings, setSettings] = useState(useSettings)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [showView, setShowView] = useState<any>(null)
  const [form, setForm] = useState({ name: '', type: '督导评价', status: 'draft', date: '' })

  const filtered = items.filter(i => !search || i.name.includes(search))
  const openAdd = () => { setForm({ name: '', type: '督导评价', status: 'draft', date: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const publish = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'published' } : i)) }
  const updateSetting = (id: string, val: string) => { setSettings(prev => prev.map(s => s.id === id ? { ...s, current: val } : s)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">表单管理</h1>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab('define')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'define' ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>表单定义</button>
        <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'settings' ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>使用设置</button>
      </div>
      {tab === 'define' ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索表单..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
            <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加表单</Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">表单名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">更新日期</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-green-600" />{i.name}</td>
                    <td className="px-4 py-3 text-gray-600">{i.type}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'published' ? '已发布' : '草稿'}</span></td>
                    <td className="px-4 py-3 text-gray-600">{i.date}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'draft' && <button onClick={() => publish(i.id)} className="text-xs text-green-600 hover:underline">发布</button>}<button onClick={() => setShowView(i)} className="text-[#1A56DB] hover:underline text-xs"><Eye className="w-3.5 h-3.5 inline" /></button><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-[#1A56DB]" />表单使用设置</h2>
          <div className="space-y-3">
            {settings.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <span className="text-sm text-gray-700">{s.label}</span>
                <select value={s.current} onChange={e => updateSetting(s.id, e.target.value)} className="h-9 px-3 border border-gray-200 rounded-md text-sm">
                  {items.filter(f => f.status === 'published').map(f => <option key={f.id}>{f.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加表单</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">表单名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入表单名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>督导评价</option><option>考评评价</option><option>督导记录</option></select></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑表单</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">表单名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">类型</label><select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"><option>督导评价</option><option>考评评价</option><option>督导记录</option></select></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此表单吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>表单预览</DialogTitle></DialogHeader>
        {showView && <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center"><FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-2" /><div className="font-medium text-gray-900">{showView.name}</div><div className="text-xs text-gray-500 mt-1">{showView.type}</div></div>}
      </DialogContent></Dialog>
    </div>
  )
}
