import { useMemo, useState } from 'react'
import {
  BookOpenCheck,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileBadge,
  FileCheck2,
  FileSearch,
  ListChecks,
  MapPinned,
  Search,
  ShieldCheck,
  UserRoundSearch,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

type SupervisionTab = '等级认定' | '认定申报' | '一人多证查询'
type FlowKey = '制定计划' | '考试报名' | '考场编排' | '考务安排' | '成绩管理' | '成绩公示' | '证书管理'
type PlanStatus = '进行中' | '待提交' | '已完成' | '已退回'

interface SupervisionPlan {
  id: string
  name: string
  code: string
  org: string
  site: string
  flow: FlowKey
  submitTime: string
  examDate: string
  status: PlanStatus
  candidates: number
  contact: string
}

interface Declaration {
  id: string
  org: string
  scope: string
  submitTime: string
  reviewer: string
  status: PlanStatus
}

interface DuplicateCert {
  id: string
  name: string
  idCard: string
  certs: string[]
  latestOrg: string
  latestDate: string
}

const flowSteps: Array<{ key: FlowKey; icon: typeof FileCheck2; color: string }> = [
  { key: '制定计划', icon: FileCheck2, color: 'bg-rose-500' },
  { key: '考试报名', icon: UsersRound, color: 'bg-orange-500' },
  { key: '考场编排', icon: MapPinned, color: 'bg-emerald-500' },
  { key: '考务安排', icon: ShieldCheck, color: 'bg-sky-500' },
  { key: '成绩管理', icon: BookOpenCheck, color: 'bg-violet-500' },
  { key: '成绩公示', icon: FileSearch, color: 'bg-amber-700' },
  { key: '证书管理', icon: FileBadge, color: 'bg-pink-500' },
]

const initialPlans: SupervisionPlan[] = [
  {
    id: '1',
    name: '20260402中广核测试第2批认定',
    code: '26440310050002',
    org: '中广测试有限公司（全国性用人单位分支机构）',
    site: '深圳市中广核',
    flow: '制定计划',
    submitTime: '2026-04-02 10:30',
    examDate: '2026-05-20',
    status: '进行中',
    candidates: 136,
    contact: '王老师 13800138001',
  },
  {
    id: '2',
    name: '2026年集团焊工技能等级认定',
    code: '26440310050003',
    org: '阳江核电有限公司',
    site: '阳江核电培训中心',
    flow: '考试报名',
    submitTime: '2026-04-18 09:12',
    examDate: '2026-06-12',
    status: '进行中',
    candidates: 82,
    contact: '李老师 13900139001',
  },
  {
    id: '3',
    name: '2026年运行值班员专项认定',
    code: '26440310050004',
    org: '大亚湾核电运营管理有限责任公司',
    site: '大亚湾实训基地',
    flow: '成绩公示',
    submitTime: '2026-03-28 15:40',
    examDate: '2026-04-25',
    status: '待提交',
    candidates: 64,
    contact: '陈老师 13700137001',
  },
]

const declarations: Declaration[] = [
  { id: 'd1', org: '中广核工程有限公司', scope: '电气设备安装工、核电运行值班员', submitTime: '2026-04-12 14:20', reviewer: '集团中心', status: '进行中' },
  { id: 'd2', org: '台山核电合营有限公司', scope: '起重装卸机械操作工', submitTime: '2026-03-30 11:05', reviewer: '集团中心', status: '已完成' },
  { id: 'd3', org: '防城港核电有限公司', scope: '仪器仪表维修工', submitTime: '2026-03-26 16:10', reviewer: '集团中心', status: '已退回' },
]

const duplicateCerts: DuplicateCert[] = [
  { id: 'c1', name: '张伟', idCard: '440301199001011234', certs: ['电工四级', '电工三级'], latestOrg: '大亚湾核电', latestDate: '2026-04-25' },
  { id: 'c2', name: '刘敏', idCard: '440301199203032345', certs: ['焊工四级', '钳工四级'], latestOrg: '阳江核电', latestDate: '2026-05-12' },
]

export default function Supervision() {
  const [activeTab, setActiveTab] = useState<SupervisionTab>('等级认定')
  const [activeFlow, setActiveFlow] = useState<FlowKey>('制定计划')
  const [queryType, setQueryType] = useState('计划名称')
  const [query, setQuery] = useState('')
  const [orgFilter, setOrgFilter] = useState('全部机构')
  const [viewPlan, setViewPlan] = useState<SupervisionPlan | null>(null)
  const [plans] = useBackendListState<SupervisionPlan>(initialPlans)
  const declarationRows = useBackendResourceList<Declaration>('/certification/declaration', declarations)
  const duplicateCertRows = useBackendResourceList<DuplicateCert>('/certification/public-query', duplicateCerts)

  const orgs = useMemo(() => ['全部机构', ...Array.from(new Set(plans.map(item => item.org)))], [plans])

  const flowCounts = useMemo(() => {
    return flowSteps.reduce<Record<FlowKey, number>>((acc, step) => {
      acc[step.key] = plans.filter(item => item.flow === step.key).length
      return acc
    }, {} as Record<FlowKey, number>)
  }, [plans])

  const filteredPlans = plans.filter(item => {
    const matchesFlow = item.flow === activeFlow
    const matchesOrg = orgFilter === '全部机构' || item.org === orgFilter
    const text = queryType === '计划名称' ? item.name : queryType === '机构名称' ? item.org : item.code
    return matchesFlow && matchesOrg && (!query || text.includes(query))
  })

  const statusClass: Record<PlanStatus, string> = {
    进行中: 'bg-blue-50 text-blue-700',
    待提交: 'bg-amber-50 text-amber-700',
    已完成: 'bg-green-50 text-green-700',
    已退回: 'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-[#1A56DB]" />
          <h1 className="text-xl font-bold text-gray-900">认定监督</h1>
        </div>
        <Button variant="outline" className="h-8 text-xs">
          <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
          导出监督台账
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
          {(['等级认定', '认定申报', '一人多证查询'] as SupervisionTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 rounded-md px-4 text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === '等级认定' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">评价机构：</span>
                <select
                  value={orgFilter}
                  onChange={event => setOrgFilter(event.target.value)}
                  className="h-8 min-w-64 rounded-md border border-gray-200 px-2 text-sm text-gray-700 focus:border-[#1A56DB] focus:outline-none"
                >
                  {orgs.map(org => <option key={org}>{org}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={queryType}
                  onChange={event => setQueryType(event.target.value)}
                  className="h-8 rounded-md border border-gray-200 px-2 text-sm text-gray-700 focus:border-[#1A56DB] focus:outline-none"
                >
                  <option>计划名称</option>
                  <option>机构名称</option>
                  <option>计划编号</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    className="h-8 w-56 rounded-md border border-gray-200 pl-8 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
                    placeholder="输入关键字"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border-y border-gray-100 px-4 py-5">
              <div className="flex min-w-[900px] items-center gap-9">
                {flowSteps.map(step => {
                  const Icon = step.icon
                  const active = activeFlow === step.key
                  return (
                    <button key={step.key} onClick={() => setActiveFlow(step.key)} className="group flex w-24 flex-col items-center gap-2">
                      <span className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-sm ${step.color}`}>
                        <Icon className="h-7 w-7" />
                      </span>
                      <span className={`border-b-2 pb-1 text-sm font-medium ${active ? 'border-[#1A56DB] text-gray-900' : 'border-transparent text-gray-600 group-hover:text-gray-900'}`}>
                        {step.key}({flowCounts[step.key]}个)
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredPlans.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setViewPlan(item)}
                  className="block w-full px-4 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="min-w-[390px] flex-1 text-sm font-semibold text-gray-900">
                      <span className="mr-1 text-[#1A56DB]">{index + 1}.</span>
                      {item.name}（{item.code}）
                    </div>
                    <div className="text-sm font-semibold text-gray-900">【{item.org}】</div>
                    <span className={`rounded px-2 py-0.5 text-xs ${statusClass[item.status]}`}>{item.status}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 md:grid-cols-4">
                    <span>认定站点：{item.site}</span>
                    <span>提交时间：{item.submitTime}</span>
                    <span>拟考日期：{item.examDate}</span>
                    <span>报名人数：{item.candidates}</span>
                  </div>
                </button>
              ))}
              {filteredPlans.length === 0 && (
                <div className="px-4 py-16 text-center text-sm text-gray-500">当前流程暂无监督数据</div>
              )}
            </div>
          </>
        )}

        {activeTab === '认定申报' && (
          <div className="overflow-auto p-4">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">申报机构</th>
                  <th className="px-4 py-3 text-left font-medium">申报职业范围</th>
                  <th className="px-4 py-3 text-left font-medium">提交时间</th>
                  <th className="px-4 py-3 text-left font-medium">审核节点</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {declarationRows.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.org}</td>
                    <td className="px-4 py-3 text-gray-600">{item.scope}</td>
                    <td className="px-4 py-3 text-gray-600">{item.submitTime}</td>
                    <td className="px-4 py-3 text-gray-600">{item.reviewer}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs ${statusClass[item.status]}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === '一人多证查询' && (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <UserRoundSearch className="h-4 w-4 text-gray-400" />
              <input className="h-8 w-72 rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none" placeholder="输入姓名或证件号码" />
              <Button className="h-8 bg-[#1A56DB] text-xs hover:bg-[#1748B5]">查询</Button>
            </div>
            <div className="grid gap-3">
              {duplicateCertRows.map(item => (
                <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-gray-900">{item.name} <span className="ml-2 text-xs font-normal text-gray-500">{item.idCard}</span></div>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{item.certs.length} 本证书</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.certs.map(cert => <span key={cert} className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600">{cert}</span>)}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">最近发证：{item.latestOrg} · {item.latestDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>监督详情</DialogTitle></DialogHeader>
          {viewPlan && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-[#F9FAFB] p-4">
                <div className="font-semibold text-gray-900">{viewPlan.name}</div>
                <div className="mt-1 text-xs text-gray-500">计划编号：{viewPlan.code}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info label="评价机构" value={viewPlan.org} />
                <Info label="当前流程" value={viewPlan.flow} />
                <Info label="认定站点" value={viewPlan.site} />
                <Info label="计划状态" value={viewPlan.status} />
                <Info label="提交时间" value={viewPlan.submitTime} />
                <Info label="拟考日期" value={viewPlan.examDate} />
                <Info label="报名人数" value={`${viewPlan.candidates}人`} />
                <Info label="联系人" value={viewPlan.contact} />
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                  <CalendarClock className="h-4 w-4 text-[#1A56DB]" />
                  监督记录
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>集团中心已接收该计划节点数据，待机构补充附件后进入下一流程。</div>
                  <div>系统已校验机构备案范围、认定职业、考试时间和站点信息。</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900">{value}</div>
    </div>
  )
}
