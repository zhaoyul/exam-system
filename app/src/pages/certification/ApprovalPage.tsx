import { useMemo, useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, FileText, MoreHorizontal, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type ApprovalStatus = '待批复' | '已通过' | '已退回'
type ApprovalType = '制定计划' | '考场编排' | '考试成绩' | '成绩公示' | '证书制证'

interface ApprovalItem {
  id: string
  code: string
  planName: string
  node: ApprovalType
  org: string
  submitter: string
  submitTime: string
  status: ApprovalStatus
  auditor?: string
  auditTime?: string
  auditOpinion?: string
  materials: string[]
  reportName: string
  candidates: number
  job: string
  level: string
}

const initialApprovals: ApprovalItem[] = [
  {
    id: 'a1',
    code: '26440310050002',
    planName: '20260402中广核测试第2批认定',
    node: '制定计划',
    org: '中广测试有限公司',
    submitter: 'Csyxgs001cs',
    submitTime: '2026-05-18 09:22',
    status: '待批复',
    materials: ['认定计划申报表.pdf', '考生规模说明.docx'],
    reportName: '计划报表-26440310050002.xlsx',
    candidates: 132,
    job: '电工',
    level: '三级',
  },
  {
    id: 'a2',
    code: '26440310050003',
    planName: '20260412防城港核电第3批认定',
    node: '考试成绩',
    org: '防城港核电有限公司',
    submitter: 'fcg001',
    submitTime: '2026-05-18 14:36',
    status: '待批复',
    materials: ['成绩汇总表.xlsx', '异常成绩说明.pdf'],
    reportName: '成绩报表-26440310050003.xlsx',
    candidates: 86,
    job: '核反应堆运行值班员',
    level: '四级',
  },
  {
    id: 'a3',
    code: '26440310050004',
    planName: '20260508阳江核电第1批认定',
    node: '考场编排',
    org: '阳江核电有限公司',
    submitter: 'yjhdyxgs',
    submitTime: '2026-05-17 11:10',
    status: '已通过',
    auditor: '集团管理员',
    auditTime: '2026-05-17 15:32',
    auditOpinion: '编排材料齐全，同意进入考务安排。',
    materials: ['考场编排表.xlsx'],
    reportName: '编排报表-26440310050004.xlsx',
    candidates: 64,
    job: '继电保护员',
    level: '三级',
  },
  {
    id: 'a4',
    code: '26440310050005',
    planName: '20260512台山核电第2批认定',
    node: '证书制证',
    org: '台山核电合营有限公司',
    submitter: 'tshd001',
    submitTime: '2026-05-16 16:45',
    status: '已退回',
    auditor: '集团管理员',
    auditTime: '2026-05-16 18:05',
    auditOpinion: '证书生成确认表缺少机构盖章，请补充后重新提交。',
    materials: ['证书生成确认表.pdf'],
    reportName: '证书制证报表-26440310050005.xlsx',
    candidates: 51,
    job: '电气值班员',
    level: '五级',
  },
]

const statusTabs = ['待批复', '已批复'] as const
const nodeFilters: Array<'全部' | ApprovalType> = ['全部', '制定计划', '考场编排', '考试成绩', '成绩公示', '证书制证']

export default function ApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>(initialApprovals)
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]>('待批复')
  const [nodeFilter, setNodeFilter] = useState<'全部' | ApprovalType>('全部')
  const [search, setSearch] = useState('')
  const [detailItem, setDetailItem] = useState<ApprovalItem | null>(null)
  const [auditItem, setAuditItem] = useState<ApprovalItem | null>(null)
  const [auditResult, setAuditResult] = useState<'通过' | '退回'>('通过')
  const [auditOpinion, setAuditOpinion] = useState('')

  const filtered = useMemo(() => {
    return items.filter(item => {
      const byTab = activeTab === '待批复' ? item.status === '待批复' : item.status !== '待批复'
      const byNode = nodeFilter === '全部' || item.node === nodeFilter
      const bySearch = !search || item.planName.includes(search) || item.code.includes(search) || item.org.includes(search)
      return byTab && byNode && bySearch
    })
  }, [activeTab, items, nodeFilter, search])

  const pendingCount = items.filter(item => item.status === '待批复').length
  const doneCount = items.length - pendingCount

  const openAudit = (item: ApprovalItem) => {
    setAuditItem(item)
    setAuditResult('通过')
    setAuditOpinion('')
  }

  const submitAudit = () => {
    if (!auditItem) return
    if (!auditOpinion.trim()) {
      toast.error('请填写批复意见')
      return
    }
    const status: ApprovalStatus = auditResult === '通过' ? '已通过' : '已退回'
    setItems(prev => prev.map(item => item.id === auditItem.id ? {
      ...item,
      status,
      auditor: '集团管理员',
      auditTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      auditOpinion,
    } : item))
    setAuditItem(null)
    toast.success(auditResult === '通过' ? '批复已通过' : '批复已退回')
  }

  const statusBadge = (status: ApprovalStatus) => {
    if (status === '已通过') return <Badge className="bg-green-50 text-green-700">{status}</Badge>
    if (status === '已退回') return <Badge className="bg-red-50 text-red-700">{status}</Badge>
    return <Badge className="bg-amber-50 text-amber-700">{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">认定批复</h1>
          <p className="mt-1 text-sm text-gray-500">查看分支机构提交的待批复项目，下载材料后进行通过或退回处理</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('批复列表已导出')}>
          <Download className="mr-2 h-4 w-4" />导出
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="待批复" value={pendingCount} tone="amber" />
        <StatCard label="已批复" value={doneCount} tone="green" />
        <StatCard label="需上传材料" value={items.filter(item => item.materials.length > 0).length} tone="blue" />
        <StatCard label="已退回" value={items.filter(item => item.status === '已退回').length} tone="red" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex items-center gap-2">
            {statusTabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`h-9 rounded-md px-4 text-sm font-medium ${activeTab === tab ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
            <select value={nodeFilter} onChange={event => setNodeFilter(event.target.value as typeof nodeFilter)} className="h-9 rounded-md border border-gray-200 px-2 text-sm">
              {nodeFilters.map(node => <option key={node}>{node}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="计划名称 / 编号 / 机构" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">计划编号</th>
                <th className="px-4 py-3 text-left font-medium">计划名称</th>
                <th className="px-4 py-3 text-left font-medium">批复节点</th>
                <th className="px-4 py-3 text-left font-medium">提交机构</th>
                <th className="px-4 py-3 text-left font-medium">提交账号</th>
                <th className="px-4 py-3 text-left font-medium">提交时间</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-gray-900"><FileText className="h-4 w-4 text-[#1A56DB]" />{item.planName}</div>
                    <div className="mt-1 text-xs text-gray-500">{item.job} / {item.level} / {item.candidates}人</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.node}</td>
                  <td className="px-4 py-3 text-gray-600">{item.org}</td>
                  <td className="px-4 py-3 text-gray-600">{item.submitter}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.submitTime}</td>
                  <td className="px-4 py-3">{statusBadge(item.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline"><MoreHorizontal className="h-3.5 w-3.5" />计划信息</button>
                      <button onClick={() => toast.success(`${item.reportName} 已开始下载`)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1A56DB]"><FileSpreadsheet className="h-3.5 w-3.5" />计划报表</button>
                      {item.status === '待批复' && <button onClick={() => openAudit(item)} className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline"><CheckCircle2 className="h-3.5 w-3.5" />批复</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>计划信息</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-semibold text-gray-900">{detailItem.planName}</div>
                <div className="mt-1 text-xs text-gray-500">{detailItem.code} / {detailItem.node}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info label="提交机构" value={detailItem.org} />
                <Info label="提交账号" value={detailItem.submitter} />
                <Info label="职业工种" value={detailItem.job} />
                <Info label="等级" value={detailItem.level} />
                <Info label="考生人数" value={`${detailItem.candidates}人`} />
                <Info label="提交时间" value={detailItem.submitTime} />
              </div>
              <div>
                <div className="mb-2 font-medium text-gray-700">上传材料</div>
                <div className="flex flex-wrap gap-2">
                  {detailItem.materials.map(file => (
                    <button key={file} onClick={() => toast.success(`${file} 已开始下载`)} className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:border-[#1A56DB] hover:text-[#1A56DB]">
                      <Download className="h-3.5 w-3.5" />{file}
                    </button>
                  ))}
                </div>
              </div>
              {detailItem.auditOpinion && (
                <div className="rounded-md border border-gray-100 p-3">
                  <div className="font-medium text-gray-700">批复记录</div>
                  <div className="mt-2 text-gray-600">{detailItem.auditor} / {detailItem.auditTime}</div>
                  <div className="mt-1 text-gray-800">{detailItem.auditOpinion}</div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.success(`${detailItem.reportName} 已开始下载`)}>计划报表</Button>
                {detailItem.status === '待批复' && <Button onClick={() => { setDetailItem(null); openAudit(detailItem) }}>批复</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!auditItem} onOpenChange={() => setAuditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>认定批复</DialogTitle></DialogHeader>
          {auditItem && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-medium text-gray-900">{auditItem.planName}</div>
                <div className="mt-1 text-xs text-gray-500">{auditItem.node} / {auditItem.org}</div>
              </div>
              <div>
                <div className="mb-2 font-medium text-gray-700">批复结果</div>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5"><input type="radio" checked={auditResult === '通过'} onChange={() => setAuditResult('通过')} />通过</label>
                  <label className="inline-flex items-center gap-1.5"><input type="radio" checked={auditResult === '退回'} onChange={() => setAuditResult('退回')} />退回</label>
                </div>
              </div>
              <label className="block">
                <span className="font-medium text-gray-700">批复意见</span>
                <textarea value={auditOpinion} onChange={event => setAuditOpinion(event.target.value)} placeholder={auditResult === '通过' ? '请输入通过意见' : '请输入退回原因'} className="mt-1 h-28 w-full rounded-md border border-gray-200 px-3 py-2 focus:border-[#1A56DB] focus:outline-none" />
              </label>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <Button variant="outline" onClick={() => setAuditItem(null)}>取消</Button>
                <Button onClick={submitAudit} className={auditResult === '通过' ? 'bg-[#1A56DB] hover:bg-[#1748B5]' : 'bg-red-600 hover:bg-red-700'}>
                  {auditResult === '通过' ? <CheckCircle2 className="mr-1 h-4 w-4" /> : <RotateCcw className="mr-1 h-4 w-4" />}
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'green' | 'blue' | 'red' }) {
  const color = {
    amber: 'text-amber-700',
    green: 'text-green-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
  }[tone]
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
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
