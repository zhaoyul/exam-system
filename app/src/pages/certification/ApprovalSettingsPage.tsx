import { useState } from 'react'
import { Save, Settings, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ApprovalItem = { id: string; name: string; enabled: boolean; level: number }

export default function ApprovalSettingsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([
    { id: '1', name: '认定计划审批', enabled: true, level: 1 },
    { id: '2', name: '考场编排审批', enabled: true, level: 1 },
    { id: '3', name: '成绩发布审批', enabled: true, level: 2 },
    { id: '4', name: '证书打印审批', enabled: false, level: 1 },
    { id: '5', name: '特殊处理审批', enabled: true, level: 3 },
  ])
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i))
    setSaved(false)
  }
  const changeLevel = (id: string, level: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, level } : i))
    setSaved(false)
  }
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">批复设置</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-[#1A56DB]" />审批流程配置</h2>
          <Button onClick={handleSave} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />{saved ? '已保存' : '保存设置'}</Button>
        </div>
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <button onClick={() => toggle(i.id)} className="text-[#1A56DB]">{i.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}</button>
                <span className="text-sm font-medium text-gray-900">{i.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">审批层级</span>
                <select value={i.level} onChange={e => changeLevel(i.id, parseInt(e.target.value))} disabled={!i.enabled} className="h-8 px-2 border border-gray-200 rounded-md text-sm disabled:bg-gray-100">
                  <option value={1}>一级审批</option><option value={2}>二级审批</option><option value={3}>三级审批</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
