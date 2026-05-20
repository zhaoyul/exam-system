import { useMemo, useState, type FormEvent } from 'react'
import { Briefcase, Edit3, GraduationCap, Plus, Search, Trash2, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { dispatchTasks, experts, trainingPlans, type ExpertProfile, type ExpertRole, type ExpertStatus } from './expertData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function ExpertInfoPage() {
  const [items, setItems] = useBackendListState<ExpertProfile>(experts)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'全部' | ExpertRole>('全部')
  const [status, setStatus] = useState<'全部' | ExpertStatus>('全部')
  const [dialog, setDialog] = useState<'add' | 'detail' | null>(null)
  const [active, setActive] = useState<ExpertProfile | null>(null)

  const filtered = useMemo(() => items.filter(item => {
    const byRole = role === '全部' || item.role === role
    const byStatus = status === '全部' || item.status === status
    const bySearch = !search || item.name.includes(search) || item.idCard.includes(search) || item.specialty.includes(search) || item.org.includes(search)
    return byRole && byStatus && bySearch
  }), [items, role, search, status])

  const saveExpert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: ExpertProfile = {
      id: active?.id || `EXP-${Date.now().toString().slice(-4)}`,
      name: String(fd.get('name') || ''),
      idCard: String(fd.get('idCard') || ''),
      phone: String(fd.get('phone') || ''),
      org: String(fd.get('org') || ''),
      title: String(fd.get('title') || '高级工程师'),
      specialty: String(fd.get('specialty') || ''),
      role: String(fd.get('role') || '督导人员') as ExpertRole,
      status: String(fd.get('status') || '待聘') as ExpertStatus,
      certificateNo: active?.certificateNo || '--',
      hireDate: active?.hireDate || '--',
      expireDate: active?.expireDate || '--',
      dispatchCount: active?.dispatchCount || 0,
      rating: active?.rating || 0,
    }
    if (!next.name || !next.idCard) {
      toast.error('请填写姓名和证件号码')
      return
    }
    setItems(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '专家信息已更新' : '专家已添加')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">专家信息</h1><p className="mt-1 text-sm text-gray-500">查看培训合格后的专家档案，包含基本信息、培训信息、聘用信息和派遣信息</p></div>
        <Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />新增专家</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="专家总数" value={items.length} />
        <Stat label="在聘专家" value={items.filter(item => item.status === '在聘').length} />
        <Stat label="考评人员" value={items.filter(item => item.role.includes('考评')).length} />
        <Stat label="督导人员" value={items.filter(item => item.role.includes('督导')).length} />
      </div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex flex-wrap gap-2">
            {(['全部', '督导人员', '考评人员', '督导/考评'] as const).map(item => <button key={item} onClick={() => setRole(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${role === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}
            {(['全部', '在聘', '待聘', '培训中', '已解聘'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'border border-[#1A56DB] text-[#1A56DB]' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>)}
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="姓名 / 证件号码 / 专业 / 单位" className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">姓名</th><th className="px-4 py-3 text-left font-medium">证件号码</th><th className="px-4 py-3 text-left font-medium">专家类型</th><th className="px-4 py-3 text-left font-medium">专业领域</th><th className="px-4 py-3 text-left font-medium">所属单位</th><th className="px-4 py-3 text-right font-medium">派遣</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{filtered.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900"><UserCircle className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{item.name}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{item.idCard}</td><td className="px-4 py-3 text-gray-600">{item.role}</td><td className="px-4 py-3"><Badge className="bg-purple-50 text-purple-700">{item.specialty}</Badge></td><td className="px-4 py-3 text-gray-600">{item.org}</td><td className="px-4 py-3 text-right">{item.dispatchCount}</td><td className="px-4 py-3"><Badge className={item.status === '在聘' ? 'bg-green-50 text-green-700' : item.status === '已解聘' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setActive(item); setDialog('detail') }} className="text-xs text-[#1A56DB] hover:underline">证件号码</button><button onClick={() => { setActive(item); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setItems(prev => prev.filter(row => row.id !== item.id)); toast.success('专家已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{active ? '编辑专家信息' : '新增专家信息'}</DialogTitle></DialogHeader><form onSubmit={saveExpert} className="grid grid-cols-2 gap-3 text-sm"><Field label="姓名" name="name" defaultValue={active?.name} /><Field label="证件号码" name="idCard" defaultValue={active?.idCard} /><Field label="联系电话" name="phone" defaultValue={active?.phone} /><Field label="所属单位" name="org" defaultValue={active?.org} /><SelectField label="职称" name="title" defaultValue={active?.title || '高级工程师'} options={['工程师', '高级工程师', '教授级高工', '技师']} /><Field label="专业领域" name="specialty" defaultValue={active?.specialty} /><SelectField label="专家类型" name="role" defaultValue={active?.role || '督导人员'} options={['督导人员', '考评人员', '督导/考评']} /><SelectField label="状态" name="status" defaultValue={active?.status || '待聘'} options={['在聘', '待聘', '培训中', '已解聘']} /><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'detail'} onOpenChange={() => setDialog(null)}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>专家档案 - {active?.name}</DialogTitle></DialogHeader>{active && <div className="space-y-4 text-sm"><div className="grid grid-cols-3 gap-3"><Info icon={UserCircle} label="基本信息" value={`${active.title} / ${active.specialty}`} /><Info icon={GraduationCap} label="培训信息" value={trainingPlans.filter(item => item.type.includes(active.role.includes('考评') ? '考评' : '督导')).map(item => item.name).slice(0, 2).join('、')} /><Info icon={Briefcase} label="聘用信息" value={`${active.hireDate} 至 ${active.expireDate}`} /></div><div className="rounded-lg border border-gray-100"><div className="border-b border-gray-100 px-3 py-2 font-medium">派遣信息</div><div className="divide-y divide-gray-100">{dispatchTasks.filter(task => task.experts.includes(active.name)).map(task => <div key={task.id} className="flex justify-between px-3 py-2"><span>{task.planName}</span><span className="text-gray-500">{task.date} / {task.status}</span></div>)}{dispatchTasks.filter(task => task.experts.includes(active.name)).length === 0 && <div className="px-3 py-3 text-gray-500">暂无派遣记录</div>}</div></div></div>}</DialogContent></Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div> }
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(item => <option key={item}>{item}</option>)}</select></label> }
function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) { return <div className="rounded-md bg-[#F9FAFB] p-3"><Icon className="mb-2 h-4 w-4 text-[#1A56DB]" /><div className="text-xs text-gray-500">{label}</div><div className="mt-1 font-medium text-gray-900">{value || '暂无'}</div></div> }
