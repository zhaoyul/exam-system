import { useMemo, useState, type FormEvent } from 'react'
import { Archive, Download, Edit3, FileSpreadsheet, MoreHorizontal, PackageOpen, Plus, Search, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { orgOptions, theorySubjects, type SubjectStatus, type TheorySubject } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SubjectManage() {
  const [subjects, setSubjects] = useBackendListState<TheorySubject>(theorySubjects)
  const [status, setStatus] = useState<SubjectStatus>('有效')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('职业技能等级')
  const [dialog, setDialog] = useState<'add' | 'resource' | 'stats' | 'auth' | 'batchAuth' | null>(null)
  const [editing, setEditing] = useState<TheorySubject | null>(null)
  const [current, setCurrent] = useState<TheorySubject | null>(null)
  const [selectedOrg, setSelectedOrg] = useState(orgOptions[0])

  const filtered = useMemo(() => subjects.filter(subject => {
    const byStatus = subject.status === status
    const bySearch = !search || subject.name.includes(search) || subject.code.includes(search)
    return byStatus && bySearch
  }), [search, status, subjects])

  const saveSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: TheorySubject = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      category: String(fd.get('category') || activeSort),
      level: String(fd.get('level') || ''),
      version: String(fd.get('version') || ''),
      status: String(fd.get('status') || '有效') as SubjectStatus,
      questions: editing?.questions || 0,
      papers: editing?.papers || 0,
      resources: editing?.resources || 0,
      authorizedOrgs: editing?.authorizedOrgs || [],
      maintainOrgs: editing?.maintainOrgs || ['中广测试有限公司'],
      typeCounts: editing?.typeCounts || { 单选题: 0, 多选题: 0, 判断题: 0 },
    }
    if (!next.code || !next.name) {
      toast.error('请填写编码和科目名称')
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

  const ownerText = (subject: TheorySubject) => {
    if (subject.maintainOrgs.some(org => org.includes('中广测试'))) return '本机构'
    return subject.maintainOrgs.some(org => org.includes('集团')) ? '集团' : '本机构'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">科目管理</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">科目名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜索</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(['有效', '无效'] as SubjectStatus[]).map(item => (
              <button key={item} onClick={() => setStatus(item)} className={`h-8 rounded-md px-5 text-sm ${status === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('resource')}><PackageOpen className="mr-1.5 h-3.5 w-3.5" />资源</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('stats')}><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />资源统计</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('batchAuth')}><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />授权</Button>
            <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('资源移动已保存')}>移动资源</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <TreeButton label="理论题库" active={activeSort === '理论题库'} onClick={() => setActiveSort('理论题库')} level={0} />
          <TreeButton label="职业技能等级" active={activeSort === '职业技能等级'} onClick={() => setActiveSort('职业技能等级')} level={1} />
          <TreeButton label="电工" active={activeSort === '电工'} onClick={() => setActiveSort('电工')} level={2} />
        </aside>

        <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[900px] text-sm">
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
                  <td className="px-4 py-3 text-gray-600">{subject.maintainOrgs[0] || '中广测试有限公司'}</td>
                  <td className="px-4 py-3 text-gray-600">{ownerText(subject)}</td>
                  <td className="px-4 py-3 text-gray-600">Csyxgs002</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => { setEditing(subject); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => deleteSubject(subject.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button>
                      <button onClick={() => openWithSubject('auth', subject)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><MoreHorizontal className="mr-0.5 inline h-3.5 w-3.5" />更多...</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 font-medium text-gray-900">本机构授权使用</div>
          <div className="space-y-2 text-sm text-gray-600">
            {subjects.filter(item => item.status === '有效').slice(0, 3).map(item => <div key={item.id} className="rounded-md border border-gray-100 px-3 py-2">{item.name}</div>)}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 font-medium text-gray-900">授权维护</div>
          <div className="space-y-2 text-sm text-gray-600">
            {orgOptions.slice(0, 3).map(org => <div key={org} className="rounded-md border border-gray-100 px-3 py-2">{org}</div>)}
          </div>
        </section>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? '编辑科目' : '添加科目'}</DialogTitle></DialogHeader>
          <form onSubmit={saveSubject} className="grid grid-cols-2 gap-3 text-sm">
            <Field label="编码" name="code" defaultValue={editing?.code} />
            <Field label="科目名称" name="name" defaultValue={editing?.name} />
            <Field label="科目分类" name="category" defaultValue={editing?.category || activeSort} />
            <SelectField label="等级" name="level" defaultValue={editing?.level || '三级'} options={['一级', '二级', '三级', '四级', '五级']} />
            <Field label="版本号" name="version" defaultValue={editing?.version || 'V1'} />
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
          <DialogHeader><DialogTitle>资源</DialogTitle></DialogHeader>
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
          <DialogHeader><DialogTitle>授权 - {current?.name}</DialogTitle></DialogHeader>
          {current && <div className="grid grid-cols-[1fr_80px_1fr] gap-3 text-sm">
            <TransferList title="未授权" items={orgOptions.filter(org => !current.authorizedOrgs.includes(org))} onClick={authorizeOrg} />
            <div className="flex items-center justify-center text-xl text-[#1A56DB]">{'>'}</div>
            <TransferList title="已授权" items={current.authorizedOrgs} onClick={authorizeOrg} />
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'batchAuth'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>授权</DialogTitle></DialogHeader>
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

function TreeButton({ label, active, level, onClick }: { label: string; active: boolean; level: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${active ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + level * 18 }}>
      {label}
    </button>
  )
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
