import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, Send, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const filings = [
  { id: '1', org: '阳江核电', parent: '集团', date: '2026-01-10', scope: '核反应堆运行值班员（三/四级）', status: 'approved', reviewer: '王督导' },
  { id: '2', org: '台山核电', parent: '集团', date: '2026-02-15', scope: '电气试验员（三/四级）、焊接工（五级）', status: 'reviewing', reviewer: '李督导' },
  { id: '3', org: '中广核工程', parent: '集团', date: '2026-03-01', scope: '机械设备检修工（三/四级）', status: 'submitted', reviewer: '--' },
  { id: '4', org: '中广核研究院', parent: '集团', date: '2026-04-01', scope: '仪控设备检修工（三/四级）', status: 'draft', reviewer: '--' },
]

export default function BranchFiling() {
  const [items, setItems] = useState(filings)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ org: '', parent: '集团', date: '', scope: '', status: 'draft', reviewer: '' })

  const filtered = items.filter(i => !search || i.org.includes(search) || i.scope.includes(search))
  const openAdd = () => { setForm({ org: '', parent: '集团', date: '', scope: '', status: 'draft', reviewer: '' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.org) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const submitF = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'submitted' } : i)) }
  const reviewF = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'reviewing' } : i)) }
  const approveF = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved', reviewer: '王督导' } : i)) }
  const rejectF = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'rejected', reviewer: '王督导' } : i)) }

  const statusCls: Record<string, string> = { draft: 'bg-gray-100 text-gray-500', submitted: 'bg-blue-50 text-blue-700', reviewing: 'bg-amber-50 text-amber-700', approved: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-700' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-6 h-6 text-[#1A56DB]" />分支机构备案</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构/工种..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 新增备案</Button>
      </div>

      {/* 流程 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between text-xs">
          {['分支机构提交', '集团初审', '专家评审', '备案完成'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1"><div className="w-6 h-6 rounded-full bg-blue-50 text-[#1A56DB] flex items-center justify-center text-xs font-medium">{i+1}</div><span className="text-gray-600">{s}</span></div>
              {i < 3 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-left">备案日期</th><th className="px-4 py-3 text-left">认定范围</th><th className="px-4 py-3 text-left">审核人</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.org}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{i.scope}</td>
                <td className="px-4 py-3 text-gray-600">{i.reviewer}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusCls[i.status]}`}>{i.status==='draft'?'草稿':i.status==='submitted'?'已提交':i.status==='reviewing'?'审核中':i.status==='approved'?'已通过':'已驳回'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2 flex-wrap">{i.status==='draft'&&<button onClick={()=>submitF(i.id)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5"><Send className="w-3 h-3"/>提交</button>}{i.status==='submitted'&&<button onClick={()=>reviewF(i.id)} className="text-xs text-amber-600 hover:underline">初审</button>}{i.status==='reviewing'&&<><button onClick={()=>approveF(i.id)} className="text-xs text-green-600 hover:underline">通过</button><button onClick={()=>rejectF(i.id)} className="text-xs text-red-600 hover:underline">驳回</button></>}<button onClick={()=>openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5"/></button><button onClick={()=>setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>新增分支机构备案</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">机构名称</label><input value={form.org} onChange={e=>setForm({...form,org:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入机构名称"/></div>
          <div><label className="text-sm font-medium text-gray-700">认定范围</label><input value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如：核反应堆运行值班员（三/四级）"/></div>
          <div><label className="text-sm font-medium text-gray-700">备案日期</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm"/></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={()=>setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1"/>保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={()=>setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此备案记录吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={()=>setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={()=>showDelete&&handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
