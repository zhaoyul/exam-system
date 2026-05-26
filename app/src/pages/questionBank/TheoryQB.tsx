import { useMemo, useState, type FormEvent } from 'react'
import { BarChart3, Download, Edit3, FileUp, MoveRight, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { knowledgeNodes, questionTypes, subjectName, theoryQuestions, theorySubjects, type QuestionStatus, type TheoryQuestion } from '@/pages/question/theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'

interface ImportResult {
  imported: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

export default function TheoryQB() {
  const [items, setItems] = useBackendListState<TheoryQuestion>(theoryQuestions)
  const [subjectId, setSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('职业技能等级')
  const [dialog, setDialog] = useState<'add' | 'import' | 'stats' | 'transfer' | null>(null)
  const [editing, setEditing] = useState<TheoryQuestion | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [importText, setImportText] = useState('')

  const selectedSubject = theorySubjects.find(subject => subject.id === subjectId)
  const subjectRows = useMemo(() => theorySubjects.filter(subject => !search || subject.name.includes(search) || subject.code.includes(search)), [search])
  const questionRows = useMemo(() => items.filter(item => !subjectId || item.subjectId === subjectId), [items, subjectId])

  const saveQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: TheoryQuestion = {
      id: editing?.id || String(Date.now()),
      subjectId: subjectId || theorySubjects[0].id,
      knowledge: String(fd.get('knowledge') || ''),
      type: String(fd.get('type') || '单选题'),
      content: String(fd.get('content') || ''),
      difficulty: String(fd.get('difficulty') || '中等') as TheoryQuestion['difficulty'],
      score: Number(fd.get('score') || 1),
      status: String(fd.get('status') || '有效') as QuestionStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (!next.content) {
      toast.error('请填写正文')
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

  const setValidity = () => {
    if (selected.length === 0) {
      toast.info('请先选择试题')
      return
    }
    setItems(prev => prev.map(item => selected.includes(item.id) ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item))
    toast.success('有效性已更新')
  }

  const transferSelected = () => {
    if (selected.length === 0) {
      toast.error('请先选择试题')
      return
    }
    setDialog('transfer')
  }

  const downloadCsv = async (path: string, filename: string) => {
    const csv = await apiRequest<string>(path, { headers: { Accept: 'text/csv' } })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const importQuestions = async () => {
    if (!importText.trim()) {
      toast.error('请粘贴标准模板内容')
      return
    }
    const result = await apiRequest<ImportResult>('/question/theory/import', {
      method: 'POST',
      body: JSON.stringify({ content: importText, subjectId: subjectId || undefined }),
    })
    setDialog(null)
    setImportText('')
    toast.success(`已导入 ${result.imported} 道试题${result.failed ? `，失败 ${result.failed} 行` : ''}`)
    window.setTimeout(() => window.location.reload(), 300)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">试题管理</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <div className="mb-3 text-sm font-medium text-gray-700">0101</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />新增试题</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={transferSelected}><MoveRight className="mr-1.5 h-3.5 w-3.5" />转移内容</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('import')}><FileUp className="mr-1.5 h-3.5 w-3.5" />文本导入</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => downloadCsv('/question/theory/template', '理论试题导入模板.csv')}><Download className="mr-1.5 h-3.5 w-3.5" />模板</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => downloadCsv('/question/theory/export', '理论试题导出.csv')}><Download className="mr-1.5 h-3.5 w-3.5" />导出</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={deleteSelected}><Trash2 className="mr-1.5 h-3.5 w-3.5" />删除</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={setValidity}>有效性</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('stats')}><BarChart3 className="mr-1.5 h-3.5 w-3.5" />题量统计</Button>
        </div>
      </section>

      <section className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="w-12 px-4 py-3 text-left"><input type="checkbox" checked={questionRows.length > 0 && questionRows.every(item => selected.includes(item.id))} onChange={event => setSelected(event.target.checked ? questionRows.map(item => item.id) : [])} /></th>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">题型</th>
              <th className="px-4 py-3 text-left font-medium">正文</th>
              <th className="px-4 py-3 text-left font-medium">是否公开</th>
              <th className="px-4 py-3 text-left font-medium">有效性</th>
              <th className="px-4 py-3 text-left font-medium">难度</th>
              <th className="px-4 py-3 text-left font-medium">抽取次数</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questionRows.map((question, index) => (
              <tr key={question.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(question.id)} onChange={() => setSelected(prev => prev.includes(question.id) ? prev.filter(id => id !== question.id) : [...prev, question.id])} /></td>
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-gray-600">{question.type}</td>
                <td className="max-w-[420px] px-4 py-3 font-medium text-gray-900">{question.content}</td>
                <td className="px-4 py-3 text-gray-600">否</td>
                <td className="px-4 py-3 text-gray-600">{question.status}</td>
                <td className="px-4 py-3 text-gray-600">{question.difficulty}</td>
                <td className="px-4 py-3 text-gray-600">{index + 2}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(question); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
                </td>
              </tr>
            ))}
            {questionRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <TreeButton label="理论题库" active={activeSort === '理论题库'} onClick={() => setActiveSort('理论题库')} level={0} />
          <TreeButton label="职业技能等级" active={activeSort === '职业技能等级'} onClick={() => setActiveSort('职业技能等级')} level={1} />
          <TreeButton label="电工" active={activeSort === '电工'} onClick={() => setActiveSort('电工')} level={2} />
        </aside>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
            <span className="text-sm font-medium text-gray-700">科目名称</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
            <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜索</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">序号</th>
                  <th className="px-4 py-3 text-left font-medium">科目编码</th>
                  <th className="px-4 py-3 text-left font-medium">科目名称</th>
                  <th className="px-4 py-3 text-left font-medium">科目版本</th>
                  <th className="px-4 py-3 text-left font-medium">权限</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectRows.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td>
                    <td className="px-4 py-3 text-gray-600">{subject.version}</td>
                    <td className="px-4 py-3 text-gray-600">使用</td>
                    <td className="px-4 py-3"><button onClick={() => { setSubjectId(subject.id); setSelected([]) }} className="text-xs text-[#1A56DB] hover:underline">确定</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? '编辑试题' : '新增试题'}</DialogTitle></DialogHeader>
          <form onSubmit={saveQuestion} className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2 block"><span className="font-medium text-gray-700">正文</span><textarea name="content" defaultValue={editing?.content} className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" /></label>
            <SelectField label="题型" name="type" defaultValue={editing?.type || '单选题'} options={questionTypes} />
            <SelectField label="知识结构" name="knowledge" defaultValue={editing?.knowledge || knowledgeNodes[0].name} options={knowledgeNodes.map(node => node.name)} />
            <SelectField label="难度" name="difficulty" defaultValue={editing?.difficulty || '中等'} options={['简单', '中等', '困难']} />
            <Field label="分值" name="score" defaultValue={String(editing?.score || 1)} type="number" />
            <SelectField label="有效性" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效', '草稿']} />
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>文本导入</DialogTitle></DialogHeader>
          <textarea value={importText} onChange={event => setImportText(event.target.value)} placeholder="粘贴按标准 CSV 模板整理的试题内容" className="h-44 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => downloadCsv('/question/theory/template', '理论试题导入模板.csv')}>下载模板</Button>
            <Button onClick={importQuestions}>导入</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>题量统计 - {subjectName(subjectId || theorySubjects[0].id)}</DialogTitle></DialogHeader>
          <div className="space-y-2">{questionTypes.map(type => <div key={type} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"><span>{type}</span><span className="font-semibold">{questionRows.filter(item => item.type === type).length} 道</span></div>)}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'transfer'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>转移内容</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm"><div className="rounded-md bg-[#F9FAFB] p-3">已选择 {selected.length} 道试题</div><SelectField label="目标知识结构" name="target" defaultValue={knowledgeNodes[0].name} options={knowledgeNodes.map(node => node.name)} /><div className="flex justify-end"><Button onClick={() => { setDialog(null); setSelected([]); toast.success('内容已转移') }}>确认转移</Button></div></div>
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

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
