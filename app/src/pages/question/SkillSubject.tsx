import { useMemo, useState, type FormEvent } from 'react'
import { Archive, Download, Edit3, FileSpreadsheet, MoreHorizontal, PackageOpen, Plus, Search, ShieldCheck, Trash2, Upload, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { orgOptions } from './theoryData'
import { skillLevels, skillSubjects, type SkillStatus, type SkillSubject } from './skillData'

export default function SkillSubjectManage() {
  const [subjects, setSubjects] = useState<SkillSubject[]>(skillSubjects)
  const [status, setStatus] = useState<'全部' | SkillStatus>('全部')
  const [level, setLevel] = useState('全部')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'add' | 'resource' | 'stats' | 'auth' | 'batchAuth' | null>(null)
  const [editing, setEditing] = useState<SkillSubject | null>(null)
  const [current, setCurrent] = useState<SkillSubject | null>(null)

  const filtered = useMemo(() => subjects.filter(subject => {
    const byStatus = status === '全部' || subject.status === status
    const byLevel = level === '全部' || subject.level === level
    const bySearch = !search || subject.name.includes(search) || subject.code.includes(search) || subject.category.includes(search)
    return byStatus && byLevel && bySearch
  }), [level, search, status, subjects])

  const saveSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillSubject = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      category: String(fd.get('category') || ''),
      level: String(fd.get('level') || '三级'),
      version: String(fd.get('version') || '2026版'),
      status: String(fd.get('status') || '有效') as SkillStatus,
      modules: editing?.modules || 0,
      questions: editing?.questions || 0,
      papers: editing?.papers || 0,
      resources: editing?.resources || 0,
      authorizedOrgs: editing?.authorizedOrgs || [],
      maintainOrgs: editing?.maintainOrgs || ['集团题库中心'],
    }
    if (!next.code || !next.name) {
      toast.error('请填写科目编码和科目名称')
      return
    }
    setSubjects(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [next, ...prev])
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '技能科目已更新' : '技能科目已添加')
  }

  const toggleAuth = (org: string) => {
    if (!current) return
    const nextOrgs = current.authorizedOrgs.includes(org) ? current.authorizedOrgs.filter(item => item !== org) : [...current.authorizedOrgs, org]
    setCurrent({ ...current, authorizedOrgs: nextOrgs })
    setSubjects(prev => prev.map(item => item.id === current.id ? { ...item, authorizedOrgs: nextOrgs } : item))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">技能科目</h1>
          <p className="mt-1 text-sm text-gray-500">维护技能题库科目资源，支持资源导入、统计、机构授权和有效性管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog('resource')}><PackageOpen className="mr-2 h-4 w-4" />资源</Button>
          <Button variant="outline" onClick={() => setDialog('stats')}><FileSpreadsheet className="mr-2 h-4 w-4" />资源统计</Button>
          <Button variant="outline" onClick={() => setDialog('batchAuth')}><ShieldCheck className="mr-2 h-4 w-4" />批量授权</Button>
          <Button onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="有效科目" value={subjects.filter(item => item.status === '有效').length} />
        <Stat label="技能模块" value={subjects.reduce((sum, item) => sum + item.modules, 0)} />
        <Stat label="技能试题" value={subjects.reduce((sum, item) => sum + item.questions, 0)} />
        <Stat label="授权机构" value={new Set(subjects.flatMap(item => item.authorizedOrgs)).size} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex flex-wrap gap-2">
            {(['全部', '有效', '无效'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}
            {['全部', ...skillLevels].map(item => <button key={item} onClick={() => setLevel(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${level === item ? 'border border-[#1A56DB] text-[#1A56DB]' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>)}
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="科目编码 / 名称 / 分类" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">科目编码</th><th className="px-4 py-3 text-left font-medium">科目名称</th><th className="px-4 py-3 text-left font-medium">分类/等级</th><th className="px-4 py-3 text-left font-medium">版本</th><th className="px-4 py-3 text-right font-medium">模块</th><th className="px-4 py-3 text-right font-medium">试题</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((subject, index) => <tr key={subject.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td><td className="px-4 py-3 font-medium text-gray-900"><Wrench className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{subject.name}</td><td className="px-4 py-3 text-gray-600">{subject.category} / {subject.level}</td><td className="px-4 py-3 text-gray-600">{subject.version}</td><td className="px-4 py-3 text-right">{subject.modules}</td><td className="px-4 py-3 text-right">{subject.questions}</td><td className="px-4 py-3"><Badge className={subject.status === '有效' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>{subject.status}</Badge></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => { setEditing(subject); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setCurrent(subject); setDialog('auth') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">机构授权</button><button onClick={() => { setSubjects(prev => prev.map(item => item.id === subject.id ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item)); toast.success('有效性已更新') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button><button onClick={() => toast.success('已导出 Word')} className="text-xs text-gray-600 hover:text-[#1A56DB]"><MoreHorizontal className="mr-0.5 inline h-3.5 w-3.5" />更多</button><button onClick={() => { setSubjects(prev => prev.filter(item => item.id !== subject.id)); toast.success('科目已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? '编辑技能科目' : '添加技能科目'}</DialogTitle></DialogHeader><form onSubmit={saveSubject} className="grid grid-cols-2 gap-3 text-sm"><Field label="科目编码" name="code" defaultValue={editing?.code} /><Field label="科目名称" name="name" defaultValue={editing?.name} /><Field label="专业类别" name="category" defaultValue={editing?.category || '运行操作'} /><SelectField label="等级" name="level" defaultValue={editing?.level || '三级'} options={skillLevels} /><Field label="版本号" name="version" defaultValue={editing?.version || '2026版'} /><SelectField label="有效性" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效']} /><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent>
      </Dialog>
      <Dialog open={dialog === 'resource'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>资源导入</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3 text-sm"><button onClick={() => toast.success('资源包已上传')} className="rounded-lg border border-dashed border-[#1A56DB] p-5 text-[#1A56DB]"><Upload className="mx-auto mb-2 h-5 w-5" />导入资源包</button><button onClick={() => toast.success('批量资源已上传')} className="rounded-lg border border-dashed border-[#1A56DB] p-5 text-[#1A56DB]"><Archive className="mx-auto mb-2 h-5 w-5" />批量导入资源</button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>资源统计</DialogTitle></DialogHeader><div className="space-y-2">{subjects.map(subject => <div key={subject.id} className="flex justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"><span>{subject.name}</span><span>{subject.resources} 资源 / {subject.modules} 模块 / {subject.questions} 题</span></div>)}</div><div className="flex justify-end"><Button variant="outline" onClick={() => toast.success('资源统计已导出')}><Download className="mr-2 h-4 w-4" />导出</Button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'auth'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>机构授权 - {current?.name}</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-2 text-sm">{orgOptions.map(org => <label key={org} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" checked={current?.authorizedOrgs.includes(org) || false} onChange={() => toggleAuth(org)} className="mr-2" />{org}</label>)}</div></DialogContent></Dialog>
      <Dialog open={dialog === 'batchAuth'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>批量授权</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><select className="h-9 w-full rounded-md border border-gray-200 px-2">{subjects.map(subject => <option key={subject.id}>{subject.name}</option>)}</select><select className="h-9 w-full rounded-md border border-gray-200 px-2">{orgOptions.map(org => <option key={org}>{org}</option>)}</select><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('批量授权完成') }}>授权</Button></div></div></DialogContent></Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div> }
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label> }
