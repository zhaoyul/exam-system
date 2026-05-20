import { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

interface Rule { id: string; name: string; singleCount: number; singleScore: number; multiCount: number; multiScore: number; judgeCount: number; judgeScore: number; total: number }

export default function PaperRules() {
  const [items, setItems] = useBackendListState<Rule>([
    { id: '1', name: '三级理论考试A卷', singleCount: 40, singleScore: 1, multiCount: 20, multiScore: 2, judgeCount: 20, judgeScore: 1, total: 100 },
    { id: '2', name: '四级理论考试B卷', singleCount: 50, singleScore: 1, multiCount: 15, multiScore: 2, judgeCount: 20, judgeScore: 0.5, total: 100 },
  ])
  const [saved, setSaved] = useState(false)

  const update = (id: string, field: keyof Rule, value: number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      updated.total = updated.singleCount * updated.singleScore + updated.multiCount * updated.multiScore + updated.judgeCount * updated.judgeScore
      return updated
    }))
    setSaved(false)
  }
  const addRule = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), name: '新组卷规则', singleCount: 0, singleScore: 1, multiCount: 0, multiScore: 2, judgeCount: 0, judgeScore: 1, total: 0 }])
    setSaved(false)
  }
  const delRule = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setSaved(false) }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">组卷规则</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">规则配置</h2>
          <div className="flex items-center gap-2">
            <Button onClick={addRule} variant="outline" className="h-9 text-xs"><Plus className="w-3.5 h-3.5 mr-1" />添加规则</Button>
            <Button onClick={handleSave} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />{saved ? '已保存' : '保存'}</Button>
          </div>
        </div>
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <input value={i.name} onChange={e => { setItems(prev => prev.map(p => p.id === i.id ? { ...p, name: e.target.value } : p)); setSaved(false) }} className="font-medium text-gray-900 border-none focus:outline-none text-sm bg-transparent" />
                <button onClick={() => delRule(i.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><div className="text-xs text-gray-500 mb-1">单选题</div><div className="flex items-center justify-center gap-2"><input type="number" value={i.singleCount} onChange={e => update(i.id, 'singleCount', parseInt(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /><span className="text-gray-400">x</span><input type="number" value={i.singleScore} onChange={e => update(i.id, 'singleScore', parseFloat(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /></div></div>
                <div className="text-center"><div className="text-xs text-gray-500 mb-1">多选题</div><div className="flex items-center justify-center gap-2"><input type="number" value={i.multiCount} onChange={e => update(i.id, 'multiCount', parseInt(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /><span className="text-gray-400">x</span><input type="number" value={i.multiScore} onChange={e => update(i.id, 'multiScore', parseFloat(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /></div></div>
                <div className="text-center"><div className="text-xs text-gray-500 mb-1">判断题</div><div className="flex items-center justify-center gap-2"><input type="number" value={i.judgeCount} onChange={e => update(i.id, 'judgeCount', parseInt(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /><span className="text-gray-400">x</span><input type="number" value={i.judgeScore} onChange={e => update(i.id, 'judgeScore', parseFloat(e.target.value)||0)} className="w-14 h-8 border border-gray-200 rounded-md text-sm text-center" /></div></div>
              </div>
              <div className="mt-3 text-right text-sm font-medium text-[#1A56DB]">总分: {i.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
