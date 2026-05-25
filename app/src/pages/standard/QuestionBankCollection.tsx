import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, FileSpreadsheet, FileUp, History, ListTree, PencilLine, Plus, RefreshCw, Search, Undo2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useBackendResourceState } from '@/hooks/useBackendListState'

type ReviewStatus = '待编制' | '编制中' | '待审核' | '退回修改' | '审核通过' | '已发布'

interface CollectionTask {
  id: string
  name: string
  occupation: string
  level: string
  subject: string
  leader: string
  compileExperts: string[]
  reviewExperts: string[]
  structureRows: number
  questionRows: number
  returnedRows: number
  status: ReviewStatus
  dueDate: string
  logs: string[]
}

const initialTasks: CollectionTask[] = [
  {
    id: 'qb-collection-001',
    name: '核电机械检修工理论题库编审',
    occupation: '核电机械检修工',
    level: '四级/三级',
    subject: '理论知识',
    leader: '赵鹏',
    compileExperts: ['许青', '周工'],
    reviewExperts: ['孙浩', '李倩'],
    structureRows: 46,
    questionRows: 328,
    returnedRows: 12,
    status: '退回修改',
    dueDate: '2026-06-15',
    logs: ['项目负责人已分配编写专家和审核专家', '细目表导入 46 条', '审核专家退回 12 道试题，要求修改知识点匹配关系'],
  },
  {
    id: 'qb-collection-002',
    name: '核反应堆运行值班员技能题库编审',
    occupation: '核反应堆运行值班员',
    level: '三级',
    subject: '技能操作',
    leader: '陈立',
    compileExperts: ['韩睿', '冯雪'],
    reviewExperts: ['郭强', '唐莉'],
    structureRows: 28,
    questionRows: 96,
    returnedRows: 0,
    status: '待审核',
    dueDate: '2026-06-20',
    logs: ['结构表已人工维护鉴定范围和鉴定点', '编写专家完成实操试题录入', '等待审核专家逐题审核'],
  },
]

const structureTree = [
  { range: '安全基础知识', points: ['核安全文化', '运行规程', '事件报告'] },
  { range: '设备检修准备', points: ['风险辨识', '工器具确认', '隔离挂牌'] },
  { range: '现场处置能力', points: ['异常判断', '操作步骤', '结果确认'] },
]

