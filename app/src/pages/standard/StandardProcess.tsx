import { useState } from 'react'
import { CheckCircle, ClipboardList, Eye, FileCheck2, History, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState } from '@/hooks/useBackendListState'

type ProcessStatus = '编制中' | '审核中' | '待发布' | '已完成'

interface ProcessItem {
  id: string
  name: string
  type: '标准编审' | '题库编审'
  occupation: string
  level: string
  subject: string
  owner: string
  compileExperts: string[]
  reviewExperts: string[]
  compileProgress: number
  reviewProgress: number
  round: number
  status: ProcessStatus
  logs: string[]
}

const initialRows: ProcessItem[] = [
  {
    id: 'std-process-001',
    name: '核电厂运行值班员国家职业标准修订过程',
    type: '标准编审',
    occupation: '核电厂运行值班员',
    level: '三级/二级',
    subject: '职业标准',
    owner: '集团标准委员会',
    compileExperts: ['陈立', '周敏', '韩睿'],
    reviewExperts: ['王明', '刘芳'],
    compileProgress: 100,
    reviewProgress: 70,
    round: 2,
    status: '审核中',
    logs: ['2026-04-02 完成立项', '2026-04-16 提交修订稿', '2026-05-08 专家审核提出 5 条修改意见'],
  },
  {
    id: 'std-process-002',
    name: '核电机械检修工理论题库编审过程',
    type: '题库编审',
    occupation: '核电机械检修工',
    level: '四级/三级',
    subject: '理论知识',
    owner: '集团题库中心',
    compileExperts: ['赵鹏', '许青'],
    reviewExperts: ['孙浩', '李倩', '郑磊'],
    compileProgress: 82,
    reviewProgress: 45,
    round: 1,
    status: '编制中',
    logs: ['2026-04-12 导入 320 道初稿试题', '2026-04-24 完成重复题检查', '2026-05-10 进入第一轮专家审核'],
  },
  {
    id: 'std-process-003',
    name: '核电仪控检修工实操题库编审过程',
    type: '题库编审',
    occupation: '核电仪控检修工',
    level: '三级',
    subject: '技能操作',
    owner: '集团题库中心',
    compileExperts: ['黄杰', '冯雪'],
    reviewExperts: ['郭强', '唐莉'],
    compileProgress: 100,
    reviewProgress: 100,
    round: 3,
    status: '待发布',
    logs: ['2026-03-19 完成实操评分点维护', '2026-04-07 完成第三轮审核', '2026-04-28 等待标准委员会发布'],
  },
]

export default function StandardProcess() {
  const [items, setItems] = useBackendListState(initialRows)
  const [detail, setDetail] = useState<ProcessItem | null>(null)

  const finishProcess = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status: '已完成',
      compileProgress: 100,
      reviewProgress: 100,
      logs: [...item.logs, `${new Date().toISOString().slice(0, 10)} 过程结束并归档`],
    } : item))
  }

  const statusCounts = items.reduce<Record<ProcessStatus, number>>((acc, item) => {
    acc[item.status] += 1
    return acc
  }, { 编制中: 0, 审核中: 0, 待发布: 0, 已完成: 0 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">标准过程</h1>
        <div className="flex gap-2 text-xs text-gray-500">
          <Badge label="编制中" value={statusCounts.编制中} />
          <Badge label="审核中" value={statusCounts.审核中} />
          <Badge label="待发布" value={statusCounts.待发布} />
          <Badge label="已完成" value={statusCounts.已完成} />
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr] border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
          <span>过程名称</span>
          <span>类型</span>
          <span>职业/等级</span>
          <span>科目</span>
          <span>进度</span>
          <span className="text-right">操作</span>
        </div>
        {items.map(item => (
          <div key={item.id} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr] items-center border-b border-gray-100 px-4 py-4 text-sm last:border-b-0">
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="mt-1 text-xs text-gray-500">负责机构：{item.owner} · 第 {item.round} 轮</div>
            </div>
            <span><TypePill type={item.type} /></span>
            <span className="text-gray-600">{item.occupation}<br /><span className="text-xs text-gray-400">{item.level}</span></span>
            <span className="text-gray-600">{item.subject}</span>
            <div className="space-y-2">
              <Progress label="编制" value={item.compileProgress} />
              <Progress label="审核" value={item.reviewProgress} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDetail(item)}><Eye className="mr-1 h-4 w-4" />详情</Button>
              {item.status !== '已完成' && (
                <Button size="sm" className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => finishProcess(item.id)}>
                  <FileCheck2 className="mr-1 h-4 w-4" />结束
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>过程详情</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{detail.name}</div>
                    <div className="mt-1 text-gray-500">{detail.occupation} · {detail.level} · {detail.subject}</div>
                  </div>
                  <StatusPill status={detail.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info icon={<ClipboardList className="h-4 w-4" />} label="编制专家" value={detail.compileExperts.join('、')} />
                <Info icon={<FileCheck2 className="h-4 w-4" />} label="审核专家" value={detail.reviewExperts.join('、')} />
                <Info icon={<PlayCircle className="h-4 w-4" />} label="编审轮次" value={`第 ${detail.round} 轮`} />
                <Info icon={<CheckCircle className="h-4 w-4" />} label="负责机构" value={detail.owner} />
              </div>
              <div className="rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 font-medium text-gray-900">
                  <History className="h-4 w-4 text-[#1A56DB]" />过程日志
                </div>
                <div className="space-y-2 p-3">
                  {detail.logs.map(log => <div key={log} className="rounded-md bg-gray-50 px-3 py-2 text-gray-600">{log}</div>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Badge({ label, value }: { label: string; value: number }) {
  return <span className="rounded-full border border-gray-200 bg-white px-3 py-1">{label}：{value}</span>
}

function TypePill({ type }: { type: ProcessItem['type'] }) {
  return <span className={`rounded-full px-2 py-1 text-xs ${type === '题库编审' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{type}</span>
}

function StatusPill({ status }: { status: ProcessStatus }) {
  const cls = status === '已完成' ? 'bg-green-50 text-green-700' : status === '待发布' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
  return <span className={`rounded-full px-2 py-1 text-xs ${cls}`}>{status}</span>
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-gray-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-[#1A56DB]" style={{ width: `${value}%` }} /></div>
      <span className="w-9 text-right text-gray-500">{value}%</span>
    </div>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">{icon}{label}</div>
      <div className="mt-2 font-medium text-gray-900">{value}</div>
    </div>
  )
}
