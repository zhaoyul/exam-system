import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { skillModules, skillSubjects, type SkillModule } from './skillData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function SkillModuleManage() {
  const [modules, setModules] = useBackendListState<SkillModule>(skillModules)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [search, setSearch] = useState('')
  const [activeSort, setActiveSort] = useState('技能题库')
  const [activeTab, setActiveTab] = useState<'全部' | '试题' | '资源'>('全部')
  const [dialog, setDialog] = useState<'add' | 'import' | null>(null)
  const selectedSubject = skillSubjects.find(subject => subject.id === selectedSubjectId)

  const filteredSubjects = useMemo(() => skillSubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const filteredModules = useMemo(() => modules.filter(module => {
    const bySubject = selectedSubjectId ? module.subjectId === selectedSubjectId : true
    const bySearch = !search || module.name.includes(search) || module.code.includes(search)
    return bySubject && bySearch
  }), [modules, search, selectedSubjectId])

  const saveModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillModule = {
      id: String(Date.now()),
      subjectId: selectedSubjectId || skillSubjects[0].id,
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      valid: String(fd.get('valid') || '有效') === '有效',
      scene: String(fd.get('scene') || '试题'),
      score: Number(fd.get('score') || 10),
      time: Number(fd.get('time') || 20),
      questionCount: 0,
      description: String(fd.get('description') || ''),
    }
    if (!next.code || !next.name) {
      toast.error('请填写模块编码和结构名称')
      return
    }
    setModules(prev => [next, ...prev])
    setDialog(null)
    toast.success('技能模块已添加')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">技能模块</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <div className="flex flex-wrap gap-2">
          {['添 加', '编 辑', '移 动', '删 除', '有效性', '应用场景设置'].map(label => <Button key={label} variant={label === '添 加' ? 'default' : 'outline'} className="h-8 px-3 text-xs" onClick={() => label === '添 加' ? setDialog('add') : toast.success(`${label}已触发`)}>{label === '添 加' && <Plus className="mr-1.5 h-3.5 w-3.5" />}{label}</Button>)}
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('import')}>导入</Button>
          {['导出', '课程结构表', '要素细目表', '考核结构表'].map(label => <Button key={label} variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success(`${label}已生成`)}>{label}</Button>)}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {(['全部', '试题', '资源'] as const).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`h-8 rounded-md px-3 text-xs ${activeTab === tab ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>{tab === '全部' ? '全 部' : tab === '试题' ? '试 题' : '资 源'}</button>)}
        </div>
        <div className="grid grid-cols-4 gap-3 p-3 text-sm">
          <FieldInline label="结构名称" value={search} onChange={setSearch} />
          <SelectInline label="有效性" options={['有效', '无效']} />
          <SelectInline label="虚拟结构" options={['是', '否']} />
          <SelectInline label="应用场景" options={['资源', '试题', '试题配分']} />
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">序号</th><th className="px-4 py-3 text-left font-medium">结构名称</th><th className="px-4 py-3 text-left font-medium">有效性</th><th className="px-4 py-3 text-left font-medium">应用场景</th><th className="px-4 py-3 text-left font-medium">试题配分</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{filteredModules.map((module, index) => <tr key={module.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-gray-600">{index + 1}</td><td className="px-4 py-3 font-medium text-gray-900">{module.name}</td><td className="px-4 py-3 text-gray-600">{module.valid ? '有效' : '无效'}</td><td className="px-4 py-3 text-gray-600">{module.scene}</td><td className="px-4 py-3 text-gray-600">{module.score}</td><td className="px-4 py-3"><button className="text-xs text-[#1A56DB] hover:underline" onClick={() => toast.success('模块已打开')}>编辑</button></td></tr>)}</tbody>
          </table>
        </div>
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

      <Dialog open={dialog === 'add'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>添加技能模块</DialogTitle></DialogHeader><form onSubmit={saveModule} className="grid grid-cols-2 gap-3 text-sm"><Field label="模块编码" name="code" /><Field label="结构名称" name="name" /><SelectField label="有效性" name="valid" defaultValue="有效" options={['有效', '无效']} /><SelectField label="应用场景" name="scene" defaultValue="试题" options={['资源', '试题', '试题配分']} /><Field label="试题配分" name="score" defaultValue="10" type="number" /><Field label="时长" name="time" defaultValue="20" type="number" /><label className="col-span-2 block"><span className="font-medium text-gray-700">描述</span><textarea name="description" className="mt-1 h-20 w-full rounded-md border border-gray-200 px-3 py-2" /></label><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>导入</DialogTitle></DialogHeader><textarea className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" /><div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('导入完成') }}>导入</Button></div></DialogContent></Dialog>
    </div>
  )
}

function TreeButton({ label, active, level, onClick }: { label: string; active: boolean; level: number; onClick: () => void }) {
  return <button onClick={onClick} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${active ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + level * 18 }}>{label}</button>
}
function FieldInline({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-gray-600">{label}</span><input value={value} onChange={event => onChange(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2" /></label>
}
function SelectInline({ label, options }: { label: string; options: string[] }) {
  return <label className="block"><span className="text-gray-600">{label}</span><select className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
