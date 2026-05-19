import { useState } from 'react'
import { Plus, Search, Clock, CheckCircle, Play, X, Trash2 } from 'lucide-react'

interface Plan { id: string; name: string; type: string; occupation: string; level: string; status: string; person: string; deadline: string }

const initialPlans: Plan[] = [
  { id: '1', name: '2026年核反应堆运行值班员标准编制', type: '标准编制', occupation: '核反应堆运行值班员', level: '三级', status: 'processing', person: '刘专家', deadline: '2026-06-30' },
  { id: '2', name: '2026年电气试验员标准修订', type: '标准修订', occupation: '电气试验员', level: '四级', status: 'approved', person: '郑专家', deadline: '2026-05-15' },
  { id: '3', name: '机械设备检修工标准编制', type: '标准编制', occupation: '机械设备检修工', level: '三级', status: 'pending', person: '陈专家', deadline: '2026-07-20' },
]

export default function StandardSettings() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: '标准编制', deadline: '' })

  const filtered = plans.filter(p => !search || p.name.includes(search))
  const processing = plans.filter(p => p.status === 'processing').length
  const pending = plans.filter(p => p.status === 'pending').length
  const approved = plans.filter(p => p.status === 'approved').length

  const doAdd = () => {
    if (!form.name || !form.deadline) return
    setPlans(prev => [{ id: Date.now().toString(), name: form.name, type: form.type, occupation: '待定', level: '待定', status: 'pending', person: '未分配', deadline: form.deadline }, ...prev])
    setForm({ name: '', type: '标准编制', deadline: '' })
    setShowAdd(false)
  }
  const doDelete = (id: string) => { setPlans(prev => prev.filter(p => p.id !== id)); setShowDelete(null) }
  const changeStatus = (id: string, newStatus: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">管理设置</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[{ label: '进行中', value: processing, color: '#1A56DB', icon: Play }, { label: '待审核', value: pending, color: '#F59E0B', icon: Clock }, { label: '已完成', value: approved, color: '#0E9F6E', icon: CheckCircle }].map((s, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}><s.icon className="w-6 h-6" style={{ color: s.color }} /></div>
            <div><div className="text-2xl font-bold text-gray-900">{s.value}</div><div className="text-sm text-gray-500">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索计划..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-72" /></div>
        <button onClick={() => setShowAdd(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加计划</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0"><tr><th className="px-4 py-3 text-left">计划名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">涵盖等级</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">负责人</th><th className="px-4 py-3 text-left">完成期限</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{filtered.map(plan => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td><td className="px-4 py-3 text-gray-600">{plan.type}</td><td className="px-4 py-3 text-gray-600">{plan.occupation}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{plan.level}</span></td>
              <td className="px-4 py-3"><select value={plan.status} onChange={e => changeStatus(plan.id, e.target.value)} className={`text-xs font-medium px-2 py-0.5 rounded border-0 ${plan.status === 'processing' ? 'bg-blue-50 text-blue-700' : plan.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}><option value="pending">待审核</option><option value="processing">进行中</option><option value="approved">已完成</option></select></td>
              <td className="px-4 py-3 text-gray-600">{plan.person}</td><td className="px-4 py-3 text-gray-600">{plan.deadline}</td>
              <td className="px-4 py-3"><button onClick={() => setShowDelete(plan.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}</tbody></table>
        {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
      </div>
      {showAdd && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}><div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加计划</h3><button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">计划名称 *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">类型</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>标准编制</option><option>标准修订</option></select></div><div><label className="block text-sm text-gray-700 mb-1">完成期限</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAdd} disabled={!form.name || !form.deadline} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showDelete && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}><div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}><div className="p-6 text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-6 h-6 text-red-600" /></div><h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除?</h3></div><div className="flex justify-center gap-3 px-6 pb-6"><button onClick={() => setShowDelete(null)} className="h-9 px-6 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={() => doDelete(showDelete)} className="h-9 px-6 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">确认删除</button></div></div></div>)}
    </div>
  )
}
