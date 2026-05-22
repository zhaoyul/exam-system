import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Edit3, Trash2, Move, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

interface SortNode {
  id: string
  name: string
  parentId?: string
  status?: string
  sort?: number
}

const initialNodes: SortNode[] = [
  { id: 'skill-root', name: '技能题库', status: 'active', sort: 1 },
  { id: 'skill-child', name: '测试下级科目', parentId: 'skill-root', status: 'active', sort: 2 },
]

export default function SkillSubjectSort() {
  const [nodes, setNodes] = useBackendListState<SortNode>(initialNodes)
  const [selectedId, setSelectedId] = useState(initialNodes[0].id)
  const [dialog, setDialog] = useState<'add' | 'edit' | 'move' | null>(null)
  const normalizedNodes = useMemo(() => nodes.map(node => node.parentId === node.id ? { ...node, parentId: undefined } : node), [nodes])
  const sortedNodes = useMemo(() => [...normalizedNodes].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)), [normalizedNodes])
  const selected = normalizedNodes.find(node => node.id === selectedId) || normalizedNodes[0]

  useEffect(() => {
    if (!normalizedNodes.length) return
    if (!normalizedNodes.some(node => node.id === selectedId)) {
      setSelectedId(normalizedNodes[0].id)
    }
  }, [normalizedNodes, selectedId])

  const saveNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const name = String(fd.get('name') || '')
    if (!name) {
      toast.error('请填写分类名称')
      return
    }
    if (dialog === 'edit') {
      setNodes(prev => prev.map(node => node.id === selected.id ? { ...node, name } : node))
      toast.success('分类已编辑')
    } else {
      setNodes(prev => [...prev, { id: `skill-category-${Date.now()}`, name, parentId: selected?.id, status: 'active', sort: prev.length + 1 }])
      toast.success('分类已添加')
    }
    setDialog(null)
  }

  const deleteNode = () => {
    if (!selected) {
      toast.info('请先选择科目分类')
      return
    }
    if (!selected.parentId) {
      toast.info('根分类不可删除')
      return
    }
    setNodes(prev => prev.filter(node => node.id !== selected.id && node.parentId !== selected.id))
    setSelectedId(selected.parentId)
    toast.success('分类已删除')
  }

  const isDescendant = (nodeId: string, parentId?: string): boolean => {
    if (!parentId) return false
    if (nodeId === parentId) return true
    const parent = normalizedNodes.find(node => node.id === parentId)
    return isDescendant(nodeId, parent?.parentId)
  }

  const moveNode = (parentId?: string) => {
    if (!selected) {
      toast.info('请先选择科目分类')
      return
    }
    if (!selected.parentId) {
      toast.info('根分类不可移动')
      return
    }
    if (parentId === selected.id || isDescendant(selected.id, parentId)) {
      toast.error('不能移动到自身或下级分类中')
      return
    }
    setNodes(prev => prev.map(node => node.id === selected.id ? { ...node, parentId, sort: Date.now() } : node))
    toast.success('分类已移动')
  }

  const renderNode = (node: SortNode, depth = 0) => {
    const children = sortedNodes.filter(item => item.parentId === node.id)
    return (
      <div key={node.id}>
        <button
          onClick={() => setSelectedId(node.id)}
          className={`block w-full rounded-md px-3 py-2 text-left text-sm ${selectedId === node.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`}
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
      <h1 className="text-xl font-bold text-gray-900">科目分类</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => setDialog('add')}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('edit')}><Edit3 className="mr-1.5 h-3.5 w-3.5" />编辑</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('add')}><GitBranch className="mr-1.5 h-3.5 w-3.5" />添加下级</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={deleteNode}><Trash2 className="mr-1.5 h-3.5 w-3.5" />删除</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('move')}><Move className="mr-1.5 h-3.5 w-3.5" />移动</Button>
        </div>
        <div className="min-h-[360px] p-4">
          <div className="w-80 rounded-md border border-gray-100 p-2">
            {sortedNodes.filter(node => !node.parentId).map(node => renderNode(node))}
          </div>
        </div>
      </section>

      <Dialog open={dialog === 'add' || dialog === 'edit'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === 'edit' ? '编辑科目分类' : '新增科目分类'}</DialogTitle></DialogHeader>
          <form key={`${dialog}-${selected?.id || 'none'}`} onSubmit={saveNode} className="space-y-3 text-sm">
            <label className="block"><span className="font-medium text-gray-700">分类名称</span><input name="name" defaultValue={dialog === 'edit' ? selected.name : ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'move'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>移动科目分类</DialogTitle></DialogHeader>
          <MoveForm
            active={selected}
            nodes={sortedNodes.filter(node => node.id !== selected?.id && !isDescendant(selected?.id || '', node.id))}
            onSubmit={parentId => { moveNode(parentId); setDialog(null) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MoveForm({ active, nodes, onSubmit }: { active?: SortNode; nodes: SortNode[]; onSubmit: (parentId?: string) => void }) {
  const [parentId, setParentId] = useState(active?.parentId || '')
  if (!active) return <div className="text-sm text-gray-500">请先选择科目分类</div>
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md bg-gray-50 px-3 py-2 text-gray-600">当前分类：{active.name}</div>
      <label className="block">
        <span className="font-medium text-gray-700">目标上级分类</span>
        <select value={parentId} onChange={event => setParentId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">
          <option value="">根目录</option>
          {nodes.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}
        </select>
      </label>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(parentId || undefined)}>保存移动</Button>
      </div>
    </div>
  )
}
