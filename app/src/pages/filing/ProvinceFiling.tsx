import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, FileCheck, Send, CheckCircle, Clock, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

const filings = [
  { id: '1', org: '大亚湾核电', province: '广东省', dept: '广东省人力资源和社会保障厅', date: '2026-01-15', materials: 8, status: 'submitted' },
  { id: '2', org: '阳江核电', province: '广东省', dept: '广东省人力资源和社会保障厅', date: '2026-01-15', materials: 8, status: 'approved' },
  { id: '3', org: '台山核电', province: '广东省', dept: '广东省人力资源和社会保障厅', date: '2026-02-20', materials: 6, status: 'reviewing' },
  { id: '4', org: '中广核工程', province: '广东省', dept: '广东省人力资源和社会保障厅', date: '2026-03-10', materials: 7, status: 'draft' },
]

const materialsList = [
  '机构法人证书', '组织章程', '管理人员名册', '场地设施清单',
  '设备仪器清单', '质量管理体系文件', '专家库名单', '近3年评价工作总结'
]

export default function ProvinceFiling() {
  const [items, setItems] = useBackendListState(filings)
  const backendMaterials = useBackendResourceList('/file/receive', materialsList)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [form, setForm] = useState({ org: '', province: '', dept: '', date: '', materials: 8, status: 'draft' })

  const filtered = items.filter(i => !search || i.org.includes(search) || i.province.includes(search))
  const openAdd = () => { setForm({ org: '', province: '', dept: '', date: '', materials: 8, status: 'draft' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.org) return
    if (showEdit) { setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i)); setShowEdit(null) }
    else { setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }
  const submit = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'submitted' } : i)) }
  const approve = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i)) }

  const statusCls: Record<string, string> = { draft: 'bg-gray-100 text-gray-500', submitted: 'bg-blue-50 text-blue-700', reviewing: 'bg-amber-50 text-amber-700', approved: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-700' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-6 h-6 text-[#1A56DB]" />省级备案管理</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索机构/省份..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64" /></div>
        <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 新增备案</Button>
      </div>

      {/* 流程说明 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          {[{ label: '草稿', icon: FileCheck }, { label: '已提交', icon: Send }, { label: '审核中', icon: Clock }, { label: '已通过', icon: CheckCircle }].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center"><s.icon className={`w-5 h-5 ${i === 0 ? 'text-[#1A56DB]' : 'text-gray-400'}`} /><span className="text-xs text-gray-500 mt-1">{s.label}</span></div>
              {i < 3 && <div className="w-16 md:w-24 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">机构</th><th className="px-4 py-3 text-left">省份</th><th className="px-4 py-3 text-left">人社部门</th><th className="px-4 py-3 text-left">提交日期</th><th className="px-4 py-3 text-right">材料数</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.org}</td>
                <td className="px-4 py-3 text-gray-600">{i.province}</td>
                <td className="px-4 py-3 text-gray-600">{i.dept}</td>
                <td className="px-4 py-3 text-gray-600">{i.date}</td>
                <td className="px-4 py-3 text-right text-gray-600">{i.materials}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusCls[i.status]}`}>{i.status === 'draft' ? '草稿' : i.status === 'submitted' ? '已提交' : i.status === 'reviewing' ? '审核中' : i.status === 'approved' ? '已通过' : '已驳回'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{i.status === 'draft' && <button onClick={() => submit(i.id)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-0.5"><Send className="w-3.5 h-3.5" />提交</button>}{i.status === 'submitted' && <button onClick={() => setItems(prev => prev.map(p => p.id === i.id ? { ...p, status: 'reviewing' } : p))} className="text-xs text-amber-600 hover:underline">审核</button>}{i.status === 'reviewing' && <button onClick={() => approve(i.id)} className="text-xs text-green-600 hover:underline flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5" />通过</button>}<button onClick={() => setShowDetail(i)} className="text-gray-500 hover:text-[#1A56DB]"><FileCheck className="w-3.5 h-3.5" /></button><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>新增备案</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">机构名称</label><input value={form.org} onChange={e => setForm({...form,org:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入机构名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">省份</label><input value={form.province} onChange={e => setForm({...form,province:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入省份" /></div>
          <div><label className="text-sm font-medium text-gray-700">人社部门</label><input value={form.dept} onChange={e => setForm({...form,dept:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入人社部门名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">计划提交日期</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>

      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>备案材料清单</DialogTitle></DialogHeader>
        {showDetail && <div>
          <div className="text-sm text-gray-600 mb-3">机构：{showDetail.org}</div>
          <div className="space-y-2">
            {backendMaterials.map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg">
                <CheckCircle className={`w-4 h-4 ${i < showDetail.materials ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={`text-sm ${i < showDetail.materials ? 'text-gray-900' : 'text-gray-400'}`}>{m}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">已准备 {showDetail.materials}/8 项材料</div>
        </div>}
      </DialogContent></Dialog>

      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此备案记录吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
