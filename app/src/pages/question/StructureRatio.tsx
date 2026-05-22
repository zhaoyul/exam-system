import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { theorySubjects } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

interface RatioRule {
  id: string
  name: string
  standard: string
  description: string
}

const initialRules: RatioRule[] = [
  { id: 'rr1', name: '电工理论试题结构比重', standard: '职业技能等级', description: '用于电工理论题库组卷结构配置' },
]

export default function StructureRatio() {
  const [rules, setRules] = useBackendListState<RatioRule>(initialRules)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('职业技能等级')
  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState<RatioRule | null>(null)
  const selectedSubject = theorySubjects.find(subject => subject.id === selectedSubjectId)

  const filteredSubjects = useMemo(() => theorySubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: RatioRule = {
      id: editing?.id || String(Date.now()),
      name: String(fd.get('name') || ''),
      standard: String(fd.get('standard') || '职业技能等级'),
      description: String(fd.get('description') || ''),
    }
    if (!next.name) {
      toast.error('请填写名称')
      return
    }
    setRules(prev => editing ? prev.map(rule => rule.id === editing.id ? next : rule) : [next, ...prev])
    setDialog(false)
    setEditing(null)
    toast.success(editing ? '结构比重已更新' : '结构比重已添加')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">结构比重</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog(true) }}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
      </section>

      <section className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">标准</th>
              <th className="px-4 py-3 text-left font-medium">描述</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rules.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                <td className="px-4 py-3 text-gray-600">{rule.standard}</td>
                <td className="px-4 py-3 text-gray-600">{rule.description}</td>
                <td className="px-4 py-3"><button onClick={() => { setEditing(rule); setDialog(true) }} className="text-xs text-[#1A56DB] hover:underline">编辑</button></td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
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

      <Dialog open={dialog} onOpenChange={open => { setDialog(open); if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? '编辑结构比重' : '添加结构比重'}</DialogTitle></DialogHeader>
          <form key={editing?.id || 'new'} onSubmit={saveRule} className="space-y-3 text-sm">
            <Field label="名称" name="name" defaultValue={editing?.name} />
            <Field label="标准" name="standard" defaultValue={editing?.standard || '职业技能等级'} />
            <label className="block"><span className="font-medium text-gray-700">描述</span><textarea name="description" defaultValue={editing?.description} className="mt-1 h-20 w-full rounded-md border border-gray-200 px-3 py-2" /></label>
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

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
