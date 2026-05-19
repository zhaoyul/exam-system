import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BookOpen, FileText, Users, CheckCircle, Send, Plus, X,
  Shield, GraduationCap, Printer, Download, CalendarDays, Clock, MapPin, Settings
} from 'lucide-react'

interface PaperItem {
  id: number
  planName: string
  subject: string
  type: string
  level: string
  session: string
  room: string
  status: 'pending' | 'drawn' | 'pushed'
  pushTime: string
  source: '系统推送' | '手动建立'
  purpose: string
  expanded?: boolean
}

interface StaffItem {
  id: number
  name: string
  role: string
  site: string
  room: string
  session: string
  status: 'assigned' | 'confirmed'
}

const mockPapers: PaperItem[] = [
  { id: 1, planName: '20220412第3批认定', subject: '核反应堆运行理论', type: 'A卷', level: '三级', session: '2022-03-31 08:00~10:00', room: '101教室考场', status: 'pushed', pushTime: '2022-03-28 10:23', source: '系统推送', purpose: '正式考试' },
  { id: 2, planName: '20220412第3批认定', subject: '电气设备维修理论', type: 'B卷', level: '四级', session: '2022-03-31 09:00~11:00', room: '102教室考场', status: 'drawn', pushTime: '', source: '系统推送', purpose: '正式考试' },
  { id: 3, planName: '20220412第3批认定', subject: '汽轮机检修技能', type: '实操任务书', level: '三级', session: '2022-03-31 14:00~16:00', room: '实操一号工位', status: 'pending', pushTime: '', source: '手动建立', purpose: '实操考核' },
]

