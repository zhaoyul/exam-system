import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Plus, Search, Trash2, CheckCircle,
  Eye, ChevronDown, ChevronRight, Settings, FileText, Edit3, MoreHorizontal
} from 'lucide-react'

interface CertPlan {
  id: string
  planNo: string
  name: string
  site: string
  filingOrg: string
  examMonth: string
  regDeadline: string
  payDeadline: string
  examDate: string
  status: string
  statusLabel: string
  professions: PlanProfession[]
}

interface PlanProfession {
  id: string
  code: string
  name: string
  levels: string[]
  examTypes: ExamType[]
}

interface ExamType {
  subject: string
  moral: string
  theory: string
  skill: string
  comprehensive: string
  performance: string
}

interface RegOrg {
  id: string
  name: string
  contact: string
  phone: string
  selected: boolean
}

const mockPlans: CertPlan[] = [
  {
    id: '1', planNo: '22111100840009', name: '20220412第3批认定', site: '中国原子能科学研究院',
    filingOrg: '北京市', examMonth: '2022年04月', regDeadline: '2022-04-20', payDeadline: '2022-04-22', examDate: '2022-04-28',
    status: 'pending_group', statusLabel: '待提交(集团)',
    professions: [
      { id: 'p1', code: 'RC001', name: '道路客运汽车驾驶员', levels: ['五级/初级工'], examTypes: [{ subject: '笔试不读卡', moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' }] },
      { id: 'p2', code: 'RC002', name: '抄表核算收费员', levels: ['五级/初级工', '四级/中级工', '二级/技师'], examTypes: [{ subject: '笔试不读卡', moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '答辩', performance: '--' }] },
    ]
  },
]

const mockRegOrgs: RegOrg[] = [
  { id: '1', name: '中广核核电运营有限公司', contact: '张三', phone: '010-12345678', selected: false },
  { id: '2', name: '中国原子能科学研究院培训中心', contact: '李四', phone: '010-87654321', selected: false },
  { id: '3', name: '大亚湾核电运营管理有限责任公司', contact: '王五', phone: '0755-84212345', selected: false },
  { id: '4', name: '阳江核电有限公司', contact: '赵六', phone: '0662-7654321', selected: false },
]

export default function CertPlanManage() {
  const [plans, setPlans] = useState<CertPlan[]>(mockPlans)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null)
  const [showSetOrg, setShowSetOrg] = useState(false)
  const [showExamSetting, setShowExamSetting] = useState(false)
  const [selectedPlanForAction, setSelectedPlanForAction] = useState<CertPlan | null>(null)
  const [regOrgs, setRegOrgs] = useState<RegOrg[]>(mockRegOrgs)
  const [orgSearch, setOrgSearch] = useState('')

  const filtered = plans.filter(p => !search || p.name.includes(search) || p.planNo.includes(search))

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const newPlan: CertPlan = {
      id: Date.now().toString(),
      planNo: `${dateStr}${String(Date.now()).slice(-4)}`,
      name: fd.get('name') as string,
      site: fd.get('site') as string,
      filingOrg: fd.get('filingOrg') as string || '北京市',
      examMonth: fd.get('examMonth') as string,
      regDeadline: fd.get('regDeadline') as string,
      payDeadline: fd.get('payDeadline') as string,
      examDate: fd.get('examDate') as string,
      status: 'pending_group', statusLabel: '待提交(集团)',
      professions: [],
    }
    setPlans(prev => [...prev, newPlan])
    setAddOpen(false)
    toast.success(`新增计划：${newPlan.name}`)
  }

  const handleRemove = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
    setShowMoreMenu(null)
    toast.success('计划已删除')
  }

  const handleSetOrg = () => {
    const selected = regOrgs.filter(o => o.selected)
    if (selected.length === 0) {
      toast.error('请至少选择一个报名机构')
      return
    }
    toast.success(`已设置 ${selected.length} 个可报考机构`)
    setShowSetOrg(false)
    setRegOrgs(prev => prev.map(o => ({ ...o, selected: false })))
  }

  const handleExamSetting = () => {
    toast.success('考试设置已保存')
    setShowExamSetting(false)
  }

  const openMoreMenu = (plan: CertPlan) => {
    setSelectedPlanForAction(plan)
    setShowMoreMenu(showMoreMenu === plan.id ? null : plan.id)
  }

  const filteredOrgs = regOrgs.filter(o => !orgSearch || o.name.includes(orgSearch))

  const statusColor = (status: string) => {
    if (status.includes('集团')) return 'bg-blue-50 text-blue-700'
    if (status.includes('不通过')) return 'bg-red-50 text-red-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">制定计划</h1>
          <p className="text-sm text-gray-500 mt-1">管理职业技能等级认定计划</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-2" />新增计划</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索计划编号/名称..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-8"></th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">站点名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">报名截止</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((plan, idx) => (
              <>
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)} className="text-gray-400 hover:text-gray-600">
                      {expandedId === plan.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{plan.planNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.filingOrg}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.site}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.regDeadline}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(plan.status)}`}>{plan.statusLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit3 className="w-3 h-3 mr-1" />编辑</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600"><CheckCircle className="w-3 h-3 mr-1" />发布</Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openMoreMenu(plan)}>
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                        {showMoreMenu === plan.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button onClick={() => { setSelectedPlanForAction(plan); setShowSetOrg(true); setShowMoreMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Settings className="w-3 h-3" />设置报考机构</button>
                            <button onClick={() => { setSelectedPlanForAction(plan); setShowExamSetting(true); setShowMoreMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><FileText className="w-3 h-3" />计划项</button>
                            <button onClick={() => { setSelectedPlanForAction(plan); setShowExamSetting(true); setShowMoreMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Eye className="w-3 h-3" />查看批复信息</button>
                            <button onClick={() => { setSelectedPlanForAction(plan); setShowExamSetting(true); setShowMoreMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Eye className="w-3 h-3" />查看集团批复</button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => handleRemove(plan.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left"><Trash2 className="w-3 h-3" />删除</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                {/* Expanded Row */}
                {expandedId === plan.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-4 py-4">
                      <div className="text-xs text-gray-500 mb-2 font-medium">职业工种 / 技能等级 / 考试科目</div>
                      {plan.professions.map(p => (
                        <div key={p.id} className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{p.code} {p.name}</span>
                              <span className="text-xs text-gray-500">{p.levels.join('、')}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#1A56DB]" onClick={() => { setSelectedPlanForAction(plan); setShowExamSetting(true) }}>考试设置</Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                          {p.examTypes.map((et, i) => (
                            <div key={i} className="grid grid-cols-5 gap-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                              <span><span className="text-gray-400">职业道德:</span> {et.moral}</span>
                              <span><span className="text-gray-400">理论:</span> {et.theory}</span>
                              <span><span className="text-gray-400">技能:</span> {et.skill}</span>
                              <span><span className="text-gray-400">综合:</span> {et.comprehensive}</span>
                              <span><span className="text-gray-400">工作业绩:</span> {et.performance}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Plan Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>新增考试计划</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>计划名称 *</Label><Input name="name" required placeholder="输入计划名称" /></div>
              <div className="space-y-1"><Label>考试月份 *</Label><Input name="examMonth" required placeholder="如：2022年04月" /></div>
              <div className="space-y-1"><Label>拟考日期 *</Label><Input name="examDate" type="date" required /></div>
              <div className="space-y-1"><Label>报名截止日期 *</Label><Input name="regDeadline" type="date" required /></div>
              <div className="space-y-1"><Label>缴费截止日期 *</Label><Input name="payDeadline" type="date" required /></div>
              <div className="space-y-1"><Label>备案地 *</Label>
                <Select name="filingOrg" defaultValue="北京市">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="北京市">北京市</SelectItem>
                    <SelectItem value="广东省">广东省</SelectItem>
                    <SelectItem value="福建省">福建省</SelectItem>
                    <SelectItem value="辽宁省">辽宁省</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2"><Label>站点名称 *</Label><Input name="site" required placeholder="选择站点" /></div>
              <div className="space-y-1 col-span-2"><Label>描述</Label><Textarea name="desc" placeholder="输入描述信息" className="h-16" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Registration Org Dialog */}
      <Dialog open={showSetOrg} onOpenChange={setShowSetOrg}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>设置可报考的报名机构</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索机构名称..." value={orgSearch} onChange={e => setOrgSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600"><input type="checkbox" className="rounded" /></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">机构名称</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">联系电话</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">联系人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrgs.map((org, idx) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={org.selected} onChange={() => setRegOrgs(prev => prev.map(o => o.id === org.id ? { ...o, selected: !o.selected } : o))} className="rounded" />
                      </td>
                      <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2 text-gray-900">{org.name}</td>
                      <td className="px-3 py-2 text-gray-600">{org.phone}</td>
                      <td className="px-3 py-2 text-gray-600">{org.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowSetOrg(false)}>取消</Button>
            <Button onClick={handleSetOrg} className="bg-[#1A56DB] hover:bg-[#1748B5]">
              <CheckCircle className="w-4 h-4 mr-1" />添加选中机构
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Setting Dialog */}
      <Dialog open={showExamSetting} onOpenChange={setShowExamSetting}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>确认考试设置</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedPlanForAction?.professions.map((p, idx) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-3">{idx + 1}. {p.name}（{p.levels.join('、')}）</div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">职业(工种)级别</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">职业道德</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">理论</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">技能</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">综合</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">工作业绩</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {p.levels.map((level, lIdx) => (
                      <tr key={lIdx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{lIdx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{p.name}({level})</td>
                        <td className="px-3 py-2 text-gray-500">--</td>
                        <td className="px-3 py-2">
                          <Select defaultValue="笔试不读卡">
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="笔试不读卡">笔试不读卡</SelectItem>
                              <SelectItem value="机考">机考</SelectItem>
                              <SelectItem value="--">--</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Select defaultValue="传统评分">
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="传统评分">传统评分</SelectItem>
                              <SelectItem value="现场操作">现场操作</SelectItem>
                              <SelectItem value="答辩">答辩</SelectItem>
                              <SelectItem value="--">--</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Select defaultValue={level.includes('技师') ? '答辩' : '--'}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="答辩">答辩</SelectItem>
                              <SelectItem value="--">--</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 text-gray-500">--</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowExamSetting(false)}>返回</Button>
            <Button onClick={handleExamSetting} className="bg-[#1A56DB] hover:bg-[#1748B5]">
              <CheckCircle className="w-4 h-4 mr-1" />发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
