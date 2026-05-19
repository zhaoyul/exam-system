import { useState } from 'react'
import { Save, DollarSign, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeeItem { id: string; level: string; theory: number; practical: number; review: number; cert: number }

export default function FeeSettingsPage() {
  const [items, setItems] = useState<FeeItem[]>([
    { id: '1', level: '一级', theory: 120, practical: 280, review: 80, cert: 30 },
    { id: '2', level: '二级', theory: 100, practical: 240, review: 70, cert: 30 },
    { id: '3', level: '三级', theory: 80, practical: 200, review: 60, cert: 30 },
    { id: '4', level: '四级', theory: 60, practical: 160, review: 50, cert: 30 },
    { id: '5', level: '五级', theory: 50, practical: 120, review: 40, cert: 30 },
  ])
  const [saved, setSaved] = useState(false)

  const updateFee = (id: string, field: keyof FeeItem, value: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    setSaved(false)
  }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const reset = () => {
    setItems([
      { id: '1', level: '一级', theory: 120, practical: 280, review: 80, cert: 30 },
      { id: '2', level: '二级', theory: 100, practical: 240, review: 70, cert: 30 },
      { id: '3', level: '三级', theory: 80, practical: 200, review: 60, cert: 30 },
      { id: '4', level: '四级', theory: 60, practical: 160, review: 50, cert: 30 },
      { id: '5', level: '五级', theory: 50, practical: 120, review: 40, cert: 30 },
    ])
    setSaved(false)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">费用设置</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#1A56DB]" />认定费用标准</h2>
          <div className="flex items-center gap-2">
            <Button onClick={reset} variant="outline" className="h-9 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />重置</Button>
            <Button onClick={handleSave} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />{saved ? '已保存' : '保存'}</Button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">等级</th><th className="px-4 py-3 text-right">理论考试费(元)</th><th className="px-4 py-3 text-right">实操考试费(元)</th><th className="px-4 py-3 text-right">评审费(元)</th><th className="px-4 py-3 text-right">证书工本费(元)</th><th className="px-4 py-3 text-right">合计(元)</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.level}</td>
                <td className="px-4 py-3 text-right"><input type="number" value={i.theory} onChange={e => updateFee(i.id, 'theory', parseInt(e.target.value)||0)} className="w-20 h-8 px-2 border border-gray-200 rounded-md text-sm text-right" /></td>
                <td className="px-4 py-3 text-right"><input type="number" value={i.practical} onChange={e => updateFee(i.id, 'practical', parseInt(e.target.value)||0)} className="w-20 h-8 px-2 border border-gray-200 rounded-md text-sm text-right" /></td>
                <td className="px-4 py-3 text-right"><input type="number" value={i.review} onChange={e => updateFee(i.id, 'review', parseInt(e.target.value)||0)} className="w-20 h-8 px-2 border border-gray-200 rounded-md text-sm text-right" /></td>
                <td className="px-4 py-3 text-right"><input type="number" value={i.cert} onChange={e => updateFee(i.id, 'cert', parseInt(e.target.value)||0)} className="w-20 h-8 px-2 border border-gray-200 rounded-md text-sm text-right" /></td>
                <td className="px-4 py-3 text-right font-medium text-[#1A56DB]">{i.theory + i.practical + i.review + i.cert}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
