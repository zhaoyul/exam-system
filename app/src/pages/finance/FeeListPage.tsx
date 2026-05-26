import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download } from 'lucide-react'
import { useBackendResourceList } from '@/hooks/useBackendListState'

interface FeeListItem {
  id: string
  chargeNo: string
  candidateName: string
  idCard: string
  profession: string
  level: string
  amount: number
  status: 'charged' | 'pending' | 'cancelled'
  createDate: string
  planName: string
  site: string
  batchNo: string
}

const mockFeeList: FeeListItem[] = [
  { id: '1', chargeNo: 'F-202604-001', candidateName: '孙考生', idCard: '440301199002022345', profession: '核反应堆运行值班员', level: '三级', amount: 400, status: 'charged', createDate: '2022-03-25', planName: '20220324中国同辐第2批认定', site: '中国同辐股份有限公司', batchNo: 'B-202604-002' },
  { id: '2', chargeNo: 'F-202604-002', candidateName: '李考生', idCard: '440301199003033456', profession: '电气试验员', level: '四级', amount: 300, status: 'charged', createDate: '2022-03-25', planName: '20220324中国同辐第2批认定', site: '中国同辐股份有限公司', batchNo: 'B-202604-002' },
  { id: '3', chargeNo: 'F-202604-003', candidateName: '赵考生', idCard: '110101199101010017', profession: '道路客运汽车驾驶员', level: '五级', amount: 200, status: 'pending', createDate: '2022-04-15', planName: '20220327中国同辐第3批认定', site: '中国同辐股份有限公司', batchNo: 'B-202604-001' },
  { id: '4', chargeNo: 'F-202604-004', candidateName: '钱考生', idCard: '110101199101010041', profession: '道路客运汽车驾驶员', level: '五级', amount: 200, status: 'pending', createDate: '2022-04-15', planName: '20220327中国同辐第3批认定', site: '中国同辐股份有限公司', batchNo: 'B-202604-001' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  charged: { label: '已收费', color: 'bg-green-100 text-green-700' },
  pending: { label: '待收费', color: 'bg-red-100 text-red-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' },
}

export default function FeeListPage() {
  const feeList = useBackendResourceList<FeeListItem>('/finance/list', mockFeeList)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = feeList.filter(f => {
    const m = !search || f.candidateName.includes(search) || f.idCard.includes(search)
    const s = statusFilter === 'all' || f.status === statusFilter
    return m && s
  })

  const totalAmount = filtered.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">收费清单</h1>
        <Button variant="outline" size="sm" className="text-xs"><Download className="w-3.5 h-3.5 mr-1" />导出</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">总收费金额</div>
          <div className="text-2xl font-bold text-gray-900">¥{totalAmount}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">已收费</div>
          <div className="text-2xl font-bold text-green-700">{feeList.filter(f => f.status === 'charged').length}笔</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-red-200">
          <div className="text-sm text-red-600">待收费</div>
          <div className="text-2xl font-bold text-red-700">{feeList.filter(f => f.status === 'pending').length}笔</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索考生姓名、证件号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="charged">已收费</SelectItem>
            <SelectItem value="pending">待收费</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">收费单号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">考生姓名</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">证件号码</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">金额</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">收费日期</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">认定计划</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">站点</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">批次号</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((f, idx) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-600">{f.chargeNo}</td>
                <td className="px-3 py-3 font-medium text-gray-900">{f.candidateName}</td>
                <td className="px-3 py-3 text-gray-600 font-mono text-xs">{f.idCard}</td>
                <td className="px-3 py-3 text-gray-600">{f.profession}</td>
                <td className="px-3 py-3"><Badge className="text-[10px] bg-blue-50 text-blue-700">{f.level}</Badge></td>
                <td className="px-3 py-3 text-right font-medium text-gray-900">¥{f.amount}</td>
                <td className="px-3 py-3"><Badge className={`text-[10px] ${statusMap[f.status].color}`}>{statusMap[f.status].label}</Badge></td>
                <td className="px-3 py-3 text-gray-600">{f.createDate}</td>
                <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">{f.planName}</td>
                <td className="px-3 py-3 text-gray-600">{f.site}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-600">{f.batchNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
