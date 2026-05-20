import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

interface LedgerItem {
  id: string
  entryNo: string
  date: string
  type: 'income' | 'expense' | 'refund'
  description: string
  amount: number
  balance: number
  relatedDoc: string
  operator: string
  planName: string
}

const mockLedger: LedgerItem[] = [
  { id: '1', entryNo: 'L-202604-001', date: '2022-03-25', type: 'income', description: '孙考生-核反应堆运行值班员三级认定费', amount: 400, balance: 400, relatedDoc: 'F-202604-002', operator: 'admin', planName: '20220324中国同辐第2批认定' },
  { id: '2', entryNo: 'L-202604-002', date: '2022-03-25', type: 'income', description: '李考生-电气试验员四级认定费', amount: 300, balance: 700, relatedDoc: 'F-202604-003', operator: 'admin', planName: '20220324中国同辐第2批认定' },
  { id: '3', entryNo: 'L-202604-003', date: '2022-03-26', type: 'income', description: '王考生-焊接工五级认定费', amount: 150, balance: 850, relatedDoc: 'F-202604-004', operator: 'admin', planName: '20220324中国同辐第2批认定' },
  { id: '4', entryNo: 'L-202604-004', date: '2022-04-01', type: 'refund', description: '王考生-退款（取消报名）', amount: -150, balance: 700, relatedDoc: 'F-202604-004', operator: 'admin', planName: '20220324中国同辐第2批认定' },
  { id: '5', entryNo: 'L-202604-005', date: '2022-04-15', type: 'income', description: '赵考生-道路客运汽车驾驶员五级认定费', amount: 200, balance: 900, relatedDoc: 'F-202604-005', operator: 'admin', planName: '20220327中国同辐第3批认定' },
]

const typeMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  income: { label: '收入', color: 'bg-green-100 text-green-700', icon: TrendingUp },
  expense: { label: '支出', color: 'bg-red-100 text-red-700', icon: TrendingDown },
  refund: { label: '退款', color: 'bg-amber-100 text-amber-700', icon: TrendingDown },
}

export default function FeeLedgerPage() {
  const [ledger] = useBackendListState<LedgerItem>(mockLedger)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = ledger.filter(l => {
    const m = !search || l.description.includes(search) || l.entryNo.includes(search)
    const t = typeFilter === 'all' || l.type === typeFilter
    return m && t
  })

  const stats = {
    income: ledger.filter(l => l.type === 'income').reduce((sum, l) => sum + l.amount, 0),
    expense: ledger.filter(l => l.type === 'expense').reduce((sum, l) => sum + Math.abs(l.amount), 0),
    refund: ledger.filter(l => l.type === 'refund').reduce((sum, l) => sum + Math.abs(l.amount), 0),
    balance: ledger.length > 0 ? ledger[ledger.length - 1].balance : 0,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">记账清单</h1>
        <Button variant="outline" size="sm" className="text-xs"><Download className="w-3.5 h-3.5 mr-1" />导出</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-green-200">
          <div className="text-sm text-green-600">总收入</div>
          <div className="text-2xl font-bold text-green-700">¥{stats.income}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-red-200">
          <div className="text-sm text-red-600">总支出</div>
          <div className="text-2xl font-bold text-red-700">¥{stats.expense}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-600">总退款</div>
          <div className="text-2xl font-bold text-amber-700">¥{stats.refund}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600">当前余额</div>
          <div className="text-2xl font-bold text-blue-700">¥{stats.balance}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索摘要、单号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="income">收入</SelectItem>
            <SelectItem value="expense">支出</SelectItem>
            <SelectItem value="refund">退款</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">记账单号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">日期</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">类型</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">摘要</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">金额</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">余额</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">关联单据</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作人</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">认定计划</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((l, idx) => {
              const TypeIcon = typeMap[l.type].icon
              return (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">{l.entryNo}</td>
                  <td className="px-3 py-3 text-gray-600">{l.date}</td>
                  <td className="px-3 py-3">
                    <Badge className={`text-[10px] ${typeMap[l.type].color}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />{typeMap[l.type].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-gray-900 max-w-[250px] truncate">{l.description}</td>
                  <td className={`px-3 py-3 text-right font-medium ${l.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {l.amount >= 0 ? '+' : ''}¥{Math.abs(l.amount)}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-900">¥{l.balance}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">{l.relatedDoc}</td>
                  <td className="px-3 py-3 text-gray-600">{l.operator}</td>
                  <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">{l.planName}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
