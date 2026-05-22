import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Download, Edit3, FileUp, MoveUp, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { knowledgeNodes, theorySubjects, type KnowledgeNode } from './theoryData'
import { useBackendListState } from '@/hooks/useBackendListState'

type ScopeTab = '全部' | '试题' | '资源'
type ValidFilter = '有效' | '无效'
type YesNo = '是' | '否'
type SceneFilter = '资源' | '试题'

export default function KnowledgeStructure() {
  const [nodes, setNodes] = useBackendListState<KnowledgeNode>(knowledgeNodes)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [scope, setScope] = useState<ScopeTab>('全部')
  const [search, setSearch] = useState('')
  const [structureName, setStructureName] = useState('')
  const [valid, setValid] = useState<ValidFilter>('有效')
  const [virtualStructure, setVirtualStructure] = useState<YesNo>('否')
  const [scene, setScene] = useState<SceneFilter>('资源')
  const [activeSort, setActiveSort] = useState('职业技能等级')
  const [activeNodeId, setActiveNodeId] = useState(knowledgeNodes[0]?.id || '')
  const [dialog, setDialog] = useState<'add' | 'import' | 'scene' | 'move' | null>(null)
  const [editing, setEditing] = useState<KnowledgeNode | null>(null)
  const normalizedNodes = useMemo(() => nodes.map(node => node.parentId === node.id ? { ...node, parentId: undefined } : node), [nodes])
  const sortedNodes = useMemo(() => [...normalizedNodes].sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''), 'zh-CN')), [normalizedNodes])
  const activeNode = normalizedNodes.find(node => node.id === activeNodeId) || normalizedNodes[0]

  useEffect(() => {
    if (!normalizedNodes.length) return
    if (!normalizedNodes.some(node => node.id === activeNodeId)) {
      setActiveNodeId(normalizedNodes[0].id)
    }
  }, [activeNodeId, normalizedNodes])

  const filteredSubjects = useMemo(() => theorySubjects.filter(subject => {
    return !search || subject.name.includes(search) || subject.code.includes(search)
  }), [search])

  const selectedSubject = theorySubjects.find(subject => subject.id === selectedSubjectId)

  const saveNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: KnowledgeNode = {
      id: editing?.id || String(Date.now()),
      code: String(fd.get('code') || ''),
      name: String(fd.get('name') || ''),
      parentId: String(fd.get('parentId') || '') || undefined,
      valid: String(fd.get('valid')) === 'true',
      scene: String(fd.get('scene') || scene),
      questionCount: editing?.questionCount || 0,
    }
    if (!next.code || !next.name) {
      toast.error('请填写结构编码和结构名称')
      return
    }
    setNodes(prev => editing ? prev.map(item => item.id === editing.id ? next : item) : [...prev, next])
    setActiveNodeId(next.id)
    setDialog(null)
    setEditing(null)
    toast.success(editing ? '知识结构已更新' : '知识结构已添加')
  }

  const removeSelected = () => {
    if (!activeNode) {
      toast.info('请先选择知识结构')
      return
    }
    setNodes(prev => prev.filter(node => node.id !== activeNode.id && node.parentId !== activeNode.id))
    setActiveNodeId(activeNode.parentId || normalizedNodes.find(node => node.id !== activeNode.id)?.id || '')
    toast.success('知识结构已删除')
  }

  const setSelectedValid = () => {
    if (!activeNode) {
      toast.info('请先选择知识结构')
      return
    }
    setNodes(prev => prev.map(node => node.id === activeNode.id ? { ...node, valid: !node.valid } : node))
    toast.success('有效性已更新')
  }

  const isDescendant = (nodeId: string, parentId?: string): boolean => {
    if (!parentId) return false
    if (nodeId === parentId) return true
    const parent = normalizedNodes.find(node => node.id === parentId)
    return isDescendant(nodeId, parent?.parentId)
  }

  const moveNode = (parentId?: string) => {
    if (!activeNode) {
      toast.info('请先选择知识结构')
      return
    }
    if (parentId === activeNode.id || isDescendant(activeNode.id, parentId)) {
      toast.error('不能移动到自身或下级结构中')
      return
    }
    setNodes(prev => prev.map(node => node.id === activeNode.id ? { ...node, parentId } : node))
    toast.success('结构已移动')
  }

  const applyScene = () => {
    if (!activeNode) {
      toast.info('请先选择知识结构')
      return
    }
    setNodes(prev => prev.map(node => node.id === activeNode.id ? { ...node, scene } : node))
    setDialog(null)
    toast.success('应用场景已设置')
  }

  const renderNode = (node: KnowledgeNode, depth = 0) => {
    const children = sortedNodes.filter(item => item.parentId === node.id)
    return (
      <div key={node.id}>
        <button
          onClick={() => { setActiveNodeId(node.id); setStructureName(node.name); setActiveSort(node.name) }}
          className={`block w-full rounded-md px-3 py-2 text-left text-sm ${activeNode?.id === node.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`}
          style={{ paddingLeft: 12 + depth * 18 }}
        >
          {node.name}
        </button>
        {children.map(child => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">知识结构</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm text-gray-600">{selectedSubject ? `当前操作科目：${selectedSubject.name}` : '请选择操作科目...'}</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => { setEditing(null); setDialog('add') }}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => { setEditing(activeNode || null); setDialog('add') }}><Edit3 className="mr-1.5 h-3.5 w-3.5" />编辑</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('move')}><MoveUp className="mr-1.5 h-3.5 w-3.5" />移动</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={removeSelected}><Trash2 className="mr-1.5 h-3.5 w-3.5" />删除</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={setSelectedValid}>有效性</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('scene')}><Settings className="mr-1.5 h-3.5 w-3.5" />应用场景设置</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('import')}><FileUp className="mr-1.5 h-3.5 w-3.5" />细目表导入</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('课程结构表已生成')}>课程结构表</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('试题细目表已生成')}>试题细目表</Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['全部', '试题', '资源'] as ScopeTab[]).map(item => (
            <button key={item} onClick={() => setScope(item)} className={`h-8 rounded-md px-5 text-sm ${scope === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">结构名称</span>
            <input value={structureName} onChange={event => setStructureName(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 text-sm" />
          </label>
          <RadioGroup label="有效性" value={valid} options={['有效', '无效']} onChange={value => setValid(value as ValidFilter)} />
          <RadioGroup label="虚拟结构" value={virtualStructure} options={['是', '否']} onChange={value => setVirtualStructure(value as YesNo)} />
          <RadioGroup label="应用场景" value={scene} options={['资源', '试题']} onChange={value => setScene(value as SceneFilter)} />
        </div>
      </section>

      <section className="grid grid-cols-[220px_1fr] gap-4">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <TreeButton label="理论题库" active={activeSort === '理论题库'} onClick={() => setActiveSort('理论题库')} level={0} />
          {sortedNodes.filter(node => !node.parentId).map(node => renderNode(node, 1))}
        </aside>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600">
            当前知识结构：{activeNode ? `${activeNode.code || activeNode.id} / ${activeNode.name} / ${activeNode.valid ? '有效' : '无效'} / ${activeNode.scene || '未设置'}` : '暂无'}
          </div>
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
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelectedSubjectId(subject.id); toast.success(`已选择 ${subject.name}`) }} className="text-xs text-[#1A56DB] hover:underline">确定</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setEditing(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? '编辑结构信息' : '添加知识结构'}</DialogTitle></DialogHeader>
          <form onSubmit={saveNode} className="grid grid-cols-2 gap-3 text-sm">
            <Field label="结构编码" name="code" defaultValue={editing?.code} />
            <Field label="结构名称" name="name" defaultValue={editing?.name || structureName} />
            <label className="block"><span className="font-medium text-gray-700">上级结构</span><select name="parentId" defaultValue={editing?.parentId || ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option value="">无</option>{sortedNodes.filter(node => node.id !== editing?.id && !isDescendant(editing?.id || '', node.id)).map(node => <option key={node.id} value={node.id}>{node.name}</option>)}</select></label>
            <label className="block"><span className="font-medium text-gray-700">应用场景</span><select name="scene" defaultValue={editing?.scene || scene} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option>资源</option><option>试题</option></select></label>
            <label className="block"><span className="font-medium text-gray-700">有效性</span><select name="valid" defaultValue={String(editing?.valid ?? true)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option value="true">有效</option><option value="false">无效</option></select></label>
            <div className="col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>细目表导入</DialogTitle></DialogHeader>
          <textarea placeholder="可直接粘贴系统模板中的细目表内容" className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success('模板已下载')}><Download className="mr-2 h-4 w-4" />模板</Button><Button onClick={() => { setDialog(null); toast.success('细目表已导入') }}>导入</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'scene'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>应用场景设置</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <RadioGroup label="应用场景" value={scene} options={['资源', '试题']} onChange={value => setScene(value as SceneFilter)} />
            <div className="flex justify-end"><Button onClick={applyScene}>保存</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'move'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>移动知识结构</DialogTitle></DialogHeader>
          <MoveForm
            active={activeNode}
            nodes={sortedNodes.filter(node => node.id !== activeNode?.id && !isDescendant(activeNode?.id || '', node.id))}
            onSubmit={parentId => { moveNode(parentId); setDialog(null) }}
          />
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

function RadioGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="mt-2 flex gap-4">
        {options.map(option => (
          <label key={option} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
            <input type="radio" checked={value === option} onChange={() => onChange(option)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}

function MoveForm({ active, nodes, onSubmit }: { active?: KnowledgeNode; nodes: KnowledgeNode[]; onSubmit: (parentId?: string) => void }) {
  const [parentId, setParentId] = useState(active?.parentId || '')
  if (!active) return <div className="text-sm text-gray-500">请先选择知识结构</div>
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md bg-gray-50 px-3 py-2 text-gray-600">当前结构：{active.name}</div>
      <label className="block">
        <span className="font-medium text-gray-700">目标上级结构</span>
        <select value={parentId} onChange={event => setParentId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">
          <option value="">无</option>
          {nodes.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}
        </select>
      </label>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(parentId || undefined)}>保存移动</Button>
      </div>
    </div>
  )
}
