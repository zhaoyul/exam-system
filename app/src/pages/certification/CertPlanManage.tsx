import { Fragment, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  AlertTriangle, Camera, CheckCircle, ChevronDown, ChevronRight, Download,
  Edit3, Eye, FileArchive, FileText, FileUp, MoreHorizontal, Plus, Search,
  Settings, Send, Trash2, Users, Info
} from 'lucide-react'
import { useBackendListState, useBackendResourceList, useBackendResourceState } from '@/hooks/useBackendListState'

interface CertPlan {
  id: string
  planNo: string
  name: string
  issueType: string
  site: string
  filingOrg: string
  examDate: string
  examMonth: string
  regDeadline: string
  payDeadline: string
  materialStatus: '未上传' | '已上传'
  status: 'draft' | 'pending_group' | 'published' | 'done'
  statusLabel: string
  description: string
  professions: PlanProfession[]
}

interface PlanProfession {
  id: string
  code: string
  occupation: string
  job: string
  levels: string[]
  onlineCount: number
  groupCount: number
  ruleFile: boolean
  levelExamConfigs: Record<string, ExamType>
}

interface ExamType {
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

const ALL_LEVELS = ['五级/初级工', '四级/中级工', '三级/高级工', '二级/技师', '一级/高级技师'] as const

const EXAM_FIELDS = ['职业道德', '理论', '技能', '综合', '工作业绩'] as const
const EXAM_FIELD_KEYS = ['moral', 'theory', 'skill', 'comprehensive', 'performance'] as (keyof ExamType)[]
const EXAM_OPTIONS = ['--', '机考', '笔试不读卡', '笔试读卡', '现场操作', '传统评分', '答辩', '论文', '作品评审', '口试']

const defaultExamType = (): ExamType => ({ moral: '--', theory: '机考', skill: '现场操作', comprehensive: '--', performance: '--' })

const mockPlans: CertPlan[] = [
  {
    id: '1',
    planNo: '22111100840009',
    name: '20220412第3批认定',
    issueType: '职业技能等级证书',
    site: '中国原子能科学研究院',
    filingOrg: '北京市',
    examDate: '2022-04-28',
    examMonth: '2022年04月',
    regDeadline: '2022-04-20',
    payDeadline: '2022-04-22',
    materialStatus: '已上传',
    status: 'pending_group',
    statusLabel: '待提交(集团)',
    description: '集团统一认定计划',
    professions: [
      {
        id: 'p1',
        code: 'RC001',
        occupation: '道路运输服务人员',
        job: '道路客运汽车驾驶员',
        levels: ['五级/初级工'],
        onlineCount: 12,
        groupCount: 8,
        ruleFile: true,
        levelExamConfigs: { '五级/初级工': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' } },
      },
      {
        id: 'p2',
        code: 'RC002',
        occupation: '电力工程技术人员',
        job: '抄表核算收费员',
        levels: ['五级/初级工', '四级/中级工', '二级/技师'],
        onlineCount: 18,
        groupCount: 27,
        ruleFile: false,
        levelExamConfigs: {
          '五级/初级工': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' },
          '四级/中级工': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' },
          '二级/技师': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '答辩', performance: '--' },
        },
      },
    ],
  },
]

const mockRegOrgs: RegOrg[] = [
  { id: '1', name: '中广核核电运营有限公司', contact: '张三', phone: '010-12345678', selected: false },
  { id: '2', name: '中国原子能科学研究院培训中心', contact: '李四', phone: '010-87654321', selected: false },
  { id: '3', name: '大亚湾核电运营管理有限责任公司', contact: '王五', phone: '0755-84212345', selected: false },
  { id: '4', name: '阳江核电有限公司', contact: '赵六', phone: '0662-7654321', selected: false },
]

const occupationOptions: PlanProfession[] = [
  {
    id: 'op1',
    code: '6-31-01-03',
    occupation: '电力、热力生产和供应人员',
    job: '继电保护员',
    levels: ['五级/初级工', '四级/中级工', '三级/高级工'],
    onlineCount: 0,
    groupCount: 0,
    ruleFile: false,
    levelExamConfigs: {
      '五级/初级工': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '--', performance: '--' },
      '四级/中级工': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '--', performance: '--' },
      '三级/高级工': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '--', performance: '--' },
    },
  },
  {
    id: 'op2',
    code: '6-31-03-01',
    occupation: '机械设备修理人员',
    job: '汽轮机检修工',
    levels: ['四级/中级工', '三级/高级工', '二级/技师'],
    onlineCount: 0,
    groupCount: 0,
    ruleFile: false,
    levelExamConfigs: {
      '四级/中级工': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' },
      '三级/高级工': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '--', performance: '--' },
      '二级/技师': { moral: '--', theory: '笔试不读卡', skill: '传统评分', comprehensive: '答辩', performance: '--' },
    },
  },
  {
    id: 'op3',
    code: '6-31-06-01',
    occupation: '核能利用人员',
    job: '核反应堆运行值班员',
    levels: ['三级/高级工', '二级/技师', '一级/高级技师'],
    onlineCount: 0,
    groupCount: 0,
    ruleFile: false,
    levelExamConfigs: {
      '三级/高级工': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '--', performance: '--' },
      '二级/技师': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '答辩', performance: '--' },
      '一级/高级技师': { moral: '--', theory: '机考', skill: '现场操作', comprehensive: '答辩', performance: '论文' },
    },
  },
]

