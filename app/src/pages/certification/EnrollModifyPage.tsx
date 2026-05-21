import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBackendResourceList } from '@/hooks/useBackendListState'

interface EnrollModifyPlan {
  id: string | number
  planNo?: string
  name?: string
  planName?: string
  filingOrg?: string
  filingPlace?: string
  site?: string
  siteName?: string
  regDeadline?: string
  onlineCount?: number
  groupCount?: number
}

const initialPlans: EnrollModifyPlan[] = [
  { id: 'em-1', planNo: '22111100840009', planName: '2026年第一批技能认定', filingOrg: '北京市', site: '中国原子能科学研究院', regDeadline: '2026-04-20', onlineCount: 12, groupCount: 8 },
  { id: 'em-2', planNo: '22111100840010', planName: '2026年第二批技能认定', filingOrg: '北京市', site: '中国原子能科学研究院', regDeadline: '2026-05-20', onlineCount: 18, groupCount: 27 },
]

export default function EnrollModifyPage() {
  const plans = useBackendResourceList<EnrollModifyPlan>('/certification/plans', initialPlans)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => plans.filter(plan => {
    const name = plan.planName || plan.name || ''
    const no = plan.planNo || ''
    return !search || name.includes(search) || no.includes(search)
  }), [plans, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-medium text-gray-900">
        <span className="text-lg">✎</span>
        <span>报名修改</span>
      </div>

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>计划名称</option>
          </select>
          <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-gray-700">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-medium"></th>
                <th className="w-20 px-4 py-3 text-center font-medium">序号</th>
                <th className="px-4 py-3 text-center font-medium">计划编号</th>
                <th className="px-4 py-3 text-center font-medium">计划名称</th>
                <th className="px-4 py-3 text-center font-medium">备案地</th>
                <th className="px-4 py-3 text-center font-medium">站点名称</th>
                <th className="px-4 py-3 text-center font-medium">报名截止</th>
                <th className="px-4 py-3 text-center font-medium">网报/集体报名</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((plan, index) => {
                const online = plan.onlineCount ?? 0
                const group = plan.groupCount ?? 0
                return (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-400"></td>
                    <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-gray-600">{plan.planNo || '-'}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{plan.planName || plan.name || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{plan.filingOrg || plan.filingPlace || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{plan.site || plan.siteName || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{plan.regDeadline || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{online}/{group}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
