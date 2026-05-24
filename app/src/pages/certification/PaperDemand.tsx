import { useMemo, useState, type FormEvent } from 'react'
import { FileText, Plus, Search, Send, Eye, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendResourceState } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────

interface PaperDemandItem {
  id: string
  orgId: string
  code: string
  planId: string
  planItemId?: string
  sessionId?: string
  paperRuleId?: string
  occupation: string
  level: string
  assemblyMethod: string
  quantity: number
  paperType: string
  status: string
  pushStatus: string
  pushTime?: string
  assignedCount: number
  returnedCount: number
  createdAt: string
  updatedAt: string
}

interface PushResult {
  id: string
  orgId: string
  code: string
  planId: string
  demandItemId: string
  candidateId: string
  candidateName: string
  occupation: string
  level: string
  paperId: string
  paperScore: number
  assemblyMethod: string
  pushStatus: string
  pushTime: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

interface AssemblyMethod {
  key: string
  label: string
  description: string
}

// ─── Constants ───────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  confirmed: '已确认',
  assigned: '已分配',
  completed: '已完成',
  cancelled: '已取消',
}

const PUSH_STATUS_LABELS: Record<string, string> = {
  pending: '待推送',
  processing: '推送中',
  completed: '已完成',
  failed: '推送失败',
}

const ASSEMBLY_LABELS: Record<string, string> = {
  question_bank_random: '题库组卷',
  paper_library_uniform: '卷库',
  manual_upload: '非题库组卷',
  no_paper: '不传试卷',
}

const STATUS_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'unassigned', label: '未抽卷' },
  { key: 'assigned', label: '已抽卷' },
]

const initialItems: PaperDemandItem[] = []

// ─── Component ───────────────────────────────────────────────────────

