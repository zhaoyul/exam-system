import { useMemo, useState, type FormEvent } from 'react'
import { Download, Edit3, Eye, FileText, Plus, Search, Send, ShieldCheck, Shuffle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { levels, orgOptions, theorySubjects } from '@/pages/question/theoryData'
import { skillLevels, skillSubjectName, skillSubjects } from '@/pages/question/skillData'

type PaperStatus = '草稿' | '已发布' | '已推送'
type BankType = '理论题库' | '技能题库'

interface PaperItem {
  id: string
  bank: BankType
  name: string
  subjectId: string
  level: string
  questions: number
  score: number
  source: '固定试卷' | '需求抽卷'
  status: PaperStatus
  authorizedOrgs: string[]
  createdAt: string
}

const initialPapers: PaperItem[] = [
  { id: 'p1', bank: '理论题库', name: '2026年第一批-核反应堆运行值班员三级-A卷', subjectId: 's1', level: '三级', questions: 80, score: 100, source: '需求抽卷', status: '已发布', authorizedOrgs: ['大亚湾核电'], createdAt: '2026-05-18' },
  { id: 'p2', bank: '理论题库', name: '电气值班员四级固定卷-B', subjectId: 's2', level: '四级', questions: 85, score: 100, source: '固定试卷', status: '草稿', authorizedOrgs: [], createdAt: '2026-05-16' },
  { id: 'p3', bank: '技能题库', name: '控制棒操作三级实操-A卷', subjectId: 'ss1', level: '三级', questions: 2, score: 100, source: '需求抽卷', status: '已发布', authorizedOrgs: ['阳江核电'], createdAt: '2026-05-18' },
  { id: 'p4', bank: '技能题库', name: '主泵检修四级固定卷-B', subjectId: 'ss2', level: '四级', questions: 3, score: 100, source: '固定试卷', status: '草稿', authorizedOrgs: [], createdAt: '2026-05-16' },
]

export default function PaperLibrary() {
  const [papers, setPapers] = useState<PaperItem[]>(initialPapers)
  const [bank, setBank] = useState<BankType>('理论题库')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'全部' | PaperStatus>('全部')
  const [dialog, setDialog] = useState<'add' | 'detail' | 'auth' | 'extract' | null>(null)
  const [active, setActive] = useState<PaperItem | null>(null)

  const filtered = useMemo(() => papers.filter(paper => {
    const byBank = paper.bank === bank
    const byStatus = status === '全部' || paper.status === status
    const bySearch = !search || paper.name.includes(search) || subjectName(paper.subjectId).includes(search)
    return byBank && byStatus && bySearch
  }), [bank, papers, search, status])

  const savePaper = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: PaperItem = {
      id: active?.id || String(Date.now()),
      bank,
      name: String(fd.get('name') || ''),
      subjectId: String(fd.get('subjectId') || (bank === '理论题库' ? theorySubjects[0].id : skillSubjects[0].id)),
      level: String(fd.get('level') || '三级'),
      questions: Number(fd.get('questions') || 80),
      score: Number(fd.get('score') || 100),
      source: '固定试卷',
      status: String(fd.get('status') || '草稿') as PaperStatus,
      authorizedOrgs: active?.authorizedOrgs || [],
      createdAt: active?.createdAt || new Date().toISOString().slice(0, 10),
    }
    if (!next.name) {
      toast.error('请填写试卷名称')
      return
    }
    setPapers(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '试卷已更新' : '固定试卷已添加')
  }

  const toggleAuth = (org: string) => {
    if (!active) return
    const nextOrgs = active.authorizedOrgs.includes(org) ? active.authorizedOrgs.filter(item => item !== org) : [...active.authorizedOrgs, org]
    setActive({ ...active, authorizedOrgs: nextOrgs })
    setPapers(prev => prev.map(item => item.id === active.id ? { ...item, authorizedOrgs: nextOrgs } : item))
  }

  const pushPaper = (paper: PaperItem) => {
    setPapers(prev => prev.map(item => item.id === paper.id ? { ...item, status: '已推送' } : item))
    toast.success('试卷已推送')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">卷库管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理固定试卷和抽取试卷，支持编辑、授权、删除、抽卷、推送和导出组卷统计表</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('系统组卷统计表已导出')}><Download className="mr-2 h-4 w-4" />导出统计表</Button>
          <Button variant="outline" onClick={() => setDialog('extract')}><Shuffle className="mr-2 h-4 w-4" />抽卷</Button>
          <Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加固定试卷</Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex gap-2">
            {(['理论题库', '技能题库'] as const).map(item => <button key={item} onClick={() => setBank(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${bank === item ? 'bg-[#1A56DB] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>)}
            {(['全部', '草稿', '已发布', '已推送'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="试卷名称 / 科目" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">试卷名称</th><th className="px-4 py-3 text-left font-medium">来源</th><th className="px-4 py-3 text-left font-medium">科目</th><th className="px-4 py-3 text-left font-medium">等级</th><th className="px-4 py-3 text-right font-medium">题数</th><th className="px-4 py-3 text-right font-medium">总分</th><th className="px-4 py-3 text-right font-medium">授权机构</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(paper => <tr key={paper.id} className="hover:bg-gray-50"><td className="max-w-[360px] px-4 py-3 font-medium text-gray-900"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-[#1A56DB]" />{paper.name}</span></td><td className="px-4 py-3 text-gray-600">{paper.source}</td><td className="px-4 py-3 text-gray-600">{subjectName(paper.subjectId)}</td><td className="px-4 py-3 text-gray-600">{paper.level}</td><td className="px-4 py-3 text-right">{paper.questions}</td><td className="px-4 py-3 text-right">{paper.score}</td><td className="px-4 py-3 text-right">{paper.authorizedOrgs.length}</td><td className="px-4 py-3"><Badge className={paper.status === '已推送' ? 'bg-green-50 text-green-700' : paper.status === '已发布' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}>{paper.status}</Badge></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setActive(paper); setDialog('detail') }} className="text-xs text-[#1A56DB] hover:underline"><Eye className="mr-0.5 inline h-3.5 w-3.5" />查看</button><button onClick={() => { setActive(paper); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setActive(paper); setDialog('auth') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><ShieldCheck className="mr-0.5 inline h-3.5 w-3.5" />授权</button><button onClick={() => pushPaper(paper)} className="text-xs text-green-600 hover:underline"><Send className="mr-0.5 inline h-3.5 w-3.5" />推送</button><button onClick={() => { setPapers(prev => prev.filter(item => item.id !== paper.id)); toast.success('试卷已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active ? '编辑试卷' : '添加固定试卷'}</DialogTitle></DialogHeader>
          <form onSubmit={savePaper} className="space-y-3 text-sm">
            <Field label="试卷名称" name="name" defaultValue={active?.name} />
            <label className="block"><span className="font-medium text-gray-700">科目</span><select name="subjectId" defaultValue={active?.subjectId || (bank === '理论题库' ? theorySubjects[0].id : skillSubjects[0].id)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{(bank === '理论题库' ? theorySubjects : skillSubjects).map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <div className="grid grid-cols-3 gap-3"><SelectField label="等级" name="level" defaultValue={active?.level || '三级'} options={bank === '理论题库' ? levels : skillLevels} /><Field label="题数" name="questions" defaultValue={String(active?.questions || (bank === '理论题库' ? 80 : 3))} type="number" /><Field label="总分" name="score" defaultValue={String(active?.score || 100)} type="number" /></div>
            <SelectField label="状态" name="status" defaultValue={active?.status || '草稿'} options={['草稿', '已发布', '已推送']} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'auth'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>试卷授权 - {active?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">{orgOptions.map(org => <label key={org} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" checked={active?.authorizedOrgs.includes(org) || false} onChange={() => toggleAuth(org)} className="mr-2" />{org}</label>)}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'detail'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>试卷详情</DialogTitle></DialogHeader>
          {active && <div className="space-y-2 text-sm"><Info label="试卷名称" value={active.name} /><Info label="科目" value={subjectName(active.subjectId)} /><Info label="等级" value={active.level} /><Info label="题数" value={`${active.questions} 道`} /><Info label="授权机构" value={active.authorizedOrgs.join('、') || '未授权'} /></div>}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'extract'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>抽卷</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm"><Field label="抽卷名称" name="name" defaultValue={bank === '理论题库' ? '系统抽取理论试卷' : '系统抽取技能试卷'} /><SelectField label="组卷规则" name="rule" defaultValue={bank === '理论题库' ? '核反应堆运行三级-A卷规则' : '控制棒操作三级-A卷规则'} options={bank === '理论题库' ? ['核反应堆运行三级-A卷规则', '核电运行跨科目综合规则'] : ['控制棒操作三级-A卷规则', '运行检修跨科目综合规则']} /><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('抽卷完成，已生成新试卷') }}>抽取</Button></div></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function subjectName(id: string) {
  return theorySubjects.find(subject => subject.id === id)?.name || skillSubjectName(id)
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
