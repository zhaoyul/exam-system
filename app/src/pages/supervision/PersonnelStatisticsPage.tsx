import { Award, Building2, Download, GraduationCap, PieChart, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { dispatchTasks, experts, trainingPlans } from './expertData'
import { useBackendListState } from '@/hooks/useBackendListState'

const orgs = ['大亚湾核电', '中广核研究院', '阳江核电', '台山核电']
const fields = ['核反应堆运行', '电气试验', '机械设备检修', '仪控设备检修']

export default function PersonnelStatisticsPage() {
  const [backendExperts] = useBackendListState(experts)
  const [backendTrainingPlans] = useBackendListState(trainingPlans)
  const [backendDispatchTasks] = useBackendListState(dispatchTasks)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-gray-900">人员统计</h1><p className="mt-1 text-sm text-gray-500">统计评价专家、督导人员、考评人员的培训、聘用、派遣和回评情况</p></div><Button variant="outline"><Download className="mr-2 h-4 w-4" />导出统计</Button></div>
      <div className="grid grid-cols-4 gap-3"><Stat label="专家总数" value={backendExperts.length} icon={Users} /><Stat label="在聘人数" value={backendExperts.filter(item => item.status === '在聘').length} icon={Award} /><Stat label="培训计划" value={backendTrainingPlans.length} icon={GraduationCap} /><Stat label="派遣任务" value={backendDispatchTasks.length} icon={Star} /></div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4"><div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Building2 className="h-4 w-4 text-[#1A56DB]" />机构人员分布</div><div className="space-y-3">{orgs.map(org => { const count = backendExperts.filter(item => item.org === org).length; return <div key={org}><div className="mb-1 flex justify-between text-sm"><span>{org}</span><span>{count} 人</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${Math.max(count * 25, 12)}%` }} /></div></div> })}</div></section>
        <section className="rounded-lg border border-gray-200 bg-white p-4"><div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><PieChart className="h-4 w-4 text-[#1A56DB]" />专业能力分布</div><div className="space-y-3">{fields.map(field => { const count = backendExperts.filter(item => item.specialty === field).length; return <div key={field} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"><span>{field}</span><Badge className="bg-blue-50 text-blue-700">{count} 人</Badge></div> })}</div></section>
      </div>
      <section className="rounded-lg border border-gray-200 bg-white"><div className="border-b border-gray-100 p-4 font-semibold text-gray-900">专家绩效明细</div><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">姓名</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">单位</th><th className="px-4 py-3 text-right font-medium">派遣次数</th><th className="px-4 py-3 text-right font-medium">回评分</th><th className="px-4 py-3 text-left font-medium">状态</th></tr></thead><tbody className="divide-y divide-gray-100">{backendExperts.map(item => <tr key={item.id}><td className="px-4 py-3 font-medium text-gray-900">{item.name}</td><td className="px-4 py-3 text-gray-600">{item.role}</td><td className="px-4 py-3 text-gray-600">{item.org}</td><td className="px-4 py-3 text-right">{item.dispatchCount}</td><td className="px-4 py-3 text-right">{item.rating}</td><td className="px-4 py-3"><Badge className={item.status === '在聘' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge></td></tr>)}</tbody></table></section>
    </div>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) { return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><div><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div><div className="rounded-lg bg-blue-50 p-2 text-[#1A56DB]"><Icon className="h-5 w-5" /></div></div></div> }
