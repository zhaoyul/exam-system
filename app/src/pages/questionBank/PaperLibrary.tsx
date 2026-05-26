import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { theorySubjects, orgOptions } from '@/pages/question/theoryData'
import { skillSubjectName, skillSubjects } from '@/pages/question/skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

interface PaperLibraryItem {
  id: string
  name: string
  subjectId: string
  composeMode: string
  paperNo: string
  owner: string
  validUntil: string
  authorizedOrgs: string[]
  published: boolean
  questionCount?: number
  totalScore?: number
  questions?: Array<{ id: string; type?: string; content?: string; paperScore?: number }>
  status?: string
}

const initialPapers: PaperLibraryItem[] = [
  { id: 'pl1', name: '测试卷库管理', subjectId: 'ss2', composeMode: '题库组卷', paperNo: '', owner: '自己建立', validUntil: '', authorizedOrgs: ['大亚湾核电'], published: false },
  { id: 'pl2', name: '电工三级理论A卷库', subjectId: 's1', composeMode: '题库组卷', paperNo: 'L-20260612-A', owner: '集团题库中心', validUntil: '2026-12-31', authorizedOrgs: ['阳江核电'], published: true },
]

export default function PaperLibrary() {
  const [papers, setPapers] = useBackendListState<PaperLibraryItem>(initialPapers)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'add' | 'auth' | 'paper' | null>(null)
  const [active, setActive] = useState<PaperLibraryItem | null>(null)

  const filtered = useMemo(() => papers.filter(paper => {
    return !search || paper.name.includes(search) || subjectName(paper.subjectId).includes(search) || paper.paperNo.includes(search)
  }), [papers, search])

  const savePaper = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: PaperLibraryItem = {
      id: active?.id || String(Date.now()),
      name: String(fd.get('name') || ''),
      subjectId: String(fd.get('subjectId') || theorySubjects[0].id),
      composeMode: String(fd.get('composeMode') || '题库组卷'),
      paperNo: String(fd.get('paperNo') || ''),
      owner: String(fd.get('owner') || '自己建立'),
      validUntil: String(fd.get('validUntil') || ''),
      authorizedOrgs: active?.authorizedOrgs || [],
      published: active?.published || false,
    }
    if (!next.name) {
      toast.error('请填写卷库名称')
      return
    }
    setPapers(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '卷库已更新' : '卷库已添加')
  }

  const toggleAuth = (org: string) => {
    if (!active) return
    const currentOrgs = active.authorizedOrgs || []
    const authorizedOrgs = currentOrgs.includes(org) ? currentOrgs.filter(item => item !== org) : [...currentOrgs, org]
    setActive({ ...active, authorizedOrgs })
    setPapers(prev => prev.map(item => item.id === active.id ? { ...item, authorizedOrgs } : item))
  }

  const publishPaper = (paper: PaperLibraryItem) => {
    setPapers(prev => prev.map(item => item.id === paper.id ? { ...item, published: true } : item))
    toast.success('试卷已发布')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">卷库管理</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">卷库名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
          <Button className="h-9 bg-[#1A56DB] px-3 hover:bg-[#1748B5]" onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">卷库名称</th>
                <th className="px-4 py-3 text-left font-medium">科目名称</th>
                <th className="px-4 py-3 text-left font-medium">组卷方式</th>
                <th className="px-4 py-3 text-left font-medium">试卷编号</th>
                <th className="px-4 py-3 text-left font-medium">所有者</th>
                <th className="px-4 py-3 text-left font-medium">有效截止</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((paper, index) => (
                <tr key={paper.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{paper.name}</td>
                  <td className="px-4 py-3 text-gray-600">{subjectName(paper.subjectId)}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.composeMode}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.paperNo}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.owner}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.validUntil}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => { setActive(paper); setDialog('add') }} className="text-[#1A56DB] hover:underline">编辑</button>
                      <button onClick={() => { setActive(paper); setDialog('auth') }} className="text-[#1A56DB] hover:underline">授权</button>
                      <button onClick={() => { setPapers(prev => prev.filter(item => item.id !== paper.id)); toast.success('卷库已删除') }} className="text-red-600 hover:underline">删除</button>
                      <button onClick={() => { setActive(paper); setDialog('paper') }} className="text-[#1A56DB] hover:underline">试卷</button>
                      <button onClick={() => publishPaper(paper)} className="text-green-600 hover:underline">{paper.published ? '已发布' : '发布'}</button>
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
        <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">共计{filtered.length}条数据,当前第1页　1　20 条/页</div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{active ? '编辑卷库' : '添加卷库'}</DialogTitle></DialogHeader>
          <form onSubmit={savePaper} className="space-y-3 text-sm">
            <Field label="卷库名称" name="name" defaultValue={active?.name} />
            <label className="block"><span className="font-medium text-gray-700">科目名称</span><select name="subjectId" defaultValue={active?.subjectId || theorySubjects[0].id} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{[...theorySubjects, ...skillSubjects].map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="组卷方式" name="composeMode" defaultValue={active?.composeMode || '题库组卷'} options={['题库组卷', '非题库组卷']} />
              <Field label="试卷编号" name="paperNo" defaultValue={active?.paperNo} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="所有者" name="owner" defaultValue={active?.owner || '自己建立'} />
              <Field label="有效截止" name="validUntil" defaultValue={active?.validUntil} />
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'auth'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>授权 - {active?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">{orgOptions.map(org => <label key={org} className="rounded-md border border-gray-100 px-3 py-2"><input type="checkbox" checked={active?.authorizedOrgs?.includes(org) || false} onChange={() => toggleAuth(org)} className="mr-2" />{org}</label>)}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'paper'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>试卷 - {active?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Info label="卷库名称" value={active?.name || ''} />
            <Info label="科目名称" value={active ? subjectName(active.subjectId) : ''} />
            <Info label="试卷编号" value={active?.paperNo || '未生成'} />
            <Info label="题量/总分" value={`${active?.questionCount || active?.questions?.length || 0} 题 / ${active?.totalScore || 0} 分`} />
            <Info label="授权机构" value={(active?.authorizedOrgs || []).join('、') || '未授权'} />
            <div className="max-h-64 overflow-auto rounded-md border border-gray-100">
              {(active?.questions || []).map((question, index) => (
                <div key={question.id || index} className="border-b border-gray-100 px-3 py-2 last:border-b-0">
                  <div className="text-xs text-gray-500">{index + 1}. {question.type || '试题'} / {question.paperScore || 0} 分</div>
                  <div className="mt-1 text-gray-900">{question.content || question.id}</div>
                </div>
              ))}
              {(!active?.questions || active.questions.length === 0) && <div className="px-3 py-6 text-center text-gray-400">暂无试题清单</div>}
            </div>
            <div className="flex justify-end"><Button onClick={() => setDialog(null)}>确定</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function subjectName(id: string) {
  return theorySubjects.find(subject => subject.id === id)?.name || skillSubjectName(id)
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>
}