type ModalKind = 'material' | 'occupation' | 'importCandidates' | 'importPhotos' | 'multiCert' | 'approval' | 'examSetting' | 'setOrg' | 'publishConfirm' | null

export default function CertPlanManage() {
  const [plans, setPlans] = useBackendListState<CertPlan>(mockPlans)
  const backendOccupationOptions = useBackendResourceList('/standard/evaluation-scope', occupationOptions)
  const [search, setSearch] = useState('')
  const [queryType, setQueryType] = useState('计划名称')
  const [activeTab, setActiveTab] = useState<'待办' | '已办'>('待办')
  const [expandedId, setExpandedId] = useState<string | null>('1')
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CertPlan | null>(null)
  const [modalKind, setModalKind] = useState<ModalKind>(null)
  const [selectedPlanForAction, setSelectedPlanForAction] = useState<CertPlan | null>(mockPlans[0])
  const [selectedOccupationIds, setSelectedOccupationIds] = useState<string[]>([])
  const [occupationSearch, setOccupationSearch] = useState('')
  // Per-occupation level selection: occupationId -> Set<levelName>
  const [occupationLevels, setOccupationLevels] = useState<Record<string, string[]>>({})
  // Per-occupation per-level exam config: `${occupationId}::${level}` -> ExamType
  const [occupationExamConfigs, setOccupationExamConfigs] = useState<Record<string, ExamType>>({})
  const [regOrgs, setRegOrgs] = useBackendResourceState<RegOrg>('/certification/execution/registration-orgs', mockRegOrgs)
  const [orgSearch, setOrgSearch] = useState('')
  const [importMode, setImportMode] = useState<'clear' | 'cover' | 'ignore'>('cover')

  const filtered = useMemo(() => {
    return plans.filter(plan => {
      const tabMatch = activeTab === '待办'
        ? plan.status !== 'published' && plan.status !== 'done'
        : plan.status === 'published' || plan.status === 'done'
      const searchMatch = !search || plan.name.includes(search) || plan.planNo.includes(search)
      return tabMatch && searchMatch
    })
  }, [activeTab, plans, search])

  const filteredOrgs = regOrgs.filter(o => !orgSearch || o.name.includes(orgSearch))

  const statusColor = (status: CertPlan['status']) => {
    if (status === 'published') return 'bg-green-50 text-green-700'
    if (status === 'done') return 'bg-gray-100 text-gray-600'
    if (status === 'pending_group') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  const openAction = (plan: CertPlan, kind: ModalKind) => {
    setSelectedPlanForAction(plan)
    if (kind === 'occupation') {
      setSelectedOccupationIds([])
      setOccupationLevels({})
      setOccupationExamConfigs({})
      setOccupationSearch('')
    }
    setModalKind(kind)
    setShowMoreMenu(null)
  }

  const openPlanDialog = (plan?: CertPlan) => {
    setEditingPlan(plan || null)
    setShowPlanDialog(true)
  }

  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const now = new Date()
    const year = String(now.getFullYear())
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(plans.length + 1).padStart(3, '0')
    const nextPlan: CertPlan = {
      id: editingPlan?.id || Date.now().toString(),
      planNo: editingPlan?.planNo || `Y0041GD000001/${year}/${month}/${seq}`,
      name: String(fd.get('name') || ''),
      issueType: '职业技能等级证书',
      site: String(fd.get('site') || '中国原子能科学研究院'),
      filingOrg: String(fd.get('filingOrg') || '北京市'),
      examDate: String(fd.get('examDate') || ''),
      examMonth: String(fd.get('examMonth') || ''),
      regDeadline: String(fd.get('regDeadline') || ''),
      payDeadline: String(fd.get('payDeadline') || ''),
      materialStatus: editingPlan?.materialStatus || '未上传',
      status: editingPlan?.status || 'draft',
      statusLabel: editingPlan?.statusLabel || '待提交(集团)',
      description: String(fd.get('description') || ''),
      professions: editingPlan?.professions || [],
    }
    setPlans(prev => editingPlan ? prev.map(p => p.id === editingPlan.id ? nextPlan : p) : [nextPlan, ...prev])
    setSelectedPlanForAction(nextPlan)
    setExpandedId(nextPlan.id)
    setShowPlanDialog(false)
    toast.success(editingPlan ? '计划信息已保存' : `新增计划：${nextPlan.name}`)
  }

  const handlePublishConfirm = () => {
    if (!selectedPlanForAction) return
    // Validate
    const plan = selectedPlanForAction
    if (!plan.name) { toast.error('计划名称不能为空'); return }
    if (!plan.examDate) { toast.error('评价日期不能为空'); return }
    if (plan.professions.length === 0) { toast.error('请至少添加一个职业工种'); return }
    // Check each profession has at least one level with exam config
    for (const prof of plan.professions) {
      if (prof.levels.length === 0) {
        toast.error(`"${prof.job}" 未选择技能等级`)
        return
      }
      for (const level of prof.levels) {
        if (!prof.levelExamConfigs[level]) {
          toast.error(`"${prof.job}" 的 "${level}" 未配置考试设置`)
          return
        }
      }
    }
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'published', statusLabel: '已发布' } : p))
    setShowMoreMenu(null)
    setModalKind(null)
    toast.success('计划已发布')
  }

  const handleRemove = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
    setShowMoreMenu(null)
    toast.success('计划已删除')
  }

  const handleUploadMaterial = () => {
    if (!selectedPlanForAction) return
    setPlans(prev => prev.map(p => p.id === selectedPlanForAction.id ? { ...p, materialStatus: '已上传' } : p))
    setModalKind(null)
    toast.success('计划材料已上传')
  }

  const isOccupationSelected = (occId: string) => selectedOccupationIds.includes(occId)
  const getOccLevels = (occId: string) => occupationLevels[occId] || []

  const toggleOccSelection = (occId: string) => {
    setSelectedOccupationIds(prev =>
      prev.includes(occId)
        ? prev.filter(id => id !== occId)
        : [...prev, occId]
    )
    // Initialize levels from the occupation's available levels
    if (!isOccupationSelected(occId)) {
      const occ = backendOccupationOptions.find(o => o.id === occId)
      if (occ && occ.levels.length > 0) {
        setOccupationLevels(prev => ({
          ...prev,
          [occId]: [...occ.levels]
        }))
        const examConfigs: Record<string, ExamType> = {}
        occ.levels.forEach(l => {
          examConfigs[`${occId}::${l}`] = occ.levelExamConfigs[l] || defaultExamType()
        })
        setOccupationExamConfigs(prev => ({ ...prev, ...examConfigs }))
      }
    }
  }

  const toggleOccLevel = (occId: string, level: string) => {
    setOccupationLevels(prev => {
      const cur = prev[occId] || []
      if (cur.includes(level)) {
        return { ...prev, [occId]: cur.filter(l => l !== level) }
      }
      return { ...prev, [occId]: [...cur, level] }
    })
  }

  const setOccLevelExamConfig = (occId: string, level: string, field: keyof ExamType, value: string) => {
    const key = `${occId}::${level}`
    setOccupationExamConfigs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || defaultExamType()), [field]: value }
    }))
  }

  const getOccLevelExamConfig = (occId: string, level: string): ExamType => {
    return occupationExamConfigs[`${occId}::${level}`] || defaultExamType()
  }

  const handleAddProfessions = () => {
    if (!selectedPlanForAction || selectedOccupationIds.length === 0) {
      toast.error('请至少选择一个职业工种')
      return
    }
    // Validate at least one level selected per occupation
    for (const occId of selectedOccupationIds) {
      if (getOccLevels(occId).length === 0) {
        const occ = backendOccupationOptions.find(o => o.id === occId)
        toast.error(`"${occ?.job || occId}" 请至少选择一个技能等级`)
        return
      }
    }
    const timestamp = Date.now()
    const selected = backendOccupationOptions
      .filter(item => selectedOccupationIds.includes(item.id))
      .map(item => {
        const selLevels = getOccLevels(item.id)
        const configs: Record<string, ExamType> = {}
        selLevels.forEach(l => {
          configs[l] = getOccLevelExamConfig(item.id, l)
        })
        return {
          ...item,
          id: `${item.id}-${timestamp}`,
          levels: selLevels,
          levelExamConfigs: configs,
        }
      })
    setPlans(prev => prev.map(plan =>
      plan.id === selectedPlanForAction.id
        ? { ...plan, professions: [...plan.professions, ...selected] }
        : plan
    ))
    setSelectedOccupationIds([])
    setOccupationLevels({})
    setOccupationExamConfigs({})
    setExpandedId(selectedPlanForAction.id)
    setModalKind(null)
    toast.success(`已增加 ${selected.length} 个职业工种`)
  }

  const handleSetOrg = () => {
    const selected = regOrgs.filter(o => o.selected)
    if (selected.length === 0) {
      toast.error('请至少选择一个报名机构')
      return
    }
    toast.success(`已设置 ${selected.length} 个可报考机构`)
    setRegOrgs(prev => prev.map(o => ({ ...o, selected: false })))
    setModalKind(null)
  }

  const handleRemoveProfession = (planId: string, professionId: string) => {
    setPlans(prev => prev.map(plan => plan.id === planId ? { ...plan, professions: plan.professions.filter(item => item.id !== professionId) } : plan))
    toast.success('职业工种已删除')
  }

  const selectedPlan = selectedPlanForAction || filtered[0] || plans[0]

  // Publish validation
  const publishValidation = useMemo(() => {
    if (!selectedPlanForAction) return { valid: false, errors: [] as string[] }
    const p = selectedPlanForAction
    const errors: string[] = []
    if (!p.name) errors.push('计划名称不能为空')
    if (!p.examDate) errors.push('评价日期不能为空')
    if (p.professions.length === 0) errors.push('请至少添加一个职业工种')
    for (const prof of p.professions) {
      if (prof.levels.length === 0) {
        errors.push(`"${prof.job}" 未选择技能等级`)
        continue
      }
      for (const level of prof.levels) {
        if (!prof.levelExamConfigs[level]) {
          errors.push(`"${prof.job}" 的 "${level}" 未配置考试设置`)
        }
      }
    }
    return { valid: errors.length === 0, errors }
  }, [selectedPlanForAction])

  const filteredOccupationOptions = backendOccupationOptions.filter(o =>
    !occupationSearch || o.job.includes(occupationSearch) || o.occupation.includes(occupationSearch)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">制定计划</h1>
          <p className="text-sm text-gray-500 mt-1">按备案站点创建认定计划，维护职业工种与等级，发布后进入考试报名</p>
        </div>
        <Button onClick={() => openPlanDialog()}><Plus className="w-4 h-4 mr-2" />添加计划</Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="办证计划">办证计划</SelectItem>
              <SelectItem value="计划名称">计划名称</SelectItem>
              <SelectItem value="计划编号">计划编号</SelectItem>
              <SelectItem value="站点名称">站点名称</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder={`请输入${queryType}`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => toast.success('查询完成')}>查询</Button>
        </div>
        <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
          {(['待办', '已办'] as const).map(tab => (
            <button
              key={tab}
              className={`px-4 py-1.5 text-xs rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[560px]">
        <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-8"></th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">预警</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划编号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">备案地</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">站点名称</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">拟考月份</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">拟考日期</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">报名截至</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((plan, idx) => (
              <Fragment key={plan.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <button onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)} className="text-gray-400 hover:text-gray-600">
                      {expandedId === plan.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-3">
	                    <span className={`rounded px-2 py-0.5 text-xs ${plan.materialStatus === '已上传' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
	                      {plan.materialStatus === '已上传' ? '材料完整' : '待补材料'}
	                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">{plan.planNo}</td>
                  <td className="px-3 py-3 font-medium text-gray-900 min-w-48">{plan.name}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.filingOrg}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.site}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.examMonth}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.examDate}</td>
                  <td className="px-3 py-3 text-gray-600">{plan.regDeadline}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(plan.status)}`}>{plan.statusLabel}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openPlanDialog(plan)}><Edit3 className="w-3 h-3 mr-1" />编辑</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => openAction(plan, 'publishConfirm')}><Send className="w-3 h-3 mr-1" />发布</Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setSelectedPlanForAction(plan); setShowMoreMenu(showMoreMenu === plan.id ? null : plan.id) }}>
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                        {showMoreMenu === plan.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button onClick={() => openAction(plan, 'multiCert')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><AlertTriangle className="w-3 h-3" />检查一人多证</button>
                            <button onClick={() => openAction(plan, 'occupation')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Plus className="w-3 h-3" />新增考试计划项</button>
                            <button onClick={() => openAction(plan, 'publishConfirm')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Send className="w-3 h-3" />发布确认</button>
                            <button onClick={() => openAction(plan, 'importCandidates')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><FileUp className="w-3 h-3" />导入考生</button>
                            <button onClick={() => openAction(plan, 'importPhotos')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Camera className="w-3 h-3" />导入考生照片</button>
                            <button onClick={() => openAction(plan, 'setOrg')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Settings className="w-3 h-3" />设置报考机构</button>
                            <button onClick={() => openAction(plan, 'approval')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"><Eye className="w-3 h-3" />查看批复信息</button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => handleRemove(plan.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left"><Trash2 className="w-3 h-3" />删除</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedId === plan.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={11} className="px-4 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">职业工种 / 技能等级 / 考试设置</div>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openAction(plan, 'occupation')}>
                          <Plus className="w-3 h-3 mr-1" />新增考试计划项
                        </Button>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">序号</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">职业</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">工种</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">技能等级</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">网报人数</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">集体报名</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">准考证</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">获证规则</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {plan.professions.map((profession, pIdx) => (
                              <tr key={profession.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-600">{pIdx + 1}</td>
                                <td className="px-3 py-2 text-gray-900">{profession.occupation}</td>
                                <td className="px-3 py-2 font-medium text-gray-900">{profession.job}</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{profession.levels.join('、')}</td>
                                <td className="px-3 py-2 text-gray-600">{profession.onlineCount}</td>
                                <td className="px-3 py-2 text-gray-600">{profession.groupCount}</td>
                                <td className="px-3 py-2"><button className="text-xs text-blue-600 hover:underline">查看</button></td>
                                <td className="px-3 py-2">
                                  <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline" onClick={() => toast.success('获证规则材料已上传')}>
                                    <FileArchive className="w-3 h-3" />{profession.ruleFile ? '下载/重传' : '上传'}
                                  </button>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#1A56DB]" onClick={() => openAction(plan, 'examSetting')}>考试设置</Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveProfession(plan.id, profession.id)}><Trash2 className="w-3 h-3" /></Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {plan.professions.length === 0 && (
                              <tr><td colSpan={9} className="px-3 py-10 text-center text-gray-400">暂无职业工种，请点击"新增考试计划项"添加</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editingPlan ? '编辑计划信息' : '新增计划信息'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSavePlan} className="space-y-4">
	            <div className="grid grid-cols-2 gap-4">
	              <div className="space-y-1"><Label>计划编号：</Label><Input value={editingPlan?.planNo || '保存后按 企业备案编号/年份/月/顺序号 自动生成'} disabled /></div>
	              <div className="space-y-1"><Label>计划名称：</Label><Input name="name" required defaultValue={editingPlan?.name} placeholder="输入计划名称" /></div>
              <div className="space-y-1"><Label>评价日期</Label><Input name="examDate" type="date" required defaultValue={editingPlan?.examDate} /></div>
              <div className="space-y-1"><Label>认定月份</Label><Input name="examMonth" required defaultValue={editingPlan?.examMonth} placeholder="如：2026年05月" /></div>
              <div className="space-y-1"><Label>报名截止日期</Label><Input name="regDeadline" type="date" required defaultValue={editingPlan?.regDeadline} /></div>
              <div className="space-y-1"><Label>缴费截止日期</Label><Input name="payDeadline" type="date" defaultValue={editingPlan?.payDeadline} /></div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 text-sm font-medium text-gray-900">选择站点：</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>备案地：</Label>
                  {['北京市', '广东省', '福建省', '辽宁省'].map(place => (
                    <label key={place} className="mr-4 inline-flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" name="filingOrg" value={place} defaultChecked={(editingPlan?.filingOrg || '北京市') === place} />
                      {place}
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>站点名称：</Label>
                  {['中国原子能科学研究院', '大亚湾核电培训中心', '阳江核电实训基地'].map(site => (
                    <label key={site} className="block text-sm text-gray-700">
                      <input className="mr-2" type="radio" name="site" value={site} defaultChecked={(editingPlan?.site || '中国原子能科学研究院') === site} />
                      {site}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1"><Label>描述：</Label><Textarea name="description" defaultValue={editingPlan?.description} placeholder="输入描述信息" className="h-20" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPlanDialog(false)}>返回</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Occupation modal: 新增考试计划项 — per-occupation level checkboxes + exam config */}
      <Dialog open={modalKind === 'occupation'} onOpenChange={() => setModalKind(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>新增考试计划项</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索职业工种..." value={occupationSearch} onChange={e => setOccupationSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="text-xs text-gray-500">选择职业工种并勾选级别，配置各级别的考试设置（职业道德/理论/技能/综合/工作业绩）</div>

            {filteredOccupationOptions.map((item, idx) => {
              const selected = isOccupationSelected(item.id)
              const selLevels = getOccLevels(item.id)
              return (
                <div key={item.id} className={`rounded-lg border ${selected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'} p-4`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected} onChange={() => toggleOccSelection(item.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-400">{idx + 1}.</span>
                        <span className="text-sm font-medium text-gray-900">{item.occupation}</span>
                        <span className="text-sm text-[#1A56DB] font-medium">{item.job}</span>
                        <span className="text-xs text-gray-400">{item.code}</span>
                      </div>

                      {selected && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2">选择技能等级：</div>
                            <div className="grid grid-cols-5 gap-2">
                              {ALL_LEVELS.map(level => {
                                const available = item.levels.includes(level)
                                const checked = selLevels.includes(level)
                                return (
                                  <label key={level} className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs cursor-pointer transition-colors
                                    ${!available ? 'opacity-30 cursor-not-allowed border-gray-100' :
                                      checked ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={!available}
                                      onChange={() => toggleOccLevel(item.id, level)}
                                      className="accent-blue-600"
                                    />
                                    <span>{level}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>

                          {/* Exam type config for each selected level */}
                          {selLevels.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">考试设置（按级别）：</div>
                              <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-2 py-2 text-left font-medium text-gray-600 w-28">级别</th>
                                      {EXAM_FIELD_KEYS.map((key, ki) => (
                                        <th key={key} className="px-2 py-2 text-left font-medium text-gray-600">{EXAM_FIELDS[ki]}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {selLevels.map((level) => {
                                      const config = getOccLevelExamConfig(item.id, level)
                                      return (
                                        <tr key={level} className="bg-white">
                                          <td className="px-2 py-1.5 text-gray-800 font-medium">{level}</td>
                                          {EXAM_FIELD_KEYS.map(field => (
                                            <td key={field} className="px-1 py-1">
                                              <select
                                                value={config[field]}
                                                onChange={e => setOccLevelExamConfig(item.id, level, field, e.target.value)}
                                                className="w-full h-7 rounded border border-gray-200 text-xs px-1 focus:outline-none focus:border-blue-400"
                                              >
                                                {EXAM_OPTIONS.map(opt => (
                                                  <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                              </select>
                                            </td>
                                          ))}
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredOccupationOptions.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">未找到匹配的职业工种</div>
            )}
            <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
              已选择信息：{selectedOccupationIds.length} 个职业工种
              {selectedOccupationIds.length > 0 && (
                <span>（共 {selectedOccupationIds.reduce((acc, id) => acc + getOccLevels(id).length, 0)} 个级别）</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>返回</Button>
            <Button onClick={handleAddProfessions}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={modalKind === 'publishConfirm'} onOpenChange={() => setModalKind(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              发布确认 — 校验计划信息完整性
            </DialogTitle>
          </DialogHeader>

          {selectedPlanForAction && (
            <div className="space-y-4">
              {/* Plan Summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">计划基本信息</div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-gray-500">计划名称：</span><span className="text-gray-900 font-medium">{selectedPlanForAction.name || '—'}</span></div>
                  <div><span className="text-gray-500">计划编号：</span><span className="text-gray-900">{selectedPlanForAction.planNo || '—'}</span></div>
                  <div><span className="text-gray-500">评价日期：</span><span className="text-gray-900">{selectedPlanForAction.examDate || '—'}</span></div>
                  <div><span className="text-gray-500">认定月份：</span><span className="text-gray-900">{selectedPlanForAction.examMonth || '—'}</span></div>
                  <div><span className="text-gray-500">站点名称：</span><span className="text-gray-900">{selectedPlanForAction.site}</span></div>
                  <div><span className="text-gray-500">备案地：</span><span className="text-gray-900">{selectedPlanForAction.filingOrg}</span></div>
                  <div><span className="text-gray-500">报名截止：</span><span className="text-gray-900">{selectedPlanForAction.regDeadline || '—'}</span></div>
                  <div><span className="text-gray-500">缴费截止：</span><span className="text-gray-900">{selectedPlanForAction.payDeadline || '—'}</span></div>
                </div>
              </div>

              {/* Validation Errors */}
              {!publishValidation.valid && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    计划信息不完整，请补充以下内容后重试：
                  </div>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                    {publishValidation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {publishValidation.valid && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  计划信息完整，可以发布
                </div>
              )}

              {/* Exam Settings per Occupation per Level */}
              {selectedPlanForAction.professions.length > 0 && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    考试设置（按职业工种和级别）
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">序号</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">职业</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">工种</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">级别</th>
                          {EXAM_FIELDS.map(f => (
                            <th key={f} className="px-2 py-2 text-left font-medium text-gray-600">{f}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedPlanForAction.professions.flatMap((prof, pIdx) =>
                          prof.levels.map((level, lIdx) => {
                            const config = prof.levelExamConfigs[level]
                            return (
                              <tr key={`${prof.id}-${level}`} className={lIdx === 0 ? 'border-t-2 border-t-gray-300' : ''}>
                                {lIdx === 0 ? (
                                  <>
                                    <td className="px-3 py-2 text-gray-600" rowSpan={prof.levels.length}>{pIdx + 1}</td>
                                    <td className="px-3 py-2 text-gray-900" rowSpan={prof.levels.length}>{prof.occupation}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900" rowSpan={prof.levels.length}>{prof.job}</td>
                                  </>
                                ) : null}
                                <td className="px-3 py-2">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{level}</span>
                                </td>
                                {config ? (
                                  EXAM_FIELD_KEYS.map(field => (
                                    <td key={field} className="px-2 py-2 text-gray-700">
                                      <span className={`px-1.5 py-0.5 rounded text-xs ${config[field] === '--' ? 'text-gray-300' : 'bg-gray-100'}`}>
                                        {config[field]}
                                      </span>
                                    </td>
                                  ))
                                ) : (
                                  <td colSpan={5} className="px-2 py-2 text-red-500 text-xs">未配置考试设置</td>
                                )}
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedPlanForAction.professions.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
                  暂无考试计划项。请先通过「新增考试计划项」添加职业工种和级别。
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>返回修改</Button>
            <Button
              onClick={handlePublishConfirm}
              disabled={!publishValidation.valid}
              className={publishValidation.valid ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Send className="w-4 h-4 mr-1" />确认发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'material'} onOpenChange={() => setModalKind(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>上传计划材料</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              当前计划：{selectedPlan?.name}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">点击或拖拽计划材料到此处上传</p>
              <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、ZIP 文件</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>返回</Button>
            <Button onClick={handleUploadMaterial}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'importCandidates'} onOpenChange={() => setModalKind(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入考生</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => toast.success('导入模板已下载')}><Download className="w-4 h-4 mr-2" />导入模板下载</Button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'clear', label: '清空后导入' },
                { key: 'cover', label: '相同覆盖导入' },
                { key: 'ignore', label: '相同忽略导入' },
              ].map(item => (
                <button key={item.key} onClick={() => setImportMode(item.key as typeof importMode)} className={`rounded-md border p-3 text-sm ${importMode === item.key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传考生 Excel 文件</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>取消</Button>
            <Button onClick={() => { setModalKind(null); toast.success('考生已导入') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'importPhotos'} onOpenChange={() => setModalKind(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入考生照片</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {['选择照片压缩包', '识别证件号码', '上传照片'].map((step, idx) => (
                <div key={step} className="rounded-md border border-gray-200 bg-gray-50 p-3"><div className="mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">{idx + 1}</div>{step}</div>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传以身份证号命名的照片压缩包</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>取消</Button>
            <Button onClick={() => { setModalKind(null); toast.success('照片识别并上传完成') }}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'multiCert'} onOpenChange={() => setModalKind(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>检查一人多证</DialogTitle></DialogHeader>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">姓名</th><th className="px-3 py-2 text-left">证件号码</th><th className="px-3 py-2 text-left">检查结果</th><th className="px-3 py-2 text-left">处理状态</th></tr></thead>
              <tbody><tr><td className="px-3 py-8 text-center text-gray-400" colSpan={4}>未发现同计划一人多证异常</td></tr></tbody>
            </table>
          </div>
          <DialogFooter><Button onClick={() => setModalKind(null)}>返回</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'approval'} onOpenChange={() => setModalKind(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>查看批复信息</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md bg-gray-50 p-3">计划名称：{selectedPlan?.name}</div>
            <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-700">集团批复：待提交后生成批复记录。</div>
          </div>
          <DialogFooter><Button onClick={() => setModalKind(null)}>返回</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'examSetting'} onOpenChange={() => setModalKind(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>考试设置 — 按级别配置考试方式</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto">
            {selectedPlan?.professions.map((profession, idx) => (
              <div key={profession.id} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-3">
                  {idx + 1}. {profession.occupation} — {profession.job}
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-gray-600">级别</th>
                      {EXAM_FIELDS.map(f => (
                        <th key={f} className="px-2 py-2 text-left font-medium text-gray-600">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {profession.levels.map(level => {
                      const config = profession.levelExamConfigs[level] || defaultExamType()
                      return (
                        <tr key={level}>
                          <td className="px-2 py-1.5 text-gray-900 font-medium">{level}</td>
                          {EXAM_FIELD_KEYS.map(field => (
                            <td key={field} className="px-1 py-1">
                              <select
                                value={config[field]}
                                onChange={e => {
                                  const newConfigs = { ...profession.levelExamConfigs, [level]: { ...config, [field]: e.target.value } }
                                  setPlans(prev => prev.map(p =>
                                    p.id === selectedPlan.id
                                      ? { ...p, professions: p.professions.map(pr => pr.id === profession.id ? { ...pr, levelExamConfigs: newConfigs } : pr) }
                                      : p
                                  ))
                                }}
                                className="w-full h-7 rounded border border-gray-200 text-xs px-1 focus:outline-none focus:border-blue-400"
                              >
                                {EXAM_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            {(!selectedPlan?.professions || selectedPlan.professions.length === 0) && (
              <div className="text-center text-sm text-gray-400 py-8">暂无职业工种，请先添加考试计划项</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>返回</Button>
            <Button onClick={() => { setModalKind(null); toast.success('考试设置已保存') }}><CheckCircle className="w-4 h-4 mr-1" />保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalKind === 'setOrg'} onOpenChange={() => setModalKind(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>设置可报考的报名机构</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索机构名称..." value={orgSearch} onChange={e => setOrgSearch(e.target.value)} className="pl-9" />
            </div>
            {filteredOrgs.map(org => (
              <label key={org.id} className="flex items-center gap-2 rounded-md border border-gray-200 p-2 text-sm">
                <input type="checkbox" checked={org.selected} onChange={() => setRegOrgs(prev => prev.map(o => o.id === org.id ? { ...o, selected: !o.selected } : o))} />
                <Users className="w-4 h-4 text-gray-400" />{org.name}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalKind(null)}>返回</Button>
            <Button onClick={handleSetOrg}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