export default function ExamSessionArrange() {
  const [papers, setPapers] = useState<PaperItem[]>(mockPapers)
  const [proctors, setProctors] = useState<StaffItem[]>([])
  const [supervisors, setSupervisors] = useState<StaffItem[]>([])
  const [skillExaminers, setSkillExaminers] = useState<StaffItem[]>([])
  const [showProctorSelect, setShowProctorSelect] = useState(false)
  const [showSupervisorSelect, setShowSupervisorSelect] = useState(false)
  const [showStaffArrange, setShowStaffArrange] = useState(false)
  const [showPaperConfig, setShowPaperConfig] = useState(false)
  const [showPaperRequirement, setShowPaperRequirement] = useState(false)
  const [workTab, setWorkTab] = useState<'待办' | '已办'>('待办')
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null)
  const [paperMode, setPaperMode] = useState<'题库组卷' | '非题库组卷' | '不传试卷'>('题库组卷')
  const [uploadName, setUploadName] = useState('')
  const [activeType, setActiveType] = useState<'理论考试' | '技能考试'>('理论考试')

  const handlePushPaper = (id: number) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, status: 'pushed' as const, pushTime: new Date().toLocaleString('zh-CN') } : p))
    toast.success('试卷推送成功')
  }

  const handlePushAll = () => {
    setPapers(prev => prev.map(p => ({ ...p, status: 'pushed' as const, pushTime: p.pushTime || new Date().toLocaleString('zh-CN') })))
    toast.success('全部试卷已推送')
  }

  const handleAddProctor = () => {
    setShowProctorSelect(true)
  }

  const handleAddSupervisor = () => {
    setShowSupervisorSelect(true)
  }

  const handleAddStaff = (type: 'proctor' | 'supervisor' | 'skill', name: string, role: string) => {
    const newStaff: StaffItem = {
      id: Date.now(),
      name,
      role,
      site: '职业技能培训中心',
      room: type === 'skill' ? '实操一号工位' : '101教室考场',
      session: type === 'skill' ? '2022-03-31 14:00~16:00' : '2022-03-31 08:00~10:00',
      status: 'assigned'
    }
    if (type === 'proctor') {
      setProctors(prev => [...prev, newStaff])
      setShowProctorSelect(false)
      toast.success(`监考人员 ${name} 已添加`)
    } else if (type === 'supervisor') {
      setSupervisors(prev => [...prev, newStaff])
      setShowSupervisorSelect(false)
      toast.success(`督导 ${name} 已添加`)
    } else {
      setSkillExaminers(prev => [...prev, newStaff])
      toast.success(`技能考评人员 ${name} 已添加`)
    }
  }

  const handleRemoveStaff = (type: 'proctor' | 'supervisor' | 'skill', id: number) => {
    if (type === 'proctor') setProctors(prev => prev.filter(s => s.id !== id))
    else if (type === 'supervisor') setSupervisors(prev => prev.filter(s => s.id !== id))
    else setSkillExaminers(prev => prev.filter(s => s.id !== id))
    toast.success('已移除')
  }

  const handleConfirmStaff = (type: 'proctor' | 'supervisor' | 'skill', id: number) => {
    const update = (list: StaffItem[]) => list.map(item => item.id === id ? { ...item, status: 'confirmed' as const } : item)
    if (type === 'proctor') setProctors(update)
    else if (type === 'supervisor') setSupervisors(update)
    else setSkillExaminers(update)
    toast.success('人员安排已确认')
  }

  const handleEndSession = () => {
    toast.success('考务安排已结束')
  }

  const handleOpenPaperConfig = (paper: PaperItem) => {
    setSelectedPaper(paper)
    setPaperMode(paper.status === 'pending' ? '题库组卷' : '非题库组卷')
    setUploadName('')
    setShowPaperConfig(true)
  }

  const handleSavePaperConfig = () => {
    if (!selectedPaper) return
    setPapers(prev => prev.map(p => p.id === selectedPaper.id ? { ...p, status: 'drawn' as const, type: paperMode === '不传试卷' ? '不传试卷' : p.type } : p))
    setShowPaperConfig(false)
    toast.success(paperMode === '题库组卷' ? '试卷已抽取' : '试卷配置已保存')
  }

  const togglePaperExpanded = (id: number) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p))
  }

  const visiblePapers = workTab === '待办'
    ? papers.filter(p => p.status !== 'pushed')
    : papers.filter(p => p.status === 'pushed')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">考务安排</h1>
          <p className="text-sm text-gray-500 mt-1">安排考务人员、推送试卷、管理考试</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('考务安排表已导出')}>
            <Download className="w-4 h-4 mr-2" /> 导出考务安排表
          </Button>
          <Button onClick={handleEndSession} size="sm">
            <CheckCircle className="w-4 h-4 mr-2" /> 结束考务安排
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '当前计划', value: '20220412第3批认定', icon: CalendarDays },
          { label: '考试场次', value: '3 场', icon: Clock },
          { label: '考点考场', value: '1 个考点 / 3 个考场', icon: MapPin },
          { label: '待推送试卷', value: `${papers.filter(p => p.status !== 'pushed').length} 份`, icon: BookOpen },
        ].map(item => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500"><item.icon className="w-4 h-4" />{item.label}</div>
            <div className="mt-2 text-base font-semibold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 p-3">
          <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
            {(['待办', '已办'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setWorkTab(tab)}
                className={`px-4 py-1.5 text-xs rounded ${workTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">集团批复设置开启时，结束后需等待审批通过再进入下一步</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">认定站点</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">考试日期</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">人员安排</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">试卷状态</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2.5 font-medium">20220412第3批认定</td>
              <td className="px-3 py-2.5 text-xs text-gray-600">职业技能培训中心</td>
              <td className="px-3 py-2.5 text-xs text-gray-600">2022-03-31</td>
              <td className="px-3 py-2.5 text-xs">{proctors.length + skillExaminers.length + supervisors.length} 人</td>
              <td className="px-3 py-2.5 text-xs">{papers.filter(p => p.status === 'pushed').length}/{papers.length} 已推送</td>
              <td className="px-3 py-2.5">
                <Badge className={`text-[10px] ${workTab === '待办' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{workTab === '待办' ? '待提交' : '已完成'}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => setShowStaffArrange(true)}>人员安排</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-purple-600" onClick={() => setShowPaperRequirement(true)}>试卷需求</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-600" onClick={handleEndSession}>结束</Button>
                  {workTab === '已办' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toast.success('考务安排表已下载')}>下载表格</Button>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
          {(['理论考试', '技能考试'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-1.5 text-xs rounded ${activeType === type ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowPaperRequirement(true)}>
            <BookOpen className="w-3.5 h-3.5 mr-1" /> 试卷需求
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenPaperConfig(papers.find(p => p.status !== 'pushed') || papers[0])}>
            <Settings className="w-3.5 h-3.5 mr-1" /> 配置试卷
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.success('考务材料已生成')}>
            <FileText className="w-3.5 h-3.5 mr-1" /> 生成考务材料
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handlePushAll}>
            <Send className="w-3.5 h-3.5 mr-1" /> 全部推送
          </Button>
        </div>
      </div>

      {/* Paper Push */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" /> 配置试卷与试卷推送
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">计划名称</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">科目</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">类型</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">等级</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">场次</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">考场</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">推送时间</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visiblePapers.map(p => (
              <Fragment key={p.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-sm font-medium">
                    <button className="mr-2 text-blue-600" onClick={() => togglePaperExpanded(p.id)}>{p.expanded ? '-' : '+'}</button>
                    {p.planName}
                  </td>
                  <td className="px-3 py-2.5 text-sm">{p.subject}</td>
                  <td className="px-3 py-2.5 text-xs">{p.type}</td>
                  <td className="px-3 py-2.5 text-xs">{p.level}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{p.session}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{p.room}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={`text-[10px] ${p.status === 'pushed' ? 'bg-green-100 text-green-700' : p.status === 'drawn' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status === 'pushed' ? '已推送' : p.status === 'drawn' ? '已抽卷' : '待配置'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-400">{p.pushTime || '-'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleOpenPaperConfig(p)}>编辑</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-purple-600" onClick={() => handleOpenPaperConfig(p)}>试卷</Button>
                      {p.status !== 'pushed' && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handlePushPaper(p.id)}>
                          <Send className="w-3 h-3 mr-1" /> 推送
                        </Button>
                      )}
                      {p.status === 'pushed' && <span className="text-xs text-gray-400 leading-7">已完成</span>}
                    </div>
                  </td>
                </tr>
                {p.expanded && (
                  <tr key={`${p.id}-detail`} className="bg-blue-50/40">
                    <td className="px-10 py-3 text-xs text-gray-600" colSpan={9}>
                      <div className="grid grid-cols-5 gap-3">
                        <div><span className="text-gray-400">来源：</span>{p.source}</div>
                        <div><span className="text-gray-400">用途：</span>{p.purpose}</div>
                        <div><span className="text-gray-400">需求项：</span>{p.subject} {p.level}</div>
                        <div><span className="text-gray-400">文件要求：</span>rar/pdf/word，不超过200M</div>
                        <div><button className="text-blue-600" onClick={() => handleOpenPaperConfig(p)}>编辑需求项</button></div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {visiblePapers.length === 0 && <div className="py-8 text-center text-sm text-gray-400">{workTab}暂无试卷记录</div>}
      </div>

      {/* Proctor Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" /> 监考人员安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddProctor}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {proctors.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考场</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">场次</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proctors.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.room}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.session}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={`text-[10px] ${s.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {s.status === 'confirmed' ? '已确认' : '已安排'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {s.status !== 'confirmed' && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600" onClick={() => handleConfirmStaff('proctor', s.id)}>确认</Button>}
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('proctor', s.id)}>
                        <X className="w-3 h-3" /> 移除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加监考人员</p>
          </div>
        )}
      </div>

      {/* Skill Examiner Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" /> 技能考评安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddStaff('skill', '王技能考评', '技能考评员')}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {skillExaminers.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {skillExaminers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5">
                    <Badge className="text-[10px] bg-blue-100 text-blue-700">已安排</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('skill', s.id)}>
                      <X className="w-3 h-3" /> 移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <GraduationCap className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加技能考评人员</p>
          </div>
        )}
      </div>

      {/* Supervisor Arrangement */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" /> 督导安排
          </h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddSupervisor}>
            <Plus className="w-3 h-3 mr-1" /> 增加
          </Button>
        </div>
        {supervisors.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">姓名</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">角色</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">考点</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">状态</th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supervisors.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">{s.role}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.site}</td>
                  <td className="px-3 py-2.5">
                    <Badge className="text-[10px] bg-amber-100 text-amber-700">已安排</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => handleRemoveStaff('supervisor', s.id)}>
                      <X className="w-3 h-3" /> 移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
            <Shield className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p>点击右上角增加按钮添加督导</p>
          </div>
        )}
      </div>

      {/* Exam Materials */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-purple-600" /> 考务材料
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '考场安排表', icon: FileText, desc: '各考场考生安排明细' },
            { label: '考场简况表', icon: FileText, desc: '考场基本信息汇总' },
            { label: '考生签到表', icon: Users, desc: '考生入场签到记录' },
            { label: '监考记录表', icon: Printer, desc: '监考过程记录' },
          ].map((item, i) => (
            <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => toast.success(`${item.label}已导出`)}>
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {showStaffArrange && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowStaffArrange(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[780px] max-h-[86vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold">人员安排</h3>
                <p className="text-xs text-gray-500 mt-1">安排考务、监考、考评、督导人员</p>
              </div>
              <button onClick={() => setShowStaffArrange(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: '考务负责人', value: '张考务', action: () => toast.success('考务负责人已选择') },
                  { label: '监考人员', value: `${proctors.length} 人`, action: handleAddProctor },
                  { label: '考评人员', value: `${skillExaminers.length} 人`, action: () => handleAddStaff('skill', '王技能考评', '技能考评员') },
                  { label: '督导人员', value: `${supervisors.length} 人`, action: handleAddSupervisor },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="rounded-lg border border-gray-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-gray-900">{item.value}</div>
                    <div className="mt-2 text-xs text-blue-600">选择人员</div>
                  </button>
                ))}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">人员</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">类型</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">考点/考场</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">场次</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...proctors, ...skillExaminers, ...supervisors].map(item => (
                    <tr key={`${item.role}-${item.id}`}>
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-xs">{item.role}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{item.site} / {item.room}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{item.session}</td>
                      <td className="px-3 py-2"><Badge className="text-[10px] bg-blue-100 text-blue-700">已安排</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {proctors.length + skillExaminers.length + supervisors.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">请选择本计划需要的各类人员</div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStaffArrange(false)}>返回</Button>
                <Button onClick={() => { setShowStaffArrange(false); toast.success('人员安排已保存') }}>保存</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaperRequirement && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowPaperRequirement(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[860px] max-h-[86vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold">试卷需求</h3>
                <p className="text-xs text-gray-500 mt-1">切换理论题库/技能题库后处理对应需求项</p>
              </div>
              <button onClick={() => setShowPaperRequirement(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
                  {(['理论考试', '技能考试'] as const).map(type => (
                    <button key={type} onClick={() => setActiveType(type)} className={`px-4 py-1.5 text-xs rounded ${activeType === type ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'}`}>{type === '理论考试' ? '理论题库' : '技能题库'}</button>
                  ))}
                </div>
                <Button size="sm" className="h-8 text-xs" onClick={() => toast.success('已手动建立试卷需求')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> 添加
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">需求名称</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">来源</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">用途</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">状态</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {papers.map(p => (
                    <tr key={`req-${p.id}`} className={p.status !== 'pushed' ? 'bg-orange-50/60' : ''}>
                      <td className="px-3 py-2 font-medium">{p.subject} · {p.level}</td>
                      <td className="px-3 py-2 text-xs">{p.source}</td>
                      <td className="px-3 py-2 text-xs">{p.purpose}</td>
                      <td className="px-3 py-2"><Badge className={`text-[10px] ${p.status === 'pushed' ? 'bg-green-100 text-green-700' : p.status === 'drawn' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{p.status === 'pushed' ? '已推送' : p.status === 'drawn' ? '已抽卷' : '待配置'}</Badge></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => togglePaperExpanded(p.id)}>需求项</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleOpenPaperConfig(p)}>编辑</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-purple-600" onClick={() => handleOpenPaperConfig(p)}>试卷</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600" onClick={() => handlePushPaper(p.id)}>推送</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showPaperConfig && selectedPaper && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowPaperConfig(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold">编辑试卷</h3>
              <button onClick={() => setShowPaperConfig(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                <div>需求项：{selectedPaper.subject} · {selectedPaper.level}</div>
                <div className="mt-1">场次：{selectedPaper.session}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">组卷方式</div>
                {(['题库组卷', '非题库组卷', '不传试卷'] as const).map(mode => (
                  <label key={mode} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <input type="radio" checked={paperMode === mode} onChange={() => setPaperMode(mode)} />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
              {paperMode === '题库组卷' && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                  点击保存后执行抽取，本计划试卷状态更新为“已抽卷”。
                </div>
              )}
              {paperMode === '非题库组卷' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">上传试卷文档</div>
                  <input
                    type="file"
                    accept=".rar,.pdf,.doc,.docx"
                    onChange={e => setUploadName(e.target.files?.[0]?.name || '')}
                    className="block w-full text-sm"
                  />
                  <p className="text-xs text-gray-400">支持 rar、pdf、word 格式，单个文件不大于 200M。{uploadName && ` 已选择：${uploadName}`}</p>
                </div>
              )}
              {paperMode === '不传试卷' && (
                <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
                  不传试卷仅保留需求项记录，请按集团或省市中心要求确认后保存。
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaperConfig(false)}>返回</Button>
                <Button onClick={handleSavePaperConfig}>保存</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proctor Select Dialog */}
      {showProctorSelect && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowProctorSelect(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold">选择监考人员</h3>
              <button onClick={() => setShowProctorSelect(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {['赵监考', '钱监考', '孙监考', '周监考'].map((name, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  onClick={() => handleAddStaff('proctor', name, '监考员')}
                >
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-gray-500">监考员 · 职业技能培训中心</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Select Dialog */}
      {showSupervisorSelect && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowSupervisorSelect(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold">选择督导</h3>
              <button onClick={() => setShowSupervisorSelect(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
              {['吴督导', '郑督导'].map((name, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  onClick={() => handleAddStaff('supervisor', name, '督导员')}
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-gray-500">督导员 · 集团督导组</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
