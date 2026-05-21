import { useMemo, useState, type FormEvent } from 'react'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { orgOptions } from './theoryData'
import { skillSubjects, type SkillStatus, type SkillSubject } from './skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SkillSubjectManage() {
  const [subjects, setSubjects] = useBackendListState<SkillSubject>(skillSubjects)
  const [status, setStatus] = useState<'有效' | '无效'>('有效')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('技能题库')
  const [dialog, setDialog] = useState<'add' | 'resource' | 'stats' | 'auth' | null>(null)
  const [editing, setEditing] = useState<SkillSubject | null>(null)
  const [current, setCurrent] = useState<SkillSubject | null>(null)

  const filtered = useMemo(() => subjects.filter(subject => {
    const byStatus = subject.status === status
    const bySearch = !search || subject.name.includes(search) || subject.code.includes(search)
    return byStatus && bySearch
  }), [search, status, subjects])

  const saveSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillSubject = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      category: String(fd.get('category') || '技能题库'),
      level: String(fd.get('level') || '三级'),
      version: String(fd.get('version') || 'v1'),
      status: String(fd.get('status') || '有效') as SkillStatus,
      modules: editing?.modules || 0,
      questions: editing?.questions || 0,
      papers: editing?.papers || 0,
      resources: editing?.resources || 0,
      authorizedOrgs: editing?.authorizedOrgs || [],
      maintainOrgs: editing?.maintainOrgs || ['中国工业集团有限公司'],
    }
    if (!next.code || !next.name) {
      toast.error('请填写编码和科目名称')
      return
    }
    setSubjects(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [next, ...prev])
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '技能科目已更新' : '技能科目已添加')
  }

  const toggleAuth = (org: string) => {
    if (!current) return
    const authorizedOrgs = current.authorizedOrgs.includes(org) ? current.authorizedOrgs.filter(item => item !== org) : [...current.authorizedOrgs, org]
    setCurrent({ ...current, authorizedOrgs })
    setSubjects(prev => prev.map(item => item.id === current.id ? { ...item, authorizedOrgs } : item))
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">技能科目</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">科目名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <div className="ml-2 flex items-center gap-2">
            {(['有效', '无效'] as const).map(item => <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{item}</button>)}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('resource')}>资源</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('stats')}>资源统计</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('auth')}>授权</Button>
            <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('资源已移动')}>移动资源</Button>
          </div>
        </div>

        <div className="grid grid-cols-[220px_1fr]">
          <aside className="border-r border-gray-100 p-3">
            <TreeButton label="技能题库" active={activeSort === '技能题库'} onClick={() => setActiveSort('技能题库')} level={0} />
            <TreeButton label="测试下级科目" active={activeSort === '测试下级科目'} onClick={() => setActiveSort('测试下级科目')} level={1} />
          </aside>
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">编码</th>
                  <th className="px-4 py-3 text-left font-medium">科目名称</th>
                  <th className="px-4 py-3 text-left font-medium">版本号</th>
                  <th className="px-4 py-3 text-left font-medium">维护机构</th>
                  <th className="px-4 py-3 text-left font-medium">所有者</th>
                  <th className="px-4 py-3 text-left font-medium">配卷负责</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td>
                    <td className="px-4 py-3 text-gray-600">{subject.version}</td>
                    <td className="px-4 py-3 text-gray-600">{subject.maintainOrgs[0] || '中国工业集团有限公司'}</td>
                    <td className="px-4 py-3 text-gray-600">本机构</td>
                    <td className="px-4 py-3 text-gray-600">设置</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button onClick={() => { setEditing(subject); setDialog('add') }} className="text-[#1A56DB] hover:underline">编辑</button>
                        <button onClick={() => { setSubjects(prev => prev.filter(item => item.id !== subject.id)); toast.success('科目已删除') }} className="text-red-600 hover:underline">删除</button>
                        <button onClick={() => toast.success('更多操作已打开')} className="text-gray-600 hover:text-[#1A56DB]"><MoreHorizontal className="mr-0.5 inline h-3.5 w-3.5" />更多...</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据,当前第1页　1　20 条/页</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">本机构授权使用</div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">授权维护</div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? '编辑技能科目' : '添加技能科目'}</DialogTitle></DialogHeader>
          <form onSubmit={saveSubject} className="grid grid-cols-2 gap-3 text-sm">
            <Field label="编码" name="code" defaultValue={editing?.code} />
            <Field label="科目名称" name="name" defaultValue={editing?.name} />
            <Field label="版本号" name="version" defaultValue={editing?.version || 'v1'} />
            <Field label="分类" name="category" defaultValue={editing?.category || '技能题库'} />
            <SelectField label="等级" name="level" defaultValue={editing?.level || '三级'} options={['一级', '二级', '三级', '四级', '五级']} />
            <SelectField label="有效性" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效']} />
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'resource'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>资源</DialogTitle></DialogHeader><div className="text-sm text-gray-600">可导入、查看和维护技能科目资源。</div></DialogContent></Dialog>
      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>资源统计</DialogTitle></DialogHeader><div className="space-y-2 text-sm">{subjects.map(subject => <div key={subject.id} className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span>{subject.name}</span><span>{subject.resources} 资源</span></div>)}</div></DialogContent></Dialog>
      <Dialog open={dialog === 'auth'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>授权</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-2 text-sm">{orgOptions.map(org => <label key={org} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" checked={current?.authorizedOrgs.includes(org) || false} onChange={() => toggleAuth(org)} className="mr-2" />{org}</label>)}</div></DialogContent></Dialog>
    </div>
  )
}

function TreeButton({ label, active, level, onClick }: { label: string; active: boolean; level: number; onClick: () => void }) {
  return <button onClick={onClick} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${active ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + level * 18 }}>{label}</button>
}
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
