import { useMemo, useState } from 'react'
import { CalendarDays, Download, Eye, FileText, RefreshCcw, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type ReportStatus = '待上报' | '已上报' | '上报失败'
type Dimension = '职业工种' | '评价机构' | '认定批次'

interface CertReportItem {
  id: string
  month: string
  batch: string
  org: string
  job: string
  level: string
  certificateCount: number
  candidateCount: number
  issueDate: string
  status: ReportStatus
  reportNo?: string
  failReason?: string
}

const initialReports: CertReportItem[] = [
  { id: 'r1', month: '2026-05', batch: '20260402中广核测试第2批认定', org: '中广测试有限公司', job: '电工', level: '三级', certificateCount: 82, candidateCount: 96, issueDate: '2026-05-18', status: '待上报' },
  { id: 'r2', month: '2026-05', batch: '20260412防城港核电第3批认定', org: '防城港核电有限公司', job: '核反应堆运行值班员', level: '四级', certificateCount: 54, candidateCount: 61, issueDate: '2026-05-19', status: '待上报' },
  { id: 'r3', month: '2026-05', batch: '20260508阳江核电第1批认定', org: '阳江核电有限公司', job: '继电保护员', level: '三级', certificateCount: 38, candidateCount: 42, issueDate: '2026-05-16', status: '已上报', reportNo: 'SB20260516001' },
  { id: 'r4', month: '2026-04', batch: '20260401台山核电第2批认定', org: '台山核电合营有限公司', job: '电气值班员', level: '五级', certificateCount: 46, candidateCount: 50, issueDate: '2026-04-28', status: '上报失败', failReason: '省级接口返回：证书照片缺失' },
]

const dimensions: Dimension[] = ['职业工种', '评价机构', '认定批次']

export default function CertReportPage() {
  const [items, setItems] = useState<CertReportItem[]>(initialReports)
  const [month, setMonth] = useState('2026-05')
  const [dimension, setDimension] = useState<Dimension>('职业工种')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [viewItem, setViewItem] = useState<CertReportItem | null>(null)

  const filtered = useMemo(() => {
    return items.filter(item => {
      const byMonth = item.month === month
      const bySearch = !search || item.batch.includes(search) || item.org.includes(search) || item.job.includes(search)
      return byMonth && bySearch
    })
  }, [items, month, search])

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; certificateCount: number; candidateCount: number; pending: number; uploaded: number; failed: number }>()
    filtered.forEach(item => {
      const key = dimension === '职业工种' ? item.job : dimension === '评价机构' ? item.org : item.batch
      const current = map.get(key) || { key, certificateCount: 0, candidateCount: 0, pending: 0, uploaded: 0, failed: 0 }
      current.certificateCount += item.certificateCount
      current.candidateCount += item.candidateCount
      if (item.status === '待上报') current.pending += 1
      if (item.status === '已上报') current.uploaded += 1
      if (item.status === '上报失败') current.failed += 1
      map.set(key, current)
    })
    return Array.from(map.values())
  }, [dimension, filtered])

  const selectedItems = filtered.filter(item => selected.includes(item.id))
  const allChecked = filtered.length > 0 && filtered.every(item => selected.includes(item.id))
  const pendingSelected = selectedItems.filter(item => item.status !== '已上报')

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? filtered.map(item => item.id) : [])
  }

  const toggleRow = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const uploadRows = (targets: CertReportItem[]) => {
    if (targets.length === 0) {
      toast.error('请选择待上报或上报失败的数据')
      return
    }
    setItems(prev => prev.map(item => targets.some(target => target.id === item.id) ? {
      ...item,
      status: '已上报' as ReportStatus,
      reportNo: `SB${item.month.replace('-', '')}${item.id.toUpperCase()}`,
      failReason: undefined,
    } : item))
    toast.success(`已上报 ${targets.length} 条证书数据`)
  }

  const uploadSelected = () => {
    uploadRows(pendingSelected)
  }

  const cancelRows = (targets: CertReportItem[]) => {
    if (targets.length === 0) {
      toast.error('请选择已上报的数据')
      return
    }
    setItems(prev => prev.map(item => targets.some(target => target.id === item.id) ? { ...item, status: '待上报' as ReportStatus, reportNo: undefined } : item))
    toast.success(`已取消 ${targets.length} 条上报记录`)
  }

  const cancelUpload = () => {
    cancelRows(selectedItems.filter(item => item.status === '已上报'))
  }

  const exportData = (scope: '统计' | '证书') => {
    if (scope === '证书' && selected.length === 0) {
      toast.error('请先选择机构或批次数据')
      return
    }
    toast.success(scope === '统计' ? `${month} 上报统计数据已导出` : `已导出 ${selected.length} 条所选证书数据`)
  }

  const statusBadge = (status: ReportStatus) => {
    if (status === '已上报') return <Badge className="bg-green-50 text-green-700">{status}</Badge>
    if (status === '上报失败') return <Badge className="bg-red-50 text-red-700">{status}</Badge>
    return <Badge className="bg-amber-50 text-amber-700">{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">证书上报</h1>
          <p className="mt-1 text-sm text-gray-500">按月份统计证书数据，支持按职业工种、评价机构、认定批次查看并上报</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('统计')}><Download className="mr-2 h-4 w-4" />导出上报数据</Button>
          <Button variant="outline" disabled={selected.length === 0} onClick={() => exportData('证书')}><Download className="mr-2 h-4 w-4" />导出选择机构的证书</Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 text-[#1A56DB]" />
              时间月份
              <input type="month" value={month} onChange={event => { setMonth(event.target.value); setSelected([]) }} className="h-9 rounded-md border border-gray-200 px-2 text-sm" />
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="机构 / 工种 / 批次" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={uploadSelected} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Upload className="mr-2 h-4 w-4" />上报</Button>
            <Button variant="outline" onClick={cancelUpload}><RefreshCcw className="mr-2 h-4 w-4" />取消上报</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard label="证书总数" value={filtered.reduce((sum, item) => sum + item.certificateCount, 0)} tone="blue" />
          <StatCard label="待上报批次" value={filtered.filter(item => item.status === '待上报').length} tone="amber" />
          <StatCard label="已上报批次" value={filtered.filter(item => item.status === '已上报').length} tone="green" />
          <StatCard label="异常批次" value={filtered.filter(item => item.status === '上报失败').length} tone="red" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex items-center gap-2">
          {dimensions.map(item => (
            <button key={item} onClick={() => setDimension(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${dimension === item ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {grouped.map(item => (
            <div key={item.key} className="rounded-md border border-gray-100 p-3">
              <div className="font-medium text-gray-900">{item.key}</div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                <div><div className="text-base font-bold text-gray-900">{item.certificateCount}</div><div className="text-gray-500">证书</div></div>
                <div><div className="text-base font-bold text-amber-700">{item.pending}</div><div className="text-gray-500">待报</div></div>
                <div><div className="text-base font-bold text-green-700">{item.uploaded}</div><div className="text-gray-500">已报</div></div>
                <div><div className="text-base font-bold text-red-700">{item.failed}</div><div className="text-gray-500">异常</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="w-12 px-4 py-3 text-left"><input type="checkbox" checked={allChecked} onChange={event => toggleAll(event.target.checked)} /></th>
              <th className="px-4 py-3 text-left font-medium">认定批次</th>
              <th className="px-4 py-3 text-left font-medium">评价机构</th>
              <th className="px-4 py-3 text-left font-medium">职业工种</th>
              <th className="px-4 py-3 text-left font-medium">等级</th>
              <th className="px-4 py-3 text-right font-medium">考生数</th>
              <th className="px-4 py-3 text-right font-medium">证书数</th>
              <th className="px-4 py-3 text-left font-medium">制证日期</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleRow(item.id)} /></td>
                <td className="px-4 py-3 font-medium text-gray-900"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-[#1A56DB]" />{item.batch}</span></td>
                <td className="px-4 py-3 text-gray-600">{item.org}</td>
                <td className="px-4 py-3 text-gray-600">{item.job}</td>
                <td className="px-4 py-3 text-gray-600">{item.level}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.candidateCount}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.certificateCount}</td>
                <td className="px-4 py-3 text-gray-600">{item.issueDate}</td>
                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.status !== '已上报' && <button onClick={() => uploadRows([item])} className="text-xs text-[#1A56DB] hover:underline">上报</button>}
                    {item.status === '已上报' && <button onClick={() => cancelRows([item])} className="text-xs text-gray-600 hover:underline">取消</button>}
                    <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1A56DB]"><Eye className="h-3.5 w-3.5" />详情</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>上报详情</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-medium text-gray-900">{viewItem.batch}</div>
                <div className="mt-1 text-xs text-gray-500">{viewItem.org} / {viewItem.month}</div>
              </div>
              <Info label="职业工种" value={viewItem.job} />
              <Info label="等级" value={viewItem.level} />
              <Info label="考生数" value={`${viewItem.candidateCount}人`} />
              <Info label="证书数" value={`${viewItem.certificateCount}本`} />
              <Info label="上报状态" value={viewItem.status} />
              {viewItem.reportNo && <Info label="上报流水号" value={viewItem.reportNo} />}
              {viewItem.failReason && <div className="rounded-md border border-red-100 bg-red-50 p-3 text-red-700">{viewItem.failReason}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'amber' | 'green' | 'red' }) {
  const color = {
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    green: 'text-green-700',
    red: 'text-red-700',
  }[tone]
  return (
    <div className="rounded-md border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
