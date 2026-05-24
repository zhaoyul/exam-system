import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendResourceList } from '@/hooks/useBackendListState'

interface TimelineEvent {
  id: string
  step: string
  result: string
  detail: string
  time: string
  operator: string
}

interface ScoreChange {
  id: string
  time: string
  scoreType: '理论' | '技能'
  oldScore: number
  newScore: number
  operator: string
  reason: string
}

interface TraceRecord {
  id: string
  name: string
  idType: string
  idNo: string
  certNo: string
  issuer: string
  generatedAt: string
  occupation: string
  level: string
  province: string
  processEvents: TimelineEvent[]
  scoreChanges: ScoreChange[]
}

const initialRecords: TraceRecord[] = [
  {
    id: 'tr1',
    name: '张三',
    idType: '居民身份证',
    idNo: '4403********1234',
    certNo: '440310052603000001',
    issuer: '中广核集团',
    generatedAt: '2026-04-28 10:01',
    occupation: '核反应堆操作员',
    level: '三级',
    province: '广东省',
    processEvents: [
      { id: 'e1', step: '指定计划', result: '计划已发布', detail: '计划编号 44031005/26/04/0001', time: '2026-04-01 09:00', operator: '机构管理员' },
      { id: 'e2', step: '考试报名', result: '报名审核通过', detail: '运行一部集体报名，照片校验通过', time: '2026-04-06 14:20', operator: '报名机构' },
      { id: 'e3', step: '考场编排', result: '理论/技能编排完成', detail: '普通编排，笔试一考场 + 实操一号工位', time: '2026-04-10 16:00', operator: '考务人员' },
      { id: 'e4', step: '考务安排', result: '试卷已回推', detail: '题库组卷，监考和督导人员已安排', time: '2026-04-15 10:00', operator: '机构管理员' },
      { id: 'e5', step: '成绩公示', result: '公示完成', detail: '公示期内有 1 条技能成绩修改记录', time: '2026-04-22 18:00', operator: '系统' },
      { id: 'e6', step: '集团证书', result: '证书已生成', detail: '集团管理员确认打印', time: '2026-04-28 10:01', operator: '集团管理员' },
    ],
    scoreChanges: [
      { id: 'sc1', time: '2026-04-22 09:20', scoreType: '技能', oldScore: 88, newScore: 90, operator: '机构管理员', reason: '复核评分表后修正' },
    ],
  },
  {
    id: 'tr2',
    name: '王五',
    idType: '居民身份证',
    idNo: '4403********7890',
    certNo: '441700552604000018',
    issuer: '中广核集团',
    generatedAt: '2026-05-18 16:22',
    occupation: '电气维修工',
    level: '四级',
    province: '广东省',
    processEvents: [
      { id: 'e7', step: '指定计划', result: '计划已发布', detail: '计划编号 44170055/26/05/0002', time: '2026-05-02 08:30', operator: '机构管理员' },
      { id: 'e8', step: '考试报名', result: '报名通过', detail: '阳江维修部批量导入', time: '2026-05-05 15:30', operator: '报名机构' },
      { id: 'e9', step: '成绩公示', result: '公示无异议', detail: '未发生成绩修改', time: '2026-05-16 17:00', operator: '系统' },
    ],
    scoreChanges: [],
  },
]

export default function TraceabilityCenter() {
  const records = useBackendResourceList<TraceRecord>('/traceability/cases', initialRecords)
  const [query, setQuery] = useState('')
  const [activeProvince, setActiveProvince] = useState('全部')
  const [active, setActive] = useState<TraceRecord | null>(null)
  const [dialog, setDialog] = useState<'process' | 'score' | null>(null)

  const filtered = useMemo(() => records.filter(record => {
    const byProvince = activeProvince === '全部' || record.province === activeProvince
    const byQuery = !query || record.name.includes(query) || record.certNo.includes(query) || record.idNo.includes(query)
    return byProvince && byQuery
  }), [activeProvince, query, records])

  const provinceStats = [
    { label: '全部', count: records.length },
    ...Array.from(new Set(records.map(item => item.province))).map(label => ({
      label,
      count: records.filter(item => item.province === label).length,
    })),
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">溯源中心</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">姓名 / 身份证 / 证书编号</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
        </div>

        <div className="grid grid-cols-[220px_1fr]">
          <aside className="border-r border-gray-100 p-3">
            <div className="mb-3 text-sm font-medium text-gray-700">备案地</div>
            {provinceStats.map((item, index) => (
              <button key={item.label} onClick={() => setActiveProvince(item.label)} className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm ${activeProvince === item.label ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + (index > 0 ? 18 : 0) }}>
                {item.label} ({item.count}个)
              </button>
            ))}
          </aside>
          <div className="overflow-auto">
            <table className="w-full min-w-[1220px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">姓名</th>
                  <th className="px-4 py-3 text-left font-medium">证件类型</th>
                  <th className="px-4 py-3 text-left font-medium">证件号码</th>
                  <th className="px-4 py-3 text-left font-medium">证书编号</th>
                  <th className="px-4 py-3 text-left font-medium">发证单位</th>
                  <th className="px-4 py-3 text-left font-medium">生成时间</th>
                  <th className="px-4 py-3 text-left font-medium">职业工种</th>
                  <th className="px-4 py-3 text-left font-medium">技能等级</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.name}</td>
                    <td className="px-4 py-3 text-gray-600">{record.idType}</td>
                    <td className="px-4 py-3 text-gray-600">{record.idNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{record.certNo}</td>
                    <td className="px-4 py-3 text-gray-600">{record.issuer}</td>
                    <td className="px-4 py-3 text-gray-600">{record.generatedAt}</td>
                    <td className="px-4 py-3 text-gray-600">{record.occupation}</td>
                    <td className="px-4 py-3 text-gray-600">{record.level}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => { setActive(record); setDialog('process') }} className="text-[#1A56DB] hover:underline">认定过程</button>
                        <button
                          onClick={() => {
                            if (!record.scoreChanges.length) {
                              toast.info('该考生暂无成绩修改记录')
                              return
                            }
                            setActive(record)
                            setDialog('score')
                          }}
                          disabled={!record.scoreChanges.length}
                          className={`hover:underline ${record.scoreChanges.length ? 'text-[#1A56DB]' : 'cursor-not-allowed text-gray-300'}`}
                        >
                          修改成绩记录
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据　1　20 条/页</div>
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'process'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>认定过程</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            {active?.processEvents.map((event, index) => (
              <div key={event.id} className="rounded-lg border border-gray-200 p-3">
                <div className="font-medium text-gray-900">{index + 1}. {event.step} - {event.result}</div>
                <div className="mt-1 text-gray-600">{event.detail}</div>
                <div className="mt-2 text-xs text-gray-500">{event.time} / {event.operator}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'score'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>修改成绩记录</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            {active?.scoreChanges.map(change => (
              <div key={change.id} className="rounded-lg border border-gray-200 p-3">
                <div className="font-medium text-gray-900">{change.scoreType}成绩：{change.oldScore} → {change.newScore}</div>
                <div className="mt-1 text-gray-600">原因：{change.reason}</div>
                <div className="mt-2 text-xs text-gray-500">{change.time} / {change.operator}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
