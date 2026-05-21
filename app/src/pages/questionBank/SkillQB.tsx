import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { skillQuestions, skillSubjects, type SkillQuestion, type SkillQuestionStatus } from '@/pages/question/skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SkillQB() {
  const [items, setItems] = useBackendListState<SkillQuestion>(skillQuestions)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('技能题库')
  const [dialog, setDialog] = useState<'add' | 'import' | 'stats' | 'transfer' | 'score' | null>(null)
  const selectedSubject = skillSubjects.find(subject => subject.id === selectedSubjectId)

  const filteredSubjects = useMemo(() => skillSubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const filtered = useMemo(() => items.filter(item => {
    const bySubject = selectedSubjectId ? item.subjectId === selectedSubjectId : true
    const bySearch = !search || item.content.includes(search)
    return bySubject && bySearch
  }), [items, search, selectedSubjectId])

  const saveQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillQuestion = {
      id: String(Date.now()),
      subjectId: selectedSubjectId || skillSubjects[0].id,
      moduleId: '',
      content: String(fd.get('content') || ''),
      questionType: String(fd.get('questionType') || '实操题'),
      assessment: String(fd.get('assessment') || '过程评分'),
      score: Number(fd.get('score') || 10),
      duration: Number(fd.get('duration') || 20),
      status: String(fd.get('status') || '有效') as SkillQuestionStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (!next.content) {
      toast.error('请填写试题名称')
      return
    }
    setItems(prev => [next, ...prev])
    setDialog(null)
    toast.success('技能试题已添加')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">技能试题</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('transfer')}>转移内容</Button>
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => setDialog('add')}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('score')}>评分表</Button>
          {['删 除', '有效性', '题量统计'].map(label => <Button key={label} variant="outline" className="h-8 px-3 text-xs" onClick={() => label === '题量统计' ? setDialog('stats') : toast.success(`${label}已触发`)}>{label}</Button>)}
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('import')}>导入</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('AI试题已生成')}>Ai试题</Button>
        </div>
      </section>

      <section className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">试题名称</th><th className="px-4 py-3 text-left font-medium">试题总分</th><th className="px-4 py-3 text-left font-medium">时长(分钟)</th><th className="px-4 py-3 text-left font-medium">有效性</th><th className="px-4 py-3 text-left font-medium">抽取次数</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{filtered.map((question, index) => <tr key={question.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-medium text-gray-900">{question.content}</td><td className="px-4 py-3 text-gray-600">{question.score}</td><td className="px-4 py-3 text-gray-600">{question.duration}</td><td className="px-4 py-3 text-gray-600">{question.status}</td><td className="px-4 py-3 text-gray-600">0</td><td className="px-4 py-3"><button className="text-xs text-[#1A56DB] hover:underline" onClick={() => toast.success('试题已打开')}>编辑</button></td></tr>)}</tbody>
        </table>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[300px] text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">题型</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody><tr><td className="px-4 py-3 text-gray-600">1</td><td className="px-4 py-3 text-gray-600">实操题</td><td className="px-4 py-3"><button className="text-xs text-[#1A56DB] hover:underline">设置</button></td></tr></tbody></table>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <TreeButton label="技能题库" active={activeSort === '技能题库'} onClick={() => setActiveSort('技能题库')} level={0} />
          <TreeButton label="测试下级科目" active={activeSort === '测试下级科目'} onClick={() => setActiveSort('测试下级科目')} level={1} />
        </aside>
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3"><span className="text-sm font-medium text-gray-700">科目名称</span><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div><Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button></div>
          <div className="overflow-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">科目编码</th><th className="px-4 py-3 text-left font-medium">科目名称</th><th className="px-4 py-3 text-left font-medium">科目版本</th><th className="px-4 py-3 text-left font-medium">权限</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredSubjects.map((subject, index) => <tr key={subject.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td><td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td><td className="px-4 py-3 text-gray-600">{subject.version}</td><td className="px-4 py-3 text-gray-600">维护</td><td className="px-4 py-3"><button onClick={() => setSelectedSubjectId(subject.id)} className="text-xs text-[#1A56DB] hover:underline">确定</button></td></tr>)}</tbody></table></div>
        </div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>添加技能试题</DialogTitle></DialogHeader><form onSubmit={saveQuestion} className="space-y-3 text-sm"><label className="block"><span className="font-medium text-gray-700">试题名称</span><textarea name="content" className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" /></label><div className="grid grid-cols-2 gap-3"><Field label="试题总分" name="score" defaultValue="10" type="number" /><Field label="时长(分钟)" name="duration" defaultValue="20" type="number" /></div><SelectField label="有效性" name="status" defaultValue="有效" options={['有效', '无效', '草稿']} /><Field label="评分方式" name="assessment" defaultValue="过程评分" /><Field label="题型" name="questionType" defaultValue="实操题" /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>导入</DialogTitle></DialogHeader><textarea className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" /><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('导入完成') }}>导入</Button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'stats'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>题量统计</DialogTitle></DialogHeader><div className="text-sm text-gray-600">当前共 {filtered.length} 道技能试题。</div></DialogContent></Dialog>
      <Dialog open={dialog === 'transfer'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>转移内容</DialogTitle></DialogHeader><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('内容已转移') }}>确定</Button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'score'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>评分表</DialogTitle></DialogHeader><div className="text-sm text-gray-600">维护技能试题评分表。</div></DialogContent></Dialog>
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
