import { useState } from 'react'
import { Search, Award, FileText, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiRequest } from '@/lib/api'

const scoreData = [
  { id: '1', name: '张三', idCard: '440301199001011234', occupation: '核反应堆运行值班员', level: '三级', theory: 85, practical: 88, total: 86.8, result: '合格', plan: '2026年第一批', date: '2026-05-20' },
  { id: '2', name: '李四', idCard: '440301199002022345', occupation: '电气试验员', level: '四级', theory: 78, practical: 82, total: 80.4, result: '合格', plan: '2026年第一批', date: '2026-05-20' },
  { id: '3', name: '王五', idCard: '440301199003033456', occupation: '机械设备检修工', level: '三级', theory: 55, practical: 58, total: 56.8, result: '不合格', plan: '2026年第一批', date: '2026-05-20' },
]

type ScoreResult = typeof scoreData[0]

interface ScoreApiItem {
  id: string
  candidateName: string
  idCard: string
  occupation: string
  level: string
  theoryScore: number
  skillScore: number
  totalScore: number
  planName: string
  updatedAt?: string
  createdAt?: string
}

interface ScoreApiResponse {
  items: ScoreApiItem[]
}

export default function ScoreQuery() {
  const [searchId, setSearchId] = useState('')
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setSearched(true)
    setLoading(true)
    try {
      const data = await apiRequest<ScoreApiResponse>(`/personal/score?q=${encodeURIComponent(searchId)}`)
      const item = data.items?.[0]
      setResult(item ? {
        id: item.id,
        name: item.candidateName,
        idCard: item.idCard,
        occupation: item.occupation,
        level: item.level,
        theory: item.theoryScore,
        practical: item.skillScore,
        total: item.totalScore,
        result: item.totalScore >= 60 ? '合格' : '不合格',
        plan: item.planName,
        date: (item.updatedAt || item.createdAt || '').slice(0, 10),
      } : null)
    } catch {
      setResult(scoreData.find(d => d.idCard === searchId) || null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setSearchId(''); setSearched(false); setResult(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-[#1A56DB]" />成绩查询</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3"><Award className="w-8 h-8 text-[#1A56DB]" /></div>
            <h2 className="text-lg font-semibold text-gray-900">个人成绩查询</h2>
            <p className="text-xs text-gray-500 mt-1">输入身份证号查询您的技能认定成绩</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="请输入身份证号" className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB]" />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="h-10 px-6 bg-[#1A56DB] hover:bg-[#1748B5]">{loading ? '查询中' : '查询'}</Button>
            <Button onClick={reset} variant="outline" className="h-10">重置</Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">示例身份证号：440301199001011234</p>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">查询结果</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowDetail(true)} variant="outline" className="h-8 text-xs"><Eye className="w-3.5 h-3.5 mr-1" />查看详情</Button>
              <Button variant="outline" className="h-8 text-xs"><Download className="w-3.5 h-3.5 mr-1" />下载成绩单</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">姓名</div>
              <div className="font-medium text-gray-900">{result.name}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">职业(工种)</div>
              <div className="font-medium text-gray-900">{result.occupation}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">等级</div>
              <div className="font-medium text-gray-900">{result.level}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">认定批次</div>
              <div className="font-medium text-gray-900">{result.plan}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">理论成绩</div>
              <div className="font-medium text-[#1A56DB]">{result.theory}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">实操成绩</div>
              <div className="font-medium text-[#1A56DB]">{result.practical}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-xs text-gray-500">综合成绩</div>
              <div className="font-medium text-[#1A56DB]">{result.total}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${result.result === '合格' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-xs text-gray-500">认定结果</div>
              <div className={`font-medium ${result.result === '合格' ? 'text-green-700' : 'text-red-700'}`}>{result.result}</div>
            </div>
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 text-sm">未找到该身份证号的认定成绩</div>
        </div>
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>成绩详情</DialogTitle></DialogHeader>
          {result && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">姓名</span><span className="font-medium">{result.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">身份证号</span><span className="font-medium">{result.idCard}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">职业(工种)</span><span className="font-medium">{result.occupation}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">技能等级</span><span className="font-medium">{result.level}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">认定批次</span><span className="font-medium">{result.plan}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">考试日期</span><span className="font-medium">{result.date}</span></div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between"><span className="text-gray-500">理论成绩</span><span className="font-medium">{result.theory}分</span></div>
                <div className="flex justify-between"><span className="text-gray-500">实操成绩</span><span className="font-medium">{result.practical}分</span></div>
                <div className="flex justify-between"><span className="text-gray-500">综合成绩</span><span className="font-bold text-[#1A56DB]">{result.total}分</span></div>
                <div className="flex justify-between"><span className="text-gray-500">认定结果</span><span className={`font-bold ${result.result === '合格' ? 'text-green-600' : 'text-red-600'}`}>{result.result}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