export default function QuestionBankCollection() {
  const [tasks, setTasks] = useBackendResourceState('/standard/question-bank-collection', initialTasks)
  const [activeId, setActiveId] = useState(initialTasks[0].id)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<'plan' | 'structure' | 'question' | 'review' | null>(null)

  const rows = useMemo(() => tasks.filter(task => !query || task.name.includes(query) || task.occupation.includes(query)), [tasks, query])
  const active = tasks.find(task => task.id === activeId) || rows[0] || tasks[0]

  const updateActive = (patch: Partial<CollectionTask>, log: string) => {
    if (!active) return
    setTasks(prev => prev.map(task => task.id === active.id ? { ...task, ...patch, logs: [log, ...task.logs] } : task))
  }

  const addPlan = () => {
    const id = `qb-collection-${Date.now()}`
    const next: CollectionTask = {
      id,
      name: '新建题库编审计划',
      occupation: '电气试验员',
      level: '三级',
      subject: '理论知识',
      leader: '待指定',
      compileExperts: [],
      reviewExperts: [],
      structureRows: 0,
      questionRows: 0,
      returnedRows: 0,
      status: '待编制',
      dueDate: '2026-07-31',
      logs: ['新增题库编审计划，等待选择项目负责人和专家'],
    }
    setTasks(prev => [next, ...prev])
    setActiveId(id)
    setDialog(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">题库征集编审</h1>
          <p className="mt-1 text-sm text-gray-500">按文档截图补充计划、专家分配、细目表/结构表、试题编写、审核退回和再提交流程</p>
        </div>
        <Button onClick={() => setDialog('plan')} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Plus className="mr-1.5 h-4 w-4" />制定题库编审计划</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索职业或计划" className="h-9 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {rows.map(task => (
              <button key={task.id} onClick={() => setActiveId(task.id)} className={`block w-full px-4 py-3 text-left hover:bg-gray-50 ${active?.id === task.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-gray-900">{task.name}</div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="mt-1 text-xs text-gray-500">{task.occupation} · {task.level} · {task.subject}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <span>细目 {task.structureRows}</span>
                  <span>试题 {task.questionRows}</span>
                  <span className={task.returnedRows > 0 ? 'text-red-600' : 'text-gray-600'}>退回 {task.returnedRows}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {active && (
          <section className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{active.name}</h2>
                    <StatusBadge status={active.status} />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">负责人：{active.leader} · 截止日期：{active.dueDate}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setDialog('structure')}><FileSpreadsheet className="mr-1.5 h-4 w-4" />细目表/结构表</Button>
                  <Button variant="outline" onClick={() => setDialog('question')}><PencilLine className="mr-1.5 h-4 w-4" />编写试题</Button>
                  <Button onClick={() => setDialog('review')} className="bg-[#1A56DB] hover:bg-[#1748B5]"><CheckCircle2 className="mr-1.5 h-4 w-4" />审核试题</Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <InfoCard icon={Users} label="编写专家" value={active.compileExperts.length ? active.compileExperts.join('、') : '未分配'} />
                <InfoCard icon={Users} label="审核专家" value={active.reviewExperts.length ? active.reviewExperts.join('、') : '未分配'} />
                <InfoCard icon={ListTree} label="鉴定范围/点" value={`${active.structureRows} 条`} />
                <InfoCard icon={ClipboardList} label="试题数量" value={`${active.questionRows} 道`} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 font-semibold text-gray-900">
                  <ListTree className="h-4 w-4 text-[#1A56DB]" />细目表与结构表
                </div>
                <div className="divide-y divide-gray-100">
                  {structureTree.map(section => (
                    <div key={section.range} className="px-4 py-3">
                      <div className="font-medium text-gray-900">{section.range}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {section.points.map(point => <Badge key={point} variant="outline" className="bg-gray-50">{point}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 font-semibold text-gray-900">
                  <History className="h-4 w-4 text-[#1A56DB]" />编审记录
                </div>
                <div className="space-y-2 p-3">
                  {active.logs.map(log => <div key={log} className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">{log}</div>)}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <Dialog open={dialog === 'plan'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>制定题库编审计划</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="计划名称" value="新建题库编审计划" />
            <Field label="计划类型" value="题库编审" />
            <Field label="职业" value="电气试验员" />
            <Field label="覆盖等级" value="三级" />
            <Field label="题库类别" value="理论知识" />
            <Field label="负责机构" value="集团题库中心" />
            <Field label="项目负责人" value="待指定" />
            <Field label="截止日期" value="2026-07-31" />
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button variant="outline" onClick={() => setDialog(null)}>取消</Button>
            <Button onClick={addPlan}>保存并发布</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'structure'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>细目表/结构表维护</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <ActionPanel icon={FileUp} title="批量导入" desc="导入细目表模板，自动生成鉴定范围和鉴定点层级。" onClick={() => updateActive({ structureRows: active.structureRows + 12 }, '批量导入细目表 12 条')} />
            <ActionPanel icon={Plus} title="手工新增" desc="手工新增下级鉴定范围、鉴定点和分值/题量要求。" onClick={() => updateActive({ structureRows: active.structureRows + 1 }, '手工新增 1 条鉴定点')} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'question'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>试题编写</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <ActionPanel icon={FileUp} title="批量导入试题" desc="按模板导入试题，绑定题型、难度、知识点和答案。" onClick={() => updateActive({ questionRows: active.questionRows + 50, status: '待审核' }, '编写专家批量导入 50 道试题，提交审核')} />
            <ActionPanel icon={PencilLine} title="人工录题" desc="逐题录入题干、选项、答案、解析和适用等级。" onClick={() => updateActive({ questionRows: active.questionRows + 1, status: '待审核' }, '编写专家人工录入 1 道试题，提交审核')} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'review'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>试题审核</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <ActionPanel icon={CheckCircle2} title="审核通过" desc="试题符合模板、细目表和题库质量要求，进入发布队列。" onClick={() => updateActive({ returnedRows: 0, status: '审核通过' }, '审核专家确认试题合规，审核通过')} />
            <ActionPanel icon={Undo2} title="退回修改" desc="填写退回原因，试题返回编写专家修改后再次提交。" onClick={() => updateActive({ returnedRows: active.returnedRows + 3, status: '退回修改' }, '审核专家退回 3 道试题：题干表述和鉴定点匹配需修正')} />
            <ActionPanel icon={RefreshCw} title="修改后再提交" desc="编写专家处理退回意见后重新提交审核。" onClick={() => updateActive({ returnedRows: Math.max(active.returnedRows - 3, 0), status: '待审核' }, '编写专家完成退回试题修改并再次提交')} />
            <ActionPanel icon={ClipboardList} title="发布题库" desc="项目负责人确认编审结束，题库入库可用于组卷。" onClick={() => updateActive({ returnedRows: 0, status: '已发布' }, '项目负责人结束编审，题库正式入库')} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const tone = status === '已发布' || status === '审核通过'
    ? 'bg-green-50 text-green-700'
    : status === '退回修改'
      ? 'bg-red-50 text-red-700'
      : status === '待审核'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-blue-50 text-blue-700'
  return <span className={`rounded-full px-2 py-1 text-xs ${tone}`}>{status}</span>
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500"><Icon className="h-4 w-4" />{label}</div>
      <div className="mt-2 text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <input defaultValue={value} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
    </label>
  )
}

function ActionPanel({ icon: Icon, title, desc, onClick }: { icon: any; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-gray-200 p-4 text-left hover:border-[#1A56DB] hover:bg-blue-50">
      <Icon className="mb-3 h-5 w-5 text-[#1A56DB]" />
      <div className="font-medium text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-500">{desc}</div>
    </button>
  )
}
