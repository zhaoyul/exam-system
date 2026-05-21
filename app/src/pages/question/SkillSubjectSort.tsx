import { useState, type FormEvent } from 'react'
import { Plus, Edit3, Trash2, Move, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface SortNode {
  id: string
  name: string
  level: number
}

const initialNodes: SortNode[] = [
  { id: 'skill-root', name: '技能题库', level: 0 },
  { id: 'skill-child', name: '测试下级科目', level: 1 },
]

export default function SkillSubjectSort() {
  const [nodes, setNodes] = useState(initialNodes)
  const [selectedId, setSelectedId] = useState(initialNodes[0].id)
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const selected = nodes.find(node => node.id === selectedId) || nodes[0]

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
      setNodes(prev => [...prev, { id: String(Date.now()), name, level: Math.min(selected.level + 1, 2) }])
      toast.success('分类已添加')
    }
    setDialog(null)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">科目分类</h1>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          <Button className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]" onClick={() => setDialog('add')}><Plus className="mr-1.5 h-3.5 w-3.5" />添加</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('edit')}><Edit3 className="mr-1.5 h-3.5 w-3.5" />编辑</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setDialog('add')}><GitBranch className="mr-1.5 h-3.5 w-3.5" />添加下级</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => { setNodes(prev => prev.filter(node => node.id !== selectedId)); setSelectedId('skill-root'); toast.success('分类已删除') }}><Trash2 className="mr-1.5 h-3.5 w-3.5" />删除</Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => toast.success('分类已移动')}><Move className="mr-1.5 h-3.5 w-3.5" />移动</Button>
        </div>
        <div className="min-h-[360px] p-4">
          <div className="w-80 rounded-md border border-gray-100 p-2">
            {nodes.map(node => (
              <button key={node.id} onClick={() => setSelectedId(node.id)} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${selectedId === node.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-700 hover:bg-gray-50'}`} style={{ paddingLeft: 12 + node.level * 18 }}>
                {node.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={dialog !== null} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === 'edit' ? '编辑科目分类' : '新增科目分类'}</DialogTitle></DialogHeader>
          <form onSubmit={saveNode} className="space-y-3 text-sm">
            <label className="block"><span className="font-medium text-gray-700">分类名称</span><input name="name" defaultValue={dialog === 'edit' ? selected.name : ''} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
