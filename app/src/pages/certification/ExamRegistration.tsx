import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users, Plus, Upload, Download, CheckCircle, Trash2,
  FileSpreadsheet, AlertTriangle, ChevronRight, UserPlus, RotateCcw,
  Camera, FileUp, ChevronLeft, RefreshCw, Search, Mail, Phone,
  Building2, GraduationCap, Calendar, ClipboardList, Image, FileText,
  Check, X, FileArchive, ArrowRight, MoreHorizontal
} from 'lucide-react'
import { useBackendResourceList, useBackendResourceState } from '@/hooks/useBackendListState'
import { apiRequest } from '@/lib/api'
import { downloadTextEndpoint } from '@/lib/download'

// ─── Types ───

interface RegistrationPlan {
  id: string | number
  planNo: string
  planName: string
  examMonth: string
  regDeadline: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  regCount: number
  batchCount: number
}

interface RegBatch {
  id: string | number
  name: string
  orgName: string
  candidateCount: number
  status: 'open' | 'closed'
  createdAt: string
}

interface Candidate {
  id: string | number
  name: string
  gender: string
  idCard: string
  phone: string
  email: string
  birthDate: string
  ethnicity: string
  politicalStatus: string
  education: string
  graduationSchool: string
  major: string
  graduationDate: string
  workUnit: string
  department: string
  position: string
  workYears: number
  profession: string
  level: string
  type: 'normal' | 'makeup'
  orgName: string
  batchId: string | number
  conditionNo: string
  photo: boolean
  materials: boolean
}

interface RegistrationOrg {
  id: number
  name: string
  code: string
  siteName: string
  status: string
}

// ─── Mock Data ───

const mockPlans: RegistrationPlan[] = [
  { id: 1, planNo: '20260324001', planName: '大亚湾核电2026年第1批认定', examMonth: '2026年04月', regDeadline: '2026-03-15', status: 'pending', regCount: 45, batchCount: 2 },
  { id: 2, planNo: '20260324002', planName: '阳江核电2026年第1批认定', examMonth: '2026年05月', regDeadline: '2026-04-10', status: 'submitted', regCount: 32, batchCount: 1 },
  { id: 3, planNo: '20260324003', planName: '台山核电2026年第2批认定', examMonth: '2026年06月', regDeadline: '2026-05-20', status: 'approved', regCount: 28, batchCount: 1 },
]

const mockBatches: RegBatch[] = [
  { id: 1, name: '报名批次-1', orgName: '运行一部', candidateCount: 25, status: 'open', createdAt: '2026-03-01' },
  { id: 2, name: '报名批次-2', orgName: '维修部', candidateCount: 20, status: 'open', createdAt: '2026-03-02' },
]

const mockCandidates: Candidate[] = [
  { id: 1, name: '张三', gender: '男', idCard: '440301199001011234', phone: '13800138001', email: 'zhangsan@cgnc.com', birthDate: '1990-01-01', ethnicity: '汉族', politicalStatus: '中共党员', education: '本科', graduationSchool: '清华大学', major: '核工程与核技术', graduationDate: '2012-06', workUnit: '大亚湾核电', department: '运行一部', position: '高级操作员', workYears: 8, profession: '核反应堆操作员', level: '三级', type: 'normal', orgName: '运行一部', batchId: 1, conditionNo: '1', photo: true, materials: true },
  { id: 2, name: '李四', gender: '女', idCard: '440301199205063456', phone: '13800138002', email: 'lisi@cgnc.com', birthDate: '1992-05-06', ethnicity: '汉族', politicalStatus: '群众', education: '大专', graduationSchool: '华南理工大学', major: '电气工程', graduationDate: '2014-06', workUnit: '大亚湾核电', department: '运行一部', position: '维修工程师', workYears: 6, profession: '电气维修工', level: '四级', type: 'normal', orgName: '运行一部', batchId: 1, conditionNo: '2', photo: true, materials: true },
  { id: 3, name: '王五', gender: '男', idCard: '440301198803127890', phone: '13800138003', email: 'wangwu@cgnc.com', birthDate: '1988-03-12', ethnicity: '汉族', politicalStatus: '中共党员', education: '本科', graduationSchool: '上海交通大学', major: '自动化', graduationDate: '2010-06', workUnit: '大亚湾核电', department: '维修部', position: '仪表工程师', workYears: 10, profession: '仪表维修工', level: '三级', type: 'normal', orgName: '维修部', batchId: 2, conditionNo: '1', photo: false, materials: false },
  { id: 4, name: '赵六', gender: '男', idCard: '440301199511224567', phone: '13800138004', email: 'zhaoliu@cgnc.com', birthDate: '1995-11-22', ethnicity: '汉族', politicalStatus: '共青团员', education: '本科', graduationSchool: '西安交通大学', major: '热能动力', graduationDate: '2018-06', workUnit: '大亚湾核电', department: '维修部', position: '汽轮机操作员', workYears: 4, profession: '汽轮机操作员', level: '四级', type: 'makeup', orgName: '维修部', batchId: 2, conditionNo: '3', photo: true, materials: true },
  { id: 5, name: '孙七', gender: '女', idCard: '440301199307088901', phone: '13800138005', email: 'sunqi@cgnc.com', birthDate: '1993-07-08', ethnicity: '汉族', politicalStatus: '群众', education: '硕士', graduationSchool: '北京大学', major: '化学工程', graduationDate: '2017-06', workUnit: '大亚湾核电', department: '运行一部', position: '化学分析师', workYears: 5, profession: '化学分析员', level: '三级', type: 'normal', orgName: '运行一部', batchId: 1, conditionNo: '2', photo: true, materials: true },
]

const mockOrgs: RegistrationOrg[] = [
  { id: 1, name: '运行一部', code: 'RUN01', siteName: '大亚湾核电基地', status: 'active' },
  { id: 2, name: '运行二部', code: 'RUN02', siteName: '大亚湾核电基地', status: 'active' },
  { id: 3, name: '维修部', code: 'MAINT01', siteName: '大亚湾核电基地', status: 'active' },
  { id: 4, name: '仪控部', code: 'IC01', siteName: '大亚湾核电基地', status: 'active' },
  { id: 5, name: '技术部', code: 'TECH01', siteName: '大亚湾核电基地', status: 'active' },
]

