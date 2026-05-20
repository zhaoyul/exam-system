import { useMemo, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronRight, Download, Edit3, Eye, FileUp, FolderTree, MoveUp, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { knowledgeNodes, theorySubjects, type KnowledgeNode } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function KnowledgeStructure() {
  const [nodes, setNodes] = useBackendListState<KnowledgeNode>(knowledgeNodes)
  const [subjectId, setSubjectId] = useState(theorySubjects[0].id)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>(nodes.filter(node => !node.parentId).map(node => node.id))
  const [dialog, setDialog] = useState<'add' | 'import' | 'view' | null>(null)
  const [parent, setParent] = useState<KnowledgeNode | null>(null)
  const [editing, setEditing] = useState<KnowledgeNode | null>(null)

  const roots = useMemo(() => nodes.filter(node => !node.parentId), [nodes])
  const selectedSubject = theorySubjects.find(item => item.id === subjectId) || theorySubjects[0]

  const visibleChildren = (id: string) => nodes.filter(node => node.parentId === id && (!search || node.name.includes(search) || node.code.includes(search)))

  const saveNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: KnowledgeNode = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      parentId: String(fd.get('parentId') || '') || parent?.id,
      valid: String(fd.get('valid')) === 'true',
      scene: String(fd.get('scene') || '理论考试'),
      questionCount: editing?.questionCount || 0,
    }
    if (!next.code || !next.name) {
      toast.error('请填写结构编码和名称')
      return
    }
    setNodes(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [...prev, next])
    setDialog(null)
    setParent(null)
    setEditing(null)
    toast.success(editing ? '知识结构已更新' : '知识结构已添加')
  }

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(item => item.id !== id && item.parentId !== id))
    toast.success('知识结构已删除')
  }

  const toggleExpanded = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const setValid = (node: KnowledgeNode) => {
    setNodes(prev => prev.map(item => item.id === node.id ? { ...item, valid: !item.valid } : item))
    toast.success('有效性已更新')
  }

  const renderNode = (node: KnowledgeNode, depth = 0) => {
    const children = visibleChildren(node.id)
    const hasChildren = children.length > 0
    if (search && !node.name.includes(search) && !node.code.includes(search) && children.length === 0) return null
    return (
      <div key={node.id}>
        <div className="group grid grid-cols-[1fr_110px_110px_260px] items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50" style={{ paddingLeft: depth * 24 + 12 }}>
          <div className="flex items-center gap-2">
            <button onClick={() => hasChildren && toggleExpanded(node.id)} className="h-5 w-5 text-gray-500">{hasChildren ? expanded.includes(node.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}</button>
            <FolderTree className="h-4 w-4 text-[#1A56DB]" />
            <div>
              <div className="font-medium text-gray-900">{node.name}</div>
              <div className="text-xs text-gray-500">{node.code}</div>
            </div>
          </div>
          <div><Badge className={node.valid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>{node.valid ? '有效' : '无效'}</Badge></div>
          <div className="text-sm text-gray-600">{node.questionCount} 题</div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { setParent(node); setEditing(null); setDialog('add') }} className="text-xs text-[#1A56DB] hover:underline">添加下级</button>
            <button onClick={() => { setEditing(node); setParent(null); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button>
            <button onClick={() => toast.success('位置已移动')} className="text-xs text-gray-600 hover:text-[#1A56DB]"><MoveUp className="mr-0.5 inline h-3.5 w-3.5" />移动</button>
            <button onClick={() => setValid(node)} className="text-xs text-gray-600 hover:text-[#1A56DB]">有效性</button>
            <button onClick={() => deleteNode(node.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button>
          </div>
        </div>
        {hasChildren && expanded.includes(node.id) && children.map(child => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">知识结构</h1>
          <p className="mt-1 text-sm text-gray-500">维护当前科目的知识结构，支持上下级、移动、有效性、应用场景和细目表导入</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog('import')}><FileUp className="mr-2 h-4 w-4" />细目表导入</Button>
          <Button variant="outline" onClick={() => setDialog('view')}><Eye className="mr-2 h-4 w-4" />结构展示</Button>
          <Button onClick={() => { setParent(null); setEditing(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加结构</Button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-3 text-sm font-semibold text-gray-900">选择科目资源</div>
          <div className="space-y-2">
            {theorySubjects.map(subject => (
              <button key={subject.id} onClick={() => setSubjectId(subject.id)} className={`w-full rounded-md border p-3 text-left ${subjectId === subject.id ? 'border-[#1A56DB] bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="font-medium text-gray-900">{subject.name}</div>
                <div className="mt-1 text-xs text-gray-500">{subject.level} / {subject.questions} 题</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-3">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Settings className="h-4 w-4 text-[#1A56DB]" />{selectedSubject.name} - 知识结构</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索结构名称/编码" className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
            </div>
          </div>
          <div className="p-2">{roots.map(root => renderNode(root))}</div>
        </section>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setParent(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? '编辑结构信息' : parent ? `添加 ${parent.name} 下级` : '添加知识结构'}</DialogTitle></DialogHeader>
          <form onSubmit={saveNode} className="grid grid-cols-2 gap-3 text-sm">
            <Field label="结构编码" name="code" defaultValue={editing?.code} />
            <Field label="结构名称" name="name" defaultValue={editing?.name} />
            <label className="block"><span className="font-medium text-gray-700">上级结构</span><select name="parentId" defaultValue={editing?.parentId || parent?.id || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option value="">无</option>{nodes.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}</select></label>
            <label className="block"><span className="font-medium text-gray-700">应用场景</span><select name="scene" defaultValue={editing?.scene || '理论考试'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option>理论考试</option><option>模拟练习</option><option>专家审题</option></select></label>
            <label className="block"><span className="font-medium text-gray-700">有效性</span><select name="valid" defaultValue={String(editing?.valid ?? true)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option value="true">有效</option><option value="false">无效</option></select></label>
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>细目表导入</DialogTitle></DialogHeader>
          <textarea placeholder="可直接粘贴系统模板中的细目表内容，如：KN-004 安全规程 / KN-004-01 工作票管理" className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success('模板已下载')}><Download className="mr-2 h-4 w-4" />模板</Button><Button onClick={() => { setDialog(null); toast.success('细目表已导入') }}>导入</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'view'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>结构展示</DialogTitle></DialogHeader>
          <div className="rounded-md bg-[#F9FAFB] p-3 text-sm">
            {roots.map(root => <div key={root.id} className="mb-2"><div className="font-medium">{root.name}</div>{nodes.filter(node => node.parentId === root.id).map(child => <div key={child.id} className="ml-5 text-gray-600">└ {child.name}</div>)}</div>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
