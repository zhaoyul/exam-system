import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { theorySubjects } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

interface PaperRule {
  id: string
  name: string
  duration: number
  composeType: string
  standardRule: string
  description: string
}

const initialRules: PaperRule[] = [
  { id: 'pr1', name: '电工理论三级组卷规则', duration: 120, composeType: '题库组卷', standardRule: '职业技能等级', description: '适用于电工三级理论考试' },
]

export default function PaperRules() {
  const [rules, setRules] = useBackendListState<PaperRule>(initialRules)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('职业技能等级')
  const [dialog, setDialog] = useState(false)
  const selectedSubject = theorySubjects.find(subject => subject.id === selectedSubjectId)

  const filteredSubjects = useMemo(() => theorySubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: PaperRule = {
      id: String(Date.now()),
      name: String(fd.get('name') || ''),
      duration: Number(fd.get('duration') || 120),
      composeType: String(fd.get('composeType') || '题库组卷'),
      standardRule: String(fd.get('standardRule') || '职业技能等级'),
      description: String(fd.get('description') || ''),
    }
    if (!next.name) {
      toast.error('请填写规则名称')
      return
    }
    setRules(prev => [next, ...prev])
    setDialog(false)
    toast.success('组卷规则已添加')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">组卷规则</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => setDialog(true)}><Plus className="mr-1.5 h-3.5 w-3.5" />添 加</Button>
      </section>

      <section className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">规则名称</th>
              <th className="px-4 py-3 text-left font-medium">测试时长（分钟）</th>
              <th className="px-4 py-3 text-left font-medium">组卷类型</th>
              <th className="px-4 py-3 text-left font-medium">标准规则</th>
              <th className="px-4 py-3 text-left font-medium">描述</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rules.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                <td className="px-4 py-3 text-gray-600">{rule.duration}</td>
                <td className="px-4 py-3 text-gray-600">{rule.composeType}</td>
                <td className="px-4 py-3 text-gray-600">{rule.standardRule}</td>
                <td className="px-4 py-3 text-gray-600">{rule.description}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs">
                    <button className="text-[#1A56DB] hover:underline" onClick={() => toast.success('组卷规则已打开')}>编辑</button>
                    <button className="text-red-600 hover:underline" onClick={() => setRules(prev => prev.filter(item => item.id !== rule.id))}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
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
            <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]">搜 索</Button>
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
                {filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{subject.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td>
                    <td className="px-4 py-3 text-gray-600">{subject.version}</td>
                    <td className="px-4 py-3 text-gray-600">使用</td>
                    <td className="px-4 py-3"><button onClick={() => setSelectedSubjectId(subject.id)} className="text-xs text-[#1A56DB] hover:underline">确定</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加组卷规则</DialogTitle></DialogHeader>
          <form onSubmit={saveRule} className="space-y-3 text-sm">
            <Field label="规则名称" name="name" />
            <Field label="测试时长（分钟）" name="duration" defaultValue="120" type="number" />
            <SelectField label="组卷类型" name="composeType" defaultValue="题库组卷" options={['题库组卷', '非题库组卷']} />
            <Field label="标准规则" name="standardRule" defaultValue="职业技能等级" />
            <label className="block"><span className="font-medium text-gray-700">描述</span><textarea name="description" className="mt-1 h-20 w-full rounded-md border border-gray-200 px-3 py-2" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(false)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
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
