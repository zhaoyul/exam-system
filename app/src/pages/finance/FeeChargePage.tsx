import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, CheckCircle, AlertCircle } from 'lucide-react'

interface ChargeItem {
  id: string
  batchNo: string
  candidateName: string
  idCard: string
  profession: string
  level: string
  planName: string
  site: string
  amount: number
  status: 'unpaid' | 'paid' | 'refunded'
  payDate: string
  payMethod: string
}

const mockCharges: ChargeItem[] = [
  { id: '1', batchNo: 'B-202604-001', candidateName: '赵考生', idCard: '110101199101010017', profession: '道路客运汽车驾驶员', level: '五级', planName: '20220327中国同辐第3批认定', site: '中国同辐股份有限公司', amount: 200, status: 'unpaid', payDate: '', payMethod: '' },
  { id: '2', batchNo: 'B-202604-001', candidateName: '钱考生', idCard: '110101199101010041', profession: '道路客运汽车驾驶员', level: '五级', planName: '20220327中国同辐第3批认定', site: '中国同辐股份有限公司', amount: 200, status: 'unpaid', payDate: '', payMethod: '' },
  { id: '3', batchNo: 'B-202604-002', candidateName: '孙考生', idCard: '440301199002022345', profession: '核反应堆运行值班员', level: '三级', planName: '20220324中国同辐第2批认定', site: '中国同辐股份有限公司', amount: 400, status: 'paid', payDate: '2022-03-25', payMethod: '对公转账' },
  { id: '4', batchNo: 'B-202604-002', candidateName: '李考生', idCard: '440301199003033456', profession: '电气试验员', level: '四级', planName: '20220324中国同辐第2批认定', site: '中国同辐股份有限公司', amount: 300, status: 'paid', payDate: '2022-03-25', payMethod: '线上支付' },
  { id: '5', batchNo: 'B-202604-003', candidateName: '周考生', idCard: '440301199004044567', profession: '焊接工', level: '五级', planName: '20220324中国同辐第2批认定', site: '中国同辐股份有限公司', amount: 150, status: 'unpaid', payDate: '', payMethod: '' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: '待缴费', color: 'bg-red-100 text-red-700' },
  paid: { label: '已缴费', color: 'bg-green-100 text-green-700' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-700' },
}

export default function FeeChargePage() {
  const [charges, setCharges] = useState<ChargeItem[]>(mockCharges)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  const filtered = charges.filter(c => {
    const m = !search || c.candidateName.includes(search) || c.idCard.includes(search)
    const s = statusFilter === 'all' || c.status === statusFilter
    const p = planFilter === 'all' || c.planName.includes(planFilter)
    return m && s && p
  })

  const handlePay = (id: string) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status: 'paid' as const, payDate: new Date().toISOString().split('T')[0], payMethod: '线上支付' } : c))
    toast.success('标记缴费成功')
  }

  const handleRefund = (id: string) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status: 'refunded' as const } : c))
    toast.success('已标记退款')
  }

  const stats = {
    total: charges.reduce((sum, c) => sum + c.amount, 0),
    unpaid: charges.filter(c => c.status === 'unpaid').reduce((sum, c) => sum + c.amount, 0),
    paid: charges.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    count: charges.length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">财务收费</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">应收总额</div>
          <div className="text-2xl font-bold text-gray-900">¥{stats.total}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-red-200">
          <div className="text-sm text-red-600">待缴金额</div>
          <div className="text-2xl font-bold text-red-700">¥{stats.unpaid}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">已收金额</div>
          <div className="text-2xl font-bold text-green-700">¥{stats.paid}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">考生人数</div>
          <div className="text-2xl font-bold text-blue-700">{stats.count}人</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索考生姓名、证件号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="unpaid">待缴费</SelectItem>
            <SelectItem value="paid">已缴费</SelectItem>
            <SelectItem value="refunded">已退款</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部计划</SelectItem>
            <SelectItem value="20220327">20220327中国同辐第3批</SelectItem>
            <SelectItem value="20220324">20220324中国同辐第2批</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">批次号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">考生姓名</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">证件号码</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">职业工种</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">等级</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">认定计划</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">站点</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">应收金额</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">缴费状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">缴费日期</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">缴费方式</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c, idx) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-600">{c.batchNo}</td>
                <td className="px-3 py-3 font-medium text-gray-900">{c.candidateName}</td>
                <td className="px-3 py-3 text-gray-600 font-mono text-xs">{c.idCard}</td>
                <td className="px-3 py-3 text-gray-600">{c.profession}</td>
                <td className="px-3 py-3"><Badge className="text-[10px] bg-blue-50 text-blue-700">{c.level}</Badge></td>
                <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">{c.planName}</td>
                <td className="px-3 py-3 text-gray-600">{c.site}</td>
                <td className="px-3 py-3 text-right font-medium text-gray-900">¥{c.amount}</td>
                <td className="px-3 py-3"><Badge className={`text-[10px] ${statusMap[c.status].color}`}>{statusMap[c.status].label}</Badge></td>
                <td className="px-3 py-3 text-gray-600">{c.payDate || '--'}</td>
                <td className="px-3 py-3 text-gray-600">{c.payMethod || '--'}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {c.status === 'unpaid' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handlePay(c.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" />确认缴费
                      </Button>
                    )}
                    {c.status === 'paid' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600" onClick={() => handleRefund(c.id)}>
                        <AlertCircle className="w-3 h-3 mr-1" />退款
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
