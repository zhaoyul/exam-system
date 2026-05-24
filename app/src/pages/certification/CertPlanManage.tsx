import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  AlertTriangle, Clock, Edit, Plus, Search, Send, Trash2
} from 'lucide-react'
import { useBackendListState } from '@/hooks/useBackendListState'

// ─── Types ───

type PlanStatus = 'draft' | 'published' | 'done'

interface CertPlan {
  id: string
  planNo: string
  name: string
  site: string
  filingOrg: string
  examMonth: string
  examDate: string
  regDeadline: string
  status: PlanStatus
  statusLabel: string
  description: string
}

// ─── Mock data ───

/** Filing locations with their codes (used for planNo auto-generation) and sites */
const filingLocations: Record<string, { code: string; sites: { id: string; name: string }[] }> = {
  '北京市': {
    code: 'BJ',
    sites: [
      { id: 'bj-1', name: '中国原子能科学研究院' },
    ],
  },
  '广东省': {
    code: 'GD',
    sites: [
      { id: 'gd-1', name: '大亚湾核电培训中心' },
      { id: 'gd-2', name: '阳江核电实训基地' },
    ],
  },
  '福建省': {
    code: 'FJ',
    sites: [
      { id: 'fj-1', name: '福建宁德核电培训中心' },
    ],
  },
  '辽宁省': {
    code: 'LN',
    sites: [
      { id: 'ln-1', name: '红沿河核电实训基地' },
    ],
  },
}

const mockPlans: CertPlan[] = [
  {
    id: '1',
    planNo: 'BJ202605001',
    name: '2026年第五批技能认定',
    site: '中国原子能科学研究院',
    filingOrg: '北京市',
    examMonth: '2026-05',
    examDate: '2026-05-28',
    regDeadline: '2026-05-20',
    status: 'draft',
    statusLabel: '待办',
    description: '集团统一认定计划',
  },
  {
    id: '2',
    planNo: 'GD202606001',
    name: '2026年第六批技能认定',
    site: '大亚湾核电培训中心',
    filingOrg: '广东省',
    examMonth: '2026-06',
    examDate: '2026-06-15',
    regDeadline: '2026-06-05',
    status: 'published',
    statusLabel: '已办',
    description: '',
  },
]

// ─── Helpers ───

function generatePlanNo(filingOrg: string, existingPlans: CertPlan[]): string {
  const now = new Date()
  const yyyy = now.getFullYear().toString()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = (filingLocations[filingOrg]?.code || 'XX') + yyyy + mm
  // Find max existing sequence for this prefix
  const maxSeq = existingPlans
    .filter(p => p.planNo.startsWith(prefix))
    .reduce((max, p) => {
      const seq = parseInt(p.planNo.slice(-3), 10)
      return seq > max ? seq : max
    }, 0)
  return prefix + String(maxSeq + 1).padStart(3, '0')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  // Already YYYY-MM-DD format
  return dateStr
}

// ─── Component ───

