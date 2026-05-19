import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Eye, Clock, CheckCircle, Calendar, AlertTriangle, Download, FileText, Search
} from 'lucide-react'

interface PublicityBatch {
  id: number
  planName: string
  profession: string
  level: string
  candidateCount: number
  publicityStart: string
  publicityEnd: string
  status: 'pending' | 'publicizing' | 'done'
  appealCount: number
  passCount: number
  failCount: number
}

const mockBatches: PublicityBatch[] = [
  { id: 1, planName: '大亚湾核电2026年第1批认定', profession: '核反应堆操作员', level: '三级', candidateCount: 45, publicityStart: '2026-04-20', publicityEnd: '2026-04-27', status: 'publicizing', appealCount: 0, passCount: 42, failCount: 3 },
  { id: 2, planName: '阳江核电2026年第1批认定', profession: '电气维修工', level: '四级', candidateCount: 32, publicityStart: '2026-04-15', publicityEnd: '2026-04-22', status: 'done', appealCount: 1, passCount: 29, failCount: 3 },
  { id: 3, planName: '台山核电2026年第2批认定', profession: '仪表维修工', level: '三级', candidateCount: 28, publicityStart: '2026-05-01', publicityEnd: '2026-05-08', status: 'pending', appealCount: 0, passCount: 0, failCount: 0 },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待公示', color: 'bg-yellow-100 text-yellow-700' },
  publicizing: { label: '公示中', color: 'bg-blue-100 text-blue-700' },
  done: { label: '已结束', color: 'bg-green-100 text-green-700' },
}

export default function ScorePublicityManage() {
  const [batches, setBatches] = useState<PublicityBatch[]>(mockBatches)
  const [publicityDays, setPublicityDays] = useState(7)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全部' | PublicityBatch['status']>('全部')
  const [selectedBatch, setSelectedBatch] = useState<PublicityBatch | null>(null)
  const [showAppeal, setShowAppeal] = useState<PublicityBatch | null>(null)

  const filtered = batches.filter(batch => {
    const bySearch = !search || batch.planName.includes(search) || batch.profession.includes(search)
    const byStatus = statusFilter === '全部' || batch.status === statusFilter
    return bySearch && byStatus
  })

  const handleStartPublicity = (id: number) => {
    const start = new Date().toISOString().split('T')[0]
    const end = new Date(Date.now() + publicityDays * 86400000).toISOString().split('T')[0]
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'publicizing' as const, publicityStart: start, publicityEnd: end } : b))
    toast.success('成绩公示已开始')
  }

  const handleEndPublicity = (id: number) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'done' as const } : b))
    toast.success('成绩公示已结束')
  }

  const handleResolveAppeal = (id: number) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, appealCount: 0 } : b))
    setShowAppeal(null)
    toast.success('申诉已处理')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">成绩公示</h1>
          <p className="text-sm text-gray-500 mt-1">管理成绩公示期，设置公示时间，处理申诉</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('公示名单已导出')}>
            <Download className="w-4 h-4 mr-2" />导出公示名单
          </Button>
          <Button onClick={() => toast.success('公示结果已提交至证书管理')}>
            <CheckCircle className="w-4 h-4 mr-2" />提交公示结果
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待公示</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{batches.filter(b => b.status === 'pending').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">公示中</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{batches.filter(b => b.status === 'publicizing').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已结束</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{batches.filter(b => b.status === 'done').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publicity Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            公示设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">公示天数：</Label>
              <Input type="number" value={publicityDays} onChange={e => setPublicityDays(Number(e.target.value))} className="w-20" />
              <span className="text-sm text-gray-500">天</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">公示方式：</Label>
              <select className="h-9 rounded-md border border-gray-200 px-3 text-sm">
                <option>站内公示</option>
                <option>站内 + 导出附件</option>
              </select>
            </div>
            <div className="text-xs text-gray-400">（公示期从点击"开始公示"之日起算）</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
          <option value="全部">全部状态</option>
          <option value="pending">待公示</option>
          <option value="publicizing">公示中</option>
          <option value="done">已结束</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="计划名称 / 职业工种" className="pl-9 w-72" />
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">职业/等级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考生数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">合格/不合格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">公示开始</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">公示结束</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">申诉</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{b.planName}</td>
                <td className="px-4 py-3 text-xs">{b.profession}/{b.level}</td>
                <td className="px-4 py-3">{b.candidateCount}人</td>
                <td className="px-4 py-3 text-xs"><span className="text-green-700">{b.passCount}</span> / <span className="text-red-700">{b.failCount}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{b.publicityStart}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{b.publicityEnd}</td>
                <td className="px-4 py-3">
                  {b.appealCount > 0 ? (
                    <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1" />{b.appealCount}条
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[b.status].color}`}>
                    {statusMap[b.status].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedBatch(b)}>
                      <Eye className="w-3 h-3 mr-1" /> 查看
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toast.success('公示表已导出')}>
                      <FileText className="w-3 h-3 mr-1" /> 公示表
                    </Button>
                    {b.appealCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => setShowAppeal(b)}>
                        处理申诉
                      </Button>
                    )}
                    {b.status === 'pending' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleStartPublicity(b.id)}>
                        <Clock className="w-3 h-3 mr-1" /> 开始公示
                      </Button>
                    )}
                    {b.status === 'publicizing' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handleEndPublicity(b.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> 结束
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>公示名单 - {selectedBatch?.planName}</DialogTitle></DialogHeader>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr><th className="px-3 py-2 text-left">姓名</th><th className="px-3 py-2 text-left">证件号码</th><th className="px-3 py-2 text-left">职业工种</th><th className="px-3 py-2 text-left">技能等级</th><th className="px-3 py-2 text-left">结果</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {['张三', '李四', '王五'].map((name, idx) => (
                  <tr key={name}>
                    <td className="px-3 py-2 font-medium">{name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">44030119900{idx + 1}011234</td>
                    <td className="px-3 py-2">{selectedBatch?.profession}</td>
                    <td className="px-3 py-2">{selectedBatch?.level}</td>
                    <td className="px-3 py-2"><Badge className="bg-green-50 text-green-700">合格</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showAppeal} onOpenChange={() => setShowAppeal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>申诉处理</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md bg-gray-50 p-3">计划：{showAppeal?.planName}</div>
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              考生反馈技能成绩与现场签字确认成绩不一致，请复核原始评分表。
            </div>
            <textarea className="h-24 w-full rounded-md border border-gray-200 p-3 text-sm" placeholder="填写处理意见" defaultValue="已复核原始评分表，成绩无误。" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAppeal(null)}>返回</Button>
            {showAppeal && <Button onClick={() => handleResolveAppeal(showAppeal.id)}>处理完成</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