export default function PaperDemand() {
  const [items, setItems] = useBackendResourceState<PaperDemandItem>('/paper-demand/items', initialItems)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'detail' | 'push' | 'pushResults' | null>(null)
  const [active, setActive] = useState<PaperDemandItem | null>(null)
  const [pushResults, setPushResults] = useState<PushResult[]>([])
  const [assemblyMethods, setAssemblyMethods] = useState<AssemblyMethod[]>([])
  const [loadingPush, setLoadingPush] = useState(false)

  // ── Load assembly methods ──
  const loadAssemblyMethods = async () => {
    try {
      const data = await apiRequest<{ methods: AssemblyMethod[] }>('/paper-demand/assembly-methods')
      setAssemblyMethods(data.methods || [])
    } catch {
      // use defaults
    }
  }

  // ── Filtered list ──
  const filtered = useMemo(() => items.filter(item => {
    const byStatus = statusFilter === 'all' ||
      (statusFilter === 'unassigned' && ['draft', 'submitted', 'confirmed'].includes(item.status)) ||
      (statusFilter === 'assigned' && ['assigned', 'completed'].includes(item.status)) ||
      item.status === statusFilter
    const bySearch = !search ||
      item.occupation?.includes(search) ||
      item.level?.includes(search) ||
      item.code?.includes(search)
    return byStatus && bySearch
  }), [items, search, statusFilter])

  // ── CRUD handlers ──
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const occupation = String(fd.get('occupation') || '').trim()
    if (!occupation) {
      toast.error('请填写工种名称')
      return
    }
    const next: PaperDemandItem = {
      id: active?.id || String(Date.now()),
      orgId: active?.orgId || '',
      code: active?.code || '',
      planId: String(fd.get('planId') || active?.planId || ''),
      planItemId: active?.planItemId || undefined,
      sessionId: active?.sessionId || undefined,
      paperRuleId: active?.paperRuleId || undefined,
      occupation,
      level: String(fd.get('level') || ''),
      assemblyMethod: String(fd.get('assemblyMethod') || active?.assemblyMethod || 'question_bank_random'),
      quantity: Number(fd.get('quantity') || 1),
      paperType: String(fd.get('paperType') || active?.paperType || 'A'),
      status: active?.status || 'draft',
      pushStatus: active?.pushStatus || 'pending',
      assignedCount: active?.assignedCount || 0,
      returnedCount: active?.returnedCount || 0,
      createdAt: active?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setItems(prev => active ? prev.map(i => i.id === active.id ? next : i) : [...prev, next])
    setDialogMode(null)
    setActive(null)
    toast.success(active ? '需求项已更新' : '需求项已创建')
  }

  const handleDelete = (item: PaperDemandItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id))
    toast.success('需求项已删除')
  }

  const handleAction = async (item: PaperDemandItem, action: string) => {
    try {
      await apiRequest(`/paper-demand/items/${item.id}/${action}`, { method: 'POST' })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: action === 'submit' ? 'submitted' : action === 'confirm' ? 'confirmed' : action === 'assign' ? 'assigned' : i.status } : i))
      toast.success(`操作「${action}」已执行`)
    } catch {
      toast.error('操作失败')
    }
  }

  // ── Push ──
  const loadPushResults = async (item: PaperDemandItem) => {
    try {
      const data = await apiRequest<{ items: PushResult[] }>(`/paper-demand/push/results?demand-item-id=${item.id}`)
      setPushResults(data.items || [])
    } catch {
      setPushResults([])
    }
  }

  const handleOpenDialog = (mode: typeof dialogMode, item?: PaperDemandItem) => {
    if (mode === 'add') {
      setActive(null)
      loadAssemblyMethods()
    } else if (item) {
      setActive(item)
      if (mode === 'push') loadAssemblyMethods()
      if (mode === 'pushResults') loadPushResults(item)
    }
    setDialogMode(mode)
  }

  // ── Status badge color ──
  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-50 text-gray-600'
      case 'submitted': return 'bg-blue-50 text-blue-700'
      case 'confirmed': return 'bg-green-50 text-green-700'
      case 'assigned': return 'bg-purple-50 text-purple-700'
      case 'completed': return 'bg-emerald-50 text-emerald-700'
      case 'cancelled': return 'bg-red-50 text-red-500'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  const pushStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700'
      case 'processing': return 'bg-blue-50 text-blue-700'
      case 'failed': return 'bg-red-50 text-red-500'
      default: return 'bg-amber-50 text-amber-700'
    }
  }

  // ── Render ──
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">试卷需求</h1>

      {/* Filters & Actions */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-3">
          <span className="text-sm font-medium text-gray-700">搜索</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="工种/等级/编号..."
              className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`h-8 rounded-md px-3 text-xs ${statusFilter === f.key ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              className="h-8 bg-[#1A56DB] px-3 text-xs hover:bg-[#1748B5]"
              onClick={() => handleOpenDialog('add')}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />添加需求项
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">工种</th>
                <th className="px-4 py-3 text-left font-medium">等级</th>
                <th className="px-4 py-3 text-left font-medium">组卷方式</th>
                <th className="px-4 py-3 text-left font-medium">数量</th>
                <th className="px-4 py-3 text-left font-medium">试卷类型</th>
                <th className="px-4 py-3 text-left font-medium">推送状态</th>
                <th className="px-4 py-3 text-left font-medium">已分配/已回传</th>
                <th className="px-4 py-3 text-left font-medium">创建时间</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColor(item.status)}>{STATUS_LABELS[item.status] || item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <FileText className="mr-1.5 inline h-4 w-4 text-[#1A56DB]" />
                    {item.occupation}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.level}</td>
                  <td className="px-4 py-3 text-gray-600">{ASSEMBLY_LABELS[item.assemblyMethod] || item.assemblyMethod}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">{item.paperType}</td>
                  <td className="px-4 py-3">
                    <Badge className={pushStatusColor(item.pushStatus)}>
                      {PUSH_STATUS_LABELS[item.pushStatus] || item.pushStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">
                    {item.assignedCount} / {item.returnedCount}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 text-xs">
                      <button onClick={() => handleOpenDialog('detail', item)} className="text-gray-500 hover:text-[#1A56DB]">
                        <Eye className="mr-0.5 inline h-3.5 w-3.5" />查看
                      </button>
                      <button onClick={() => handleOpenDialog('edit', item)} className="text-gray-500 hover:text-[#1A56DB]">
                        <Edit3 className="mr-0.5 inline h-3.5 w-3.5" />编辑
                      </button>
                      <button onClick={() => handleOpenDialog('push', item)} className="text-green-600 hover:text-green-800">
                        <Send className="mr-0.5 inline h-3.5 w-3.5" />推送
                      </button>
                      {item.status === 'draft' && (
                        <button onClick={() => handleAction(item, 'submit')} className="text-blue-600 hover:text-blue-800">
                          提交
                        </button>
                      )}
                      {item.status === 'submitted' && (
                        <button onClick={() => handleAction(item, 'confirm')} className="text-green-600 hover:text-green-800">
                          确认
                        </button>
                      )}
                      <button onClick={() => handleDelete(item)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="inline h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">
                    暂无数据，点击「添加需求项」创建第一条试卷需求
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={() => { setDialogMode(null); setActive(null) }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{active ? '编辑需求项' : '新建需求项'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-medium text-gray-700">工种名称 *</span>
                <input name="occupation" defaultValue={active?.occupation} required className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" placeholder="如：核反应堆操作员" />
              </label>
              <label className="block">
                <span className="font-medium text-gray-700">技能等级</span>
                <input name="level" defaultValue={active?.level} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" placeholder="如：三级" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-medium text-gray-700">组卷方式</span>
                <select name="assemblyMethod" defaultValue={active?.assemblyMethod || 'question_bank_random'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2 focus:border-[#1A56DB] focus:outline-none">
                  {(assemblyMethods.length > 0 ? assemblyMethods : [
                    { key: 'question_bank_random', label: '题库组卷（千人千卷）' },
                    { key: 'paper_library_uniform', label: '卷库（统一卷）' },
                    { key: 'manual_upload', label: '非题库组卷（上传附件）' },
                    { key: 'no_paper', label: '不传试卷' },
                  ] as AssemblyMethod[]).map(m => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-medium text-gray-700">试卷类型</span>
                <select name="paperType" defaultValue={active?.paperType || 'A'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-2 focus:border-[#1A56DB] focus:outline-none">
                  <option value="A">A卷</option>
                  <option value="B">B卷</option>
                  <option value="C">C卷</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-medium text-gray-700">考生数量</span>
                <input name="quantity" type="number" min={1} defaultValue={active?.quantity || 1} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
              </label>
              <label className="block">
                <span className="font-medium text-gray-700">关联计划ID</span>
                <input name="planId" defaultValue={active?.planId} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" placeholder="计划ID（可选）" />
              </label>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogMode(null); setActive(null) }}>取消</Button>
              <Button type="submit" className="bg-[#1A56DB]">{active ? '保存修改' : '创建需求项'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={dialogMode === 'detail'} onOpenChange={() => { setDialogMode(null); setActive(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>需求项详情</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-3 text-sm">
              <Info label="工种" value={active.occupation} />
              <Info label="等级" value={active.level} />
              <Info label="组卷方式" value={ASSEMBLY_LABELS[active.assemblyMethod] || active.assemblyMethod} />
              <Info label="试卷类型" value={active.paperType} />
              <Info label="考生数量" value={String(active.quantity)} />
              <Info label="状态" value={STATUS_LABELS[active.status] || active.status} />
              <Info label="推送状态" value={PUSH_STATUS_LABELS[active.pushStatus] || active.pushStatus} />
              <Info label="已分配/已回传" value={`${active.assignedCount} / ${active.returnedCount}`} />
              <Info label="计划ID" value={active.planId || '-'} />
              <Info label="创建时间" value={active.createdAt ? new Date(active.createdAt).toLocaleString('zh-CN') : '-'} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogMode(null)}>关闭</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Push Dialog ── */}
      <Dialog open={dialogMode === 'push'} onOpenChange={() => { setDialogMode(null); setActive(null); setLoadingPush(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>试卷推送</DialogTitle></DialogHeader>
          {active && (
            <form onSubmit={async (e) => {
              e.preventDefault()
              setLoadingPush(true)
              const fd = new FormData(e.currentTarget)
              const isBatch = fd.get('pushMode') === 'batch'
              const body: Record<string, unknown> = {
                demandItemId: active.id,
                planId: active.planId,
                occupation: active.occupation,
                level: active.level,
                assemblyMethod: active.assemblyMethod,
              }
              if (isBatch) {
                const resultsStr = String(fd.get('batchResults') || '[]')
                try {
                  body.results = JSON.parse(resultsStr)
                } catch {
                  toast.error('批量数据JSON格式错误')
                  setLoadingPush(false)
                  return
                }
              } else {
                body.candidateId = String(fd.get('candidateId') || '')
                body.candidateName = String(fd.get('candidateName') || '')
                body.paperId = String(fd.get('paperId') || '')
                body.paperScore = Number(fd.get('paperScore') || 0)
              }
              try {
                await apiRequest('/paper-demand/push', {
                  method: 'POST',
                  body: JSON.stringify(body),
                })
                toast.success('推送成功')
                setDialogMode(null)
                setActive(null)
              } catch {
                toast.error('推送失败')
              } finally {
                setLoadingPush(false)
              }
            }} className="space-y-3 text-sm">
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                需求项：{active.occupation}（{active.level}）— 已分配 {active.assignedCount}，已回传 {active.returnedCount}
              </div>
              <label className="flex items-center gap-2">
                <input type="radio" name="pushMode" value="single" defaultChecked className="accent-[#1A56DB]" />
                <span className="font-medium text-gray-700">单条推送</span>
              </label>
              <div className="grid grid-cols-2 gap-3 ml-6">
                <label className="block">
                  <span className="text-gray-600">考生ID</span>
                  <input name="candidateId" className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2 text-xs focus:border-[#1A56DB] focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-gray-600">考生姓名</span>
                  <input name="candidateName" className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2 text-xs focus:border-[#1A56DB] focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-gray-600">试卷ID</span>
                  <input name="paperId" className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2 text-xs focus:border-[#1A56DB] focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-gray-600">试卷分数</span>
                  <input name="paperScore" type="number" step="0.1" min={0} className="mt-1 h-8 w-full rounded-md border border-gray-200 px-2 text-xs focus:border-[#1A56DB] focus:outline-none" />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input type="radio" name="pushMode" value="batch" className="accent-[#1A56DB]" />
                <span className="font-medium text-gray-700">批量推送（JSON）</span>
              </label>
              <div className="ml-6">
                <textarea
                  name="batchResults"
                  rows={4}
                  placeholder='[{"candidateId":"xxx","candidateName":"张三","paperId":"pp1","paperScore":85.5}]'
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs font-mono focus:border-[#1A56DB] focus:outline-none"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenDialog('pushResults', active!)}>
                  <Eye className="mr-1 h-3.5 w-3.5" />查看推送结果
                </Button>
                <Button type="submit" className="bg-[#1A56DB]" disabled={loadingPush}>
                  <Send className="mr-1 h-3.5 w-3.5" />{loadingPush ? '推送中...' : '确认推送'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Push Results Dialog ── */}
      <Dialog open={dialogMode === 'pushResults'} onOpenChange={() => { setDialogMode(null); setActive(null) }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>推送结果</DialogTitle></DialogHeader>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">考生</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">试卷ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">分数</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">状态</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pushResults.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{r.candidateName || r.candidateId}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-500">{r.paperId}</td>
                    <td className="px-3 py-2">{r.paperScore ?? '-'}</td>
                    <td className="px-3 py-2">
                      <Badge className={pushStatusColor(r.pushStatus)}>
                        {PUSH_STATUS_LABELS[r.pushStatus] || r.pushStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {r.pushTime ? new Date(r.pushTime).toLocaleString('zh-CN') : '-'}
                    </td>
                  </tr>
                ))}
                {pushResults.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无推送记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Helper ──
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-md border border-gray-100 px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
