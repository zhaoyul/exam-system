import { useMemo, useState } from 'react'
import {
  Award,
  BarChart3,
  CheckCircle,
  Download,
  FileArchive,
  FileText,
  History,
  MoreHorizontal,
  Search,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type PlanType = '等级认定' | '认定申报'

interface HistoryPlan {
  id: string
  code: string
  title: string
  type: PlanType
  filingArea: string
  siteName: string
  testMonth: string
  testDate: string
  archiveDate: string
  total: number
  passed: number
  certCount: number
  candidates: HistoryCandidate[]
}

interface HistoryCandidate {
  id: string
  name: string
  idCard: string
  ticketNo: string
  occupation: string
  level: string
  certNo: string
  issueDate: string
  theoryScore: number
  skillScore: number
  events: HistoryEvent[]
}

interface HistoryEvent {
  id: string
  time: string
  step: string
  result: string
  operator: string
}

const historyPlans: HistoryPlan[] = [
  {
    id: 'h1',
    code: '26440310050003',
    title: '20260402中广核测试第3批认定',
    type: '等级认定',
    filingArea: '广东省',
    siteName: '深圳市中广核',
    testMonth: '2026年04月',
    testDate: '2026-04-10',
    archiveDate: '2026-04-17',
    total: 95,
    passed: 82,
    certCount: 82,
    candidates: [
      {
        id: 'h1-c1',
        name: '张三',
        idCard: '440301199001011234',
        ticketNo: '260402440310050001',
        occupation: '发电厂发电机检修工',
        level: '四级/中级工',
        certNo: 'Y004144031005264000001',
        issueDate: '2026-04-17',
        theoryScore: 90,
        skillScore: 87,
        events: [
          { id: 'h1-e1', time: '2026-04-02 08:30', step: '考生报名', result: '集体报名导入成功', operator: '中广测试有限公司' },
          { id: 'h1-e2', time: '2026-04-10 18:10', step: '考务工作', result: '考试结束并完成阅卷', operator: '考务负责人' },
          { id: 'h1-e3', time: '2026-04-17 10:20', step: '存档', result: '认定批次归档完成', operator: '系统' },
        ],
      },
    ],
  },
  {
    id: 'h2',
    code: '26450000010002',
    title: '20260409防城港核电有限公司第2批认定',
    type: '等级认定',
    filingArea: '广西壮族自治区',
    siteName: '防城港核电评价站',
    testMonth: '2026年04月',
    testDate: '2026-04-20',
    archiveDate: '2026-04-30',
    total: 120,
    passed: 105,
    certCount: 105,
    candidates: [
      {
        id: 'h2-c1',
        name: '赵六',
        idCard: '450601199103032345',
        ticketNo: '260409450000010001',
        occupation: '企业人力资源管理师',
        level: '三级/高级工',
        certNo: 'Y004145000001263000001',
        issueDate: '2026-04-28',
        theoryScore: 86,
        skillScore: 91,
        events: [
          { id: 'h2-e1', time: '2026-04-01 09:20', step: '考生报名', result: '报名材料审核通过', operator: '防城港核电' },
          { id: 'h2-e2', time: '2026-04-20 16:40', step: '考务工作', result: '理论和实操成绩已确认', operator: '考务负责人' },
          { id: 'h2-e3', time: '2026-04-30 17:00', step: '存档', result: '认定批次归档完成', operator: '系统' },
        ],
      },
    ],
  },
  {
    id: 'h3',
    code: '25440310050001',
    title: '20250315福建宁A电第1批认定申报',
    type: '认定申报',
    filingArea: '福建省',
    siteName: '福建宁德技能人才评价站',
    testMonth: '2025年03月',
    testDate: '2025-03-25',
    archiveDate: '2025-03-30',
    total: 156,
    passed: 138,
    certCount: 138,
    candidates: [
      {
        id: 'h3-c1',
        name: '李四',
        idCard: '350902199002022345',
        ticketNo: '250315440310050001',
        occupation: '电气试验员',
        level: '四级/中级工',
        certNo: 'Y004135090225254000001',
        issueDate: '2025-03-28',
        theoryScore: 88,
        skillScore: 93,
        events: [
          { id: 'h3-e1', time: '2025-03-15 08:10', step: '考生报名', result: '个人网报审核通过', operator: '报名管理员' },
          { id: 'h3-e2', time: '2025-03-25 17:30', step: '考务工作', result: '成绩审核通过', operator: '考评负责人' },
          { id: 'h3-e3', time: '2025-03-30 17:00', step: '存档', result: '认定批次归档完成', operator: '系统' },
        ],
      },
    ],
  },
]

export default function HistoricalPage() {
  const [plans] = useBackendListState<HistoryPlan>(historyPlans)
  const [search, setSearch] = useState('')
  const [planType, setPlanType] = useState<PlanType>('等级认定')
  const [activeArea, setActiveArea] = useState('全部')
  const [borderMode, setBorderMode] = useState<'不打印边框' | '打印边框' | '图文边框'>('打印边框')
  const [printPhoto, setPrintPhoto] = useState<'否' | '是'>('是')
  const [birthDisplayMode, setBirthDisplayMode] = useState<'不隐藏' | '隐藏'>('不隐藏')
  const [candidatePlan, setCandidatePlan] = useState<HistoryPlan | null>(null)
  const [certCandidate, setCertCandidate] = useState<HistoryCandidate | null>(null)
  const [eventCandidate, setEventCandidate] = useState<HistoryCandidate | null>(null)
  const [morePlan, setMorePlan] = useState<HistoryPlan | null>(null)
  const [statsPlan, setStatsPlan] = useState<HistoryPlan | null>(null)

  const filtered = useMemo(() => {
    return plans.filter(plan => {
      const byType = plan.type === planType
      const byArea = activeArea === '全部' || plan.filingArea === activeArea
      const bySearch = !search || plan.title.includes(search) || plan.code.includes(search)
      return byType && byArea && bySearch
    })
  }, [activeArea, plans, planType, search])

  const areaStats = useMemo(() => {
    const areas = ['全部', ...Array.from(new Set(plans.map(plan => plan.filingArea)))]
    return areas.map(area => {
      const rows = area === '全部' ? plans : plans.filter(plan => plan.filingArea === area)
      return {
        area,
        planCount: rows.length,
        candidateCount: rows.reduce((sum, plan) => sum + plan.total, 0),
        certCount: rows.reduce((sum, plan) => sum + plan.certCount, 0),
      }
    })
  }, [plans])

  const exportSinglePlan = (plan: HistoryPlan, isReport: boolean) => {
    toast.success(isReport ? `${plan.title} 报表已开始下载` : `${plan.title} 证书上报数据压缩包已开始下载`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-[#1A56DB]" />
        <h1 className="text-xl font-bold text-gray-900">历次认定</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid gap-4 text-sm text-gray-700">
          <InlineChoice
            label="证书边框设置"
            value={borderMode}
            options={['不打印边框', '打印边框', '图文边框']}
            onChange={value => setBorderMode(value as typeof borderMode)}
          />
          <InlineChoice
            label="是否打印照片"
            value={printPhoto}
            options={['否', '是']}
            onChange={value => setPrintPhoto(value as typeof printPhoto)}
          />
          <InlineChoice
            label="报表身份证出生年月设置"
            value={birthDisplayMode}
            options={['不隐藏', '隐藏']}
            onChange={value => setBirthDisplayMode(value as typeof birthDisplayMode)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
          <span className="text-sm font-medium text-gray-700">计划名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 text-sm hover:bg-[#1748B5]">搜索</Button>
        </div>

        <div className="mt-3 flex gap-2">
          {(['等级认定', '认定申报'] as PlanType[]).map(type => (
            <button
              key={type}
              onClick={() => setPlanType(type)}
              className={`h-8 rounded-md px-4 text-sm ${planType === type ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {areaStats.map(item => (
          <button
            key={item.area}
            onClick={() => setActiveArea(item.area)}
            className={`rounded-lg border p-4 text-left ${activeArea === item.area ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
          >
            <div className="text-sm font-medium text-gray-900">{item.area}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
              <span>计划 {item.planCount}</span>
              <span>考生 {item.candidateCount}</span>
              <span>证书 {item.certCount}</span>
            </div>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">计划编号</th>
                <th className="px-4 py-3 text-left font-medium">计划名称</th>
                <th className="px-4 py-3 text-left font-medium">备案地</th>
                <th className="px-4 py-3 text-left font-medium">站点名称</th>
                <th className="px-4 py-3 text-left font-medium">拟考月份</th>
                <th className="px-4 py-3 text-left font-medium">拟考日期</th>
                <th className="px-4 py-3 text-left font-medium">存档日期</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((plan, index) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{plan.code}</td>
                  <td className="max-w-[320px] truncate px-4 py-3 font-medium text-gray-900">{plan.title}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.filingArea}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.siteName}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.testMonth}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.testDate}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.archiveDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCandidatePlan(plan)} className="text-xs text-[#1A56DB] hover:underline">考生</button>
                      <button onClick={() => { setCandidatePlan(plan); toast.success(`${plan.title} 集体报名信息已打开`) }} className="text-xs text-[#1A56DB] hover:underline">集体</button>
                      <button onClick={() => setMorePlan(plan)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1A56DB]">
                        更多<MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={!!candidatePlan} onOpenChange={() => setCandidatePlan(null)}>
        <DialogContent className="max-h-[82vh] max-w-5xl overflow-auto">
          <DialogHeader><DialogTitle>考生信息 - {candidatePlan?.title}</DialogTitle></DialogHeader>
          {candidatePlan && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-500">共 {candidatePlan.candidates.length} 名考生，证书 {candidatePlan.certCount} 本</div>
                <Button variant="outline" size="sm" onClick={() => toast.success('考生信息报表已下载')}>
                  <FileText className="mr-1 h-4 w-4" />报表
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-[#F9FAFB] text-gray-600">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium">序号</th>
                      <th className="px-3 py-3 text-left font-medium">姓名</th>
                      <th className="px-3 py-3 text-left font-medium">证件号码</th>
                      <th className="px-3 py-3 text-left font-medium">准考证号</th>
                      <th className="px-3 py-3 text-left font-medium">职业工种</th>
                      <th className="px-3 py-3 text-left font-medium">证书编号</th>
                      <th className="px-3 py-3 text-left font-medium">颁证时间</th>
                      <th className="px-3 py-3 text-left font-medium">考试成绩</th>
                      <th className="px-3 py-3 text-left font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {candidatePlan.candidates.map((candidate, index) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-3 py-3 font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">{candidate.idCard}</td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">{candidate.ticketNo}</td>
                        <td className="px-3 py-3 text-gray-600">{candidate.occupation}（{candidate.level}）</td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">{candidate.certNo}</td>
                        <td className="px-3 py-3 text-gray-600">{candidate.issueDate}</td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          <div>理论成绩：{candidate.theoryScore}</div>
                          <div>技能成绩：{candidate.skillScore}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCertCandidate(candidate)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                              <Award className="h-3.5 w-3.5" />证书
                            </button>
                            <button onClick={() => setEventCandidate(candidate)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                              <History className="h-3.5 w-3.5" />考生事件
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!certCandidate} onOpenChange={() => setCertCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>考生证书</DialogTitle></DialogHeader>
          {certCandidate && (
            <div className="border-4 border-[#1A56DB] bg-white p-8">
              <div className="mx-auto max-w-xl text-center">
                <div className="text-2xl font-bold tracking-wide text-gray-900">职业技能等级证书</div>
                <div className="mt-2 font-mono text-sm text-gray-500">{certCandidate.certNo}</div>
                <div className="mt-8 grid grid-cols-2 gap-4 text-left text-sm text-gray-700">
                  <Info label="姓名" value={certCandidate.name} />
                  <Info label="证件号码" value={certCandidate.idCard} />
                  <Info label="职业工种" value={certCandidate.occupation} />
                  <Info label="技能等级" value={certCandidate.level} />
                  <Info label="准考证号" value={certCandidate.ticketNo} />
                  <Info label="颁证日期" value={certCandidate.issueDate} />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => toast.success('证书已下载')}>
              <Download className="mr-2 h-4 w-4" />下载证书
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!eventCandidate} onOpenChange={() => setEventCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>考生事件 - {eventCandidate?.name}</DialogTitle></DialogHeader>
          {eventCandidate && (
            <div className="space-y-3">
              {eventCandidate.events.map(event => (
                <div key={event.id} className="rounded-md border border-gray-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{event.step}</div>
                    <div className="text-xs text-gray-500">{event.time}</div>
                  </div>
                  <div className="mt-2 text-gray-600">{event.result}</div>
                  <div className="mt-1 text-xs text-gray-500">处理人员：{event.operator}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!morePlan} onOpenChange={() => setMorePlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>更多 - {morePlan?.title}</DialogTitle></DialogHeader>
          {morePlan && (
            <div className="space-y-3">
              <button onClick={() => { setStatsPlan(morePlan); setMorePlan(null) }} className="flex w-full items-center gap-3 rounded-md border border-gray-100 px-3 py-3 text-left text-sm hover:bg-gray-50">
                <BarChart3 className="h-4 w-4 text-[#1A56DB]" />
                <span>
                  <span className="block font-medium text-gray-900">数据统计</span>
                  <span className="text-xs text-gray-500">查看报名、通过、发证和通过率</span>
                </span>
              </button>
              <button onClick={() => { exportSinglePlan(morePlan, true); setMorePlan(null) }} className="flex w-full items-center gap-3 rounded-md border border-gray-100 px-3 py-3 text-left text-sm hover:bg-gray-50">
                <FileText className="h-4 w-4 text-[#1A56DB]" />
                <span>
                  <span className="block font-medium text-gray-900">下载报表</span>
                  <span className="text-xs text-gray-500">下载当前计划的统计报表</span>
                </span>
              </button>
              <button onClick={() => { exportSinglePlan(morePlan, false); setMorePlan(null) }} className="flex w-full items-center gap-3 rounded-md border border-gray-100 px-3 py-3 text-left text-sm hover:bg-gray-50">
                <FileArchive className="h-4 w-4 text-[#1A56DB]" />
                <span>
                  <span className="block font-medium text-gray-900">导出证书</span>
                  <span className="text-xs text-gray-500">打包下载历史证书上报数据</span>
                </span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!statsPlan} onOpenChange={() => setStatsPlan(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>数据统计 - {statsPlan?.title}</DialogTitle></DialogHeader>
          {statsPlan && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat icon={<UserRound className="h-5 w-5 text-[#1A56DB]" />} label="报名人数" value={`${statsPlan.total}人`} />
              <Stat icon={<CheckCircle className="h-5 w-5 text-green-600" />} label="通过人数" value={`${statsPlan.passed}人`} />
              <Stat icon={<Award className="h-5 w-5 text-amber-600" />} label="发证数量" value={`${statsPlan.certCount}本`} />
              <Stat icon={<BarChart3 className="h-5 w-5 text-purple-600" />} label="通过率" value={`${((statsPlan.passed / statsPlan.total) * 100).toFixed(1)}%`} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900">{value}</div>
    </div>
  )
}

function InlineChoice({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-44">{label}：</span>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`inline-flex items-center gap-1 text-sm ${value === option ? 'text-[#1A56DB]' : 'text-gray-500'}`}
        >
          <span className={`h-3.5 w-3.5 rounded-full border ${value === option ? 'border-[#1A56DB]' : 'border-gray-300'}`}>
            <span className={`m-[3px] block h-1.5 w-1.5 rounded-full ${value === option ? 'bg-[#1A56DB]' : 'bg-transparent'}`} />
          </span>
          {option}
        </button>
      ))}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-4 text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-50">{icon}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  )
}
