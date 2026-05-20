import { useMemo, useState, type FormEvent } from 'react'
import { BarChart3, Edit3, FileUp, MoveRight, Plus, Search, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { skillModuleName, skillModules, skillQuestionTypes, skillQuestions, skillSubjectName, skillSubjects, type SkillQuestion, type SkillQuestionStatus } from '@/pages/question/skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SkillQB() {
  const [items, setItems] = useBackendListState<SkillQuestion>(skillQuestions)
  const [subjectId, setSubjectId] = useState(skillSubjects[0].id)
  const [moduleId, setModuleId] = useState('全部')
  const [status, setStatus] = useState<'全部' | SkillQuestionStatus>('全部')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [dialog, setDialog] = useState<'add' | 'import' | 'stats' | 'transfer' | null>(null)
  const [editing, setEditing] = useState<SkillQuestion | null>(null)

  const availableModules = skillModules.filter(module => module.subjectId === subjectId)
  const filtered = useMemo(() => items.filter(item => {
    const bySubject = item.subjectId === subjectId
    const byModule = moduleId === '全部' || item.moduleId === moduleId
    const byStatus = status === '全部' || item.status === status
    const bySearch = !search || item.content.includes(search) || item.assessment.includes(search)
    return bySubject && byModule && byStatus && bySearch
  }), [items, moduleId, search, status, subjectId])

  const saveQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillQuestion = {
      id: editing?.id || String(Date.now()),
      subjectId,
      moduleId: String(fd.get('moduleId') || availableModules[0]?.id || ''),
      content: String(fd.get('content') || ''),
      questionType: String(fd.get('questionType') || '实操题'),
      assessment: String(fd.get('assessment') || ''),
      score: Number(fd.get('score') || 10),
      duration: Number(fd.get('duration') || 20),
      status: String(fd.get('status') || '有效') as SkillQuestionStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (!next.content) {
      toast.error('请填写技能试题内容')
      return
    }
    setItems(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [next, ...prev])
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '技能试题已更新' : '技能试题已添加')
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">技能试题</h1><p className="mt-1 text-sm text-gray-500">按技能科目和三级模块维护实操题，支持文本导入、题量统计、删除和层级转移</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setDialog('import')}><FileUp className="mr-2 h-4 w-4" />文本导入</Button><Button variant="outline" onClick={() => setDialog('stats')}><BarChart3 className="mr-2 h-4 w-4" />题量统计</Button><Button variant="outline" onClick={() => selected.length ? setDialog('transfer') : toast.error('请先选择试题')}><MoveRight className="mr-2 h-4 w-4" />层级转移</Button><Button variant="outline" onClick={deleteSelected}><Trash2 className="mr-2 h-4 w-4" />删除当前试题</Button><Button onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加</Button></div>
      </div>
      <div className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 text-sm font-semibold text-gray-900">选择技能科目</div><div className="space-y-2">{skillSubjects.map(subject => <button key={subject.id} onClick={() => { setSubjectId(subject.id); setModuleId('全部'); setSelected([]) }} className={`w-full rounded-md border p-3 text-left ${subjectId === subject.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}><div className="font-medium text-gray-900">{subject.name}</div><div className="mt-1 text-xs text-gray-500">{subject.level} / {subject.questions} 题</div></button>)}</div></aside>
        <section className="rounded-lg border border-gray-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3"><div className="flex gap-2"><select value={moduleId} onChange={event => setModuleId(event.target.value)} className="h-9 rounded-md border border-gray-200 px-2 text-sm"><option>全部</option>{availableModules.map(module => <option key={module.id} value={module.id}>{module.name}</option>)}</select><select value={status} onChange={event => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border border-gray-200 px-2 text-sm"><option>全部</option><option>有效</option><option>无效</option><option>草稿</option></select></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="题目 / 考核要点" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div></div><div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={filtered.length > 0 && filtered.every(item => selected.includes(item.id))} onChange={event => setSelected(event.target.checked ? filtered.map(item => item.id) : [])} /></th><th className="px-4 py-3 text-left font-medium">技能试题</th><th className="px-4 py-3 text-left font-medium">模块</th><th className="px-4 py-3 text-left font-medium">题型</th><th className="px-4 py-3 text-left font-medium">评分方式</th><th className="px-4 py-3 text-right font-medium">分值</th><th className="px-4 py-3 text-right font-medium">时长</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(question => <tr key={question.id} className="hover:bg-gray-50"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(question.id)} onChange={() => setSelected(prev => prev.includes(question.id) ? prev.filter(id => id !== question.id) : [...prev, question.id])} /></td><td className="max-w-[360px] px-4 py-3 font-medium text-gray-900"><Wrench className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{question.content}</td><td className="px-4 py-3 text-gray-600">{skillModuleName(question.moduleId)}</td><td className="px-4 py-3 text-gray-600">{question.questionType}</td><td className="px-4 py-3 text-gray-600">{question.assessment}</td><td className="px-4 py-3 text-right">{question.score}</td><td className="px-4 py-3 text-right">{question.duration}分钟</td><td className="px-4 py-3"><Badge className={question.status === '有效' ? 'bg-green-50 text-green-700' : question.status === '草稿' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}>{question.status}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setEditing(question); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setItems(prev => prev.map(item => item.id === question.id ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item)); toast.success('有效性已更新') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button></div></td></tr>)}</tbody></table></div></section>
      </div>
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? '编辑技能试题' : '添加技能试题'}</DialogTitle></DialogHeader><form onSubmit={saveQuestion} className="grid grid-cols-2 gap-3 text-sm"><label className="col-span-2 block"><span className="font-medium text-gray-700">技能试题内容</span><textarea name="content" defaultValue={editing?.content} className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" /></label><SelectField label="技能模块" name="moduleId" defaultValue={editing?.moduleId || availableModules[0]?.id || ''} options={availableModules.map(item => ({ label: item.name, value: item.id }))} /><SelectField label="题型" name="questionType" defaultValue={editing?.questionType || '实操题'} options={skillQuestionTypes.map(item => ({ label: item, value: item }))} /><Field label="评分方式" name="assessment" defaultValue={editing?.assessment || '过程评分'} /><Field label="分值" name="score" defaultValue={String(editing?.score || 10)} type="number" /><Field label="时长" name="duration" defaultValue={String(editing?.duration || 20)} type="number" /><SelectField label="状态" name="status" defaultValue={editing?.status || '有效'} options={['有效', '无效', '草稿'].map(item => ({ label: item, value: item }))} /><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>文本导入技能试题</DialogTitle></DialogHeader><textarea placeholder="粘贴按模板整理的技能试题文本，系统将解析模块、考核要点、评分标准、分值和时长。" className="h-44 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" /><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('已导入 8 道技能试题') }}>导入</Button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>题量统计 - {skillSubjectName(subjectId)}</DialogTitle></DialogHeader><div className="space-y-2">{availableModules.map(module => <div key={module.id} className="flex justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"><span>{module.name}</span><span>{filtered.filter(item => item.moduleId === module.id).length} 道</span></div>)}</div></DialogContent></Dialog>
      <Dialog open={dialog === 'transfer'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>层级转移</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-md bg-[#F9FAFB] p-3">已选择 {selected.length} 道试题</div><SelectField label="目标技能模块" name="target" defaultValue={availableModules[0]?.id || ''} options={availableModules.map(item => ({ label: item.name, value: item.id }))} /><div className="flex justify-end"><Button onClick={() => { setDialog(null); setSelected([]); toast.success('试题层级已转移') }}>确认转移</Button></div></div></DialogContent></Dialog>
    </div>
  )
}
function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: Array<{ label: string; value: string }> }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> }
