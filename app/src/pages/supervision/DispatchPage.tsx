import { useMemo, useState } from 'react'
import { ClipboardCheck, Eye, FileText, MapPin, Search, Send, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { dispatchTasks, experts, type DispatchTask } from './expertData'

export default function DispatchPage() {
  const [items, setItems] = useState<DispatchTask[]>(dispatchTasks)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'全部' | DispatchTask['status']>('全部')
  const [active, setActive] = useState<DispatchTask | null>(null)
  const [dialog, setDialog] = useState<'dispatch' | 'detail' | 'feedback' | null>(null)

  const filtered = useMemo(() => items.filter(item => (status === '全部' || item.status === status) && (!search || item.planName.includes(search) || item.org.includes(search))), [items, search, status])

  const dispatch = () => {
    if (!active) return
    setItems(prev => prev.map(item => item.id === active.id ? { ...item, status: '已派遣', experts: ['陈建国', '刘秀芳'] } : item))
    setDialog(null)
    toast.success('人员派遣已保存')
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-gray-900">专家派遣</h1><p className="mt-1 text-sm text-gray-500">对待考试计划派遣督导或考评人员，查看督导详情并完成回评</p></div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3"><div className="flex gap-2">{(['全部', '待派遣', '已派遣', '已回评'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="计划 / 机构" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div></div>
        <div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">认定计划</th><th className="px-4 py-3 text-left font-medium">机构</th><th className="px-4 py-3 text-left font-medium">日期</th><th className="px-4 py-3 text-left font-medium">派遣类型</th><th className="px-4 py-3 text-left font-medium">已派人员</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900"><ClipboardCheck className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{item.planName}</td><td className="px-4 py-3 text-gray-600"><MapPin className="mr-1 inline h-3.5 w-3.5 text-gray-400" />{item.org}</td><td className="px-4 py-3 text-gray-600">{item.date}</td><td className="px-4 py-3 text-gray-600">{item.type}</td><td className="px-4 py-3 text-gray-600">{item.experts.join('、') || '--'}</td><td className="px-4 py-3"><Badge className={item.status === '待派遣' ? 'bg-amber-50 text-amber-700' : item.status === '已回评' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}>{item.status}</Badge></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setActive(item); setDialog('dispatch') }} className="text-xs text-[#1A56DB] hover:underline"><Send className="mr-0.5 inline h-3.5 w-3.5" />派遣</button><button onClick={() => { setActive(item); setDialog('detail') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Eye className="mr-0.5 inline h-3.5 w-3.5" />查看</button><button onClick={() => { setActive(item); setDialog('feedback') }} className="text-xs text-green-600 hover:underline"><Star className="mr-0.5 inline h-3.5 w-3.5" />回评</button></div></td></tr>)}</tbody></table></div>
      </section>
      <Dialog open={dialog === 'dispatch'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>人员派遣 - {active?.planName}</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2">{experts.filter(item => item.status === '在聘').map(expert => <label key={expert.id} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" defaultChecked={active?.experts.includes(expert.name)} className="mr-2" />{expert.name} / {expert.role}</label>)}</div><div className="flex justify-end"><Button onClick={dispatch}>保存派遣</Button></div></div></DialogContent></Dialog>
      <Dialog open={dialog === 'detail'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>督导详情</DialogTitle></DialogHeader>{active && <div className="space-y-2 text-sm"><Info label="派遣任务书" value={`${active.planName} / ${active.org}`} /><Info label="现场签到" value="已签到 2 人，移动督导APP同步完成" /><Info label="督导记录" value="考场纪律、视频监控、评分表均已检查" /><Info label="督导评分" value={active.supervisorScore ? `${active.supervisorScore} 分` : '待提交'} /></div>}</DialogContent></Dialog>
      <Dialog open={dialog === 'feedback'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>回评</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><textarea defaultValue={active?.feedback || '督导人员工作规范，记录完整。'} className="h-28 w-full rounded-md border border-gray-200 px-3 py-2" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success('回评已保存')}>保存</Button><Button onClick={() => { if (active) setItems(prev => prev.map(item => item.id === active.id ? { ...item, status: '已回评', feedback: '回评已提交' } : item)); setDialog(null); toast.success('回评已提交') }}>提交回评</Button></div></div></DialogContent></Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-gray-100 px-3 py-2"><FileText className="mr-2 inline h-4 w-4 text-[#1A56DB]" /><span className="text-gray-500">{label}：</span><span className="font-medium text-gray-900">{value}</span></div> }
