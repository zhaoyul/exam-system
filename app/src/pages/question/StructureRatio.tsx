import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Layers, AlertTriangle } from 'lucide-react'

interface RatioItem {
  type: string
  easy: number
  medium: number
  hard: number
  total: number
}

const defaultRatios: RatioItem[] = [
  { type: '单选题', easy: 20, medium: 30, hard: 10, total: 60 },
  { type: '多选题', easy: 10, medium: 15, hard: 5, total: 30 },
  { type: '判断题', easy: 8, medium: 10, hard: 2, total: 20 },
  { type: '填空题', easy: 5, medium: 8, hard: 2, total: 15 },
  { type: '简答题', easy: 2, medium: 3, hard: 0, total: 5 },
]

export default function StructureRatio() {
  const [ratios, setRatios] = useState<RatioItem[]>(defaultRatios)
  const [subject, setSubject] = useState('reactor')
  const totalQuestions = ratios.reduce((a, r) => a + r.total, 0)

  const handleSave = () => {
    toast.success('结构比重已保存')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">结构比重</h1>
          <p className="text-sm text-gray-500 mt-1">配置各题型的数量占比和难度分布</p>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />保存</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">选择科目：</span>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="reactor">核反应堆运行值班员（三级）</SelectItem>
              <SelectItem value="electrical">电气值班员（四级）</SelectItem>
              <SelectItem value="turbine">汽轮机运行值班员（三级）</SelectItem>
              <SelectItem value="instrument">仪器仪表维修工（四级）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-xs text-yellow-700">结构比重将用于组卷时的题目分配比例，请确保各题型数量与组卷规则一致。</span>
        </div>

        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">题型</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">简单</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">中等</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">困难</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">合计</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">占比</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">难度分布</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ratios.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.type}</td>
                  <td className="px-4 py-3"><Input type="number" value={r.easy} onChange={e => { const v = [...ratios]; v[i].easy = Number(e.target.value); v[i].total = v[i].easy + v[i].medium + v[i].hard; setRatios(v); }} className="w-16 h-7 text-xs" /></td>
                  <td className="px-4 py-3"><Input type="number" value={r.medium} onChange={e => { const v = [...ratios]; v[i].medium = Number(e.target.value); v[i].total = v[i].easy + v[i].medium + v[i].hard; setRatios(v); }} className="w-16 h-7 text-xs" /></td>
                  <td className="px-4 py-3"><Input type="number" value={r.hard} onChange={e => { const v = [...ratios]; v[i].hard = Number(e.target.value); v[i].total = v[i].easy + v[i].medium + v[i].hard; setRatios(v); }} className="w-16 h-7 text-xs" /></td>
                  <td className="px-4 py-3 font-bold">{r.total}</td>
                  <td className="px-4 py-3 text-xs">{totalQuestions > 0 ? ((r.total / totalQuestions) * 100).toFixed(1) : 0}%</td>
                  <td className="px-4 py-3 w-32">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-400" style={{ width: `${(r.easy / r.total) * 100}%` }} />
                      <div className="h-full bg-yellow-400" style={{ width: `${(r.medium / r.total) * 100}%` }} />
                      <div className="h-full bg-red-400" style={{ width: `${(r.hard / r.total) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-gray-600">简单</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs text-gray-600">中等</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-gray-600">困难</span>
          </div>
          <div className="ml-auto font-bold text-gray-900">
            总题数：{totalQuestions} 道
          </div>
        </div>
      </div>
    </div>
  )
}
