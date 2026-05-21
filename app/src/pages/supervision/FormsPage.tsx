import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, Edit3, Eye, FileSpreadsheet, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formDefs, type ExpertFormDef } from './expertData'
import { useBackendListState } from '@/hooks/useBackendListState'

export default function FormsPage() {
  const [tab, setTab] = useState<'表单定义' | '使用设置'>('表单定义')
  const [backendItems, setItems] = useBackendListState<ExpertFormDef>(formDefs)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'add' | 'view' | 'setting' | null>(null)
  const [active, setActive] = useState<ExpertFormDef | null>(null)
  const items = useMemo(() => {
    const byId = new Map<string, ExpertFormDef>()
    formDefs.forEach(item => byId.set(item.id, item))
    backendItems.forEach(item => byId.set(item.id, item))
    return Array.from(byId.values())
  }, [backendItems])

  const filtered = useMemo(() => items.filter(item => !search || item.name.includes(search) || item.type.includes(search)), [items, search])

  const saveForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: ExpertFormDef = {
      id: active?.id || String(Date.now()),
      name: String(fd.get('name') || ''),
      type: String(fd.get('type') || '督导人员工作填表') as ExpertFormDef['type'],
      status: active?.status || '草稿',
      fields: String(fd.get('fields') || '').split('\n').map(item => item.trim()).filter(Boolean),
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (!next.name) {
      toast.error('请填写表单名称')
      return
    }
    setItems(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '表单已更新' : '表单已新增')
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-gray-900">表单管理</h1><p className="mt-1 text-sm text-gray-500">定义督导和考评工作表单，并设置移动端任务使用的表单模板</p></div>
      <div className="flex gap-2">{(['表单定义', '使用设置'] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`h-9 rounded-md px-4 text-sm font-medium ${tab === item ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{item}</button>)}</div>
      {tab === '表单定义' ? (
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="表单名称 / 类型" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" /></div><Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />新增</Button></div>
          <div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">表单名称</th><th className="px-4 py-3 text-left font-medium">类型</th><th className="px-4 py-3 text-right font-medium">字段数</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">更新日期</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(item => <tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900"><FileSpreadsheet className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{item.name}</td><td className="px-4 py-3 text-gray-600">{item.type}</td><td className="px-4 py-3 text-right">{item.fields.length}</td><td className="px-4 py-3"><Badge className={item.status === '已发布' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{item.status}</Badge></td><td className="px-4 py-3 text-gray-600">{item.updatedAt}</td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setActive(item); setDialog('view') }} className="text-xs text-[#1A56DB] hover:underline"><Eye className="mr-0.5 inline h-3.5 w-3.5" />预览</button><button onClick={() => { setActive(item); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => { setItems(prev => prev.map(row => row.id === item.id ? { ...row, status: '已发布' } : row)); toast.success('表单校验通过并发布') }} className="text-xs text-green-600 hover:underline"><CheckCircle2 className="mr-0.5 inline h-3.5 w-3.5" />校验</button><button onClick={() => { setItems(prev => prev.filter(row => row.id !== item.id)); toast.success('表单已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button></div></td></tr>)}</tbody></table></div>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Settings className="h-4 w-4 text-[#1A56DB]" />使用设置</div>
          <div className="space-y-3">{(['督导人员工作填表', '评价督导人员工作填表', '考评人员工作填表'] as const).map(type => <div key={type} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-3"><span className="text-sm font-medium text-gray-900">{type}</span><select className="h-9 rounded-md border border-gray-200 px-2 text-sm">{items.filter(item => item.status === '已发布').map(item => <option key={item.id}>{item.name}</option>)}</select><Button variant="outline" size="sm" onClick={() => toast.success('使用表单已设定')}>设定</Button></div>)}</div>
        </section>
      )}
      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{active ? '编辑表单' : '新增表单'}</DialogTitle></DialogHeader><form onSubmit={saveForm} className="space-y-3 text-sm"><Field label="表单名称" name="name" defaultValue={active?.name} /><label className="block"><span className="font-medium text-gray-700">表单类型</span><select name="type" defaultValue={active?.type || '督导人员工作填表'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option>督导人员工作填表</option><option>评价督导人员工作填表</option><option>考评人员工作填表</option></select></label><label className="block"><span className="font-medium text-gray-700">字段定义（一行一个）</span><textarea name="fields" defaultValue={active?.fields.join('\n') || '现场签到\n检查项\n问题描述\n处理意见'} className="mt-1 h-32 w-full rounded-md border border-gray-200 px-3 py-2" /></label><div className="flex justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div></form></DialogContent></Dialog>
      <Dialog open={dialog === 'view'} onOpenChange={() => setDialog(null)}><DialogContent><DialogHeader><DialogTitle>表单预览</DialogTitle></DialogHeader>{active && <div className="space-y-2 text-sm">{active.fields.map(field => <div key={field} className="rounded-md border border-gray-100 px-3 py-2"><span className="text-gray-500">{field}</span><div className="mt-1 h-8 rounded bg-[#F9FAFB]" /></div>)}</div>}</DialogContent></Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) { return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label> }
