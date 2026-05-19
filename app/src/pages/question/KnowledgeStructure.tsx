import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Plus, FolderTree, ChevronRight, ChevronDown, Trash2, Edit3, Layers } from 'lucide-react'

interface KnowledgeNode {
  id: number
  name: string
  code: string
  parentId: number | null
  children?: KnowledgeNode[]
  questionCount: number
}

const treeData: KnowledgeNode[] = [
  {
    id: 1, name: '核反应堆物理', code: 'KN-001', parentId: null, questionCount: 45,
    children: [
      { id: 11, name: '中子物理学', code: 'KN-001-01', parentId: 1, questionCount: 15 },
      { id: 12, name: '反应性控制', code: 'KN-001-02', parentId: 1, questionCount: 18 },
      { id: 13, name: '核燃料管理', code: 'KN-001-03', parentId: 1, questionCount: 12 },
    ]
  },
  {
    id: 2, name: '热工水力学', code: 'KN-002', parentId: null, questionCount: 38,
    children: [
      { id: 21, name: '单相流体力学', code: 'KN-002-01', parentId: 2, questionCount: 12 },
      { id: 22, name: '两相流体力学', code: 'KN-002-02', parentId: 2, questionCount: 14 },
      { id: 23, name: '传热学基础', code: 'KN-002-03', parentId: 2, questionCount: 12 },
    ]
  },
  {
    id: 3, name: '辐射防护', code: 'KN-003', parentId: null, questionCount: 32,
    children: [
      { id: 31, name: '辐射剂量学', code: 'KN-003-01', parentId: 3, questionCount: 10 },
      { id: 32, name: '辐射屏蔽', code: 'KN-003-02', parentId: 3, questionCount: 12 },
      { id: 33, name: '辐射监测', code: 'KN-003-03', parentId: 3, questionCount: 10 },
    ]
  },
]

function TreeNode({ node, depth = 0 }: { node: KnowledgeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-4 h-4 flex items-center justify-center">
            {expanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          </button>
        ) : <div className="w-4" />}
        <FolderTree className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="text-sm flex-1">{node.name}</span>
        <span className="text-xs text-gray-400 font-mono">{node.code}</span>
        <Badge variant="outline" className="text-[10px] ml-2">{node.questionCount}道</Badge>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs"><Edit3 className="w-3 h-3" /></Button>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

export default function KnowledgeStructure() {
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">知识结构</h1>
          <p className="text-sm text-gray-500 mt-1">管理理论题库的知识点和知识树结构</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增知识点</Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Subject selector */}
        <div className="col-span-3 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">选择科目</h3>
          {['核反应堆运行值班员', '电气值班员', '汽轮机运行值班员', '仪器仪表维修工'].map((name, i) => (
            <div key={i} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${i === 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-gray-500 mt-1">{[45, 38, 32, 28][i]}个知识点</div>
            </div>
          ))}
        </div>

        {/* Right: Knowledge tree */}
        <div className="col-span-9 bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">核反应堆运行值班员 - 知识结构</span>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="搜索知识点..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
          </div>
          <div className="p-2">
            {treeData.map(node => <TreeNode key={node.id} node={node} />)}
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>新增知识点</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddOpen(false); toast.success('知识点已添加'); }} className="space-y-3">
            <div className="space-y-1"><Label>知识点名称 *</Label><Input name="name" placeholder="如：中子物理学" required /></div>
            <div className="space-y-1"><Label>知识点编码 *</Label><Input name="code" placeholder="如：KN-001-01" required /></div>
            <div className="space-y-1"><Label>上级知识点</Label>
              <Select defaultValue="">
                <SelectTrigger><SelectValue placeholder="无（作为根节点）" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无（作为根节点）</SelectItem>
                  <SelectItem value="1">核反应堆物理</SelectItem>
                  <SelectItem value="2">热工水力学</SelectItem>
                  <SelectItem value="3">辐射防护</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button type="submit">保存</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
