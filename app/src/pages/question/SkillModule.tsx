import { useMemo, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronRight, Download, Edit3, Eye, FileUp, Layers, MoveUp, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { skillModules, skillSubjects, type SkillModule } from './skillData'

export default function SkillModuleManage() {
  const [modules, setModules] = useState<SkillModule[]>(skillModules)
  const [subjectId, setSubjectId] = useState(skillSubjects[0].id)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>(modules.filter(item => !item.parentId).map(item => item.id))
  const [dialog, setDialog] = useState<'add' | 'import' | 'view' | null>(null)
  const [editing, setEditing] = useState<SkillModule | null>(null)
  const [parent, setParent] = useState<SkillModule | null>(null)

  const roots = useMemo(() => modules.filter(item => item.subjectId === subjectId && !item.parentId), [modules, subjectId])
  const currentSubject = skillSubjects.find(item => item.id === subjectId) || skillSubjects[0]
  const childrenOf = (id: string) => modules.filter(item => item.parentId === id && (!search || item.name.includes(search) || item.code.includes(search)))

  const saveModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: SkillModule = {
      id: editing?.id || String(Date.now()),
      subjectId,
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      parentId: String(fd.get('parentId') || '') || parent?.id,
      valid: String(fd.get('valid')) === 'true',
      scene: String(fd.get('scene') || '实操考试'),
      score: Number(fd.get('score') || 10),
      time: Number(fd.get('time') || 20),
      questionCount: editing?.questionCount || 0,
      description: String(fd.get('description') || ''),
    }
    if (!next.code || !next.name) {
      toast.error('请填写模块编码和名称')
      return
    }
    setModules(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [...prev, next])
    setDialog(null)
    setEditing(null)
    setParent(null)
    toast.success(editing ? '技能模块已更新' : '技能模块已添加')
  }

  const renderModule = (module: SkillModule, depth = 0) => {
    const children = childrenOf(module.id)
    const hasChildren = children.length > 0
    if (search && !module.name.includes(search) && !module.code.includes(search) && children.length === 0) return null
    return (
      <div key={module.id}>
        <div className="grid grid-cols-[1fr_90px_90px_90px_260px] items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50" style={{ paddingLeft: depth * 24 + 12 }}>
          <div className="flex items-center gap-2">
            <button onClick={() => hasChildren && setExpanded(prev => prev.includes(module.id) ? prev.filter(id => id !== module.id) : [...prev, module.id])} className="h-5 w-5 text-gray-500">{hasChildren ? expanded.includes(module.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}</button>
            <Layers className="h-4 w-4 text-[#1A56DB]" />
            <div><div className="font-medium text-gray-900">{module.name}</div><div className="text-xs text-gray-500">{module.code} / {module.description}</div></div>
          </div>
          <Badge className={module.valid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>{module.valid ? '有效' : '无效'}</Badge>
          <div className="text-sm text-gray-600">{module.score}分</div>
          <div className="text-sm text-gray-600">{module.time}分钟</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setParent(module); setEditing(null); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline">添加下级</button>
            <button onClick={() => { setEditing(module); setParent(null); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
            <button onClick={() => toast.success('位置已移动')} className="text-xs text-gray-600 hover:text-[#1A56DB]"><MoveUp className="mr-0.5 inline h-3.5 w-3.5" />移动</button>
            <button onClick={() => { setModules(prev => prev.map(item => item.id === module.id ? { ...item, valid: !item.valid } : item)); toast.success('有效性已更新') }} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button>
            <button onClick={() => { setModules(prev => prev.filter(item => item.id !== module.id && item.parentId !== module.id)); toast.success('模块已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button>
          </div>
        </div>
        {hasChildren && expanded.includes(module.id) && children.map(child => renderModule(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">技能模块</h1><p className="mt-1 text-sm text-gray-500">维护选中技能科目的模块结构，支持上下级、移动、有效性、细目表导入和结构展示</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setDialog('import')}><FileUp className="mr-2 h-4 w-4" />细目表导入</Button><Button variant="outline" onClick={() => setDialog('view')}><Eye className="mr-2 h-4 w-4" />结构展示</Button><Button onClick={() => { setEditing(null); setParent(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加模块</Button></div>
      </div>
      <div className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 text-sm font-semibold text-gray-900">选择技能科目</div><div className="space-y-2">{skillSubjects.map(subject => <button key={subject.id} onClick={() => setSubjectId(subject.id)} className={`w-full rounded-md border p-3 text-left ${subjectId === subject.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}><div className="font-medium text-gray-900">{subject.name}</div><div className="mt-1 text-xs text-gray-500">{subject.modules} 模块 / {subject.questions} 题</div></button>)}</div></aside>
        <section className="rounded-lg border border-gray-200 bg-white"><div className="flex items-center justify-between border-b border-gray-100 p-3"><div className="font-semibold text-gray-900">{currentSubject.name} - 技能模块</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索模块名称/编码" className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div></div><div className="p-2">{roots.map(root => renderModule(root))}</div></section>
      </div>
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null); setParent(null) }}><DialogContent><DialogHeader><DialogTitle>{editing ? '编辑技能模块' : parent ? `添加 ${parent.name} 下级` : '添加技能模块'}</DialogTitle></DialogHeader><form onSubmit={saveModule} className="grid grid-cols-2 gap-3 text-sm"><Field label="模块编码" name="code" defaultValue={editing?.code} /><Field label="模块名称" name="name" defaultValue={editing?.name} /><label className="block"><span className="font-medium text-gray-700">上级模块</span><select name="parentId" defaultValue={editing?.parentId || parent?.id || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option value="">无</option>{modules.filter(item => item.subjectId === subjectId).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><SelectField label="应用场景" name="scene" defaultValue={editing?.scene || '实操考试'} options={['实操考试', '模拟练习', '专家审题']} /><Field label="分值" name="score" defaultValue={String(editing?.score || 10)} type="number" /><Field label="时长" name="time" defaultValue={String(editing?.time || 20)} type="number" /><SelectField label="有效性" name="valid" defaultValue={String(editing?.valid ?? true)} options={['true', 'false']} /><label className="col-span-2 block"><span className="font-medium text-gray-700">模块描述</span><textarea name="description" defaultValue={editing?.description} className="mt-1 h-20 w-full rounded-md border border-gray-200 px-3 py-2" /></label><div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>细目表导入</DialogTitle></DialogHeader><textarea placeholder="粘贴技能模块细目表内容，可包含模块编码、模块名称、分值、时长、考核要点。" className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success('模板已下载')}><Download className="mr-2 h-4 w-4" />模板</Button><Button onClick={() => { setDialog(null); toast.success('细目表已导入') }}>导入</Button></div></DialogContent></Dialog>
      <Dialog open={dialog === 'view'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>结构展示</DialogTitle></DialogHeader><div className="rounded-md bg-[#F9FAFB] p-3 text-sm">{roots.map(root => <div key={root.id} className="mb-2"><div className="font-medium">{root.name}</div>{modules.filter(item => item.parentId === root.id).map(child => <div key={child.id} className="ml-5 text-gray-600">└ {child.name}</div>)}</div>)}</div></DialogContent></Dialog>
    </div>
  )
}
function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string; type?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} type={type} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{options.map(option => <option key={option} value={option}>{option === 'true' ? '有效' : option === 'false' ? '无效' : option}</option>)}</select></label> }
