import { useMemo, useState, type FormEvent } from 'react'
import { Award, CheckCircle2, Edit3, FileText, GraduationCap, Plus, Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { nextTrainingStep, trainingPlans, trainingSteps, type TrainingPlan, type TrainingType } from './expertData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function TrainingPage({ type = '督导培训' }: { type?: TrainingType }) {
  const templateItems = trainingPlans.filter(item => item.type === type)
  const [backendItems, setItems] = useBackendListState<TrainingPlan>(templateItems)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'自建培训' | '报名培训' | '历次培训'>('自建培训')
  const [dialog, setDialog] = useState<'add' | 'register' | 'score' | 'cert' | 'candidates' | null>(null)
  const [active, setActive] = useState<TrainingPlan | null>(null)
  const items = useMemo(() => {
    const byId = new Map<string, TrainingPlan>()
    templateItems.forEach(item => byId.set(item.id, item))
    backendItems.filter(item => item.type === type).forEach(item => byId.set(item.id, item))
    return Array.from(byId.values())
  }, [backendItems, templateItems, type])

  const filtered = useMemo(() => items.filter(item => {
    const byTab = tab === '历次培训' ? item.status === '历次培训' : item.buildType === tab && item.status !== '历次培训'
    const bySearch = !search || item.name.includes(search) || item.location.includes(search) || item.teacher.includes(search)
    return byTab && bySearch
  }), [items, search, tab])

  const savePlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: TrainingPlan = {
      id: active?.id || String(Date.now()),
      type,
      name: String(fd.get('name') || ''),
      buildType: String(fd.get('buildType') || '自建培训') as TrainingPlan['buildType'],
      date: String(fd.get('date') || ''),
      location: String(fd.get('location') || ''),
      teacher: String(fd.get('teacher') || ''),
      hours: Number(fd.get('hours') || 16),
      status: active?.status || '制定计划',
      registered: active?.registered || 0,
      passed: active?.passed || 0,
      certified: active?.certified || 0,
    }
    if (!next.name) {
      toast.error('请填写培训计划名称')
      return
    }
    setItems(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '培训计划已更新' : '培训计划已新增')
  }

  const finishStep = (plan: TrainingPlan) => {
    setItems(prev => prev.map(item => item.id === plan.id ? { ...item, status: nextTrainingStep(item.status) } : item))
    toast.success('当前环节已结束，计划进入下一步')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">{type}</h1><p className="mt-1 text-sm text-gray-500">按原站流程维护制定计划、人员报名、培训考核、证书发放和历次培训</p></div>
        <Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />新增</Button>
      </div>
      <div className="grid grid-cols-5 gap-3">{trainingSteps.map(step => <div key={step} className="rounded-lg border border-gray-200 bg-white p-3 text-center"><div className="text-xl font-bold text-[#1A56DB]">{items.filter(item => item.status === step).length}</div><div className="text-xs text-gray-500">{step}</div></div>)}</div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex gap-2">{(['自建培训', '报名培训', '历次培训'] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${tab === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="培训名称 / 地点 / 讲师" className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">培训计划</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">日期/地点</th><th className="px-4 py-3 text-right font-medium">报名</th><th className="px-4 py-3 text-right font-medium">合格</th><th className="px-4 py-3 text-right font-medium">证书</th><th className="px-4 py-3 text-left font-medium">当前环节</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{filtered.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900"><GraduationCap className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{item.name}</td><td className="px-4 py-3 text-gray-600">{item.buildType}</td><td className="px-4 py-3 text-gray-600">{item.date} / {item.location}</td><td className="px-4 py-3 text-right">{item.registered}</td><td className="px-4 py-3 text-right">{item.passed}</td><td className="px-4 py-3 text-right">{item.certified}</td><td className="px-4 py-3"><Badge className={item.status === '历次培训' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>{item.status}</Badge></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setActive(item); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setActive(item); setDialog('register') }} className="text-xs text-[#1A56DB] hover:underline">报名</button><button onClick={() => { setActive(item); setDialog('score') }} className="text-xs text-[#1A56DB] hover:underline">成绩</button><button onClick={() => { setActive(item); setDialog('cert') }} className="text-xs text-[#1A56DB] hover:underline">证书</button><button onClick={() => { setActive(item); setDialog('candidates') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">考生</button><button onClick={() => finishStep(item)} className="text-xs text-green-600 hover:underline">结束</button></div></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{active ? '编辑培训计划' : '新增培训计划'}</DialogTitle></DialogHeader><form onSubmit={savePlan} className="grid grid-cols-2 gap-3 text-sm"><Field label="培训计划名称" name="name" defaultValue={active?.name} /><SelectField label="培训类型" name="buildType" defaultValue={active?.buildType || '自建培训'} options={['自建培训', '报名培训']} /><Field label="培训日期" name="date" defaultValue={active?.date} type="date" /><Field label="培训地点" name="location" defaultValue={active?.location} /><Field label="讲师" name="teacher" defaultValue={active?.teacher} /><Field label="学时" name="hours" defaultValue={String(active?.hours || 16)} type="number" /><div className="col-span-2 rounded-md bg-[#F9FAFB] p-3 text-xs text-gray-500">基本信息、申报条件、考试科目在本弹窗中维护；保存后点击“结束”进入下一环节。</div><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'register'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>人员报名 - {active?.name}</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('已打开新增培训人员')}>新增培训人员</Button><Field label="证件号码" name="idCard" defaultValue="440301198001011234" /><Field label="姓名" name="name" defaultValue="陈建国" /><div className="rounded-md bg-[#F9FAFB] p-3">点击查询可自动识别历史人员信息，也可手工录入。</div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success('已查询历史报名信息')}><Search className="mr-2 h-4 w-4" />查询</Button><Button variant="outline" onClick={() => { setDialog(null); toast.success('报名已结束') }}>结束报名</Button><Button onClick={() => { setItems(prev => prev.map(item => item.id === active?.id ? { ...item, registered: item.registered + 1 } : item)); setDialog(null); toast.success('培训人员已录入') }}><UserPlus className="mr-2 h-4 w-4" />录入信息</Button></div></div></DialogContent></Dialog>
      <Dialog open={dialog === 'score'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>培训/考核管理</DialogTitle></DialogHeader><div className="space-y-2 text-sm">{['陈建国', '刘秀芳', '黄志强'].map((name, index) => <div key={name} className="grid grid-cols-[1fr_90px_90px] items-center gap-2 rounded-md border border-gray-100 px-3 py-2"><span>{name}</span><input defaultValue={[92, 88, 76][index]} className="h-8 rounded border border-gray-200 px-2 text-right" /><Badge className="bg-green-50 text-green-700">合格</Badge></div>)}<div className="flex justify-end"><Button onClick={() => { setItems(prev => prev.map(item => item.id === active?.id ? { ...item, passed: Math.max(item.passed, 3) } : item)); setDialog(null); toast.success('成绩已保存') }}><CheckCircle2 className="mr-2 h-4 w-4" />保存成绩</Button></div></div></DialogContent></Dialog>
      <Dialog open={dialog === 'cert'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>证书发放</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-md border border-dashed border-[#1A56DB] p-5 text-center text-[#1A56DB]">生成培训合格证书并进入发证环节</div><div className="flex justify-end"><Button onClick={() => { setItems(prev => prev.map(item => item.id === active?.id ? { ...item, certified: Math.max(item.certified, item.passed || 1) } : item)); setDialog(null); toast.success('培训证书已生成') }}><Award className="mr-2 h-4 w-4" />生成证书</Button></div></div></DialogContent></Dialog>
      <Dialog open={dialog === 'candidates'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>历次培训人员</DialogTitle></DialogHeader><div className="space-y-2 text-sm">{['陈建国 / 92分 / DDPX-2026-001', '刘秀芳 / 88分 / KPPX-2026-008'].map(row => <div key={row} className="rounded-md border border-gray-100 px-3 py-2"><FileText className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{row}</div>)}</div></DialogContent></Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(item => <option key={item}>{item}</option>)}</select></label> }
