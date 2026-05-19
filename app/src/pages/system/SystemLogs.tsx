import { useState } from 'react'
import { Search, Calendar, User, Download, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const logs = [
  { id: '1', user: '管理员', action: '登录系统', module: '系统', ip: '10.0.0.15', time: '2026-05-20 08:30:15', level: 'info' },
  { id: '2', user: '张三', action: '新增认定计划', module: '等级认定', ip: '10.0.0.23', time: '2026-05-20 09:15:32', level: 'info' },
  { id: '3', user: '李四', action: '删除考生信息', module: '考生管理', ip: '10.0.0.45', time: '2026-05-20 10:20:08', level: 'warn' },
  { id: '4', user: '王五', action: '修改成绩', module: '成绩管理', ip: '10.0.0.67', time: '2026-05-20 11:05:44', level: 'warn' },
  { id: '5', user: '系统', action: '自动备份完成', module: '系统', ip: '127.0.0.1', time: '2026-05-20 12:00:00', level: 'info' },
  { id: '6', user: '赵六', action: '导出证书数据', module: '证书管理', ip: '10.0.0.89', time: '2026-05-20 14:30:22', level: 'info' },
  { id: '7', user: '系统', action: '检测到异常登录', module: '安全', ip: '192.168.1.100', time: '2026-05-20 15:10:05', level: 'error' },
  { id: '8', user: '管理员', action: '重置用户密码', module: '系统管理', ip: '10.0.0.15', time: '2026-05-20 16:45:18', level: 'warn' },
]

export default function SystemLogs() {
  const [items, setItems] = useState(logs)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('全部')
  const [moduleFilter, setModuleFilter] = useState('全部')

  const filtered = items.filter(i => {
    const m = !search || i.user.includes(search) || i.action.includes(search) || i.ip.includes(search)
    const l = levelFilter === '全部' || i.level === levelFilter
    const mod = moduleFilter === '全部' || i.module === moduleFilter
    return m && l && mod
  })

  const clearLogs = () => { setItems([]) }
  const refresh = () => { setItems(prev => [...prev]) }

  const levelCls: Record<string, string> = { info: 'bg-blue-50 text-blue-700', warn: 'bg-amber-50 text-amber-700', error: 'bg-red-50 text-red-700' }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-6 h-6 text-[#1A56DB]" />系统操作日志</h1>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索用户/操作/IP..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-56" /></div>
          <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="h-9 px-2 border border-gray-200 rounded-md text-sm"><option>全部</option><option value="info">信息</option><option value="warn">警告</option><option value="error">错误</option></select>
          <select value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)} className="h-9 px-2 border border-gray-200 rounded-md text-sm"><option>全部</option><option>系统</option><option>等级认定</option><option>成绩管理</option><option>证书管理</option><option>安全</option></select>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline" className="h-9 text-xs"><RotateCcw className="w-3.5 h-3.5 mr-1" />刷新</Button>
          <Button variant="outline" className="h-9 text-xs"><Download className="w-3.5 h-3.5 mr-1" />导出</Button>
          <Button onClick={clearLogs} variant="outline" className="h-9 text-xs text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5 mr-1" />清空</Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">时间</th><th className="px-4 py-3 text-left">用户</th><th className="px-4 py-3 text-left">操作</th><th className="px-4 py-3 text-left">模块</th><th className="px-4 py-3 text-left">IP地址</th><th className="px-4 py-3 text-left">级别</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{i.time}</td>
                <td className="px-4 py-3 text-gray-900 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" />{i.user}</td>
                <td className="px-4 py-3 text-gray-700">{i.action}</td>
                <td className="px-4 py-3 text-gray-600">{i.module}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{i.ip}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${levelCls[i.level]}`}>{i.level==='info'?'信息':i.level==='warn'?'警告':'错误'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
