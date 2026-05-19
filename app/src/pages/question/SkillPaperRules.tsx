import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Search, FileSpreadsheet, Copy, Trash2 } from 'lucide-react'

interface SkillRule {
  id: number
  name: string
  subject: string
  level: string
  modules: string
  totalScore: number
  passScore: number
  duration: number
  status: string
}

const mockRules: SkillRule[] = [
  { id: 1, name: '控制棒操作三级-A卷', subject: '反应堆控制棒操作', level: '三级', modules: '5个模块', totalScore: 100, passScore: 60, duration: 180, status: 'active' },
  { id: 2, name: '主泵检修四级-B卷', subject: '主泵检修', level: '四级', modules: '4个模块', totalScore: 100, passScore: 60, duration: 150, status: 'active' },
  { id: 3, name: '汽轮机叶片检查三级', subject: '汽轮机叶片检查', level: '三级', modules: '3个模块', totalScore: 100, passScore: 60, duration: 120, status: 'draft' },
]

export default function SkillPaperRules() {
  const [rules] = useState<SkillRule[]>(mockRules)
  const [search, setSearch] = useState('')

  const filtered = rules.filter(r => !search || r.name.includes(search) || r.subject.includes(search))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">组卷规则</h1>
          <p className="text-sm text-gray-500 mt-1">配置技能实操的组卷规则，包括模块组合、分值、时长</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('导入规则')}><FileSpreadsheet className="w-4 h-4 mr-2" />导入</Button>
          <Button onClick={() => toast.success('新增规则')}><Plus className="w-4 h-4 mr-2" />新增规则</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="搜索规则名称、科目..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">规则名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">科目</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">模块数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">总分</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">及格线</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">时长</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r, idx) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-xs">{r.subject}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{r.level}</Badge></td>
                <td className="px-4 py-3 text-xs">{r.modules}</td>
                <td className="px-4 py-3 text-xs">{r.totalScore}分</td>
                <td className="px-4 py-3 text-xs">{r.passScore}分</td>
                <td className="px-4 py-3 text-xs">{r.duration}分钟</td>
                <td className="px-4 py-3">
                  <Badge className={`text-[10px] ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status === 'active' ? '启用' : '草稿'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">详情</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
