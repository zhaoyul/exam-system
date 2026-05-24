import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Eye, Clock, CheckCircle, Calendar, AlertTriangle, Download, Search, PenTool } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'
import { formatChineseDate } from '@/lib/workflow'

interface ScoreChangeRecord {
  id: string
  candidateName: string
  scoreType: '理论' | '技能'
  oldScore: number
  newScore: number
  reason: string
  modifiedAt: string
  modifiedBy: string
}

interface PublicityCandidate {
  id: string
  name: string
  idCard: string
  theoryScore: number
  skillScore: number
  result: '合格' | '不合格'
}

interface PublicityBatch {
  id: number
  planName: string
  profession: string
  level: string
  publicityStart: string
  publicityEnd: string
  status: 'pending' | 'publicizing' | 'done'
  appealCount: number
  candidates: PublicityCandidate[]
  changes: ScoreChangeRecord[]
}

const mockBatches: PublicityBatch[] = [
  {
    id: 1,
    planName: '大亚湾核电2026年第1批认定',
    profession: '核反应堆操作员',
    level: '三级',
    publicityStart: '2026-04-20',
    publicityEnd: '2026-04-27',
    status: 'publicizing',
    appealCount: 1,
    candidates: [
      { id: 'c1', name: '张三', idCard: '440301199001011234', theoryScore: 86, skillScore: 90, result: '合格' },
      { id: 'c2', name: '李四', idCard: '440301199205063456', theoryScore: 59, skillScore: 70, result: '不合格' },
    ],
    changes: [
      { id: 'chg1', candidateName: '张三', scoreType: '技能', oldScore: 88, newScore: 90, reason: '复核评分表后修正', modifiedAt: '2026-04-22 09:20', modifiedBy: '机构管理员' },
    ],
  },
  {
    id: 2,
    planName: '阳江核电2026年第1批认定',
    profession: '电气维修工',
    level: '四级',
    publicityStart: '2026-04-15',
    publicityEnd: '2026-04-22',
    status: 'done',
    appealCount: 0,
    candidates: [
      { id: 'c3', name: '王五', idCard: '440301198803127890', theoryScore: 92, skillScore: 89, result: '合格' },
    ],
    changes: [],
  },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待公示', color: 'bg-yellow-100 text-yellow-700' },
  publicizing: { label: '公示中', color: 'bg-blue-100 text-blue-700' },
  done: { label: '已结束', color: 'bg-green-100 text-green-700' },
}

function calcPublicityEnd(startDate: string, publicityDays: number) {
  const endDate = new Date(`${startDate}T00:00:00`)
  endDate.setDate(endDate.getDate() + publicityDays)
  return endDate.toISOString().split('T')[0]
}

