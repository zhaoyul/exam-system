import { useMemo, useState } from 'react'
import { Award, FileText, Search, UserCheck, UserX } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { experts, type ExpertProfile, type ExpertRole, type ExpertStatus } from './expertData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function HiringPage() {
  const [items, setItems] = useBackendListState<ExpertProfile>(experts)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'全部' | ExpertRole>('全部')
  const [active, setActive] = useState<ExpertProfile | null>(null)

  const filtered = useMemo(() => items.filter(item => {
    const byRole = role === '全部' || item.role === role
    const bySearch = !search || item.name.includes(search) || item.idCard.includes(search) || item.certificateNo.includes(search)
    return byRole && bySearch
  }), [items, role, search])

  const setStatus = (expert: ExpertProfile, status: ExpertStatus) => {
    setItems(prev => prev.map(item => item.id === expert.id ? { ...item, status, hireDate: status === '在聘' ? '2026-05-19' : item.hireDate, expireDate: status === '在聘' ? '2027-05-18' : item.expireDate } : item))
    toast.success(status === '在聘' ? '专家已聘用' : '专家已解聘')
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-gray-900">专家聘用</h1><p className="mt-1 text-sm text-gray-500">对培训合格获得证书的督导人员、考评人员进行聘用或解聘</p></div>
      <div className="grid grid-cols-4 gap-3"><Stat label="待聘人员" value={items.filter(item => item.status === '待聘').length} /><Stat label="在聘人员" value={items.filter(item => item.status === '在聘').length} /><Stat label="本月聘用" value={2} /><Stat label="即将到期" value={1} /></div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3"><div className="flex gap-2">{(['全部', '督导人员', '考评人员', '督导/考评'] as const).map(item => <button key={item} onClick={() => setRole(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${role === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="姓名 / 证件号码 / 培训证书" className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div></div>
        <div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">姓名</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">培训证书</th><th className="px-4 py-3 text-left font-medium">聘用日期</th><th className="px-4 py-3 text-left font-medium">到期日期</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900"><Award className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{item.name}</td><td className="px-4 py-3 text-gray-600">{item.role}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{item.certificateNo}</td><td className="px-4 py-3 text-gray-600">{item.hireDate}</td><td className="px-4 py-3 text-gray-600">{item.expireDate}</td><td className="px-4 py-3"><Badge className={item.status === '在聘' ? 'bg-green-50 text-green-700' : item.status === '已解聘' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => setActive(item)} className="text-xs text-[#1A56DB] hover:underline"><FileText className="mr-0.5 inline h-3.5 w-3.5" />查看</button><button onClick={() => setStatus(item, '在聘')} className="text-xs text-green-600 hover:underline"><UserCheck className="mr-0.5 inline h-3.5 w-3.5" />聘用</button><button onClick={() => setStatus(item, '已解聘')} className="text-xs text-red-600 hover:underline"><UserX className="mr-0.5 inline h-3.5 w-3.5" />解聘</button></div></td></tr>)}</tbody></table></div>
      </section>
      <Dialog open={!!active} onOpenChange={() => setActive(null)}><DialogContent><DialogHeader><DialogTitle>聘用信息</DialogTitle></DialogHeader>{active && <div className="space-y-2 text-sm"><Info label="姓名" value={active.name} /><Info label="证件号码" value={active.idCard} /><Info label="培训证书" value={active.certificateNo} /><Info label="聘用周期" value={`${active.hireDate} 至 ${active.expireDate}`} /><Info label="可聘类型" value={active.role} /></div>}</DialogContent></Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div> }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div> }
