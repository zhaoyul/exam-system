import { useMemo, useState, type FormEvent } from 'react'
import { BarChart3, BookOpen, Edit3, FileUp, MoveRight, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { knowledgeNodes, questionTypes, subjectName, theoryQuestions, theorySubjects, type QuestionStatus, type TheoryQuestion } from '@/pages/question/theoryData'

export default function TheoryQB() {
  const [items, setItems] = useState<TheoryQuestion[]>(theoryQuestions)
  const [subjectId, setSubjectId] = useState(theorySubjects[0].id)
  const [typeFilter, setTypeFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<'全部' | QuestionStatus>('全部')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'add' | 'import' | 'stats' | 'transfer' | null>(null)
  const [editing, setEditing] = useState<TheoryQuestion | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(() => items.filter(item => {
    const bySubject = item.subjectId === subjectId
    const byType = typeFilter === '全部' || item.type === typeFilter
    const byStatus = statusFilter === '全部' || item.status === statusFilter
    const bySearch = !search || item.content.includes(search) || item.knowledge.includes(search)
    return bySubject && byType && byStatus && bySearch
  }), [items, search, statusFilter, subjectId, typeFilter])

  const saveQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: TheoryQuestion = {
      id: editing?.id || String(Date.now()),
      subjectId,
      knowledge: String(fd.get('knowledge') || ''),
      type: String(fd.get('type') || '单选题'),
      content: String(fd.get('content') || ''),
      difficulty: String(fd.get('difficulty') || '中等') as TheoryQuestion['difficulty'],
      score: Number(fd.get('score') || 1),
      status: String(fd.get('status') || '有效') as QuestionStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (!next.content) {
      toast.error('请填写试题内容')
      return
    }
    setItems(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [next, ...prev])
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '试题已更新' : '试题已添加')
  }

  const deleteSelected = () => {
    if (selected.length === 0) {
      toast.error('请先选择试题')
      return
    }
    setItems(prev => prev.filter(item => !selected.includes(item.id)))
    setSelected([])
    toast.success('试题已删除')
  }

  const toggleStatus = (question: TheoryQuestion) => {
    setItems(prev => prev.map(item => item.id === question.id ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item))
    toast.success('试题有效性已更新')
  }

  const transferSelected = () => {
    if (selected.length === 0) {
      toast.error('请先选择试题')
      return
    }
    setDialog('transfer')
  }

  const statusBadge = (status: QuestionStatus) => {
    if (status === '有效') return <Badge className="bg-green-50 text-green-700">{status}</Badge>
    if (status === '无效') return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>
    return <Badge className="bg-amber-50 text-amber-700">{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">试题管理</h1>
          <p className="mt-1 text-sm text-gray-500">维护当前科目试题，支持添加、文本导入、删除、题量统计和层级转移</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog('import')}><FileUp className="mr-2 h-4 w-4" />文本导入</Button>
          <Button variant="outline" onClick={() => setDialog('stats')}><BarChart3 className="mr-2 h-4 w-4" />题量统计</Button>
          <Button variant="outline" onClick={transferSelected}><MoveRight className="mr-2 h-4 w-4" />层级转移</Button>
          <Button variant="outline" onClick={deleteSelected}><Trash2 className="mr-2 h-4 w-4" />删除当前试题</Button>
          <Button onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加试题</Button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-3 text-sm font-semibold text-gray-900">选择科目资源</div>
          <div className="space-y-2">{theorySubjects.map(subject => <button key={subject.id} onClick={() => { setSubjectId(subject.id); setSelected([]) }} className={`w-full rounded-md border p-3 text-left ${subjectId === subject.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}><div className="font-medium text-gray-900">{subject.name}</div><div className="mt-1 text-xs text-gray-500">{subject.level} / {subject.questions} 题</div></button>)}</div>
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
            <div className="flex flex-wrap gap-2">
              <select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="h-9 rounded-md border border-gray-200 px-2 text-sm"><option>全部</option>{questionTypes.map(type => <option key={type}>{type}</option>)}</select>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="h-9 rounded-md border border-gray-200 px-2 text-sm"><option>全部</option><option>有效</option><option>无效</option><option>草稿</option></select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="题干 / 知识点" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="w-12 px-4 py-3 text-left"><input type="checkbox" checked={filtered.length > 0 && filtered.every(item => selected.includes(item.id))} onChange={event => setSelected(event.target.checked ? filtered.map(item => item.id) : [])} /></th><th className="px-4 py-3 text-left font-medium">试题内容</th><th className="px-4 py-3 text-left font-medium">题型</th><th className="px-4 py-3 text-left font-medium">知识点</th><th className="px-4 py-3 text-left font-medium">难度</th><th className="px-4 py-3 text-left font-medium">分值</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(question => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(question.id)} onChange={() => setSelected(prev => prev.includes(question.id) ? prev.filter(id => id !== question.id) : [...prev, question.id])} /></td>
                    <td className="max-w-[360px] px-4 py-3 font-medium text-gray-900"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 shrink-0 text-[#1A56DB]" />{question.content}</span></td>
                    <td className="px-4 py-3 text-gray-600">{question.type}</td>
                    <td className="px-4 py-3 text-gray-600">{question.knowledge}</td>
                    <td className="px-4 py-3 text-gray-600">{question.difficulty}</td>
                    <td className="px-4 py-3 text-gray-600">{question.score}</td>
                    <td className="px-4 py-3">{statusBadge(question.status)}</td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setEditing(question); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => toggleStatus(question)} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? '编辑试题' : '添加试题'}</DialogTitle></DialogHeader>
          <form onSubmit={saveQuestion} className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2 block"><span className="font-medium text-gray-700">试题内容</span><textarea name="content" defaultValue={editing?.content} className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" /></label>
            <SelectField label="题型" name="type" defaultValue={editing?.type || '单选题'} options={questionTypes} />
            <SelectField label="知识点" name="knowledge" defaultValue={editing?.knowledge || knowledgeNodes[0].name} options={knowledgeNodes.map(node => node.name)} />
            <SelectField label="难度" name="difficulty" defaultValue={editing?.difficulty || '中等'} options={['简单', '中等', '困难']} />
            <Field label="分值" name="score" defaultValue={String(editing?.score || 1)} type="number" />
            <SelectField label="状态" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效', '草稿']} />
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>文本导入试题</DialogTitle></DialogHeader>
          <textarea placeholder="粘贴按模板整理的试题文本，系统将批量解析题干、选项、答案、解析和知识点。" className="h-44 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('已导入 12 道试题') }}>导入</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>题量统计 - {subjectName(subjectId)}</DialogTitle></DialogHeader>
          <div className="space-y-2">{questionTypes.map(type => <div key={type} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"><span>{type}</span><span className="font-semibold">{filtered.filter(item => item.type === type).length} 道</span></div>)}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'transfer'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>层级转移</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm"><div className="rounded-md bg-[#F9FAFB] p-3">已选择 {selected.length} 道试题</div><SelectField label="目标知识结构" name="target" defaultValue={knowledgeNodes[0].name} options={knowledgeNodes.map(node => node.name)} /><div className="flex justify-end"><Button onClick={() => { setDialog(null); setSelected([]); toast.success('试题层级已转移') }}>确认转移</Button></div></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