export default function ScorePublicityManage() {
  const [batches, setBatches] = useBackendListState<PublicityBatch>(mockBatches)
  const [publicityDays, setPublicityDays] = useState(7)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全部' | PublicityBatch['status']>('全部')
  const [selectedBatch, setSelectedBatch] = useState<PublicityBatch | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<{ batchId: number; candidate: PublicityCandidate } | null>(null)

  const filtered = batches.filter(batch => {
    const bySearch = !search || batch.planName.includes(search) || batch.profession.includes(search)
    const byStatus = statusFilter === '全部' || batch.status === statusFilter
    return bySearch && byStatus
  })

  const handleStartPublicity = (id: number) => {
    const start = new Date().toISOString().split('T')[0]
    const end = calcPublicityEnd(start, publicityDays)
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'publicizing', publicityStart: start, publicityEnd: end } : b))
    toast.success('成绩公示已开始')
  }

  const handleEndPublicity = (id: number) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'done' } : b))
    toast.success('成绩公示已结束')
  }

  const saveCandidateScore = (payload: { theoryScore: number; skillScore: number; reason: string }) => {
    if (!editingCandidate) return
    setBatches(prev => prev.map(batch => {
      if (batch.id !== editingCandidate.batchId) return batch
      const current = batch.candidates.find(candidate => candidate.id === editingCandidate.candidate.id)
      if (!current) return batch
      const nextCandidates = batch.candidates.map(candidate => candidate.id === current.id ? {
        ...candidate,
        theoryScore: payload.theoryScore,
        skillScore: payload.skillScore,
        result: payload.theoryScore >= 60 && payload.skillScore >= 60 ? '合格' as const : '不合格' as const,
      } : candidate)
      const nextChanges = [...batch.changes]
      if (current.theoryScore !== payload.theoryScore) {
        nextChanges.unshift({
          id: `${current.id}-theory-${Date.now()}`,
          candidateName: current.name,
          scoreType: '理论',
          oldScore: current.theoryScore,
          newScore: payload.theoryScore,
          reason: payload.reason,
          modifiedAt: new Date().toLocaleString('zh-CN'),
          modifiedBy: '机构管理员',
        })
      }
      if (current.skillScore !== payload.skillScore) {
        nextChanges.unshift({
          id: `${current.id}-skill-${Date.now()}`,
          candidateName: current.name,
          scoreType: '技能',
          oldScore: current.skillScore,
          newScore: payload.skillScore,
          reason: payload.reason,
          modifiedAt: new Date().toLocaleString('zh-CN'),
          modifiedBy: '机构管理员',
        })
      }
      return { ...batch, candidates: nextCandidates, changes: nextChanges }
    }))
    setEditingCandidate(null)
    toast.success('成绩已修改并永久记录')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">成绩公示</h1>
          <p className="mt-1 text-sm text-gray-500">公示期间允许修改理论/技能成绩，系统永久保存修改记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('公示名单已导出')}>
            <Download className="mr-2 h-4 w-4" />导出公示名单
          </Button>
          <Button onClick={() => toast.success('公示结果已提交')}>
            <CheckCircle className="mr-2 h-4 w-4" />提交公示结果
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '待公示', count: batches.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: '公示中', count: batches.filter(b => b.status === 'publicizing').length, icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: '已结束', count: batches.filter(b => b.status === 'done').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold">{item.count}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}><item.icon className="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-blue-600" />
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
            <div className="text-xs text-gray-400">公示期内修改成绩时，系统自动保留操作人、时间和原因</div>
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="计划名称 / 职业工种" className="w-72 pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">职业/等级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考生数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">公示开始</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">公示结束</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">修改记录</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">申诉</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(batch => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{batch.planName}</td>
                <td className="px-4 py-3 text-xs">{batch.profession}/{batch.level}</td>
                <td className="px-4 py-3">{batch.candidates.length}人</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatChineseDate(batch.publicityStart)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatChineseDate(batch.publicityEnd)}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{batch.changes.length} 条</td>
                <td className="px-4 py-3">
                  {batch.appealCount > 0 ? (
                    <Badge variant="outline" className="bg-red-100 text-[10px] text-red-700">
                      <AlertTriangle className="mr-1 h-2.5 w-2.5" />{batch.appealCount}条
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">0</span>
                  )}
                </td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusMap[batch.status].color}`}>{statusMap[batch.status].label}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelectedBatch(batch)}>
                      <Eye className="mr-1 h-3 w-3" />查看
                    </Button>
                    {batch.status === 'pending' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handleStartPublicity(batch.id)}><Clock className="mr-1 h-3 w-3" />开始公示</Button>}
                    {batch.status === 'publicizing' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handleEndPublicity(batch.id)}><CheckCircle className="mr-1 h-3 w-3" />结束</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>公示名单 - {selectedBatch?.planName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">姓名</th>
                    <th className="px-3 py-2 text-left">证件号码</th>
                    <th className="px-3 py-2 text-left">理论成绩</th>
                    <th className="px-3 py-2 text-left">技能成绩</th>
                    <th className="px-3 py-2 text-left">结果</th>
                    <th className="px-3 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedBatch?.candidates.map(candidate => (
                    <tr key={candidate.id}>
                      <td className="px-3 py-2 font-medium">{candidate.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{candidate.idCard}</td>
                      <td className="px-3 py-2">{candidate.theoryScore}</td>
                      <td className="px-3 py-2">{candidate.skillScore}</td>
                      <td className="px-3 py-2"><Badge className={candidate.result === '合格' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>{candidate.result}</Badge></td>
                      <td className="px-3 py-2">
                        {selectedBatch.status === 'publicizing' ? (
                          <button onClick={() => setEditingCandidate({ batchId: selectedBatch.id, candidate })} className="text-xs text-blue-600 hover:underline">
                            <PenTool className="mr-1 inline h-3 w-3" />修改成绩
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">仅公示中可修改</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-gray-200">
              <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700">永久修改记录</div>
              <div className="max-h-60 overflow-auto">
                {(selectedBatch?.changes.length || 0) > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">考生</th>
                        <th className="px-3 py-2 text-left">成绩类型</th>
                        <th className="px-3 py-2 text-left">变更</th>
                        <th className="px-3 py-2 text-left">原因</th>
                        <th className="px-3 py-2 text-left">操作时间</th>
                        <th className="px-3 py-2 text-left">操作人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedBatch?.changes.map(change => (
                        <tr key={change.id}>
                          <td className="px-3 py-2">{change.candidateName}</td>
                          <td className="px-3 py-2">{change.scoreType}</td>
                          <td className="px-3 py-2">{change.oldScore} → {change.newScore}</td>
                          <td className="px-3 py-2">{change.reason}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{change.modifiedAt}</td>
                          <td className="px-3 py-2">{change.modifiedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">暂无成绩修改记录</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditScoreDialog
        key={editingCandidate ? `${editingCandidate.batchId}-${editingCandidate.candidate.id}` : 'closed'}
        open={!!editingCandidate}
        candidate={editingCandidate?.candidate || null}
        onClose={() => setEditingCandidate(null)}
        onSave={saveCandidateScore}
      />
    </div>
  )
}

function EditScoreDialog({
  open,
  candidate,
  onClose,
  onSave,
}: {
  open: boolean
  candidate: PublicityCandidate | null
  onClose: () => void
  onSave: (payload: { theoryScore: number; skillScore: number; reason: string }) => void
}) {
  const [theoryScore, setTheoryScore] = useState(String(candidate?.theoryScore || 0))
  const [skillScore, setSkillScore] = useState(String(candidate?.skillScore || 0))
  const [reason, setReason] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>修改成绩</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-md bg-gray-50 p-3">考生：{candidate?.name}</div>
          <label className="block"><span className="font-medium text-gray-700">理论成绩</span><Input type="number" value={theoryScore} onChange={event => setTheoryScore(event.target.value)} /></label>
          <label className="block"><span className="font-medium text-gray-700">技能成绩</span><Input type="number" value={skillScore} onChange={event => setSkillScore(event.target.value)} /></label>
          <label className="block">
            <span className="font-medium text-gray-700">修改原因</span>
            <textarea value={reason} onChange={event => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-md border border-gray-200 px-3 py-2" />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>返回</Button>
            <Button onClick={() => {
              if (!reason.trim()) {
                toast.error('请填写修改原因')
                return
              }
              onSave({ theoryScore: Number(theoryScore), skillScore: Number(skillScore), reason })
            }}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
