import { useMemo, useState, type FormEvent } from 'react'
import { Archive, BookOpen, Download, Edit3, FileSpreadsheet, MoreHorizontal, PackageOpen, Plus, Search, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { orgOptions, theorySubjects, type SubjectStatus, type TheorySubject } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SubjectManage() {
  const [subjects, setSubjects] = useBackendListState<TheorySubject>(theorySubjects)
  const [status, setStatus] = useState<'全部' | SubjectStatus>('全部')
  const [search, setSearch] = useState('')
  const [activeLevel, setActiveLevel] = useState('全部')
  const [dialog, setDialog] = useState<'add' | 'resource' | 'stats' | 'auth' | 'batchAuth' | null>(null)
  const [editing, setEditing] = useState<TheorySubject | null>(null)
  const [current, setCurrent] = useState<TheorySubject | null>(null)
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0])

  const filtered = useMemo(() => subjects.filter(subject => {
    const byStatus = status === '全部' || subject.status === status
    const byLevel = activeLevel === '全部' || subject.level === activeLevel
    const bySearch = !search || subject.name.includes(search) || subject.code.includes(search) || subject.category.includes(search)
    return byStatus && byLevel && bySearch
  }), [activeLevel, search, status, subjects])

  const saveSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: TheorySubject = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      category: String(fd.get('category') || ''),
      level: String(fd.get('level') || ''),
      version: String(fd.get('version') || ''),
      status: String(fd.get('status') || '有效') as SubjectStatus,
      questions: editing?.questions || 0,
      papers: editing?.papers || 0,
      resources: editing?.resources || 0,
      authorizedOrgs: editing?.authorizedOrgs || [],
      maintainOrgs: editing?.maintainOrgs || ['集团题库中心'],
      typeCounts: editing?.typeCounts || { 单选题: 0, 多选题: 0, 判断题: 0 },
    }
    if (!next.code || !next.name) {
      toast.error('请填写科目编码和科目名称')
      return
    }
    setSubjects(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [next, ...prev])
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '科目已更新' : '科目已添加')
  }

  const openWithSubject = (type: typeof dialog, subject: TheorySubject) => {
    setCurrent(subject)
    setDialog(type)
  }

  const toggleValidity = (subject: TheorySubject) => {
    setSubjects(prev => prev.map(item => item.id === subject.id ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item))
    toast.success('有效性已更新')
  }

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(item => item.id !== id))
    toast.success('科目已删除')
  }

  const authorizeOrg = (org: string) => {
    if (!current) return
    setSubjects(prev => prev.map(item => item.id === current.id ? {
      ...item,
      authorizedOrgs: item.authorizedOrgs.includes(org) ? item.authorizedOrgs.filter(name => name !== org) : [...item.authorizedOrgs, org],
    } : item))
    setCurrent(prev => prev ? {
      ...prev,
      authorizedOrgs: prev.authorizedOrgs.includes(org) ? prev.authorizedOrgs.filter(name => name !== org) : [...prev.authorizedOrgs, org],
    } : prev)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">科目管理</h1>
          <p className="mt-1 text-sm text-gray-500">维护理论题库科目资源，支持导入、资源统计、机构授权和有效性管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog('resource')}><PackageOpen className="mr-2 h-4 w-4" />资源</Button>
          <Button variant="outline" onClick={() => setDialog('stats')}><FileSpreadsheet className="mr-2 h-4 w-4" />资源统计</Button>
          <Button variant="outline" onClick={() => setDialog('batchAuth')}><ShieldCheck className="mr-2 h-4 w-4" />批量授权</Button>
          <Button onClick={() => { setEditing(null); setDialog('add') }} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Plus className="mr-2 h-4 w-4" />添加</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="有效科目" value={subjects.filter(item => item.status === '有效').length} />
        <Stat label="无效科目" value={subjects.filter(item => item.status === '无效').length} />
        <Stat label="试题总数" value={subjects.reduce((sum, item) => sum + item.questions, 0)} />
        <Stat label="授权机构数" value={new Set(subjects.flatMap(item => item.authorizedOrgs)).size} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex flex-wrap gap-2">
            {(['全部', '有效', '无效'] as const).map(item => (
              <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-3 text-xs font-medium ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>
            ))}
            {['全部', '一级', '二级', '三级', '四级', '五级'].map(level => (
              <button key={level} onClick={() => setActiveLevel(level)} className={`h-8 rounded-md px-3 text-xs font-medium ${activeLevel === level ? 'border border-[#1A56DB] text-[#1A56DB]' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{level}</button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="科目编码 / 名称 / 分类" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">科目编码</th>
                <th className="px-4 py-3 text-left font-medium">科目名称</th>
                <th className="px-4 py-3 text-left font-medium">分类/等级</th>
                <th className="px-4 py-3 text-left font-medium">版本</th>
                <th className="px-4 py-3 text-right font-medium">试题</th>
                <th className="px-4 py-3 text-right font-medium">授权机构</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((subject, index) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#1A56DB]" />{subject.name}</span></td>
                  <td className="px-4 py-3 text-gray-600">{subject.category} / {subject.level}</td>
                  <td className="px-4 py-3 text-gray-600">{subject.version}</td>
                  <td className="px-4 py-3 text-right">{subject.questions}</td>
                  <td className="px-4 py-3 text-right">{subject.authorizedOrgs.length}</td>
                  <td className="px-4 py-3"><Badge className={subject.status === '有效' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>{subject.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => { setEditing(subject); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => openWithSubject('auth', subject)} className="text-xs text-gray-600 hover:text-[#1A56DB]">机构授权</button>
                      <button onClick={() => toggleValidity(subject)} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button>
                      <button onClick={() => toast.success('已导出 Word')} className="text-xs text-gray-600 hover:text-[#1A56DB]"><MoreHorizontal className="mr-0.5 inline h-3.5 w-3.5" />更多</button>
                      <button onClick={() => deleteSubject(subject.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? '编辑科目' : '添加科目'}</DialogTitle></DialogHeader>
          <form onSubmit={saveSubject} className="grid grid-cols-2 gap-3 text-sm">
            <Field label="科目编码" name="code" defaultValue={editing?.code} />
            <Field label="科目名称" name="name" defaultValue={editing?.name} />
            <Field label="科目分类" name="category" defaultValue={editing?.category || '核能工程'} />
            <SelectField label="等级" name="level" defaultValue={editing?.level || '三级'} options={['一级', '二级', '三级', '四级', '五级']} />
            <Field label="版本号" name="version" defaultValue={editing?.version || '2026版'} />
            <SelectField label="有效性" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效']} />
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button type="button" variant="outline" onClick={() => { setDialog(null); setEditing(null) }}>取消</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'resource'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>资源导入</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => toast.success('资源包已上传')} className="rounded-lg border border-dashed border-[#1A56DB] p-5 text-[#1A56DB]"><Upload className="mx-auto mb-2 h-5 w-5" />导入资源包</button>
              <button onClick={() => toast.success('批量资源已上传')} className="rounded-lg border border-dashed border-[#1A56DB] p-5 text-[#1A56DB]"><Archive className="mx-auto mb-2 h-5 w-5" />批量导入资源</button>
            </div>
            <div className="rounded-md bg-gray-50 p-3 text-gray-600">支持本地资源包对接导入、自建题库批量导入，上传成功后资源状态显示绿色对勾。</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>资源统计</DialogTitle></DialogHeader>
          <div className="overflow-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-3 py-2 text-left">科目</th><th className="px-3 py-2 text-right">学习资源</th><th className="px-3 py-2 text-right">单选</th><th className="px-3 py-2 text-right">多选</th><th className="px-3 py-2 text-right">判断</th><th className="px-3 py-2 text-right">简答</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{subjects.map(subject => <tr key={subject.id}><td className="px-3 py-2">{subject.name}</td><td className="px-3 py-2 text-right">{subject.resources}</td><td className="px-3 py-2 text-right">{subject.typeCounts.单选题 || 0}</td><td className="px-3 py-2 text-right">{subject.typeCounts.多选题 || 0}</td><td className="px-3 py-2 text-right">{subject.typeCounts.判断题 || 0}</td><td className="px-3 py-2 text-right">{subject.typeCounts.简答题 || 0}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="flex justify-end"><Button variant="outline" onClick={() => toast.success('资源统计已导出')}><Download className="mr-2 h-4 w-4" />导出</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'auth'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>机构授权 - {current?.name}</DialogTitle></DialogHeader>
          {current && <div className="grid grid-cols-[1fr_80px_1fr] gap-3 text-sm">
            <TransferList title="未授权" items={orgOptions.filter(org => !current.authorizedOrgs.includes(org))} onClick={authorizeOrg} />
            <div className="flex items-center justify-center text-xl text-[#1A56DB]">{'>'}</div>
            <TransferList title="已授权" items={current.authorizedOrgs} onClick={authorizeOrg} />
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'batchAuth'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>批量授权</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <label className="block"><span className="font-medium text-gray-700">选择科目</span><select className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{subjects.map(subject => <option key={subject.id}>{subject.name}</option>)}</select></label>
            <label className="block"><span className="font-medium text-gray-700">选择机构</span><select value={selectedOrg} onChange={event => setSelectedOrg(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{orgOptions.map(org => <option key={org}>{org}</option>)}</select></label>
            <div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success(`已授权给 ${selectedOrg}`) }}>授权</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-gray-900">{value}</div></div>
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}

function TransferList({ title, items, onClick }: { title: string; items: string[]; onClick: (item: string) => void }) {
  return <div className="rounded-md border border-gray-200"><div className="border-b border-gray-100 bg-[#F9FAFB] px-3 py-2 font-medium">{title}</div><div className="min-h-48 space-y-1 p-2">{items.map(item => <button key={item} onClick={() => onClick(item)} className="block w-full rounded px-2 py-1.5 text-left hover:bg-blue-50">{item}</button>)}</div></div>
}
