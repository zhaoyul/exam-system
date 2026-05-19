import { Fragment, useMemo, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronRight, Edit3, FileText, Plus, Search, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { skillLevels, skillSubjectName, skillSubjects } from './skillData'

type ReqSource = '系统推送' | '手动建立'
type ReqStatus = '新需求' | '已配置' | '已抽卷'
interface SkillReq { id: string; name: string; source: ReqSource; subjectId: string; level: string; useType: string; paperCount: number; status: ReqStatus; items: Array<{ id: string; rule: string; count: number; purpose: string }> }
const initialReqs: SkillReq[] = [
  { id: 'skr1', name: '2026年4月控制棒操作实操A卷', source: '系统推送', subjectId: 'ss1', level: '三级', useType: '正式考试', paperCount: 2, status: '新需求', items: [{ id: 'i1', rule: '控制棒操作三级-A卷规则', count: 2, purpose: '正式考试' }] },
  { id: 'skr2', name: '主泵检修实操补考卷', source: '手动建立', subjectId: 'ss2', level: '四级', useType: '补考', paperCount: 1, status: '已配置', items: [{ id: 'i2', rule: '主泵检修四级规则', count: 1, purpose: '补考' }] },
]

export default function SkillPaperRequirements() {
  const [reqs, setReqs] = useState<SkillReq[]>(initialReqs)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<'全部' | ReqSource>('全部')
  const [expanded, setExpanded] = useState<string[]>([])
  const [dialog, setDialog] = useState<'add' | 'item' | 'paper' | null>(null)
  const [active, setActive] = useState<SkillReq | null>(null)
  const filtered = useMemo(() => reqs.filter(req => (source === '全部' || req.source === source) && (!search || req.name.includes(search) || skillSubjectName(req.subjectId).includes(search))), [reqs, search, source])

  const saveReq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillReq = { id: active?.id || String(Date.now()), name: String(fd.get('name') || ''), source: active?.source || '手动建立', subjectId: String(fd.get('subjectId') || skillSubjects[0].id), level: String(fd.get('level') || '三级'), useType: String(fd.get('useType') || '正式考试'), paperCount: Number(fd.get('paperCount') || 1), status: active?.status || '新需求', items: active?.items || [] }
    if (!next.name) { toast.error('请填写需求名称'); return }
    setReqs(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null); setActive(null); toast.success(active ? '试卷需求已更新' : '试卷需求已添加')
  }

  const saveItem = () => {
    if (!active) return
    setReqs(prev => prev.map(req => req.id === active.id ? { ...req, status: '已配置', items: [...req.items, { id: String(Date.now()), rule: '控制棒操作三级-A卷规则', count: req.paperCount, purpose: req.useType }] } : req))
    setDialog(null); toast.success('需求项已保存')
  }
  const extractPaper = () => { if (!active) return; setReqs(prev => prev.map(req => req.id === active.id ? { ...req, status: '已抽卷' } : req)); setDialog(null); toast.success('技能试卷抽取完成') }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-gray-900">试卷需求</h1><p className="mt-1 text-sm text-gray-500">管理技能题库系统推送和手动建立的试卷需求，配置需求项并抽取实操试卷</p></div><Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加</Button></div>
      <div className="rounded-lg border border-gray-200 bg-white"><div className="flex items-center justify-between gap-3 border-b border-gray-100 p-3"><div className="flex gap-2">{(['全部', '系统推送', '手动建立'] as const).map(item => <button key={item} onClick={() => setSource(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${source === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="需求名称 / 技能科目" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div></div><div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="w-12 px-4 py-3"></th><th className="px-4 py-3 text-left font-medium">需求名称</th><th className="px-4 py-3 text-left font-medium">来源</th><th className="px-4 py-3 text-left font-medium">技能科目</th><th className="px-4 py-3 text-left font-medium">等级</th><th className="px-4 py-3 text-right font-medium">套数</th><th className="px-4 py-3 text-left font-medium">用途</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(req => <Fragment key={req.id}><tr className="hover:bg-gray-50"><td className="px-4 py-3"><button onClick={() => setExpanded(prev => prev.includes(req.id) ? prev.filter(id => id !== req.id) : [...prev, req.id])}>{expanded.includes(req.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></td><td className="px-4 py-3 font-medium text-gray-900"><FileText className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{req.name}</td><td className="px-4 py-3"><Badge className={req.source === '系统推送' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}>{req.source}</Badge></td><td className="px-4 py-3 text-gray-600">{skillSubjectName(req.subjectId)}</td><td className="px-4 py-3 text-gray-600">{req.level}</td><td className="px-4 py-3 text-right">{req.paperCount}</td><td className="px-4 py-3 text-gray-600">{req.useType}</td><td className="px-4 py-3"><Badge className={req.status === '已抽卷' ? 'bg-green-50 text-green-700' : req.status === '已配置' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}>{req.status}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setActive(req); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setActive(req); setDialog('item') }} className="text-xs text-[#1A56DB] hover:underline">需求项</button><button onClick={() => { setActive(req); setDialog('paper') }} className="text-xs text-green-600 hover:underline"><Shuffle className="mr-0.5 inline h-3.5 w-3.5" />试卷</button></div></td></tr>{expanded.includes(req.id) && <tr><td></td><td colSpan={8} className="bg-[#F9FAFB] px-4 py-3">{req.items.length ? req.items.map(item => <div key={item.id} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">规则：{item.rule} / 套数：{item.count} / 用途：{item.purpose}</div>) : <div className="text-sm text-gray-500">暂无需求项</div>}</td></tr>}</Fragment>)}</tbody></table></div></div>
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}><DialogContent><DialogHeader><DialogTitle>{active ? '编辑试卷需求' : '添加试卷需求'}</DialogTitle></DialogHeader><form onSubmit={saveReq} className="space-y-3 text-sm"><Field label="需求名称" name="name" defaultValue={active?.name} /><label className="block"><span className="font-medium text-gray-700">技能科目</span><select name="subjectId" defaultValue={active?.subjectId || skillSubjects[0].id} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{skillSubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><div className="grid grid-cols-3 gap-3"><SelectField label="等级" name="level" defaultValue={active?.level || '三级'} options={skillLevels} /><Field label="套数" name="paperCount" defaultValue={String(active?.paperCount || 1)} type="number" /><SelectField label="用途" name="useType" defaultValue={active?.useType || '正式考试'} options={['正式考试', '补考', '模拟练习']} /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'item'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>编辑需求项</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><Field label="组卷规则" name="rule" defaultValue="控制棒操作三级-A卷规则" /><Field label="抽卷套数" name="count" defaultValue={String(active?.paperCount || 1)} type="number" /><div className="flex justify-end"><Button onClick={saveItem}>保存</Button></div></div></DialogContent></Dialog>
      <Dialog open={dialog === 'paper'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>抽取试卷</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-md bg-[#F9FAFB] p-3">需求：{active?.name}</div><div className="rounded-md border border-dashed border-[#1A56DB] p-5 text-center text-[#1A56DB]">点击“抽取”后按需求项生成技能考试用试卷</div><div className="flex justify-end"><Button onClick={extractPaper}>抽取</Button></div></div></DialogContent></Dialog>
    </div>
  )
}
function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label> }
