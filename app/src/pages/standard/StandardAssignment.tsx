import { useState } from 'react'
import { Plus, CheckCircle, X, Trash2 } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

interface Task { id: string; name: string; occupation: string; level: string; responsible: string; experts: string[]; status: string }

const initialTasks: Task[] = [
  { id: '1', name: '核反应堆运行值班员标准编制', occupation: '核反应堆运行值班员', level: '三级', responsible: '刘专家', experts: ['张专家', '李专家'], status: 'arranging' },
  { id: '2', name: '电气试验员标准修订', occupation: '电气试验员', level: '四级', responsible: '郑专家', experts: ['王专家'], status: 'done' },
]

export default function StandardAssignment() {
  const [tasks, setTasks] = useBackendListState<Task>(initialTasks)
  const [showAdd, setShowAdd] = useState(false)
  const [showAddExpert, setShowAddExpert] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', occupation: '', level: '三级', responsible: '' })
  const [expertName, setExpertName] = useState('')

  const doAdd = () => { if (!form.name) return; setTasks(p => [{ id: Date.now().toString(), name: form.name, occupation: form.occupation, level: form.level, responsible: form.responsible, experts: [], status: 'arranging' }, ...p]); setForm({ name: '', occupation: '', level: '三级', responsible: '' }); setShowAdd(false) }
  const addExpert = (taskId: string) => { if (!expertName) return; setTasks(p => p.map(t => t.id === taskId ? { ...t, experts: [...t.experts, expertName], status: 'done' } : t)); setExpertName(''); setShowAddExpert(null) }
  const endArrange = (taskId: string) => setTasks(p => p.map(t => t.id === taskId ? { ...t, status: 'done' } : t))
  const delTask = (id: string) => setTasks(p => p.filter(t => t.id !== id))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">标准安排</h1>
      <div className="flex justify-end mb-3"><button onClick={() => setShowAdd(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加任务</button></div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0"><tr><th className="px-4 py-3 text-left">工作任务</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-left">负责人</th><th className="px-4 py-3 text-left">分配专家</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{tasks.map(task => (
          <tr key={task.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{task.name}</td><td className="px-4 py-3 text-gray-600">{task.occupation}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{task.level}</span></td><td className="px-4 py-3 text-gray-600">{task.responsible || '-'}</td><td className="px-4 py-3 text-gray-600">{task.experts.join(', ') || '-'}</td>
            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${task.status === 'done' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{task.status === 'done' ? '已安排' : '安排中'}</span></td>
            <td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => setShowAddExpert(task.id)} className="h-8 px-3 bg-[#1A56DB] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#1748B5]"><Plus className="w-3.5 h-3.5" /> 负责人</button><button onClick={() => endArrange(task.id)} className="h-8 px-3 bg-green-600 text-white rounded-md text-xs flex items-center gap-1 hover:bg-green-700"><CheckCircle className="w-3.5 h-3.5" /> 结束安排</button><button onClick={() => delTask(task.id)} className="p-1.5 hover:bg-red-100 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button></div></td>
          </tr>
        ))}</tbody></table>
        {tasks.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无任务</div>}
      </div>
      {showAdd && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加任务</h3><button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">任务名称 *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">职业(工种)</label><input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">等级</label><select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>五级</option><option>四级</option><option>三级</option><option>二级</option></select></div><div><label className="block text-sm text-gray-700 mb-1">负责人</label><input value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAdd} disabled={!form.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
      {showAddExpert && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddExpert(null)}><div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加专家</h3><button onClick={() => setShowAddExpert(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6"><label className="block text-sm text-gray-700 mb-1">专家姓名</label><input value={expertName} onChange={e => setExpertName(e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAddExpert(null)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={() => addExpert(showAddExpert)} disabled={!expertName} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">添加</button></div></div></div>)}
    </div>
  )
}