const applicationConditions = [
  { no: '1', label: '条件1: 取得本职业五级证书后，累计从事本职业工作3年（含）以上' },
  { no: '2', label: '条件2: 累计从事本职业工作5年（含）以上' },
  { no: '3', label: '条件3: 取得技工学校本专业或相关专业毕业证书（含尚未取得毕业证书的在校应届毕业生）' },
  { no: '4', label: '条件4: 取得经评估论证、以中级技能为培养目标的中等及以上职业学校本专业或相关专业毕业证书（含尚未取得毕业证书的在校应届毕业生）' },
]

const professionLevels = [
  { profession: '核反应堆操作员', levels: ['一级/高级技师', '二级/技师', '三级/高级', '四级/中级', '五级/初级'] },
  { profession: '电气维修工', levels: ['一级/高级技师', '二级/技师', '三级/高级', '四级/中级', '五级/初级'] },
  { profession: '仪表维修工', levels: ['一级/高级技师', '二级/技师', '三级/高级', '四级/中级', '五级/初级'] },
  { profession: '汽轮机操作员', levels: ['一级/高级技师', '二级/技师', '三级/高级', '四级/中级', '五级/初级'] },
  { profession: '化学分析员', levels: ['一级/高级技师', '二级/技师', '三级/高级', '四级/中级', '五级/初级'] },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待报名', color: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: '已提交', color: 'bg-blue-100 text-blue-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', color: 'bg-red-100 text-red-700' },
}

type RegistrationMode = 'single' | 'batch' | null

// ─── Main Component ───

