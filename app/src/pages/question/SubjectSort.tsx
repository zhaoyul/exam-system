import { useState } from 'react'
import { Edit3, MoveUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface SubjectSortNode {
  id: string
  name: string
  parentId?: string
}

const initialNodes: SubjectSortNode[] = [
  { id: 'root', name: '理论题库' },
  { id: 'level', name: '职业技能等级', parentId: 'root' },
  { id: 'electrician', name: '电工', parentId: 'level' },
]

export default function SubjectSort() {
  const [nodes, setNodes] = useState(initialNodes)
  const [activeId, setActiveId] = useState('electrician')
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const active = nodes.find(node => node.id === activeId)

  const addNode = (name: string, parentId?: string) => {
    setNodes(prev => [...prev, { id: String(Date.now()), name, parentId }])
    toast.success('科目分类已添加')
  }

  const updateNode = (name: string) => {
    setNodes(prev => prev.map(node => node.id === activeId ? { ...node, name } : node))
    toast.success('科目分类已更新')
  }

  const deleteNode = () => {
    if (activeId === 'root') {
      toast.info('根分类不可删除')
      return
    }
    setNodes(prev => prev.filter(node => node.id !== activeId && node.parentId !== activeId))
    setActiveId('root')
    toast.success('科目分类已删除')
  }

  const renderNode = (node: SubjectSortNode, depth = 0) => {
    const children = nodes.filter(item => item.parentId === node.id)
    return (
      <div key={node.id}>
        <button
          onClick={() => setActiveId(node.id)}
          className={`block w-full rounded-md px-3 py-2 text-left text-sm ${activeId === node.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`}
          style={{ paddingLeft: 12 + depth * 22 }}
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
        <h1 className="text-xl font-bold text-gray-900">科目分类</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => setDialog('add')}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('edit')}><Edit3 className="mr-1.5 h-3.5 w-3.5" />编辑</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('add')}><Plus className="mr-1.5 h-3.5 w-3.5" />添加下级</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={deleteNode}><Trash2 className="mr-1.5 h-3.5 w-3.5" />删除</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('分类已移动')}><MoveUp className="mr-1.5 h-3.5 w-3.5" />移动</Button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="max-w-md">{nodes.filter(node => !node.parentId).map(node => renderNode(node))}</div>
      </section>

      <Dialog open={dialog === 'add'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>添加科目分类</DialogTitle></DialogHeader>
          <SortForm defaultValue="" onSubmit={name => { addNode(name, activeId); setDialog(null) }} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'edit'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>编辑科目分类</DialogTitle></DialogHeader>
          <SortForm defaultValue={active?.name || ''} onSubmit={name => { updateNode(name); setDialog(null) }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SortForm({ defaultValue, onSubmit }: { defaultValue: string; onSubmit: (name: string) => void }) {
  const [name, setName] = useState(defaultValue)
  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        <span className="font-medium text-gray-700">分类名称</span>
        <input value={name} onChange={event => setName(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
      </label>
      <div className="flex justify-end gap-2">
        <Button onClick={() => name ? onSubmit(name) : toast.error('请填写分类名称')}>保存</Button>
      </div>
    </div>
  )
}
