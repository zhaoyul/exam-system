import { useMemo, useState } from 'react'
import { CheckCircle, Clock, FileText, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendResourceList } from '@/hooks/useBackendListState'

interface FilingChange {
  id: string
  org: string
  creditCode: string
  applyTime: string
  status: 'pending' | 'approved'
  reason: string
}

const initialRows: FilingChange[] = [
  { id: 'fm1', org: '中广测试有限公司', creditCode: '123456789QWE123', applyTime: '2026-04-22 10:30', status: 'pending', reason: '备案地由北京市调整为北京市、广东省' },
  { id: 'fm2', org: '福建宁德核电有限公司', creditCode: '91350900111111111X', applyTime: '2026-03-18 15:12', status: 'approved', reason: '新增督导人员与考点材料' },
]

export default function FilingGroupPage() {
  const rows = useBackendResourceList<FilingChange>('/filing/group', initialRows)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [keyword, setKeyword] = useState('')
  const [detail, setDetail] = useState<FilingChange | null>(null)

  const filtered = useMemo(() => rows.filter(row => (
    row.status === tab
    && (!keyword || row.org.includes(keyword) || row.creditCode.includes(keyword))
  )), [keyword, rows, tab])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">备案修改</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="申请机构"
            className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={`h-9 rounded-md px-4 text-sm ${tab === 'pending' ? 'bg-[#1A56DB] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          待审批
        </button>
        <button onClick={() => setTab('approved')} className={`h-9 rounded-md px-4 text-sm ${tab === 'approved' ? 'bg-[#1A56DB] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          已审批
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">申请机构</th>
              <th className="px-4 py-3 text-left font-medium">社会统一信用代码</th>
              <th className="px-4 py-3 text-left font-medium">申请时间</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.org}</td>
                <td className="px-4 py-3 text-gray-600">{row.creditCode}</td>
                <td className="px-4 py-3 text-gray-600">{row.applyTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(row)} className="text-xs text-[#1A56DB] hover:underline">查看</button>
                    {tab === 'pending' && <button className="text-xs text-green-600 hover:underline">审批</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <StatusCard icon={Clock} label="待审批" value={rows.filter(row => row.status === 'pending').length} />
        <StatusCard icon={CheckCircle} label="已审批" value={rows.filter(row => row.status === 'approved').length} />
      </section>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>备案修改详情</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <Info label="申请机构" value={detail.org} />
              <Info label="社会统一信用代码" value={detail.creditCode} />
              <Info label="申请时间" value={detail.applyTime} />
              <Info label="修改说明" value={detail.reason} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50"><Icon className="h-5 w-5 text-[#1A56DB]" /></div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}：</span><span className="font-medium text-gray-900">{value}</span></div>
}
