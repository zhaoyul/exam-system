import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Megaphone, Pin, Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

const ann_init = [
  { id: '1', title: '2026年第三批技能认定报名通知', content: '各相关单位：2026年第三批技能认定报名工作已经开始，请于7月15日前完成报名。', type: '通知', author: '集团人力资源部', date: '2026-06-01', top: true, status: 'published' },
  { id: '2', title: '考场安排变更公告', content: '原定第二考场的考生请注意，因设备维护，考场调整至培训中心B栋201。', type: '公告', author: '考务管理员', date: '2026-05-18', top: true, status: 'published' },
  { id: '3', title: '督导人员培训通知', content: '2026年下半年督导人员培训将于9月1日举行，请相关专家做好准备。', type: '通知', author: '培训管理员', date: '2026-08-15', top: false, status: 'draft' },
  { id: '4', title: '系统维护公告', content: '系统将于本周六（5月24日）凌晨0:00-6:00进行维护，期间暂停服务。', type: '公告', author: '系统管理员', date: '2026-05-20', top: false, status: 'published' },
]

export default function Announcements() {
  const [items, setItems] = useBackendListState(ann_init)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [showView, setShowView] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '', type: '通知', author: '', top: false, status: 'draft' })

  const filtered = items.filter(i => !search || i.title.includes(search) || i.content.includes(search))
  const openAdd = () => { setForm({ title: '', content: '', type: '通知', author: '', top: false, status: 'draft' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.title || !form.content) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id, date: showEdit.date } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString(), date: new Date().toISOString().slice(0,10) }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const publish = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'published' } : i)) }
  const toggleTop = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, top: !i.top } : i)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Megaphone className="w-6 h-6 text-[#1A56DB]" />通知公告</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索标题/内容..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 发布公告</Button>
      </div>

      {/* 置顶公告 */}
      {filtered.filter(i => i.top).length > 0 && (
        <div className="mb-3 space-y-2">
          {filtered.filter(i => i.top).map(i => (
            <div key={i.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">置顶</span>
                  <span className="text-sm font-medium text-gray-900">{i.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{i.content.slice(0, 80)}...</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowView(i)} className="text-gray-400 hover:text-[#1A56DB]"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleTop(i.id)} className="text-gray-400 hover:text-amber-600"><Pin className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">标题</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">发布人</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.filter(i => !i.top).map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.title}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{i.type}</span></td>
                <td className="px-4 py-3 text-gray-600">{i.author}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status==='published'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{i.status==='published'?'已发布':'草稿'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status==='draft'&&<button onClick={()=>publish(i.id)} className="text-xs text-green-600 hover:underline flex items-center gap-0.5"><Send className="w-3 h-3"/>发布</button>}<button onClick={()=>setShowView(i)} className="text-gray-500 hover:text-[#1A56DB]"><Eye className="w-3.5 h-3.5"/></button><button onClick={()=>toggleTop(i.id)} className="text-gray-500 hover:text-amber-600"><Pin className="w-3.5 h-3.5"/></button><button onClick={()=>openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5"/></button><button onClick={()=>setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>发布公告</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">标题 <span className="text-red-500">*</span></label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入标题"/></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">类型</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm"><option>通知</option><option>公告</option></select></div><div><label className="text-xs text-gray-500">发布人</label><input value={form.author} onChange={e=>setForm({...form,author:e.target.value})} className="w-full mt-1 h-9 px-2 border border-gray-200 rounded-md text-sm" placeholder="输入发布人"/></div></div>
          <div><label className="text-sm font-medium text-gray-700">内容 <span className="text-red-500">*</span></label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className="w-full mt-1 p-3 border border-gray-200 rounded-md text-sm min-h-[100px]" placeholder="输入公告内容"/></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.top} onChange={e=>setForm({...form,top:e.target.checked})} className="rounded" /> 置顶</label>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={()=>setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1"/>保存</Button></div>
      </DialogContent></Dialog>

      <Dialog open={!!showView} onOpenChange={()=>setShowView(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{showView?.title}</DialogTitle></DialogHeader>
        {showView&&<div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-400"><span>{showView.author}</span><span>·</span><span>{showView.date}</span><span>·</span><span className="px-1.5 py-0.5 bg-gray-100 rounded">{showView.type}</span></div>
          <p className="text-sm text-gray-700 leading-relaxed">{showView.content}</p>
        </div>}
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={()=>setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此公告吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={()=>setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={()=>showDelete&&handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