export default function ExamRegistration() {
  const plans = useBackendResourceList('/certification/exam-registration', mockPlans)
  const [batches, setBatches] = useBackendResourceState<RegBatch>('/certification/execution/registration-orgs', mockBatches)
  const [candidates, setCandidates] = useBackendResourceState<Candidate>('/candidates/manage', mockCandidates)
  const [orgs] = useState<RegistrationOrg[]>(mockOrgs)

  // Navigation state
  const [selectedPlan, setSelectedPlan] = useState<string | number | null>(null)
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null)
  const [activeTab, setActiveTab] = useState('todo')
  const [moreMenuOpen, setMoreMenuOpen] = useState<string | number | null>(null)

  // Single registration wizard state
  const [singleStep, setSingleStep] = useState(1)
  const [singleForm, setSingleForm] = useState<Partial<Candidate>>({
    gender: '男', type: 'normal', conditionNo: '1',
    ethnicity: '汉族', politicalStatus: '群众',
    education: '本科', level: '三级',
    profession: '核反应堆操作员',
  })
  const [singlePhotoFile, setSinglePhotoFile] = useState<File | null>(null)
  const [singlePhotoPreview, setSinglePhotoPreview] = useState<string | null>(null)

  // Batch registration wizard state
  const [batchStep, setBatchStep] = useState(1)
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)
  const [newBatchName, setNewBatchName] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('核反应堆操作员')
  const [selectedLevel, setSelectedLevel] = useState('三级')
  const [selectedBatchId, setSelectedBatchId] = useState<string | number>(1)
  const [importMode, setImportMode] = useState<'clear' | 'cover' | 'ignore'>('cover')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [photoZipFile, setPhotoZipFile] = useState<File | null>(null)
  const [photoNamingPattern, setPhotoNamingPattern] = useState<'name-idcard' | 'idcard' | 'idcard-name'>('idcard')
  const [photoRecognized, setPhotoRecognized] = useState(false)
  const [photoPreviewList, setPhotoPreviewList] = useState<{ name: string; matched: boolean }[]>([])

  // Shared batch ops
  const [photoFilter, setPhotoFilter] = useState<'全部' | '有照片' | '无照片'>('全部')
  const [selectedBatch, setSelectedBatch] = useState<string | number>(1)
  const [candidateDetail, setCandidateDetail] = useState<Candidate | null>(null)
  const [registrationWindowMode, setRegistrationWindowMode] = useState<'window' | 'online'>('window')
  const [checkMultiCert, setCheckMultiCert] = useState(false)

  // Dialogs
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [photoImportDialogOpen, setPhotoImportDialogOpen] = useState(false)
  const [materialImportOpen, setMaterialImportOpen] = useState(false)
  const [feeDialog, setFeeDialog] = useState<'缴费' | '记账' | null>(null)

  const filteredCandidates = candidates.filter(c =>
    c.batchId === selectedBatch &&
    (photoFilter === '全部' || (photoFilter === '有照片' ? c.photo : !c.photo))
  )

  // ─── Handlers: Plan List ───

  const handleEnterRegistration = (planId: string | number, mode: RegistrationMode) => {
    setSelectedPlan(planId)
    setRegistrationMode(mode)
    setMoreMenuOpen(null)
    if (mode === 'single') {
      setSingleStep(1)
    } else {
      setBatchStep(1)
    }
  }

  const handleBackToPlanList = () => {
    setSelectedPlan(null)
    setRegistrationMode(null)
    setSingleStep(1)
    setBatchStep(1)
  }

  // ─── Handlers: Single Registration ───

  const handleSingleStepNext = () => {
    if (singleStep < 4) setSingleStep(s => s + 1)
  }

  const handleSingleStepPrev = () => {
    if (singleStep > 1) setSingleStep(s => s - 1)
  }

  const handleSinglePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSinglePhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setSinglePhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSingleSubmit = () => {
    const now = new Date()
    const newCandidate: Candidate = {
      id: Date.now(),
      name: singleForm.name || '',
      gender: singleForm.gender || '男',
      idCard: singleForm.idCard || '',
      phone: singleForm.phone || '',
      email: singleForm.email || '',
      birthDate: singleForm.birthDate || '',
      ethnicity: singleForm.ethnicity || '汉族',
      politicalStatus: singleForm.politicalStatus || '群众',
      education: singleForm.education || '',
      graduationSchool: singleForm.graduationSchool || '',
      major: singleForm.major || '',
      graduationDate: singleForm.graduationDate || '',
      workUnit: singleForm.workUnit || '',
      department: singleForm.department || '',
      position: singleForm.position || '',
      workYears: singleForm.workYears || 0,
      profession: singleForm.profession || '',
      level: singleForm.level || '三级',
      type: (singleForm.type as 'normal' | 'makeup') || 'normal',
      orgName: '运行一部',
      batchId: 0,
      conditionNo: singleForm.conditionNo || '1',
      photo: !!singlePhotoFile,
      materials: false,
    }
    setCandidates(prev => [...prev, newCandidate])
    toast.success(`报名成功！考生：${newCandidate.name}`)
    handleBackToPlanList()
  }

  // ─── Handlers: Batch Registration ───

  const handleBatchStepNext = () => {
    if (batchStep < 5) setBatchStep(s => s + 1)
  }

  const handleBatchStepPrev = () => {
    if (batchStep > 1) setBatchStep(s => s - 1)
  }

  const handleCreateBatch = () => {
    if (!newBatchName.trim()) {
      toast.error('请输入批次名称')
      return
    }
    const org = orgs.find(o => o.id === selectedOrgId)
    const newBatch: RegBatch = {
      id: Date.now(),
      name: newBatchName,
      orgName: org?.name || '',
      candidateCount: 0,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setBatches(prev => [...prev, newBatch])
    setSelectedBatchId(newBatch.id)
    setSelectedBatch(newBatch.id)
    toast.success(`新增报名批次：${newBatch.name}`)
    handleBatchStepNext()
  }

  const handleDeleteCandidate = (id: string | number) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
    setBatches(prev => prev.map(b => b.id === selectedBatch ? { ...b, candidateCount: Math.max(0, b.candidateCount - 1) } : b))
    toast.success('已删除考生')
  }

  const handleCancelRegistration = (id: string | number) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
    setBatches(prev => prev.map(b => b.id === selectedBatch ? { ...b, candidateCount: Math.max(0, b.candidateCount - 1) } : b))
    toast.success('已取消报名')
  }

  const handleEndRegistration = () => {
    toast.success('报名已结束提交')
    setActiveTab('done')
  }

  const handleCheckMultiCert = () => {
    setCheckMultiCert(true)
    toast.success('一人多证检查完成，未发现异常')
  }

  const handleDeleteAllCandidates = () => {
    const deletedCount = candidates.filter(c => c.batchId === selectedBatch).length
    setCandidates(prev => prev.filter(c => c.batchId !== selectedBatch))
    setBatches(prev => prev.map(b => b.id === selectedBatch ? { ...b, candidateCount: 0 } : b))
    toast.success(`已删除当前批次 ${deletedCount} 条报名信息`)
  }

  const handlePhotoImportRecognize = () => {
    setPhotoRecognized(true)
    const sampleMatches = candidates.filter(c => c.batchId === selectedBatch).map(c => ({
      name: `${c.name}-${c.idCard}`,
      matched: c.photo || Math.random() > 0.3,
    }))
    setPhotoPreviewList(sampleMatches)
    toast.success('照片识别完成')
  }

  const handlePhotoImportUpload = async () => {
    if (selectedPlan) {
      await apiRequest(`/certification/exam-registration/${encodeURIComponent(String(selectedPlan))}/photos`, {
        method: 'POST',
        body: JSON.stringify({
          batchId: selectedBatch,
          candidateIds: candidates.filter(c => c.batchId === selectedBatch).map(c => c.id),
        }),
      }).catch(() => undefined)
    }
    setCandidates(prev => prev.map(c => c.batchId === selectedBatch ? { ...c, photo: true } : c))
    setPhotoDialogOpen(false)
    setPhotoRecognized(false)
    setPhotoPreviewList([])
    toast.success('照片批量导入完成')
  }

  const handleExcelImportConfirm = async () => {
    if (selectedPlan && importFile) {
      const content = await importFile.text()
      const result = await apiRequest<{ imported: number; skipped: number; failed: number }>(`/certification/exam-registration/${encodeURIComponent(String(selectedPlan))}/import`, {
        method: 'POST',
        body: JSON.stringify({ batchId: selectedBatchId, mode: importMode, content }),
      })
      setImportDialogOpen(false)
      setImportFile(null)
      toast.success(`已导入 ${result.imported} 名考生，忽略 ${result.skipped} 条，失败 ${result.failed} 条`)
      handleBatchStepNext()
      return
    }
    const newId = Date.now()
    const importedCandidates: Candidate[] = [
      { id: newId, name: '批量考生A', gender: '男', idCard: '440301199010101111', phone: '13800138010', email: 'batcha@cgnc.com', birthDate: '1990-10-10', ethnicity: '汉族', politicalStatus: '群众', education: '本科', graduationSchool: '哈尔滨工程大学', major: '核工程', graduationDate: '2013-06', workUnit: '大亚湾核电', department: '运行一部', position: '操作员', workYears: 7, profession: selectedProfession, level: selectedLevel, type: 'normal', orgName: orgs.find(o => o.id === selectedOrgId)?.name || '', batchId: selectedBatchId, conditionNo: '1', photo: false, materials: false },
      { id: newId + 1, name: '批量考生B', gender: '女', idCard: '440301199205052222', phone: '13800138011', email: 'batchb@cgnc.com', birthDate: '1992-05-05', ethnicity: '汉族', politicalStatus: '中共党员', education: '硕士', graduationSchool: '中国科学技术大学', major: '核物理', graduationDate: '2016-06', workUnit: '大亚湾核电', department: '运行一部', position: '高级操作员', workYears: 5, profession: selectedProfession, level: selectedLevel, type: 'normal', orgName: orgs.find(o => o.id === selectedOrgId)?.name || '', batchId: selectedBatchId, conditionNo: '2', photo: false, materials: false },
    ]
    if (importMode === 'clear') {
      setCandidates(prev => [...prev.filter(c => c.batchId !== selectedBatchId), ...importedCandidates])
    } else if (importMode === 'cover') {
      setCandidates(prev => {
        const others = prev.filter(c => c.batchId !== selectedBatchId)
        const existing = prev.filter(c => c.batchId === selectedBatchId)
        const existingIds = new Set(existing.map(c => c.idCard))
        const merged = existing.filter(c => !importedCandidates.some(ic => ic.idCard === c.idCard))
        return [...others, ...merged, ...importedCandidates]
      })
    } else {
      setCandidates(prev => {
        const existingIds = new Set(prev.filter(c => c.batchId === selectedBatchId).map(c => c.idCard))
        const newOnes = importedCandidates.filter(ic => !existingIds.has(ic.idCard))
        return [...prev, ...newOnes]
      })
    }
    setBatches(prev => prev.map(b => b.id === selectedBatchId ? { ...b, candidateCount: candidates.filter(c => c.batchId === selectedBatchId).length + importedCandidates.length } : b))
    setImportDialogOpen(false)
    setImportFile(null)
    toast.success(`已按「${importMode === 'clear' ? '清空后导入' : importMode === 'cover' ? '相同覆盖导入' : '相同忽略导入'}」导入 ${importedCandidates.length} 名考生`)
    handleBatchStepNext()
  }

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [addBatchDialogOpen, setAddBatchDialogOpen] = useState(false)

  // ─── Render: Wizard Steps ───

  const renderWizardSteps = (current: number, total: number, labels: string[]) => (
    <div className="flex items-center gap-2 mb-6">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            i + 1 === current ? 'bg-blue-600 text-white' :
            i + 1 < current ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
              i + 1 === current ? 'bg-white text-blue-600' :
              i + 1 < current ? 'bg-green-600 text-white' :
              'bg-gray-300 text-gray-600'
            }`}>
              {i + 1 < current ? '✓' : i + 1}
            </span>
            {label}
          </div>
          {i < total - 1 && (
            <div className={`w-6 h-px ${i + 1 < current ? 'bg-green-400' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  )

  // ─── Render: Single Registration Wizard ───

  const renderSingleWizard = () => (
    <div className="space-y-6">
      {renderWizardSteps(singleStep, 4, ['选择申报条件', '填写考生信息', '上传照片', '确认报名'])}

      {singleStep === 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              第一步：选择申报条件
            </CardTitle>
            <p className="text-sm text-gray-500">请选择符合考生实际条件的申报条件编号</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {applicationConditions.map(cond => (
              <label
                key={cond.no}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  singleForm.conditionNo === cond.no
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="conditionNo"
                  value={cond.no}
                  checked={singleForm.conditionNo === cond.no}
                  onChange={e => setSingleForm(f => ({ ...f, conditionNo: e.target.value }))}
                  className="mt-0.5"
                />
                <span className="text-sm">{cond.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {singleStep === 2 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              第二步：填写考生信息
            </CardTitle>
            <p className="text-sm text-gray-500">请填写完整的考生信息，带 * 为必填项</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">基本信息</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>姓名 *</Label><Input value={singleForm.name || ''} onChange={e => setSingleForm(f => ({ ...f, name: e.target.value }))} placeholder="请输入姓名" /></div>
                <div className="space-y-1"><Label>性别 *</Label>
                  <Select value={singleForm.gender} onValueChange={v => setSingleForm(f => ({ ...f, gender: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="男">男</SelectItem><SelectItem value="女">女</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>证件号码 *</Label><Input value={singleForm.idCard || ''} onChange={e => setSingleForm(f => ({ ...f, idCard: e.target.value }))} placeholder="身份证号" /></div>
                <div className="space-y-1"><Label>出生日期</Label><Input type="date" value={singleForm.birthDate || ''} onChange={e => setSingleForm(f => ({ ...f, birthDate: e.target.value }))} /></div>
                <div className="space-y-1"><Label>民族</Label><Input value={singleForm.ethnicity || ''} onChange={e => setSingleForm(f => ({ ...f, ethnicity: e.target.value }))} placeholder="汉族" /></div>
                <div className="space-y-1"><Label>政治面貌</Label>
                  <Select value={singleForm.politicalStatus} onValueChange={v => setSingleForm(f => ({ ...f, politicalStatus: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="中共党员">中共党员</SelectItem>
                      <SelectItem value="中共预备党员">中共预备党员</SelectItem>
                      <SelectItem value="共青团员">共青团员</SelectItem>
                      <SelectItem value="群众">群众</SelectItem>
                      <SelectItem value="民主党派">民主党派</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Education Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">教育信息</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>学历 *</Label>
                  <Select value={singleForm.education} onValueChange={v => setSingleForm(f => ({ ...f, education: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="博士">博士</SelectItem>
                      <SelectItem value="硕士">硕士</SelectItem>
                      <SelectItem value="本科">本科</SelectItem>
                      <SelectItem value="大专">大专</SelectItem>
                      <SelectItem value="中专">中专</SelectItem>
                      <SelectItem value="高中">高中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>毕业院校</Label><Input value={singleForm.graduationSchool || ''} onChange={e => setSingleForm(f => ({ ...f, graduationSchool: e.target.value }))} placeholder="毕业院校" /></div>
                <div className="space-y-1"><Label>专业</Label><Input value={singleForm.major || ''} onChange={e => setSingleForm(f => ({ ...f, major: e.target.value }))} placeholder="所学专业" /></div>
                <div className="space-y-1"><Label>毕业时间</Label><Input type="month" value={singleForm.graduationDate || ''} onChange={e => setSingleForm(f => ({ ...f, graduationDate: e.target.value }))} /></div>
              </div>
            </div>

            {/* Work Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">工作信息</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>工作单位</Label><Input value={singleForm.workUnit || ''} onChange={e => setSingleForm(f => ({ ...f, workUnit: e.target.value }))} placeholder="工作单位" /></div>
                <div className="space-y-1"><Label>所在部门</Label><Input value={singleForm.department || ''} onChange={e => setSingleForm(f => ({ ...f, department: e.target.value }))} placeholder="所在部门" /></div>
                <div className="space-y-1"><Label>职务/岗位</Label><Input value={singleForm.position || ''} onChange={e => setSingleForm(f => ({ ...f, position: e.target.value }))} placeholder="职务或岗位名称" /></div>
                <div className="space-y-1"><Label>工作年限(年)</Label><Input type="number" value={singleForm.workYears || ''} onChange={e => setSingleForm(f => ({ ...f, workYears: Number(e.target.value) }))} placeholder="0" /></div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">联系方式</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>手机号码</Label>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input className="pl-9" value={singleForm.phone || ''} onChange={e => setSingleForm(f => ({ ...f, phone: e.target.value }))} placeholder="手机号" /></div>
                </div>
                <div className="space-y-1"><Label>电子邮箱</Label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input className="pl-9" value={singleForm.email || ''} onChange={e => setSingleForm(f => ({ ...f, email: e.target.value }))} placeholder="邮箱地址" /></div>
                </div>
              </div>
            </div>

            {/* Exam Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">报考信息</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>职业工种 *</Label>
                  <Select value={singleForm.profession} onValueChange={v => setSingleForm(f => ({ ...f, profession: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {professionLevels.map(pl => <SelectItem key={pl.profession} value={pl.profession}>{pl.profession}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>技能等级 *</Label>
                  <Select value={singleForm.level} onValueChange={v => setSingleForm(f => ({ ...f, level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="一级/高级技师">一级/高级技师</SelectItem>
                      <SelectItem value="二级/技师">二级/技师</SelectItem>
                      <SelectItem value="三级/高级">三级/高级</SelectItem>
                      <SelectItem value="四级/中级">四级/中级</SelectItem>
                      <SelectItem value="五级/初级">五级/初级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>考试类型</Label>
                  <Select value={singleForm.type} onValueChange={v => setSingleForm(f => ({ ...f, type: v as 'normal' | 'makeup' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="normal">正考</SelectItem><SelectItem value="makeup">补考</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {singleStep === 3 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              第三步：上传照片
            </CardTitle>
            <p className="text-sm text-gray-500">请上传考生近期免冠证件照，支持 jpg/png 格式</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {singlePhotoPreview ? (
                <div className="relative">
                  <img src={singlePhotoPreview} alt="照片预览" className="w-40 h-52 object-cover rounded-lg border-2 border-blue-300" />
                  <button
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    onClick={() => { setSinglePhotoFile(null); setSinglePhotoPreview(null) }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors w-full max-w-md">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">点击上传考生照片</p>
                  <p className="text-xs text-gray-400 mt-1">支持 jpg、png 格式，建议尺寸 480×640</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleSinglePhotoUpload} />
                </label>
              )}
              {singlePhotoPreview && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" /> 照片已就绪
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {singleStep === 4 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              第四步：确认报名信息
            </CardTitle>
            <p className="text-sm text-gray-500">请核对以下信息，确认无误后点击"立即报名"</p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">申报条件：</span><span className="font-medium">条件{singleForm.conditionNo}</span></div>
                <div><span className="text-gray-500">照片：</span><span className="font-medium">{singlePhotoFile ? '已上传 ✓' : '未上传 ✗'}</span></div>
                <div><span className="text-gray-500">姓名：</span><span className="font-medium">{singleForm.name || '-'}</span></div>
                <div><span className="text-gray-500">性别：</span><span className="font-medium">{singleForm.gender || '-'}</span></div>
                <div><span className="text-gray-500">证件号码：</span><span className="font-medium">{singleForm.idCard || '-'}</span></div>
                <div><span className="text-gray-500">出生日期：</span><span className="font-medium">{singleForm.birthDate || '-'}</span></div>
                <div><span className="text-gray-500">民族：</span><span className="font-medium">{singleForm.ethnicity || '-'}</span></div>
                <div><span className="text-gray-500">政治面貌：</span><span className="font-medium">{singleForm.politicalStatus || '-'}</span></div>
                <div><span className="text-gray-500">学历：</span><span className="font-medium">{singleForm.education || '-'}</span></div>
                <div><span className="text-gray-500">毕业院校：</span><span className="font-medium">{singleForm.graduationSchool || '-'}</span></div>
                <div><span className="text-gray-500">专业：</span><span className="font-medium">{singleForm.major || '-'}</span></div>
                <div><span className="text-gray-500">毕业时间：</span><span className="font-medium">{singleForm.graduationDate || '-'}</span></div>
                <div><span className="text-gray-500">工作单位：</span><span className="font-medium">{singleForm.workUnit || '-'}</span></div>
                <div><span className="text-gray-500">所在部门：</span><span className="font-medium">{singleForm.department || '-'}</span></div>
                <div><span className="text-gray-500">职务/岗位：</span><span className="font-medium">{singleForm.position || '-'}</span></div>
                <div><span className="text-gray-500">工作年限：</span><span className="font-medium">{singleForm.workYears ? `${singleForm.workYears}年` : '-'}</span></div>
                <div><span className="text-gray-500">手机号码：</span><span className="font-medium">{singleForm.phone || '-'}</span></div>
                <div><span className="text-gray-500">电子邮箱：</span><span className="font-medium">{singleForm.email || '-'}</span></div>
                <div><span className="text-gray-500">职业工种：</span><span className="font-medium">{singleForm.profession || '-'}</span></div>
                <div><span className="text-gray-500">技能等级：</span><span className="font-medium">{singleForm.level || '-'}</span></div>
                <div><span className="text-gray-500">考试类型：</span><span className="font-medium">{singleForm.type === 'makeup' ? '补考' : '正考'}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single wizard navigation */}
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToPlanList}>
            <RotateCcw className="w-4 h-4 mr-2" /> 返回计划列表
          </Button>
          {singleStep > 1 && (
            <Button variant="outline" onClick={handleSingleStepPrev}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
            </Button>
          )}
        </div>
        {singleStep < 4 ? (
          <Button onClick={handleSingleStepNext}>
            下一步 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSingleSubmit} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 mr-2" /> 立即报名
          </Button>
        )}
      </div>
    </div>
  )

  // ─── Render: Batch Registration Wizard ───

  const renderBatchWizard = () => {
    const batchStepLabels = ['选择报名机构', '新增报名批次', '选择职业工种等级', '导入考生Excel', '批量导入照片']

    return (
      <div className="space-y-6">
        {renderWizardSteps(batchStep, 5, batchStepLabels)}

        {batchStep === 1 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                第一步：选择报名机构
              </CardTitle>
              <p className="text-sm text-gray-500">选择本次集体报名的组织机构</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {orgs.map(org => (
                  <label
                    key={org.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOrgId === org.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orgId"
                      value={org.id}
                      checked={selectedOrgId === org.id}
                      onChange={() => setSelectedOrgId(org.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-sm">{org.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">编码: {org.code} | 站点: {org.siteName}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {batchStep === 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                第二步：新增报名批次
              </CardTitle>
              <p className="text-sm text-gray-500">创建新的报名批次，关联到已选机构</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-3">
                <div className="space-y-1">
                  <Label>已选机构</Label>
                  <Input value={orgs.find(o => o.id === selectedOrgId)?.name || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <Label>批次名称 *</Label>
                  <Input value={newBatchName} onChange={e => setNewBatchName(e.target.value)} placeholder="如：报名批次-3" />
                </div>
              </div>

              {/* Existing batches for this org */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">已有批次</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batches.filter(b => b.orgName === orgs.find(o => o.id === selectedOrgId)?.name).map(batch => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{batch.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{batch.orgName} · {batch.candidateCount}人</span>
                      </div>
                      <Badge className={batch.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {batch.status === 'open' ? '正在报名' : '已结束'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {batchStep === 3 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                第三步：选择职业工种等级
              </CardTitle>
              <p className="text-sm text-gray-500">选择本次报名批次对应的职业（工种）和级别</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-3">
                <div className="space-y-1">
                  <Label>职业（工种）*</Label>
                  <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {professionLevels.map(pl => <SelectItem key={pl.profession} value={pl.profession}>{pl.profession}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>技能等级 *</Label>
                  <div className="flex flex-wrap gap-2">
                    {(professionLevels.find(pl => pl.profession === selectedProfession)?.levels || []).map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                          selectedLevel === level
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p>已选批次：<strong>{batches.find(b => b.id === selectedBatchId)?.name || '-'}</strong></p>
                <p>报名机构：<strong>{batches.find(b => b.id === selectedBatchId)?.orgName || '-'}</strong></p>
              </div>
            </CardContent>
          </Card>
        )}

        {batchStep === 4 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                第四步：导入考生Excel
              </CardTitle>
              <p className="text-sm text-gray-500">下载模板并按格式填写后上传导入</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => downloadTextEndpoint('/certification/exam-registration/import-template', '考生导入模板.csv')}>
                <Download className="w-4 h-4 mr-2" /> 导入模板下载
              </Button>

              <div className="space-y-2">
                <Label>导入模式</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'clear' as const, label: '清空后导入', desc: '先清空当前批次，再写入上传数据' },
                    { key: 'cover' as const, label: '相同覆盖导入', desc: '证件号相同的考生用新数据覆盖' },
                    { key: 'ignore' as const, label: '相同忽略导入', desc: '证件号相同的考生保留原数据' },
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setImportMode(item.key)}
                      className={`rounded-md border p-3 text-left ${
                        importMode === item.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer block">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">点击或拖拽CSV文件到此处上传</p>
                <p className="text-xs text-gray-400 mt-1">支持标准模板 .csv 格式</p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) { setImportFile(file); toast.success(`已选择文件：${file.name}`) }
                  }}
                />
              </label>

              {importFile && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  <FileSpreadsheet className="w-4 h-4" />
                  {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
                <p className="font-medium mb-1">导入字段说明：</p>
                <p>姓名、性别、身份证号、职业工种、技能等级、考试类型、申报条件编号</p>
              </div>
            </CardContent>
          </Card>
        )}

        {batchStep === 5 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                第五步：批量导入照片
              </CardTitle>
              <p className="text-sm text-gray-500">上传照片压缩包，系统自动识别匹配考生照片</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step indicator inside */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                {['选择照片压缩包', '识别证件号码', '上传照片'].map((step, index) => (
                  <div key={step} className={`rounded-md border p-3 ${index <= (photoRecognized ? 2 : 0) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs ${index <= (photoRecognized ? 2 : 0) ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      {index < (photoRecognized ? 2 : 0) ? '✓' : index + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>

              {/* Photo naming pattern */}
              <div className="space-y-2">
                <Label>照片命名规则</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'name-idcard' as const, label: '姓名-证件号码', example: '张三-440301199001011234.jpg' },
                    { key: 'idcard' as const, label: '证件号码', example: '440301199001011234.jpg' },
                    { key: 'idcard-name' as const, label: '证件号码-姓名', example: '440301199001011234-张三.jpg' },
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPhotoNamingPattern(item.key)}
                      className={`rounded-md border p-3 text-left ${
                        photoNamingPattern === item.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="mt-1 text-xs text-gray-400 font-mono">{item.example}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload area */}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer block">
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">上传照片压缩包（.zip）</p>
                <p className="text-xs text-gray-400 mt-1">照片格式支持 jpg/png，单张不超过 500KB</p>
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) { setPhotoZipFile(file); toast.success(`已选择文件：${file.name}`) }
                  }}
                />
              </label>

              {photoZipFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  <FileArchive className="w-4 h-4" />
                  {photoZipFile.name} ({(photoZipFile.size / 1024).toFixed(1)} KB)
                </div>
              )}

              {/* Recognition results */}
              {photoRecognized && photoPreviewList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">识别结果</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {photoPreviewList.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{item.name}</span>
                        {item.matched ? (
                          <Badge className="bg-green-100 text-green-700">已匹配</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">未匹配</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Batch wizard navigation */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToPlanList}>
              <RotateCcw className="w-4 h-4 mr-2" /> 返回计划列表
            </Button>
            {batchStep > 1 && (
              <Button variant="outline" onClick={handleBatchStepPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
              </Button>
            )}
          </div>
          {batchStep === 2 ? (
            <Button onClick={handleCreateBatch} disabled={!newBatchName.trim()}>
              创建批次 <Plus className="w-4 h-4 ml-1" />
            </Button>
          ) : batchStep === 4 ? (
            <Button onClick={handleExcelImportConfirm} disabled={!importFile}>
              确认导入 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : batchStep === 5 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePhotoImportRecognize} disabled={!photoZipFile || photoRecognized}>
                <Search className="w-4 h-4 mr-1" /> 识别
              </Button>
              <Button onClick={handlePhotoImportUpload}>
                <Upload className="w-4 h-4 mr-1" /> 上传照片
              </Button>
            </div>
          ) : (
            <Button onClick={handleBatchStepNext} disabled={batchStep === 1 && !selectedOrgId}>
              下一步 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Batch Candidate Management (existing batch view after creation) ───

  const renderBatchCandidateView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBackToPlanList}>
            <RotateCcw className="w-3 h-3 mr-1" /> 返回计划列表
          </Button>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            请选择职业（工种）级别
            <select
              value={`${selectedProfession} / ${selectedLevel}`}
              onChange={e => {
                const [p, l] = e.target.value.split(' / ')
                setSelectedProfession(p); setSelectedLevel(l)
              }}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
            >
              {professionLevels.flatMap(pl => pl.levels.map(l => `${pl.profession} / ${l}`)).map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <div className="flex rounded-md border border-gray-200 bg-white p-0.5">
            <button
              className={`px-3 py-1 text-xs rounded ${registrationWindowMode === 'window' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setRegistrationWindowMode('window')}
            >
              窗口报名
            </button>
            <button
              className={`px-3 py-1 text-xs rounded ${registrationWindowMode === 'online' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setRegistrationWindowMode('online')}
            >
              在线报名
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckMultiCert}>
            <AlertTriangle className="w-4 h-4 mr-2" /> 检查一人多证
          </Button>
          <Button variant="outline" onClick={() => { setImportDialogOpen(true); setBatchStep(4); setSelectedBatchId(selectedBatch) }}>
            <Upload className="w-4 h-4 mr-2" /> 导入考生
          </Button>
          <Button variant="outline" onClick={() => { setPhotoDialogOpen(true); setBatchStep(5) }}>
            <Camera className="w-4 h-4 mr-2" /> 导入照片
          </Button>
          <Button variant="outline" onClick={() => setMaterialImportOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" /> 导入申报材料
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Batch list */}
        <div className="col-span-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">报名批次</h3>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddBatchDialogOpen(true)}>
              <Plus className="w-3 h-3 mr-1" /> 新增批次
            </Button>
          </div>
          {batches.map(batch => (
            <div
              key={batch.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedBatch === batch.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedBatch(batch.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{batch.name}</span>
                <Badge variant="outline" className="text-[10px]">{batch.candidateCount}人</Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">{batch.orgName}</div>
              <div className="text-xs text-gray-400 mt-0.5">{batch.createdAt}</div>
              <div className="mt-1">
                <Badge className={`text-[10px] ${batch.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {batch.status === 'open' ? '正在报名' : '已结束'}
                </Badge>
              </div>
            </div>
          ))}

          <div className="pt-2 space-y-2 border-t mt-2">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('申报表已导出')}>导出申报表</Button>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('全部电子表格已导出')}>导出全部电子表格</Button>
            <Button variant="outline" size="sm" className="w-full text-xs text-red-600" onClick={handleDeleteAllCandidates}>删除所有报名信息</Button>
            <Button variant="default" size="sm" className="w-full text-xs" onClick={handleEndRegistration}>结束报名</Button>
          </div>
        </div>

        {/* Right: Candidate list */}
        <div className="col-span-9">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  考生列表 ({filteredCandidates.length})
                  <Badge variant="outline" className="text-[10px]">
                    {registrationWindowMode === 'window' ? '窗口报名' : '在线报名'}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <select
                    value={photoFilter}
                    onChange={e => setPhotoFilter(e.target.value as typeof photoFilter)}
                    className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs"
                  >
                    <option>全部</option>
                    <option>有照片</option>
                    <option>无照片</option>
                  </select>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.success('报名报表已导出')}>
                    <FileSpreadsheet className="w-3 h-3 mr-1" /> 报名报表
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => downloadTextEndpoint('/certification/exam-registration/import-template', '考生导入模板.csv')}>
                    <Download className="w-3 h-3 mr-1" /> 下载模板
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left"><input type="checkbox" /></th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">序号</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">姓名</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">性别</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">照片</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">证件号码</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">职业工种</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">多证检查</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">技能等级</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">类型</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-3 py-12 text-center text-gray-400">
                          <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p>暂无数据</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2"><input type="checkbox" /></td>
                          <td className="px-3 py-2 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{c.name}</td>
                          <td className="px-3 py-2 text-xs">{c.gender}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className={`text-[10px] ${c.photo ? 'text-green-600' : 'text-red-600'}`}>
                              {c.photo ? '已上传' : '未上传'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-xs font-mono text-gray-500">{c.idCard}</td>
                          <td className="px-3 py-2 text-xs">{c.profession}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className="text-green-600">同职业0个 其他职业0个</span>
                          </td>
                          <td className="px-3 py-2 text-xs">{c.level}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className={`text-[10px] ${c.type === 'makeup' ? 'text-amber-600' : 'text-blue-600'}`}>
                              {c.type === 'makeup' ? '补考' : '正考'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600">查看</Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => setCandidateDetail(c)}>编辑</Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600" onClick={() => handleCancelRegistration(c.id)}>取消报名</Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleDeleteCandidate(c.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {checkMultiCert && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">一人多证检查完成，未发现异常情况</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // ─── Render: Plan Selection View ───

  const renderPlanSelection = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">报名截止</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {plans.filter(p => p.status === 'pending').map((plan, idx) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{idx + 1}</td>
              <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.planNo}</td>
              <td className="px-4 py-3 font-medium">{plan.planName}</td>
              <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
              <td className="px-4 py-3 text-gray-500">{plan.regDeadline}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[plan.status].color}`}>
                  {statusMap[plan.status].label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleEnterRegistration(plan.id, 'batch')}>
                    进入集体报名 <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMoreMenuOpen(moreMenuOpen === plan.id ? null : plan.id)}
                    >
                      更多 <ChevronRight className="w-3 h-3 ml-1 rotate-90" />
                    </Button>
                    {moreMenuOpen === plan.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleEnterRegistration(plan.id, 'batch')}
                          >
                            <Users className="w-4 h-4" /> 集体报名
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleEnterRegistration(plan.id, 'single')}
                          >
                            <UserPlus className="w-4 h-4" /> 单人报名
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => { setMoreMenuOpen(null); toast.success('查看批复') }}>
                            <FileText className="w-4 h-4" /> 查看批复
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => { setMoreMenuOpen(null); toast.success('报名报表已生成') }}>
                            <FileSpreadsheet className="w-4 h-4" /> 报名报表
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // ─── Main Render ───

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考试报名</h1>
          <p className="text-sm text-gray-500 mt-1">
            {registrationMode === 'single' ? '单人报名（4步流程）' :
             registrationMode === 'batch' ? '集体报名（5步流程）' :
             '支持单人报名和批量导入，补考、一人多证检查'}
          </p>
        </div>
        {selectedPlan && (
          <div className="text-sm text-gray-500">
            当前计划：<span className="font-medium text-gray-700">{plans.find(p => p.id === selectedPlan)?.planName}</span>
          </div>
        )}
      </div>

      {/* Error boundary: show plan list when nothing selected */}
      {!selectedPlan ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todo">
              待办 ({plans.filter(p => p.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="done">
              已办 ({plans.filter(p => p.status !== 'pending').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo" className="space-y-4 pt-4">
            {renderPlanSelection()}
          </TabsContent>

          <TabsContent value="done" className="space-y-4 pt-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">序号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划编号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">计划名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">考试月份</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">报名人数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.filter(p => p.status !== 'pending').map((plan, idx) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{plan.planNo}</td>
                      <td className="px-4 py-3 font-medium">{plan.planName}</td>
                      <td className="px-4 py-3 text-gray-600">{plan.examMonth}</td>
                      <td className="px-4 py-3">{plan.regCount}人</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[plan.status].color}`}>
                          {statusMap[plan.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">查看详情</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600" onClick={() => setFeeDialog('缴费')}>缴费</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => setFeeDialog('记账')}>记账</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => toast.success('已取消报名，可重新编辑')}>取消报名</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* Registration mode content */
        <div>
          {registrationMode === 'single' ? renderSingleWizard() : renderBatchCandidateView()}
        </div>
      )}

      {/* ─── Dialogs ─── */}

      {/* Fee Dialog */}
      <Dialog open={!!feeDialog} onOpenChange={() => setFeeDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{feeDialog}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
              当前批次存在非 0 元收费项目，需在财务系统完成收费或记账后继续。
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>费用总数</Label><Input value="3200.00" readOnly /></div>
              <div className="space-y-1"><Label>收费方式</Label><Input value={feeDialog || ''} readOnly /></div>
            </div>
            {feeDialog === '缴费' && <div className="space-y-1"><Label>缴费凭证</Label><Input placeholder="请输入凭证号或上传凭证说明" /></div>}
            {feeDialog === '记账' && <div className="space-y-1"><Label>记账说明</Label><Input placeholder="请输入日后清账说明" /></div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeDialog(null)}>取消</Button>
            <Button onClick={() => { setFeeDialog(null); toast.success('收费处理已保存，可在收费清单/记账清单查看') }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Batch Dialog */}
      <Dialog open={addBatchDialogOpen} onOpenChange={setAddBatchDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>新增报名批次</DialogTitle></DialogHeader>
          <form onSubmit={e => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const newBatch: RegBatch = {
              id: Date.now(),
              name: fd.get('name') as string,
              orgName: fd.get('orgName') as string,
              candidateCount: 0, status: 'open',
              createdAt: new Date().toISOString().split('T')[0],
            }
            setBatches(prev => [...prev, newBatch])
            setAddBatchDialogOpen(false)
            toast.success(`新增报名批次：${newBatch.name}`)
          }} className="space-y-3">
            <div className="space-y-1"><Label>批次名称 *</Label><Input name="name" required placeholder="如：报名批次-3" /></div>
            <div className="space-y-1"><Label>报名机构 *</Label>
              <Select name="orgName" defaultValue="运行一部">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="运行一部">运行一部</SelectItem>
                  <SelectItem value="运行二部">运行二部</SelectItem>
                  <SelectItem value="维修部">维修部</SelectItem>
                  <SelectItem value="仪控部">仪控部</SelectItem>
                  <SelectItem value="技术部">技术部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddBatchDialogOpen(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>批量导入考生</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => downloadTextEndpoint('/certification/exam-registration/import-template', '考生导入模板.csv')}>
              <Download className="w-4 h-4 mr-2" /> 导入模板下载
            </Button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'clear', label: '清空后导入', desc: '先清空当前批次，再写入上传数据' },
                { key: 'cover', label: '相同覆盖导入', desc: '证件号相同的考生用新数据覆盖' },
                { key: 'ignore', label: '相同忽略导入', desc: '证件号相同的考生保留原数据' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setImportMode(item.key as typeof importMode)}
                  className={`rounded-md border p-3 text-left ${importMode === item.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.desc}</div>
                </button>
              ))}
            </div>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer block">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">点击或拖拽CSV文件到此处上传</p>
              <p className="text-xs text-gray-400 mt-1">支持标准模板 .csv 格式</p>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setImportFile(f); toast.success(`已选择：${f.name}`) }
              }} />
            </label>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
              <p className="font-medium mb-1">导入字段说明：</p>
              <p>姓名、性别、身份证号、职业工种、技能等级、考试类型、申报条件编号</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>取消</Button>
            <Button onClick={handleExcelImportConfirm}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Import Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入考生照片</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {['选择照片压缩包', '识别证件号码', '上传照片'].map((step, i) => (
                <div key={step} className={`rounded-md border p-3 ${i <= (photoRecognized ? 2 : 0) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full text-white ${i <= (photoRecognized ? 2 : 0) ? 'bg-blue-600' : 'bg-gray-300'}`}>{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>照片命名规则</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'name-idcard' as const, label: '姓名-证件号码', eg: '张三-440301...jpg' },
                  { key: 'idcard' as const, label: '证件号码', eg: '440301...jpg' },
                  { key: 'idcard-name' as const, label: '证件号码-姓名', eg: '440301...-张三.jpg' },
                ].map(item => (
                  <button key={item.key} type="button" onClick={() => setPhotoNamingPattern(item.key)}
                    className={`rounded-md border p-2 text-left ${photoNamingPattern === item.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.eg}</div>
                  </button>
                ))}
              </div>
            </div>

            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer">
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传以照片命名的压缩包（.zip）</p>
              <p className="text-xs text-gray-400 mt-1">照片格式支持 jpg/png</p>
              <input type="file" accept=".zip" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (f) setPhotoZipFile(f)
              }} />
            </label>

            {photoRecognized && photoPreviewList.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1">
                {photoPreviewList.map((item, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-gray-50 rounded text-xs">
                    <span>{item.name}</span>
                    <Badge className={`text-[10px] ${item.matched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.matched ? '已匹配' : '未匹配'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>取消</Button>
            <Button variant="outline" onClick={handlePhotoImportRecognize} disabled={!photoZipFile || photoRecognized}>识别</Button>
            <Button onClick={handlePhotoImportUpload}>上传</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Edit Dialog */}
      <Dialog open={!!candidateDetail} onOpenChange={() => setCandidateDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>编辑考生信息</DialogTitle></DialogHeader>
          {candidateDetail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>姓名</Label><Input value={candidateDetail.name} onChange={e => setCandidateDetail({ ...candidateDetail, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>性别</Label><Input value={candidateDetail.gender} onChange={e => setCandidateDetail({ ...candidateDetail, gender: e.target.value })} /></div>
                <div className="space-y-1"><Label>证件号码</Label><Input value={candidateDetail.idCard} onChange={e => setCandidateDetail({ ...candidateDetail, idCard: e.target.value })} /></div>
                <div className="space-y-1"><Label>职业工种</Label><Input value={candidateDetail.profession} onChange={e => setCandidateDetail({ ...candidateDetail, profession: e.target.value })} /></div>
                <div className="space-y-1"><Label>技能等级</Label><Input value={candidateDetail.level} onChange={e => setCandidateDetail({ ...candidateDetail, level: e.target.value })} /></div>
                <div className="space-y-1"><Label>申报条件编号</Label><Input value={candidateDetail.conditionNo} onChange={e => setCandidateDetail({ ...candidateDetail, conditionNo: e.target.value })} /></div>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                照片：{candidateDetail.photo ? '已上传' : '未上传'}；申报材料：{candidateDetail.materials ? '完整' : '缺失'}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCandidateDetail(null)}>返回</Button>
            <Button onClick={() => {
              if (!candidateDetail) return
              setCandidates(prev => prev.map(c => c.id === candidateDetail.id ? candidateDetail : c))
              setCandidateDetail(null); toast.success('考生信息已保存')
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Import Dialog */}
      <Dialog open={materialImportOpen} onOpenChange={setMaterialImportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>导入申报材料</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">上传考生申报材料压缩包</p>
              <p className="text-xs text-gray-400 mt-1">按计划/批次归档，支持一人一档材料包</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              材料导入后可在考生行中查看申报表和附件完整性，异常材料会进入待处理列表。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaterialImportOpen(false)}>取消</Button>
            <Button onClick={() => { setMaterialImportOpen(false); toast.success('申报材料已导入') }}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
