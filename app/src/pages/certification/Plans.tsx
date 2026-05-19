import { useState } from 'react'
import { Plus, Search, Play, Users, MapPin, FileText, Award, ChevronRight, Save, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const workflowSteps = ['制定计划', '考试报名', '考场编排', '考务安排', '成绩管理', '成绩公示', '证书管理']

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: '已完成', cls: 'bg-green-50 text-green-700' },
  processing: { label: '进行中', cls: 'bg-blue-50 text-blue-700' },
  pending: { label: '待审批', cls: 'bg-amber-50 text-amber-700' },
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
}

export default function Plans() {
  const [items, setItems] = useState([
    { id: '1', name: '2026年第一批技能认定', date: '2026-05-20', occupation: '核反应堆运行值班员', level: '三级', status: 'draft' },
    { id: '2', name: '2026年第二批技能认定', date: '2026-06-15', occupation: '电气试验员', level: '四级', status: 'pending' },
    { id: '3', name: '2026年第三批技能认定', date: '2026-07-10', occupation: '机械设备检修工', level: '三级', status: 'processing' },
    { id: '4', name: '2026年第四批技能认定', date: '2026-04-28', occupation: '仪控设备检修工', level: '二级', status: 'completed' },
  ])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', date: '', occupation: '', level: '三级', status: 'draft' })

  const levels = ['一级', '二级', '三级', '四级', '五级']
  const occupations = ['核反应堆运行值班员', '电气试验员', '机械设备检修工', '仪控设备检修工', '焊接工', '起重机械操作工']

  const filtered = items.filter(p => !search || p.name.includes(search) || p.occupation.includes(search))
  const selected = items.find(p => p.id === selectedPlan)

  const openAdd = () => { setForm({ name: '', date: '', occupation: '', level: '三级', status: 'draft' }); setShowAdd(true) }
  const openEdit = (p: any) => { setForm(p); setShowEdit(p) }
  const handleSave = () => {
    if (!form.name || !form.date) return
    if (showEdit) {
      setItems(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id } : i))
      setShowEdit(null)
    } else {
      setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev])
      setShowAdd(false)
    }
    setForm({ name: '', date: '', occupation: '', level: '三级', status: 'draft' })
  }
  const handleDelete = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setShowDelete(null); if (selectedPlan === id) setSelectedPlan(null) }

  const FormFields = () => (
    <div className="space-y-3">
      <div><label className="text-sm font-medium text-gray-700">计划名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" placeholder="输入计划名称" /></div>
      <div><label className="text-sm font-medium text-gray-700">拟考日期</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]" /></div>
      <div><label className="text-sm font-medium text-gray-700">职业(工种)</label><select value={form.occupation} onChange={e => setForm({...form,occupation:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]"><option value="">请选择</option>{occupations.map(o => <option key={o}>{o}</option>)}</select></div>
      <div><label className="text-sm font-medium text-gray-700">等级</label><select value={form.level} onChange={e => setForm({...form,level:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]">{levels.map(l => <option key={l}>{l}</option>)}</select></div>
      <div><label className="text-sm font-medium text-gray-700">状态</label><select value={form.status} onChange={e => setForm({...form,status:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB]">{Object.entries(statusMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">等级认定</h1>
      {!selectedPlan ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索计划..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-72" />
            </div>
            <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加计划</Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">计划名称</th><th className="px-4 py-3 text-left">拟考日期</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.date}</td>
                    <td className="px-4 py-3 text-gray-600">{p.occupation}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.level}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusMap[p.status]?.cls}`}>{statusMap[p.status]?.label}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => setSelectedPlan(p.id)} className="text-[#1A56DB] hover:underline text-xs flex items-center gap-0.5">管理<ChevronRight className="w-3 h-3" /></button><button onClick={() => openEdit(p)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(p.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedPlan(null)} className="text-sm text-[#1A56DB] hover:underline mb-4">&larr; 返回计划列表</button>
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{selected?.name}</h2>
              <div className="flex items-center gap-2"><button onClick={() => openEdit(selected)} className="text-xs text-[#1A56DB] hover:underline flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button><button onClick={() => setShowDelete(selected?.id || '')} className="text-xs text-red-600 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />删除</button></div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span><MapPin className="w-3.5 h-3.5 inline mr-1" />大亚湾核电</span>
              <span><FileText className="w-3.5 h-3.5 inline mr-1" />{selected?.occupation}</span>
              <span><Award className="w-3.5 h-3.5 inline mr-1" />{selected?.level}</span>
              <span><Users className="w-3.5 h-3.5 inline mr-1" />128人报名</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {workflowSteps.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1 ${i === step ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Play className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{workflowSteps[step]}</h3>
            <p className="text-sm text-gray-500 mb-4">当前处于「{workflowSteps[step]}」阶段，请完成相关操作。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[{icon: Users, label: '报名人数', val: '128'}, {icon: FileText, label: '考场数', val: '6'}, {icon: Award, label: '通过人数', val: '--'}].map(c => (
                <div key={c.label} className="border border-gray-200 rounded-lg p-4"><c.icon className="w-6 h-6 text-[#1A56DB] mb-2" /><div className="text-2xl font-bold text-gray-900">{c.val}</div><div className="text-xs text-gray-500">{c.label}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加认定计划</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>编辑认定计划</DialogTitle></DialogHeader><FormFields /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div></DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此计划吗？此操作不可撤销。</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
