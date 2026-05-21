import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

type ReqStatus = '未抽卷' | '已抽卷'

interface SkillReq {
  id: string
  status: ReqStatus
  name: string
  remark: string
  createdAt: string
  pushedAt: string
  pushedBy: string
  type: string
  useType: string
}

const initialReqs: SkillReq[] = [
  { id: 'skr1', status: '未抽卷', name: 'test', remark: 'test', createdAt: '2026-04-30 09:58:14', pushedAt: '', pushedBy: '', type: '手动建立', useType: 'test' },
]

export default function SkillPaperRequirements() {
  const [reqs, setReqs] = useBackendListState<SkillReq>(initialReqs)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'全部' | ReqStatus>('全部')
  const [dialog, setDialog] = useState<'add' | 'operate' | null>(null)
  const [active, setActive] = useState<SkillReq | null>(null)

  const filtered = useMemo(() => reqs.filter(req => {
    const byStatus = status === '全部' || req.status === status
    const bySearch = !search || req.name.includes(search) || req.remark.includes(search)
    return byStatus && bySearch
  }), [reqs, search, status])

  const saveReq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillReq = {
      id: active?.id || String(Date.now()),
      status: String(fd.get('status') || '未抽卷') as ReqStatus,
      name: String(fd.get('name') || ''),
      remark: String(fd.get('remark') || ''),
      createdAt: active?.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      pushedAt: active?.pushedAt || '',
      pushedBy: active?.pushedBy || '',
      type: String(fd.get('type') || '手动建立'),
      useType: String(fd.get('useType') || ''),
    }
    if (!next.name) {
      toast.error('请填写需求名称')
      return
    }
    setReqs(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '试卷需求已更新' : '试卷需求已添加')
  }

  const drawPaper = () => {
    if (!active) return
    setReqs(prev => prev.map(req => req.id === active.id ? { ...req, status: '已抽卷' } : req))
    setDialog(null)
    toast.success('自动抽卷完成')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">试卷需求</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">需求名称</span>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <div className="flex gap-2">{(['全部', '已抽卷', '未抽卷'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{item === '全部' ? '全 部' : item}</button>)}</div>
          <div className="ml-auto flex gap-2">
            <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('批量自动抽卷完成')}>批量自动抽卷</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('批量推送完成')}>批量推送</Button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">试卷需求</th><th className="px-4 py-3 text-left font-medium">备注</th><th className="px-4 py-3 text-left font-medium">创建时间</th><th className="px-4 py-3 text-left font-medium">推送时间</th><th className="px-4 py-3 text-left font-medium">推送人</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-left font-medium">试卷用途</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{filtered.map((req, index) => <tr key={req.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3"><Badge className={req.status === '已抽卷' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{req.status}</Badge></td><td className="px-4 py-3 font-medium text-gray-900">{req.name}</td><td className="px-4 py-3 text-gray-600">{req.remark}</td><td className="px-4 py-3 text-gray-600">{req.createdAt}</td><td className="px-4 py-3 text-gray-600">{req.pushedAt}</td><td className="px-4 py-3 text-gray-600">{req.pushedBy}</td><td className="px-4 py-3 text-gray-600">{req.type}</td><td className="px-4 py-3 text-gray-600">{req.useType}</td><td className="px-4 py-3"><button onClick={() => { setActive(req); setDialog('operate') }} className="text-xs text-[#1A56DB] hover:underline">操作</button></td></tr>)}</tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据,当前第1页　1　20 条/页</div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}><DialogContent><DialogHeader><DialogTitle>{active ? '编辑试卷需求' : '添加试卷需求'}</DialogTitle></DialogHeader><form onSubmit={saveReq} className="space-y-3 text-sm"><Field label="需求名称" name="name" defaultValue={active?.name} /><Field label="备注" name="remark" defaultValue={active?.remark} /><div className="grid grid-cols-2 gap-3"><SelectField label="状态" name="status" defaultValue={active?.status || '未抽卷'} options={['未抽卷', '已抽卷']} /><Field label="类型" name="type" defaultValue={active?.type || '手动建立'} /></div><Field label="试卷用途" name="useType" defaultValue={active?.useType} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'operate'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>操作</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-md bg-[#F9FAFB] p-3">试卷需求：{active?.name}</div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setDialog(null); toast.success('已推送') }}>推送</Button><Button onClick={drawPaper}>自动抽卷</Button></div></div></DialogContent></Dialog>
    </div>
  )
}
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