export default function CertPlanManage() {
  const [plans, setPlans] = useBackendListState<CertPlan>(mockPlans)
  const [search, setSearch] = useState('')
  const [queryType, setQueryType] = useState('计划名称')
  const [activeTab, setActiveTab] = useState<'待办' | '已办'>('待办')
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CertPlan | null>(null)

  // New plan form state
  const [formName, setFormName] = useState('')
  const [formFilingOrg, setFormFilingOrg] = useState('')
  const [formSite, setFormSite] = useState('')
  const [formExamMonth, setFormExamMonth] = useState('')
  const [formExamDate, setFormExamDate] = useState('')
  const [formRegDeadline, setFormRegDeadline] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const filtered = useMemo(() => {
    return plans.filter(plan => {
      const tabMatch = activeTab === '待办'
        ? plan.status === 'draft'
        : plan.status === 'published' || plan.status === 'done'
      const searchMatch = !search
        || plan.name.includes(search)
        || plan.planNo.includes(search)
        || plan.filingOrg.includes(search)
        || plan.site.includes(search)
      return tabMatch && searchMatch
    })
  }, [activeTab, plans, search])

  // Sites available for selected filing org
  const availableSites = useMemo(() => {
    if (!formFilingOrg) return []
    return filingLocations[formFilingOrg]?.sites || []
  }, [formFilingOrg])

  const statusColor = (status: PlanStatus) => {
    if (status === 'published' || status === 'done') return 'bg-green-50 text-green-700'
    return 'bg-amber-50 text-amber-700'
  }

  // ─── Dialogs ───

  const openAddDialog = () => {
    setEditingPlan(null)
    setFormName('')
    setFormFilingOrg('')
    setFormSite('')
    setFormExamMonth('')
    setFormExamDate('')
    setFormRegDeadline('')
    setFormDescription('')
    setShowPlanDialog(true)
  }

  const openEditDialog = (plan: CertPlan) => {
    setEditingPlan(plan)
    setFormName(plan.name)
    setFormFilingOrg(plan.filingOrg)
    setFormSite(plan.site)
    setFormExamMonth(plan.examMonth)
    setFormExamDate(plan.examDate)
    setFormRegDeadline(plan.regDeadline)
    setFormDescription(plan.description)
    setShowPlanDialog(true)
  }

  const handleSave = () => {
    if (!formName.trim()) { toast.error('请输入计划名称'); return }
    if (!formFilingOrg) { toast.error('请选择备案地'); return }
    if (!formSite) { toast.error('请选择站点'); return }
    if (!formExamMonth) { toast.error('请选择拟考月份'); return }
    if (!formExamDate) { toast.error('请选择拟考日期'); return }
    if (!formRegDeadline) { toast.error('请选择报名截止日期'); return }

    if (editingPlan) {
      // Edit existing
      const updated: CertPlan = {
        ...editingPlan,
        name: formName,
        filingOrg: formFilingOrg,
        site: formSite,
        examMonth: formExamMonth,
        examDate: formExamDate,
        regDeadline: formRegDeadline,
        description: formDescription,
      }
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? updated : p))
      toast.success('计划信息已保存')
    } else {
      // New plan
      const planNo = generatePlanNo(formFilingOrg, plans)
      const newPlan: CertPlan = {
        id: Date.now().toString(),
        planNo,
        name: formName,
        filingOrg: formFilingOrg,
        site: formSite,
        examMonth: formExamMonth,
        examDate: formExamDate,
        regDeadline: formRegDeadline,
        status: 'draft',
        statusLabel: '待办',
        description: formDescription,
      }
      setPlans(prev => [newPlan, ...prev])
      toast.success(`新增计划：${newPlan.name}（${newPlan.planNo}）`)
    }
    setShowPlanDialog(false)
  }

  const handlePublish = (plan: CertPlan) => {
    setPlans(prev => prev.map(p =>
      p.id === plan.id ? { ...p, status: 'published', statusLabel: '已办' } : p
    ))
    toast.success('计划已发布')
  }

  const handleRemove = (plan: CertPlan) => {
    setPlans(prev => prev.filter(p => p.id !== plan.id))
    toast.success('计划已删除')
  }

  // ─── Render ───

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">制定计划</h1>
          <p className="text-sm text-gray-500 mt-1">创建认定计划，选择站点，生成计划编号后发布</p>
        </div>
        <Button onClick={openAddDialog}><Plus className="w-4 h-4 mr-2" />添加计划</Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="计划名称">计划名称</SelectItem>
              <SelectItem value="计划编号">计划编号</SelectItem>
              <SelectItem value="备案地">备案地</SelectItem>
              <SelectItem value="站点名称">站点名称</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`请输入${queryType}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('查询完成')}>查询</Button>
        </div>
        <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
          {(['待办', '已办'] as const).map(tab => (
            <button
              key={tab}
              className={`px-5 py-1.5 text-xs rounded transition-colors ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table — full width, no left panel */}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">序号</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600 w-16">预警</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">站点名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">拟考月份</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">拟考日期</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">报名截止</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((plan, idx) => {
              // Calculate warning: days until regDeadline
              const now = new Date()
              const deadline = new Date(plan.regDeadline)
              const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              const isWarning = plan.status === 'draft' && daysLeft <= 7 && daysLeft > 0
              const isUrgent = plan.status === 'draft' && daysLeft <= 3 && daysLeft > 0
              const isExpired = plan.status === 'draft' && daysLeft <= 0

              return (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 text-center">
                    {isExpired && (
                      <span title="已截止" className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                    {isUrgent && !isExpired && (
                      <span title="报名即将截止" className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {daysLeft}天
                      </span>
                    )}
                    {isWarning && !isUrgent && !isExpired && (
                      <span title="即将截止" className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {daysLeft}天
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{plan.planNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.filingOrg}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.site}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(plan.examDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(plan.regDeadline)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${statusColor(plan.status)}`}>
                      {plan.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {plan.status === 'draft' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditDialog(plan)}>
                            <Edit className="w-3 h-3 mr-1" />编辑
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handlePublish(plan)}>
                            <Send className="w-3 h-3 mr-1" />发布
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500" onClick={() => handleRemove(plan)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {plan.status !== 'draft' && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center text-sm text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? '编辑计划信息' : '新增计划信息'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Plan No (auto-generated, read-only) — only for new plans */}
            {!editingPlan && (
              <div className="space-y-1">
                <Label>计划编号</Label>
                <div className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm flex items-center text-gray-500">
                  {formFilingOrg
                    ? `${filingLocations[formFilingOrg]?.code || 'XX'}${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}XXX`
                    : '请先选择备案地'}
                </div>
                <p className="text-xs text-gray-400">格式：备案地代码+年月+3位顺序号，自动生成不可编辑</p>
              </div>
            )}
            {editingPlan && (
              <div className="space-y-1">
                <Label>计划编号</Label>
                <div className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm flex items-center text-gray-500">
                  {editingPlan.planNo}
                </div>
              </div>
            )}

            {/* Plan name */}
            <div className="space-y-1">
              <Label>计划名称 *</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="输入计划名称" />
            </div>

            {/* Site selection: filing org → cascade sites */}
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 text-sm font-medium text-gray-900">选择站点</div>
              <div className="grid grid-cols-2 gap-6">
                {/* Filing location */}
                <div className="space-y-2">
                  <Label>备案地 *</Label>
                  <div className="space-y-1.5">
                    {Object.keys(filingLocations).map(place => (
                      <label key={place} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                        <input
                          type="radio"
                          name="filingOrg"
                          value={place}
                          checked={formFilingOrg === place}
                          onChange={() => {
                            setFormFilingOrg(place)
                            setFormSite('') // Reset site on filing change
                          }}
                          className="accent-blue-600"
                        />
                        {place}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Sites (cascade from filing) */}
                <div className="space-y-2">
                  <Label>站点名称 *</Label>
                  {formFilingOrg ? (
                    <div className="space-y-1.5">
                      {availableSites.map(site => (
                        <label key={site.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                          <input
                            type="radio"
                            name="site"
                            value={site.name}
                            checked={formSite === site.name}
                            onChange={() => setFormSite(site.name)}
                            className="accent-blue-600"
                          />
                          {site.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded">
                      请先选择备案地
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>拟考月份 *</Label>
                <Input
                  type="month"
                  value={formExamMonth}
                  onChange={e => setFormExamMonth(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>拟考日期 *</Label>
                <Input
                  type="date"
                  value={formExamDate}
                  onChange={e => setFormExamDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>报名截止 *</Label>
                <Input
                  type="date"
                  value={formRegDeadline}
                  onChange={e => setFormRegDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>描述</Label>
              <Textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="输入描述信息（可选）"
                className="h-20"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>取消</Button>
            <Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
