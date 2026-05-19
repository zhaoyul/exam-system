import { useState } from 'react'
import { Search, Save, CheckCircle, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const candidates = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', theory: 85, practical: 88 },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', theory: 78, practical: 82 },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', theory: 92, practical: 90 },
  { id: '4', name: '赵六', idCard: '440301199004044567', occupation: '仪控设备检修工', level: '二级', theory: 0, practical: 0 },
  { id: '5', name: '孙七', idCard: '440301199005055678', occupation: '焊接工', level: '五级', theory: 65, practical: 70 },
]

export default function ScoreEntry() {
  const [items, setItems] = useState(candidates)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTheory, setEditTheory] = useState('')
  const [editPractical, setEditPractical] = useState('')
  const [saved, setSaved] = useState(false)

  const filtered = items.filter(i => !search || i.name.includes(search) || i.idCard.includes(search))

  const startEdit = (i: typeof candidates[0]) => {
    setEditingId(i.id); setEditTheory(i.theory.toString()); setEditPractical(i.practical.toString())
  }
  const saveEdit = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, theory: parseInt(editTheory)||0, practical: parseInt(editPractical)||0 } : i))
    setEditingId(null); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const submitAll = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">成绩录入</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索考生..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
        <Button onClick={submitAll} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />{saved ? '已提交' : '提交成绩'}</Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">姓名</th><th className="px-4 py-3 text-left">身份证号</th><th className="px-4 py-3 text-left">职业(工种)</th><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">理论成绩</th><th className="px-4 py-3 text-right">实操成绩</th><th className="px-4 py-3 text-right">总分</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                <td className="px-4 py-3 text-gray-600">{i.idCard}</td>
                <td className="px-4 py-3 text-gray-600">{i.occupation}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{i.level}</span></td>
                <td className="px-4 py-3 text-right">{editingId === i.id ? <input type="number" value={editTheory} onChange={e => setEditTheory(e.target.value)} className="w-16 h-8 border border-gray-200 rounded-md text-sm text-center" /> : <span className={i.theory >= 60 ? 'text-gray-900' : 'text-red-600'}>{i.theory || '-'}</span>}</td>
                <td className="px-4 py-3 text-right">{editingId === i.id ? <input type="number" value={editPractical} onChange={e => setEditPractical(e.target.value)} className="w-16 h-8 border border-gray-200 rounded-md text-sm text-center" /> : <span className={i.practical >= 60 ? 'text-gray-900' : 'text-red-600'}>{i.practical || '-'}</span>}</td>
                <td className="px-4 py-3 text-right font-medium">{i.theory && i.practical ? (i.theory * 0.4 + i.practical * 0.6).toFixed(1) : '-'}</td>
                <td className="px-4 py-3">{editingId === i.id ? <button onClick={() => saveEdit(i.id)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button> : <button onClick={() => startEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
