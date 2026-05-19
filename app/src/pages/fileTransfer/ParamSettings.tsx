import { useState } from 'react'
import { Save, Settings, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Setting { id: string; name: string; desc: string; enabled: boolean }

export default function ParamSettings() {
  const [items, setItems] = useState<Setting[]>([
    { id: '1', name: '自动归档', desc: '认定完成后自动归档相关文件', enabled: true },
    { id: '2', name: '邮件通知', desc: '发文后自动发送邮件通知', enabled: true },
    { id: '3', name: '短信提醒', desc: '重要事项发送短信提醒', enabled: false },
    { id: '4', name: '文件加密', desc: '隐私文档自动加密存储', enabled: true },
    { id: '5', name: '操作日志', desc: '记录所有文件操作日志', enabled: true },
  ])
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i)); setSaved(false) }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">参数设置</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-[#1A56DB]" />文件传输参数</h2>
          <Button onClick={handleSave} className="h-9 bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />{saved ? '已保存' : '保存设置'}</Button>
        </div>
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">{i.name}</div>
                <div className="text-xs text-gray-500">{i.desc}</div>
              </div>
              <button onClick={() => toggle(i.id)} className="text-[#1A56DB]">{i.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
