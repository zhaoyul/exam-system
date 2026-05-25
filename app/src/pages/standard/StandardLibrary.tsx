import { useState } from 'react'
import { Search, Plus, Edit3, Trash2, Save, BookOpen, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

interface TreeNode { id: string; name: string; children?: TreeNode[] }

const treeData: TreeNode[] = [
  { id: '1', name: '核反应堆运行', children: [
    { id: '1-1', name: '核反应堆运行值班员', children: [
      { id: '1-1-1', name: '一级标准' },
      { id: '1-1-2', name: '二级标准' },
      { id: '1-1-3', name: '三级标准' },
    ]},
    { id: '1-2', name: '核反应堆操纵员' },
  ]},
  { id: '2', name: '电气试验', children: [
    { id: '2-1', name: '电气试验员', children: [
      { id: '2-1-1', name: '三级标准' },
      { id: '2-1-2', name: '四级标准' },
    ]},
  ]},
  { id: '3', name: '机械设备检修', children: [
    { id: '3-1', name: '机械设备检修工' },
    { id: '3-2', name: '仪控设备检修工' },
  ]},
]

const standards = [
  { id: 's1', name: '核反应堆运行值班员三级标准', code: 'CGN-S-001', version: 'V2.0', status: 'active', nodeId: '1-1-3' },
  { id: 's2', name: '电气试验员四级标准', code: 'CGN-S-002', version: 'V1.5', status: 'active', nodeId: '2-1-2' },
  { id: 's3', name: '机械设备检修工三级标准', code: 'CGN-S-003', version: 'V1.0', status: 'draft', nodeId: '3-1' },
]

const standardSections = [
  { title: '职业概况', type: '仅标题', rows: ['职业名称：核反应堆运行值班员', '职业编码：6-31-03-01', '职业定义：从事核反应堆运行监控、状态判断和异常处置的人员'] },
  { title: '基本要求', type: '基本要求', rows: ['职业道德：遵守核安全文化和运行纪律', '基础知识：核反应堆物理、热工水力、辐射防护'] },
  { title: '工作要求', type: '工作要求', rows: ['三级：能完成运行监视、参数记录和常规操作', '二级：能组织异常工况判断和班组协同处置'] },
  { title: '权重表', type: '权重表', rows: ['理论知识：基础知识 30%、专业知识 50%、安全要求 20%', '技能操作：运行监视 35%、异常处置 45%、记录报告 20%'] },
]

function TreeItem({ node, expanded, toggle, selected, onSelect }: {
  node: TreeNode; expanded: Set<string>; toggle: (id: string) => void; selected: string; onSelect: (id: string) => void
}) {
  const isExpanded = expanded.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  return (
    <div>
      <button onClick={() => { onSelect(node.id); if (hasChildren) toggle(node.id) }} className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md text-sm w-full text-left ${selected === node.id ? 'bg-blue-50 text-[#1A56DB] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
        {hasChildren ? (isExpanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />) : <span className="w-3.5" />}
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
        {node.name}
      </button>
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-gray-200 pl-1">
          {node.children!.map(c => <TreeItem key={c.id} node={c} expanded={expanded} toggle={toggle} selected={selected} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  )
}

export default function StandardLibrary() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '1-1']))
  const [selected, setSelected] = useState('1-1-3')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', version: '', status: 'draft' })
  const [stds, setStds] = useBackendListState(standards)
  const backendTreeData = useBackendResourceList('/standard/library', treeData)

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const filtered = stds.filter(s => !search || s.name.includes(search) || s.code.includes(search))
  const openAdd = () => { setForm({ name: '', code: '', version: '', status: 'draft' }); setShowAdd(true) }
  const openEdit = (i: any) => { setForm(i); setShowEdit(i) }
  const handleSave = () => {
    if (!form.name || !form.code) return
    if (showEdit) { setStds(prev => prev.map(i => i.id === showEdit.id ? { ...form, id: showEdit.id, nodeId: showEdit.nodeId } : i)); setShowEdit(null) }
    else { setStds(prev => [{ ...form, id: Date.now().toString(), nodeId: selected }, ...prev]); setShowAdd(false) }
  }
  const handleDelete = (id: string) => { setStds(prev => prev.filter(i => i.id !== id)); setShowDelete(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">标准库</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">标准分类</h2>
          <div className="space-y-0.5">{backendTreeData.map(n => <TreeItem key={n.id} node={n} expanded={expanded} toggle={toggle} selected={selected} onSelect={setSelected} />)}</div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索标准..." className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:border-[#1A56DB]" /></div>
            <Button onClick={openAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加标准</Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium"><tr><th className="px-4 py-3 text-left">标准名称</th><th className="px-4 py-3 text-left">标准编号</th><th className="px-4 py-3 text-left">版本</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-[#1A56DB]" />{i.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{i.code}</td>
                    <td className="px-4 py-3 text-gray-600">{i.version}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${i.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'active' ? '生效' : '草稿'}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => openEdit(i)} className="text-gray-500 hover:text-amber-600"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => setShowDelete(i.id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">标准正文结构</h2>
                <p className="mt-1 text-xs text-gray-500">按已发布模板维护职业概况、基本要求、工作要求和权重表，标准征集审核通过后自动入库。</p>
              </div>
              <Button variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />新增章节</Button>
            </div>
            <div className="divide-y divide-gray-100">
              {standardSections.map(section => (
                <div key={section.title} className="grid gap-3 px-4 py-3 md:grid-cols-[150px_110px_1fr_80px]">
                  <div className="font-medium text-gray-900">{section.title}</div>
                  <div><span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">{section.type}</span></div>
                  <div className="space-y-1 text-sm text-gray-600">{section.rows.map(row => <div key={row}>{row}</div>)}</div>
                  <div className="text-right"><button className="text-xs text-[#1A56DB] hover:underline">编辑</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>添加标准</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-700">标准名称</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="输入标准名称" /></div>
          <div><label className="text-sm font-medium text-gray-700">标准编号</label><input value={form.code} onChange={e => setForm({...form,code:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如: CGN-S-001" /></div>
          <div><label className="text-sm font-medium text-gray-700">版本</label><input value={form.version} onChange={e => setForm({...form,version:e.target.value})} className="w-full mt-1 h-9 px-3 border border-gray-200 rounded-md text-sm" placeholder="如: V1.0" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button><Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]"><Save className="w-4 h-4 mr-1" />保存</Button></div>
      </DialogContent></Dialog>
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader><p className="text-sm text-gray-500">确定要删除此标准吗？</p><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button><Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button></div></DialogContent></Dialog>
    </div>
  )
}
