import { useState } from 'react'
import { Plus, Search, X, Trash2 } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

const initialPlans = [
  { id: '1', name: '2026年核反应堆运行值班员标准编制', type: '标准编制', occupation: '核反应堆运行值班员', template: '国家职业技能标准模板', level: '三级,四级,五级', org: '大亚湾核电', status: 'processing' },
  { id: '2', name: '2026年电气试验员标准修订', type: '标准修订', occupation: '电气试验员', template: '核行业职业技能标准模板', level: '四级,五级', org: '阳江核电', status: 'approved' },
  { id: '3', name: '机械设备检修工标准编制', type: '标准编制', occupation: '机械设备检修工', template: '国家职业技能标准模板', level: '三级,四级', org: '台山核电', status: 'pending' },
]

export default function StandardPlans() {
  const [plans, setPlans] = useBackendListState(initialPlans)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: '标准编制', occupation: '', template: '国家职业技能标准模板', level: '三级', org: '大亚湾核电' })

  const filtered = plans.filter(p => !search || p.name.includes(search) || p.occupation.includes(search))
  const doAdd = () => { if (!form.name || !form.occupation) return; setPlans(p => [{ id: Date.now().toString(), name: form.name, type: form.type, occupation: form.occupation, template: form.template, level: form.level, org: form.org, status: 'pending' }, ...p]); setForm({ name: '', type: '标准编制', occupation: '', template: '国家职业技能标准模板', level: '三级', org: '大亚湾核电' }); setShowAdd(false) }
  const doDelete = (id: string) => { setPlans(p => p.filter(pl => pl.id !== id)); setShowDelete(null) }
  const changeStatus = (id: string, s: string) => setPlans(p => p.map(pl => pl.id === id ? { ...pl, status: s } : pl))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">标准编写计划</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索计划..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-72" /></div>
        <button onClick={() => setShowAdd(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加计划</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0"><tr><th className="px-4 py-3 text-left">计划名称</th><th className="px-4 py-3 text-left">类型</th><th className="px-4 py-3 text-left">职业信息</th><th className="px-4 py-3 text-left">参考模板</th><th className="px-4 py-3 text-left">涵盖等级</th><th className="px-4 py-3 text-left">负责机构</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{filtered.map(plan => (
          <tr key={plan.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td><td className="px-4 py-3 text-gray-600">{plan.type}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{plan.occupation}</span></td><td className="px-4 py-3 text-gray-600">{plan.template}</td><td className="px-4 py-3 text-gray-600">{plan.level}</td><td className="px-4 py-3 text-gray-600">{plan.org}</td>
            <td className="px-4 py-3"><select value={plan.status} onChange={e => changeStatus(plan.id, e.target.value)} className={`text-xs font-medium px-2 py-0.5 rounded border-0 ${plan.status === 'processing' ? 'bg-blue-50 text-blue-700' : plan.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}><option value="pending">待审核</option><option value="processing">进行中</option><option value="approved">已完成</option></select></td>
            <td className="px-4 py-3"><button onClick={() => setShowDelete(plan.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></td>
          </tr>
        ))}</tbody></table>
        {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
      </div>
      {showAdd && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}><div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加计划</h3><button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">计划名称 *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">类型</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>标准编制</option><option>标准修订</option></select></div><div><label className="block text-sm text-gray-700 mb-1">职业(工种) *</label><input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">涵盖等级</label><select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>五级</option><option>四级</option><option>三级</option><option>二级</option><option>一级</option></select></div><div><label className="block text-sm text-gray-700 mb-1">负责机构</label><select value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>大亚湾核电</option><option>阳江核电</option><option>台山核电</option></select></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAdd} disabled={!form.name || !form.occupation} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showDelete && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}><div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}><div className="p-6 text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-6 h-6 text-red-600" /></div><h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除?</h3></div><div className="flex justify-center gap-3 px-6 pb-6"><button onClick={() => setShowDelete(null)} className="h-9 px-6 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={() => doDelete(showDelete)} className="h-9 px-6 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">确认删除</button></div></div></div>)}
    </div>
  )
}
