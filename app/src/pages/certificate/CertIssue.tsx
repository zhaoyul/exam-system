import { Fragment, useMemo, useState } from 'react'
import {
  Award,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  History,
  Printer,
  Search,
  Settings,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'
import { SITE_OPTIONS, generateCertificateNumber } from '@/lib/workflow'

type PrintState = '全部' | '已打印' | '未打印'
type BorderMode = '不打印边框' | '打印边框' | '图文边框'

interface CertBatch {
  id: string
  code: string
  title: string
  unitUid: string
  unitName: string
  filingArea: string
  siteName: string
  testMonth: string
  isPrint: boolean
  canAdjust: boolean
  items: CertBatchItem[]
  candidates: CertCandidate[]
}

interface CertBatchItem {
  id: string
  occupation: string
  level: string
  onlineCount: number
  groupCount: number
}

interface CertCandidate {
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
  status: '待确认打印' | '已打印'
  events: CertEvent[]
}

interface CertEvent {
  id: string
  time: string
  step: string
  result: string
  operator: string
}

const units = [
  { uid: 'all', name: '全部机构', type: '集团' },
  { uid: 'u1', name: '中广测试有限公司', type: '全国性用人单位分支机构' },
  { uid: 'u2', name: '福建宁A电有限公司', type: '全国性用人单位分支机构' },
  { uid: 'u3', name: '防城港核电', type: '全国性用人单位分支机构' },
]

const batches: CertBatch[] = [
  {
    id: 'p1',
    code: '22118800880003',
    title: '20220324中国同辐股份有限公司第2批认定',
    unitUid: 'u1',
    unitName: '中广测试有限公司',
    filingArea: '北京市',
    siteName: '北京市技能人才评价站',
    testMonth: '2022年04月',
    isPrint: false,
    canAdjust: true,
    items: [
      { id: 'p1-i1', occupation: '道路客运汽车驾驶员', level: '五级/初级工', onlineCount: 0, groupCount: 1 },
      { id: 'p1-i2', occupation: '抄表核算收费员', level: '五级/初级工', onlineCount: 0, groupCount: 1 },
      { id: 'p1-i3', occupation: '抄表核算收费员', level: '四级/中级工', onlineCount: 0, groupCount: 1 },
    ],
    candidates: [
      {
        id: 'c1',
        name: '张三',
        idCard: '460321191001015633',
        ticketNo: '2104271199996600001',
        occupation: '道路客运汽车驾驶员',
        level: '五级/初级工',
        certNo: 'Y001011999966215000001',
        issueDate: '2022-04-27',
        theoryScore: 92,
        skillScore: 88,
        status: '待确认打印',
        events: [
          { id: 'e1', time: '2022-03-24 09:10', step: '考试报名', result: '报名审核通过', operator: '中广测试有限公司' },
          { id: 'e2', time: '2022-04-27 16:30', step: '成绩公示', result: '公示完成', operator: '系统' },
          { id: 'e3', time: '2022-04-28 10:00', step: '证书生成', result: '证书编号已生成', operator: '机构管理员' },
        ],
      },
      {
        id: 'c2',
        name: '李四',
        idCard: '460321191001016572',
        ticketNo: '2104271199996600002',
        occupation: '抄表核算收费员',
        level: '五级/初级工',
        certNo: 'Y001011999966215000002',
        issueDate: '2022-04-27',
        theoryScore: 89,
        skillScore: 91,
        status: '待确认打印',
        events: [
          { id: 'e4', time: '2022-03-24 09:12', step: '考试报名', result: '报名审核通过', operator: '中广测试有限公司' },
          { id: 'e5', time: '2022-04-27 16:30', step: '成绩公示', result: '公示完成', operator: '系统' },
          { id: 'e6', time: '2022-04-28 10:01', step: '证书生成', result: '证书编号已生成', operator: '机构管理员' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    code: '22119999660044',
    title: '2021-04-27年第28批认定',
    unitUid: 'u2',
    unitName: '福建宁A电有限公司',
    filingArea: '北京市',
    siteName: '福建宁德技能人才评价站',
    testMonth: '2021年04月',
    isPrint: true,
    canAdjust: false,
    items: [
      { id: 'p2-i1', occupation: '秘书', level: '五级/初级工', onlineCount: 0, groupCount: 3 },
    ],
    candidates: [
      {
        id: 'c3',
        name: '王五',
        idCard: '460321191001015414',
        ticketNo: '2104271199996600003',
        occupation: '秘书',
        level: '五级/初级工',
        certNo: 'Y001011999966215000003',
        issueDate: '2021-04-27',
        theoryScore: 100,
        skillScore: 100,
        status: '已打印',
        events: [
          { id: 'e7', time: '2021-04-27 10:15', step: '证书生成', result: '证书编号已生成', operator: '机构管理员' },
          { id: 'e8', time: '2021-04-28 09:20', step: '确认打印', result: '集团确认打印', operator: '集团管理员' },
          { id: 'e9', time: '2021-04-28 09:25', step: '归档', result: '制证记录已存档', operator: '系统' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    code: '23117700550018',
    title: '2026年防城港核电检修工职业技能等级认定',
    unitUid: 'u3',
    unitName: '防城港核电',
    filingArea: '广西壮族自治区',
    siteName: '防城港核电评价站',
    testMonth: '2026年05月',
    isPrint: false,
    canAdjust: true,
    items: [
      { id: 'p3-i1', occupation: '核反应堆运行值班员', level: '三级/高级工', onlineCount: 4, groupCount: 16 },
      { id: 'p3-i2', occupation: '机械设备检修工', level: '四级/中级工', onlineCount: 2, groupCount: 11 },
    ],
    candidates: [
      {
        id: 'c4',
        name: '赵六',
        idCard: '450601199103032345',
        ticketNo: '2605201177005500018',
        occupation: '核反应堆运行值班员',
        level: '三级/高级工',
        certNo: 'Y004145117705263000018',
        issueDate: '2026-05-18',
        theoryScore: 86,
        skillScore: 90,
        status: '待确认打印',
        events: [
          { id: 'e10', time: '2026-05-08 09:00', step: '考务安排', result: '考场和考务人员已确认', operator: '防城港核电' },
          { id: 'e11', time: '2026-05-16 17:00', step: '成绩公示', result: '公示无异议', operator: '系统' },
          { id: 'e12', time: '2026-05-18 11:05', step: '提交集团', result: '待集团确认打印', operator: '机构管理员' },
        ],
      },
    ],
  },
]

export default function CertIssue() {
  const [items, setItems] = useBackendListState<CertBatch>(batches)
  const backendUnits = useBackendResourceList('/certification/organizations', units)
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState(units[0])
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [printState, setPrintState] = useState<PrintState>('未打印')
  const [borderMode, setBorderMode] = useState<BorderMode>('打印边框')
  const [printPhoto, setPrintPhoto] = useState(true)
  const [expanded, setExpanded] = useState<string[]>(['p1'])
  const [candidateBatch, setCandidateBatch] = useState<CertBatch | null>(null)
  const [teamBatch, setTeamBatch] = useState<CertBatch | null>(null)
  const [certPreview, setCertPreview] = useState<CertCandidate | null>(null)
  const [eventCandidate, setEventCandidate] = useState<CertCandidate | null>(null)

  const filtered = useMemo(() => {
    return items.filter(item => {
      const unitMatch = selectedUnit.uid === 'all' || item.unitUid === selectedUnit.uid
      const stateMatch = printState === '全部' || (printState === '已打印' ? item.isPrint : !item.isPrint)
      const searchMatch = !search || item.title.includes(search) || item.code.includes(search)
      return unitMatch && stateMatch && searchMatch
    })
  }, [items, printState, search, selectedUnit.uid])

  const totals = useMemo(() => {
    const all = items.filter(item => selectedUnit.uid === 'all' || item.unitUid === selectedUnit.uid)
    return {
      all: all.length,
      printed: all.filter(item => item.isPrint).length,
      pending: all.filter(item => !item.isPrint).length,
    }
  }, [items, selectedUnit.uid])

  const toggleExpanded = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const buildCandidateCertNo = (batch: CertBatch, candidate: CertCandidate, usedNumbers: string[]) => {
    const matchedSite = SITE_OPTIONS.find(item => item.siteName === batch.siteName)
    return generateCertificateNumber(matchedSite?.siteCode || '00000000', candidate.issueDate, candidate.level, usedNumbers)
  }

  const confirmPrint = (batch: CertBatch) => {
    const usedNumbers = items.flatMap(item => item.candidates.map(candidate => candidate.certNo))
    setItems(prev => prev.map(item => item.id === batch.id
      ? {
          ...item,
          isPrint: true,
          candidates: item.candidates.map(candidate => {
            const nextCertNo = buildCandidateCertNo(item, candidate, usedNumbers)
            usedNumbers.push(nextCertNo)
            return {
              ...candidate,
              certNo: nextCertNo,
              status: '已打印' as const,
              events: [
                ...candidate.events,
                {
                  id: `print-${candidate.id}-${Date.now()}`,
                  time: new Date().toLocaleString('zh-CN'),
                  step: '确认打印',
                  result: '集团管理员确认打印并锁定证书编号',
                  operator: '集团管理员',
                },
              ],
            }
          }),
        }
      : item))
    toast.success(`已确认打印：${batch.title}，证书编号已按站点代码 + 年度 + 等级编码 + 顺序号规则生成`)
  }

  const adjustCert = (batch: CertBatch, range: '全部' | '12级' | '345级' = '全部') => {
    toast.success(`${batch.title} 已进入证书调整：${range}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#1A56DB]" />
            <h1 className="text-xl font-bold text-gray-900">集团证书</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">查看机构提交的证书批次，进行证书查看、集体下载和集团确认打印</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('当前筛选范围证书批次已导出')}>
          <Download className="mr-2 h-4 w-4" />导出
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">机构选择</span>
            <button
              onClick={() => setUnitDialogOpen(true)}
              className="inline-flex h-9 min-w-64 items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:border-[#1A56DB]"
            >
              <span>{selectedUnit.name}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">计划名称</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="输入计划名称或编号"
                className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
              />
            </div>
            <Button className="h-9 bg-[#1A56DB] text-sm hover:bg-[#1748B5]">查询</Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            {(['全部', '已打印', '未打印'] as PrintState[]).map(item => (
              <button
                key={item}
                onClick={() => setPrintState(item)}
                className={`h-8 rounded-md px-3 text-sm ${printState === item ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {item}
                <span className="ml-1 text-xs opacity-80">
                  {item === '全部' ? totals.all : item === '已打印' ? totals.printed : totals.pending}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">证书边框设置：</span>
            {(['不打印边框', '打印边框', '图文边框'] as BorderMode[]).map(item => (
              <label key={item} className="inline-flex cursor-pointer items-center gap-1.5 text-gray-700">
                <input type="radio" checked={borderMode === item} onChange={() => setBorderMode(item)} />
                {item}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">是否打印照片：</span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-gray-700">
              <input type="radio" checked={!printPhoto} onChange={() => setPrintPhoto(false)} />否
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-gray-700">
              <input type="radio" checked={printPhoto} onChange={() => setPrintPhoto(true)} />是
            </label>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="w-10 px-3 py-3 text-left"></th>
                <th className="w-16 px-3 py-3 text-left font-medium">序号</th>
                <th className="px-3 py-3 text-left font-medium">计划编号</th>
                <th className="px-3 py-3 text-left font-medium">计划名称</th>
                <th className="px-3 py-3 text-left font-medium">备案地</th>
                <th className="px-3 py-3 text-left font-medium">站点名称</th>
                <th className="px-3 py-3 text-left font-medium">拟考月份</th>
                <th className="px-3 py-3 text-left font-medium">打印状态</th>
                <th className="px-3 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((batch, index) => (
                <Fragment key={batch.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <button onClick={() => toggleExpanded(batch.id)} className="text-gray-400 hover:text-gray-700">
                        {expanded.includes(batch.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{batch.code}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900">{batch.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{batch.unitName}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{batch.filingArea}</td>
                    <td className="px-3 py-3 text-gray-600">{batch.siteName}</td>
                    <td className="px-3 py-3 text-gray-600">{batch.testMonth}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${batch.isPrint ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {batch.isPrint ? '已打印' : '未打印'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {batch.canAdjust && (
                          <button onClick={() => adjustCert(batch)} className="text-xs text-[#1A56DB] hover:underline">
                            证书调整
                          </button>
                        )}
                        <button onClick={() => setCandidateBatch(batch)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                          <UserRound className="h-3.5 w-3.5" />考生
                        </button>
                        {!batch.isPrint ? (
                          <button onClick={() => setTeamBatch(batch)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                            <FileArchive className="h-3.5 w-3.5" />集体
                          </button>
                        ) : (
                          <button onClick={() => setTeamBatch(batch)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                            <FileArchive className="h-3.5 w-3.5" />集体证书
                          </button>
                        )}
                        {!batch.isPrint && (
                          <button onClick={() => confirmPrint(batch)} className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline">
                            <CheckCircle className="h-3.5 w-3.5" />确认打印
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded.includes(batch.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-3 py-3">
                        <table className="w-full text-sm">
                          <thead className="text-xs text-gray-500">
                            <tr>
                              <th className="w-20 px-3 py-2 text-left font-medium">序号</th>
                              <th className="px-3 py-2 text-left font-medium">职业工种</th>
                              <th className="px-3 py-2 text-left font-medium">考试级别</th>
                              <th className="px-3 py-2 text-left font-medium">网报人数</th>
                              <th className="px-3 py-2 text-left font-medium">集体报名</th>
                              <th className="px-3 py-2 text-left font-medium">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batch.items.map((item, childIndex) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-gray-600">{index + 1}-{childIndex + 1}</td>
                                <td className="px-3 py-2 text-gray-900">{item.occupation}</td>
                                <td className="px-3 py-2 text-gray-600">{item.level}</td>
                                <td className="px-3 py-2 text-gray-600">{item.onlineCount}</td>
                                <td className="px-3 py-2 text-gray-600">{item.groupCount}</td>
                                <td className="px-3 py-2">
                                  <button onClick={() => setCandidateBatch(batch)} className="text-xs text-[#1A56DB] hover:underline">
                                    考生
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">暂无证书批次</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>选择机构</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {backendUnits.map(unit => (
              <button
                key={unit.uid}
                onClick={() => {
                  setSelectedUnit(unit)
                  setUnitDialogOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                  selectedUnit.uid === unit.uid ? 'border-[#1A56DB] bg-[#E8EFFF] text-[#1A56DB]' : 'border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {unit.name}
                </span>
                <span className="text-xs text-gray-500">{unit.type}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!candidateBatch} onOpenChange={() => setCandidateBatch(null)}>
        <DialogContent className="max-h-[82vh] max-w-5xl overflow-auto">
          <DialogHeader><DialogTitle>考生信息 - {candidateBatch?.title}</DialogTitle></DialogHeader>
          {candidateBatch && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-500">共 {candidateBatch.candidates.length} 名考生</div>
                <Button variant="outline" size="sm" onClick={() => toast.success('考生成绩证书统计报表已导出')}>
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
                    {candidateBatch.candidates.map((candidate, index) => (
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
                            <button onClick={() => setCertPreview(candidate)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
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

      <Dialog open={!!teamBatch} onOpenChange={() => setTeamBatch(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{teamBatch?.isPrint ? '集体证书' : '集体'}</DialogTitle></DialogHeader>
          {teamBatch && (
            <div className="space-y-4">
              <div className="rounded-md bg-[#F9FAFB] p-3 text-sm">
                <div className="font-medium text-gray-900">{teamBatch.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {borderMode} / {printPhoto ? '打印照片' : '不打印照片'} / {teamBatch.candidates.length} 本证书
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => toast.success('集体证书 PDF 已生成，可用于批量打印')}>
                  <FileArchive className="mr-2 h-4 w-4" />证书
                </Button>
                <Button variant="outline" onClick={() => toast.success('成绩证书统计表已下载')}>
                  <FileText className="mr-2 h-4 w-4" />统计表
                </Button>
              </div>
              <div className="rounded-md border border-gray-100 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Settings className="h-4 w-4 text-[#1A56DB]" />打印设置
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <span>边框：{borderMode}</span>
                  <span>照片：{printPhoto ? '是' : '否'}</span>
                  <span>备案地：{teamBatch.filingArea}</span>
                  <span>拟考月份：{teamBatch.testMonth}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <Button variant="outline" onClick={() => setTeamBatch(null)}>返回</Button>
                {!teamBatch.isPrint && (
                  <Button className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={() => { confirmPrint(teamBatch); setTeamBatch(null) }}>
                    <CheckCircle className="mr-2 h-4 w-4" />确认打印
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!certPreview} onOpenChange={() => setCertPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>考生证书</DialogTitle></DialogHeader>
          {certPreview && (
            <div className={`bg-white p-8 ${borderMode === '不打印边框' ? 'border border-gray-100' : 'border-4 border-[#1A56DB]'}`}>
              <div className="mx-auto max-w-xl text-center">
                <div className="text-2xl font-bold tracking-wide text-gray-900">职业技能等级证书</div>
                <div className="mt-2 font-mono text-sm text-gray-500">{certPreview.certNo}</div>
                <div className="mt-8 grid grid-cols-[1fr_120px] gap-6 text-left">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <Info label="姓名" value={certPreview.name} />
                    <Info label="证件号码" value={certPreview.idCard} />
                    <Info label="职业工种" value={certPreview.occupation} />
                    <Info label="技能等级" value={certPreview.level} />
                    <Info label="准考证号" value={certPreview.ticketNo} />
                    <Info label="颁证日期" value={certPreview.issueDate} />
                  </div>
                  <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-400">
                    {printPhoto ? '照片' : '不打印照片'}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between text-sm text-gray-600">
                  <span>评价机构：中广核集团职业技能等级认定中心</span>
                  <span>状态：{certPreview.status}</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => toast.success('证书已加入打印队列')}>
              <Printer className="mr-2 h-4 w-4" />打印
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
                  <div className="mt-1 text-xs text-gray-500">操作人：{event.operator}</div>
                </div>
              ))}
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
