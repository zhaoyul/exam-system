import { useState } from 'react'
import { Plus, FileText, ChevronRight, ChevronDown, X } from 'lucide-react'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

const initialTemplates = [
  { id: '1', name: '国家职业技能标准模板', type: '国标', status: 'published', date: '2025-01-15' },
  { id: '2', name: '核行业职业技能标准模板', type: '行标', status: 'published', date: '2025-03-20' },
  { id: '3', name: '中广核企业职业技能标准模板', type: '企标', status: 'draft', date: '2026-04-10' },
]

const templateItems = [
  { id: '1', title: '职业概况', type: '仅标题', level: 1, children: [
    { id: '1-1', title: '职业名称', type: '文本输入', level: 2 },
    { id: '1-2', title: '职业编码', type: '文本输入', level: 2 },
    { id: '1-3', title: '职业定义', type: '富文本输入', level: 2 },
    { id: '1-4', title: '职业技能等级', type: '等级选择', level: 2 },
  ]},
  { id: '2', title: '基本要求', type: '基本要求', level: 1, children: [
    { id: '2-1', title: '职业道德', type: '仅标题', level: 2, children: [
      { id: '2-1-1', title: '职业道德基本知识', type: '富文本输入', level: 3 },
      { id: '2-1-2', title: '职业守则', type: '富文本输入', level: 3 },
    ]},
    { id: '2-2', title: '基础知识', type: '文本输入', level: 2 },
  ]},
  { id: '3', title: '工作要求', type: '工作要求', level: 1 },
  { id: '4', title: '权重表', type: '权重表', level: 1 },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useBackendListState(initialTemplates)
  const backendTemplateItems = useBackendResourceList('/standard/templates', templateItems)
  const [selectedTpl, setSelectedTpl] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '1': true, '2': true })
  const [showAdd, setShowAdd] = useState(false)
  const [newTpl, setNewTpl] = useState({ name: '', type: '国标' })

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }))
  const doAdd = () => { if (!newTpl.name) return; setTemplates(p => [{ id: Date.now().toString(), name: newTpl.name, type: newTpl.type, status: 'draft', date: new Date().toISOString().split('T')[0] }, ...p]); setNewTpl({ name: '', type: '国标' }); setShowAdd(false) }
  const doPublish = (id: string) => setTemplates(p => p.map(t => t.id === id ? { ...t, status: 'published' } : t))
  const doDelete = (id: string) => { setTemplates(p => p.filter(t => t.id !== id)); if (selectedTpl === id) setSelectedTpl(null) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">标准规范模板</h1>
      {!selectedTpl ? (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowAdd(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5]"><Plus className="w-4 h-4" /> 添加模板</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-10 h-10 text-[#1A56DB]" />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${tpl.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{tpl.status === 'published' ? '已发布' : '草稿'}</span>
                </div>
                <div className="text-base font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#1A56DB]" onClick={() => setSelectedTpl(tpl.id)}>{tpl.name}</div>
                <div className="flex items-center gap-2 mt-2"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tpl.type}</span><span className="text-xs text-gray-500">{tpl.date}</span></div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setSelectedTpl(tpl.id)} className="h-8 px-3 bg-[#1A56DB] text-white rounded-md text-xs hover:bg-[#1748B5]">编辑</button>
                  {tpl.status === 'draft' && <button onClick={() => doPublish(tpl.id)} className="h-8 px-3 bg-green-600 text-white rounded-md text-xs hover:bg-green-700">发布</button>}
                  <button onClick={() => doDelete(tpl.id)} className="h-8 px-3 border border-red-200 text-red-600 rounded-md text-xs hover:bg-red-50">删除</button>
                </div>
              </div>
            ))}
          </div>
          {templates.length === 0 && <div className="py-12 text-center text-gray-400">暂无模板</div>}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div><button onClick={() => setSelectedTpl(null)} className="text-sm text-[#1A56DB] hover:underline mb-1">&larr; 返回模板列表</button><h2 className="text-lg font-semibold text-gray-900">{templates.find(t => t.id === selectedTpl)?.name}</h2></div>
            <button onClick={() => doPublish(selectedTpl)} className="h-9 px-4 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">发布模板</button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-gray-900">模板结构</h3><button className="h-8 px-3 bg-[#1A56DB] text-white rounded-md text-xs flex items-center gap-1 hover:bg-[#1748B5]"><Plus className="w-3.5 h-3.5" /> 增加新项</button></div>
            {backendTemplateItems.map(item => (
              <div key={item.id}>
                <div className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-50">
                  {item.children && (<button onClick={() => toggle(item.id)} className="text-gray-400">{expanded[item.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>)}{!item.children && <div className="w-4" />}
                  <span className="text-sm font-medium text-gray-900">{item.title}</span><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{item.type}</span>
                </div>
                {item.children && expanded[item.id] && (<div className="ml-6">{item.children.map(child => (
                  <div key={child.id}>
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-50">
                      {child.children && (<button onClick={() => toggle(child.id)} className="text-gray-400">{expanded[child.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>)}{!child.children && <div className="w-4" />}
                      <span className="text-sm text-gray-700">{child.title}</span><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{child.type}</span>
                    </div>
                    {child.children && expanded[child.id] && (<div className="ml-6">{child.children.map(sub => (<div key={sub.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-50"><div className="w-4" /><span className="text-sm text-gray-600">{sub.title}</span><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{sub.type}</span></div>))}</div>)}
                  </div>
                ))}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}
      {showAdd && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}><div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加模板</h3><button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><div className="p-6 space-y-4"><div><label className="block text-sm text-gray-700 mb-1">模板名称 *</label><input value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm" /></div><div><label className="block text-sm text-gray-700 mb-1">类型</label><select value={newTpl.type} onChange={e => setNewTpl({ ...newTpl, type: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm"><option>国标</option><option>行标</option><option>企标</option></select></div></div><div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"><button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button><button onClick={doAdd} disabled={!newTpl.name} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm disabled:opacity-40">保存</button></div></div></div>)}
    </div>
  )
}
