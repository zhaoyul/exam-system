import { useNavigate } from 'react-router-dom'
import { Award, BarChart3, ClipboardCheck, FileSpreadsheet, GraduationCap, Shield, Star, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { dispatchTasks, experts, trainingPlans } from '@/pages/supervision/expertData'
import { useBackendResourceList } from '@/hooks/useBackendListState'

export default function ExpertWorkbench() {
  const navigate = useNavigate()
  const backendExperts = useBackendResourceList('/supervision/expert-info', experts)
  const backendTrainingPlans = useBackendResourceList('/supervision/training', trainingPlans)
  const backendDispatchTasks = useBackendResourceList('/supervision/dispatch', dispatchTasks)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">评价专家</h1><p className="mt-1 text-sm text-gray-500">质量督导管理，覆盖培训、聘用、派遣、表单和人员统计</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/supervision/expert-info')}>专家信息</Button><Button onClick={() => navigate('/supervision/dispatch')}><ClipboardCheck className="mr-2 h-4 w-4" />专家派遣</Button></div>
      </div>
      <div className="grid grid-cols-4 gap-3"><Stat label="专家总数" value={backendExperts.length} icon={Users} /><Stat label="在聘专家" value={backendExperts.filter(item => item.status === '在聘').length} icon={Award} /><Stat label="待派遣任务" value={backendDispatchTasks.filter(item => item.status === '待派遣').length} icon={ClipboardCheck} /><Stat label="培训计划" value={backendTrainingPlans.length} icon={GraduationCap} /></div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-4 font-semibold text-gray-900">专家列表</div>
          <table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">编号</th><th className="px-4 py-3 text-left font-medium">姓名</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">专业</th><th className="px-4 py-3 text-right font-medium">评分</th><th className="px-4 py-3 text-left font-medium">状态</th></tr></thead><tbody className="divide-y divide-gray-100">{backendExperts.map(item => <tr key={item.id} onClick={() => navigate('/supervision/expert-info')} className="cursor-pointer hover:bg-gray-50"><td className="px-4 py-3 font-mono text-xs text-gray-600">{item.id}</td><td className="px-4 py-3 font-medium text-gray-900">{item.name}</td><td className="px-4 py-3 text-gray-600">{item.role}</td><td className="px-4 py-3 text-gray-600">{item.specialty}</td><td className="px-4 py-3 text-right"><Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />{item.rating}</td><td className="px-4 py-3"><Badge className={item.status === '在聘' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge></td></tr>)}</tbody></table>
        </section>
        <section className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><TrendingUp className="h-4 w-4 text-[#1A56DB]" />培训流程概览</div><div className="space-y-2">{backendTrainingPlans.map(plan => <button key={plan.id} onClick={() => navigate(plan.type === '督导培训' ? '/supervision/training' : '/supervision/evaluator-training')} className="w-full rounded-md border border-gray-100 px-3 py-2 text-left hover:bg-gray-50"><div className="flex justify-between text-sm"><span className="font-medium text-gray-900">{plan.name}</span><Badge className="bg-blue-50 text-blue-700">{plan.status}</Badge></div><div className="mt-1 text-xs text-gray-500">{plan.type} / {plan.registered}人报名 / {plan.certified}人发证</div></button>)}</div></div>
          <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><ClipboardCheck className="h-4 w-4 text-[#1A56DB]" />即将派遣任务</div><div className="space-y-2">{backendDispatchTasks.map(task => <button key={task.id} onClick={() => navigate('/supervision/dispatch')} className="w-full rounded-md border border-gray-100 px-3 py-2 text-left hover:bg-gray-50"><div className="text-sm font-medium text-gray-900">{task.planName}</div><div className="mt-1 text-xs text-gray-500">{task.date} / {task.org} / {task.status}</div></button>)}</div></div>
        </section>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '专家信息', path: '/supervision/expert-info', icon: Users, desc: '培训/聘用/派遣档案' },
          { label: '专家聘用', path: '/supervision/hiring', icon: Award, desc: '聘用与解聘' },
          { label: '督导培训', path: '/supervision/training', icon: Shield, desc: '督导培训五步流程' },
          { label: '考评培训', path: '/supervision/evaluator-training', icon: GraduationCap, desc: '考评培训五步流程' },
          { label: '专家派遣', path: '/supervision/dispatch', icon: ClipboardCheck, desc: '派遣/详情/回评' },
          { label: '表单管理', path: '/supervision/forms', icon: FileSpreadsheet, desc: '表单定义与使用设置' },
          { label: '人员统计', path: '/supervision/personnel-statistics', icon: BarChart3, desc: '人员分布和绩效' },
        ].map(item => <button key={item.path} onClick={() => navigate(item.path)} className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-[#1A56DB] hover:bg-blue-50"><item.icon className="mb-3 h-5 w-5 text-[#1A56DB]" /><div className="font-medium text-gray-900">{item.label}</div><div className="mt-1 text-xs text-gray-500">{item.desc}</div></button>)}
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) { return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><div><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div><div className="rounded-lg bg-blue-50 p-2 text-[#1A56DB]"><Icon className="h-5 w-5" /></div></div></div> }
