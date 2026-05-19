import { useMemo, useState, type FormEvent } from 'react'
import { Copy, Download, Edit3, Eye, FileUp, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { knowledgeNodes, theorySubjects } from './theoryData'

interface RatioRule {
  id: string
  name: string
  subjectId: string
  description: string
  status: '启用' | '草稿'
  rows: Array<{ knowledge: string; single: number; multiple: number; judge: number; short: number; ratio: number }>
}

const initialRules: RatioRule[] = [
  { id: 'rr1', name: '核反应堆运行三级结构比重', subjectId: 's1', description: '理论考试正式组卷使用', status: '启用', rows: [{ knowledge: '核反应堆物理', single: 20, multiple: 10, judge: 8, short: 2, ratio: 35 }, { knowledge: '热工水力学', single: 18, multiple: 8, judge: 6, short: 2, ratio: 30 }, { knowledge: '辐射防护', single: 12, multiple: 6, judge: 5, short: 1, ratio: 20 }] },
  { id: 'rr2', name: '电气值班四级结构比重', subjectId: 's2', description: '补考试卷使用', status: '草稿', rows: [{ knowledge: '电气安全', single: 24, multiple: 8, judge: 8, short: 0, ratio: 40 }, { knowledge: '倒闸操作', single: 18, multiple: 10, judge: 5, short: 2, ratio: 35 }] },
]

export default function StructureRatio() {
  const [rules, setRules] = useState<RatioRule[]>(initialRules)
  const [subjectId, setSubjectId] = useState('全部')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<'add' | 'view' | 'import' | null>(null)
  const [active, setActive] = useState<RatioRule | null>(null)

  const filtered = useMemo(() => rules.filter(rule => {
    const bySubject = subjectId === '全部' || rule.subjectId === subjectId
    const bySearch = !search || rule.name.includes(search) || rule.description.includes(search)
    return bySubject && bySearch
  }), [rules, search, subjectId])

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next: RatioRule = {
      id: active?.id || String(Date.now()),
      name: String(fd.get('name') || ''),
      subjectId: String(fd.get('subjectId') || theorySubjects[0].id),
      description: String(fd.get('description') || ''),
      status: String(fd.get('status') || '草稿') as RatioRule['status'],
      rows: active?.rows || [{ knowledge: knowledgeNodes[0].name, single: 20, multiple: 10, judge: 10, short: 2, ratio: 35 }],
    }
    if (!next.name) {
      toast.error('请填写比重名称')
      return
    }
    setRules(prev => active ? prev.map(item => item.id === active.id ? next : item) : [next, ...prev])
    setDialog(null)
    setActive(null)
    toast.success(active ? '比重已更新' : '比重已添加')
  }

  const copyRule = (rule: RatioRule) => {
    setRules(prev => [{ ...rule, id: String(Date.now()), name: `${rule.name}（复制）`, status: '草稿' }, ...prev])
    toast.success('比重规则已复制')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">结构比重</h1>
          <p className="mt-1 text-sm text-gray-500">设置组卷涉及的考点知识比重，支持添加、编辑、查看、复制、删除和导入</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialog('import')}><FileUp className="mr-2 h-4 w-4" />导入</Button>
          <Button onClick={() => { setActive(null); setDialog('add') }}><Plus className="mr-2 h-4 w-4" />添加</Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-3">
          <div className="flex gap-2">
            <select value={subjectId} onChange={event => setSubjectId(event.target.value)} className="h-9 rounded-md border border-gray-200 px-2 text-sm"><option value="全部">全部科目</option>{theorySubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
            <Button variant="outline" onClick={() => toast.success('系统组卷统计表已导出')}><Download className="mr-2 h-4 w-4" />比重表</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="比重名称 / 描述" className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-4 py-3 text-left font-medium">比重名称</th><th className="px-4 py-3 text-left font-medium">科目</th><th className="px-4 py-3 text-left font-medium">描述</th><th className="px-4 py-3 text-right font-medium">知识点</th><th className="px-4 py-3 text-left font-medium">状态</th><th className="px-4 py-3 text-left font-medium">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(rule => {
                const subject = theorySubjects.find(item => item.id === rule.subjectId)
                return <tr key={rule.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td><td className="px-4 py-3 text-gray-600">{subject?.name}</td><td className="px-4 py-3 text-gray-600">{rule.description}</td><td className="px-4 py-3 text-right">{rule.rows.length}</td><td className="px-4 py-3"><Badge className={rule.status === '启用' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}>{rule.status}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setActive(rule); setDialog('view') }} className="text-xs text-[#1A56DB] hover:underline"><Eye className="mr-0.5 inline h-3.5 w-3.5" />查看</button><button onClick={() => { setActive(rule); setDialog('add') }} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑</button><button onClick={() => copyRule(rule)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><Copy className="mr-0.5 inline h-3.5 w-3.5" />复制</button><button onClick={() => { setRules(prev => prev.filter(item => item.id !== rule.id)); toast.success('比重规则已删除') }} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-0.5 inline h-3.5 w-3.5" />删除</button></div></td></tr>
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialog === 'add'} onOpenChange={() => { setDialog(null); setActive(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active ? '编辑结构比重' : '添加结构比重'}</DialogTitle></DialogHeader>
          <form onSubmit={saveRule} className="space-y-3 text-sm">
            <Field label="比重名称" name="name" defaultValue={active?.name} />
            <label className="block"><span className="font-medium text-gray-700">科目</span><select name="subjectId" defaultValue={active?.subjectId || theorySubjects[0].id} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2">{theorySubjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <label className="block"><span className="font-medium text-gray-700">状态</span><select name="status" defaultValue={active?.status || '草稿'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2"><option>启用</option><option>草稿</option></select></label>
            <label className="block"><span className="font-medium text-gray-700">描述</span><textarea name="description" defaultValue={active?.description} className="mt-1 h-20 w-full rounded-md border border-gray-200 px-3 py-2" /></label>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)}>取消</Button><Button type="submit">保存</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'view'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>比重表 - {active?.name}</DialogTitle></DialogHeader>
          {active && <div className="overflow-auto rounded-md border border-gray-200"><table className="w-full text-sm"><thead className="bg-[#F9FAFB] text-gray-600"><tr><th className="px-3 py-2 text-left">知识结构</th><th className="px-3 py-2 text-right">单选</th><th className="px-3 py-2 text-right">多选</th><th className="px-3 py-2 text-right">判断</th><th className="px-3 py-2 text-right">简答</th><th className="px-3 py-2 text-right">占比</th></tr></thead><tbody className="divide-y divide-gray-100">{active.rows.map(row => <tr key={row.knowledge}><td className="px-3 py-2">{row.knowledge}</td><td className="px-3 py-2 text-right">{row.single}</td><td className="px-3 py-2 text-right">{row.multiple}</td><td className="px-3 py-2 text-right">{row.judge}</td><td className="px-3 py-2 text-right">{row.short}</td><td className="px-3 py-2 text-right">{row.ratio}%</td></tr>)}</tbody></table></div>}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'import'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入知识比重结构</DialogTitle></DialogHeader>
          <textarea className="h-40 w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="粘贴知识比重结构：知识点、题型数量、占比..." />
          <div className="flex justify-end"><Button onClick={() => { setDialog(null); toast.success('结构比重已导入') }}>导入</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="font-medium text-gray-700">{label}</span><input name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" /></label>
}
