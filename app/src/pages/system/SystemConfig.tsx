import { useState } from 'react'
import { Save, Settings, Clock, Database, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBackendListState } from '@/hooks/useBackendListState'

interface ConfigItem { id: string; name: string; desc: string; enabled: boolean }

export default function SystemConfig() {
  const [basic, setBasic] = useBackendListState<ConfigItem>([
    { id: '1', name: '启用验证码', desc: '登录时必须输入验证码', enabled: true },
    { id: '2', name: '短信通知', desc: '重要操作发送短信提醒', enabled: true },
    { id: '3', name: '邮件通知', desc: '启用邮件通知功能', enabled: false },
    { id: '4', name: '密码强度检查', desc: '强制使用强密码', enabled: true },
    { id: '5', name: '登录失败锁定', desc: '连续5次失败锁定账号30分钟', enabled: true },
  ])

  const [backup, setBackup] = useBackendListState([
    { id: '1', name: '数据库自动备份', time: '每天 02:00', lastRun: '2026-05-20 02:00', status: 'success' },
    { id: '2', name: '证书数据备份', time: '每周六 03:00', lastRun: '2026-05-17 03:00', status: 'success' },
    { id: '3', name: '日志归档', time: '每月1日 04:00', lastRun: '2026-05-01 04:00', status: 'success' },
  ])

  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => {
    setBasic(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i))
    setSaved(false)
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const runBackup = (id: string) => { setBackup(prev => prev.map(b => b.id === id ? { ...b, lastRun: new Date().toLocaleString(), status: 'success' } : b)) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-6 h-6 text-[#1A56DB]" />系统配置</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 基础配置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4 text-[#1A56DB]" />基础配置</h2>
            <Button onClick={handleSave} className="h-8 text-xs bg-[#1A56DB]"><Save className="w-3.5 h-3.5 mr-1" />{saved ? '已保存' : '保存'}</Button>
          </div>
          <div className="space-y-3">
            {basic.map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div><div className="text-sm font-medium text-gray-900">{i.name}</div><div className="text-xs text-gray-500">{i.desc}</div></div>
                <button onClick={() => toggle(i.id)} className={`w-11 h-6 rounded-full transition-colors ${i.enabled ? 'bg-[#1A56DB]' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${i.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 定时任务 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#1A56DB]" />定时任务</h2>
          <div className="space-y-3">
            {backup.map(b => (
              <div key={b.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{b.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${b.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{b.status === 'success' ? '成功' : '失败'}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">执行时间：{b.time} · 上次执行：{b.lastRun}</div>
                <Button onClick={() => runBackup(b.id)} variant="outline" className="h-7 text-xs"><RefreshCw className="w-3 h-3 mr-1" />立即执行</Button>
              </div>
            ))}
          </div>
        </div>

        {/* 数据备份 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-[#1A56DB]" />数据备份与恢复</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-[#1A56DB]">3.2 GB</div>
              <div className="text-xs text-gray-500">数据库大小</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-500">备份记录</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">7 天</div>
              <div className="text-xs text-gray-500">备份保留周期</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="h-9 text-xs bg-[#1A56DB]"><Database className="w-3.5 h-3.5 mr-1" />立即备份</Button>
            <Button variant="outline" className="h-9 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />恢复数据</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
