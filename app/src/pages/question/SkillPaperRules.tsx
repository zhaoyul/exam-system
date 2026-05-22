import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { skillSubjects } from './skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

interface SkillRule {
  id: string
  name: string
  standardCompose: string
  totalScore: number
  status: string
}

const initialRules: SkillRule[] = [
  { id: 'sr1', name: '测试技能组卷规则', standardCompose: '是', totalScore: 100, status: '启用' },
]

export default function SkillPaperRules() {
  const [rules, setRules] = useBackendListState<SkillRule>(initialRules)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('技能题库')
  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState<SkillRule | null>(null)
  const selectedSubject = skillSubjects.find(subject => subject.id === selectedSubjectId)

  const filteredSubjects = useMemo(() => skillSubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillRule = {
      id: editing?.id || String(Date.now()),
      name: String(fd.get('name') || ''),
      standardCompose: String(fd.get('standardCompose') || '是'),
      totalScore: Number(fd.get('totalScore') || 100),
      status: String(fd.get('status') || '启用'),
    }
    if (!next.name) {
      toast.error('请填写规则名称')
      return
    }
    setRules(prev => editing ? prev.map(rule => rule.id === editing.id ? next : rule) : [next, ...prev])
    setDialog(false)
    setEditing(null)
    toast.success(editing ? '组卷规则已更新' : '组卷规则已添加')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">组卷规则</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog(true) }}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
      </section>

      <section className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">规则名称</th><th className="px-4 py-3 text-left font-medium">标准组卷</th><th className="px-4 py-3 text-left font-medium">总分</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{rules.map((rule, index) => <tr key={rule.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td><td className="px-4 py-3 text-gray-600">{rule.standardCompose}</td><td className="px-4 py-3 text-gray-600">{rule.totalScore}</td><td className="px-4 py-3 text-gray-600">{rule.status}</td><td className="px-4 py-3"><button className="text-xs text-[#1A56DB] hover:underline" onClick={() => { setEditing(rule); setDialog(true) }}>编辑</button></td></tr>)}</tbody>
        </table>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3"><TreeButton label="技能题库" active={activeSort === '技能题库'} onClick={() => setActiveSort('技能题库')} level={0} /><TreeButton label="测试下级科目" active={activeSort === '测试下级科目'} onClick={() => setActiveSort('测试下级科目')} level={1} /></aside>
        <div className="rounded-lg border border-gray-200 bg-white"><div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3"><span className="text-sm font-medium text-gray-700">科目名称</span><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div><Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button></div><div className="overflow-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">科目编码</th><th className="px-4 py-3 text-left font-medium">科目名称</th><th className="px-4 py-3 text-left font-medium">科目版本</th><th className="px-4 py-3 text-left font-medium">权限</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredSubjects.map((subject, index) => <tr key={subject.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td><td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td><td className="px-4 py-3 text-gray-600">{subject.version}</td><td className="px-4 py-3 text-gray-600">维护</td><td className="px-4 py-3"><button onClick={() => setSelectedSubjectId(subject.id)} className="text-xs text-[#1A56DB] hover:underline">确定</button></td></tr>)}</tbody></table></div></div>
      </section>

      <Dialog open={dialog} onOpenChange={open => { setDialog(open); if (!open) setEditing(null) }}><DialogContent><DialogHeader><DialogTitle>{editing ? '编辑组卷规则' : '添加组卷规则'}</DialogTitle></DialogHeader><form key={editing?.id || 'new'} onSubmit={saveRule} className="space-y-3 text-sm"><Field label="规则名称" name="name" defaultValue={editing?.name} /><SelectField label="标准组卷" name="standardCompose" defaultValue={editing?.standardCompose || '是'} options={['是', '否']} /><Field label="总分" name="totalScore" defaultValue={String(editing?.totalScore || 100)} type="number" /><SelectField label="状态" name="status" defaultValue={editing?.status || '启用'} options={['启用', '停用']} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(false)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
    </div>
  )
}
function TreeButton({ label, active, level, onClick }: { label: string; active: boolean; level: number; onClick: () => void }) {
  return <button onClick={onClick} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${active ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + level * 18 }}>{label}</button>
}
function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
