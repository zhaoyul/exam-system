import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { hasMenuAccess, getRoleLabel } from '@/config/rolePermissions'
import type { UserRole } from '@/config/rolePermissions'
import {
  LayoutDashboard, Users, User, BookOpen, FileText, Award,
  ClipboardCheck, FileCheck, Shield, BarChart3, FolderOpen,
  Upload, ChevronDown, ChevronRight, ChevronLeft, Atom,
  Settings, Database, GraduationCap, Printer, FileSpreadsheet,
  Archive, Receipt, AlertTriangle, Clock, PenTool,
  MapPin, UserCheck, Eye, Link2, Monitor, Bell,
  Ticket, Search, Globe, UserPlus,
  Building2, LayoutGrid, Wrench, Layers,
  ShieldCheck
} from 'lucide-react'

// Custom icons mapped to lucide equivalents
function BuildingIcon(props: any) { return <FileText {...props} /> }
function EyeIcon(props: any) { return <Award {...props} /> }
function EditIcon(props: any) { return <PenTool {...props} /> }

const groupModuleGroups = [
  {
    key: 'cert',
    label: '等级认定',
    path: '/wb/cert',
    icon: Award,
    children: [
      { label: '工作台', path: '/wb/cert', icon: LayoutDashboard },
      { label: '认定机构', path: '/cert/organizations', icon: BuildingIcon },
      { label: '认定监督', path: '/cert/supervision', icon: Shield },
      { label: '认定统计', path: '/cert/statistics', icon: BarChart3 },
      { label: '统计报表', path: '/report/statistics', icon: FileSpreadsheet },
      { label: '集团证书', path: '/cert/certificates-group', icon: Award },
      { label: '历次认定', path: '/cert/historical', icon: Clock },
      { label: '视频监控', path: '/cert/video-monitor', icon: Monitor },
      { label: '批复设置', path: '/cert/approval-settings', icon: Settings },
      { label: '认定批复', path: '/cert/approval', icon: FileCheck },
      { label: '证书上报', path: '/cert/cert-report', icon: Upload },
      { label: '预警违规', path: '/cert/violations', icon: AlertTriangle },
      { label: '特办申请', path: '/cert/special', icon: Receipt },
      { label: '试卷需求', path: '/cert/paper-demand', icon: FileText },
    ],
  },
  {
    key: 'theory',
    label: '理论题库',
    path: '/wb/theory',
    icon: BookOpen,
    children: [
      { label: '工作台', path: '/wb/theory', icon: LayoutDashboard },
      { label: '科目分类', path: '/question/subject-sort', icon: Layers },
      { label: '科目管理', path: '/question/subjects', icon: BookOpen },
      { label: '知识结构', path: '/question/knowledge', icon: Layers },
      { label: '试题管理', path: '/question/theory', icon: FileText },
      { label: '结构比重', path: '/question/ratio', icon: BarChart3 },
      { label: '组卷规则', path: '/question/paper-rules', icon: FileSpreadsheet },
      { label: '试卷需求', path: '/question/paper-require', icon: FileText },
      { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen },
    ],
  },
  {
    key: 'skill',
    label: '技能题库',
    path: '/wb/skill',
    icon: Wrench,
    children: [
      { label: '工作台', path: '/wb/skill', icon: LayoutDashboard },
      { label: '科目分类', path: '/question/skill-subject-sort', icon: Layers },
      { label: '技能科目', path: '/question/skill-subjects', icon: BookOpen },
      { label: '技能模块', path: '/question/skill-modules', icon: Layers },
      { label: '技能试题', path: '/question/skill', icon: PenTool },
      { label: '组卷规则', path: '/question/skill-rules', icon: FileSpreadsheet },
      { label: '试卷需求', path: '/question/skill-require', icon: FileText },
      { label: '卷库管理', path: '/question/paper-library', icon: FolderOpen },
    ],
  },
  {
    key: 'trace',
    label: '溯源中心',
    path: '/wb/traceability',
    icon: Link2,
    children: [
      { label: '工作台', path: '/wb/traceability', icon: LayoutDashboard },
      { label: '溯源查询', path: '/traceability', icon: Search },
    ],
  },
  {
    key: 'expert',
    label: '评价专家',
    path: '/wb/expert',
    icon: Shield,
    children: [
      { label: '工作台', path: '/wb/expert', icon: LayoutDashboard },
      { label: '专家信息', path: '/supervision/expert-info', icon: User },
      { label: '专家聘用', path: '/supervision/hiring', icon: Award },
      { label: '督导培训', path: '/supervision/training', icon: Shield },
      { label: '考评培训', path: '/supervision/evaluator-training', icon: GraduationCap },
      { label: '专家派遣', path: '/supervision/dispatch', icon: ClipboardCheck },
      { label: '表单管理', path: '/supervision/forms', icon: FileSpreadsheet },
      { label: '人员统计', path: '/supervision/personnel-statistics', icon: BarChart3 },
    ],
  },
  {
    key: 'filing',
    label: '机构备案',
    path: '/wb/filing',
    icon: Building2,
    children: [
      { label: '工作台', path: '/wb/filing', icon: LayoutDashboard },
      { label: '备案查看', path: '/filing/group', icon: FileCheck },
      { label: '备案修改', path: '/system/filing-group', icon: PenTool },
      { label: '站点复核', path: '/filing/province', icon: MapPin },
      { label: '集团审核', path: '/filing/branch', icon: Shield },
      { label: '评价范围', path: '/standard/evaluation-scope', icon: BookOpen },
    ],
  },
  {
    key: 'basic',
    label: '基础数据',
    path: '/system/users',
    icon: Database,
    children: [
      { label: '机构用户', path: '/system/users', icon: Users },
    ],
  },
]

const branchModuleGroups = [
  {
    key: 'cert-branch',
    label: '等级认定',
    path: '/branch/portal',
    icon: Award,
    children: [
      { label: '工作台', path: '/branch/portal', icon: LayoutDashboard },
      { label: '等级认定', path: '/cert/exec/plans', icon: LayoutDashboard },
      { label: '考场信息', path: '/cert/exam-rooms', icon: MapPin },
      { label: '报名机构', path: '/cert/registration-orgs', icon: Globe },
      { label: '考务人员', path: '/cert/exam-staff', icon: UserCheck },
      { label: '监考人员', path: '/cert/supervisors', icon: Shield },
      { label: '阅卷负责', path: '/cert/marking-lead', icon: PenTool },
      { label: '历次认定', path: '/cert/historical', icon: Clock },
      { label: '视频监控', path: '/cert/video-monitor', icon: Monitor },
      { label: '报名修改', path: '/cert/enroll-modify', icon: PenTool },
      { label: '申请特办', path: '/cert/special', icon: Receipt },
    ],
  },
  {
    key: 'theory',
    label: '理论题库',
    path: '/wb/theory',
    icon: BookOpen,
    children: [
      { label: '工作台', path: '/wb/theory', icon: LayoutDashboard },
      { label: '科目管理', path: '/question/subjects', icon: BookOpen },
      { label: '试卷需求', path: '/question/paper-require', icon: FileText },
    ],
  },
  {
    key: 'skill',
    label: '技能题库',
    path: '/wb/skill',
    icon: Wrench,
    children: [
      { label: '工作台', path: '/wb/skill', icon: LayoutDashboard },
      { label: '技能科目', path: '/question/skill-subjects', icon: BookOpen },
      { label: '试卷需求', path: '/question/skill-require', icon: FileText },
    ],
  },
  {
    key: 'trace',
    label: '溯源中心',
    path: '/traceability',
    icon: Link2,
    children: [
      { label: '溯源查询', path: '/traceability', icon: Search },
    ],
  },
  {
    key: 'monitor-center',
    label: '监控中心',
    path: '/cert/video-monitor',
    icon: Monitor,
    children: [
      { label: '视频监控', path: '/cert/video-monitor', icon: Monitor },
    ],
  },
  {
    key: 'filing-branch',
    label: '机构备案',
    path: '/wb/filing',
    icon: Building2,
    children: [
      { label: '工作台', path: '/wb/filing', icon: LayoutDashboard },
      { label: '备案信息', path: '/system/filing-branch', icon: FileCheck },
      { label: '备案申报', path: '/system/filing-branch/apply', icon: Upload },
      { label: '备案查看', path: '/filing/group', icon: Search },
      { label: '备案修改', path: '/system/filing-branch/modify', icon: PenTool },
    ],
  },
  {
    key: 'basic-branch',
    label: '基础数据',
    path: '/system/users',
    icon: Database,
    children: [
      { label: '机构用户', path: '/system/users', icon: Users },
      { label: '认定人员', path: '/system/personnel', icon: User },
    ],
  },
]

const defaultModuleGroups = branchModuleGroups

// Other functional menus (not in 7 main modules)
const otherMenus = [
  {
    label: '首页看板',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: '成绩管理',
    path: '/score/entry',
    icon: BarChart3,
    children: [
      { label: '成绩录入', path: '/score/entry', icon: PenTool },
      { label: '成绩审核', path: '/score/review', icon: ClipboardCheck },
      { label: '成绩公示', path: '/score/publicity', icon: Eye },
      { label: '成绩更正', path: '/score/correction', icon: EditIcon },
    ],
  },
  {
    label: '证书管理',
    path: '/certificate/issue',
    icon: Award,
    children: [
      { label: '证书核发', path: '/certificate/issue', icon: Award },
      { label: '证书查看', path: '/certificate/view', icon: EyeIcon },
      { label: '证书补发', path: '/certificate/reissue', icon: Receipt },
      { label: '公共查询', path: '/cert/public-query', icon: Search },
      { label: '证书打印', path: '/cert/certificates-print', icon: Printer },
      { label: '证书上报', path: '/cert/cert-report', icon: Upload },
    ],
  },
  {
    label: '考生管理',
    path: '/candidates/manage',
    icon: UserPlus,
    children: [
      { label: '考生档案', path: '/candidates/manage', icon: UserPlus },
      { label: '个人网报', path: '/personal/register', icon: Globe },
    ],
  },
  {
    label: '考试中心',
    path: '/exam/manage',
    icon: Monitor,
    children: [
      { label: '考试管理', path: '/exam/manage', icon: Monitor },
      { label: '在线考试', path: '/exam/online', icon: PenTool },
      { label: '座位编排', path: '/exam/seats', icon: LayoutGrid },
      { label: '准考证管理', path: '/personal/ticket', icon: Ticket },
    ],
  },
  {
    label: '阅卷管理',
    path: '/grading',
    icon: GraduationCap,
    children: [
      { label: '阅卷管理', path: '/grading', icon: GraduationCap },
      { label: '阅卷管理(详)', path: '/grading/marking', icon: ClipboardCheck },
    ],
  },
  {
    label: '考务监控',
    path: '/monitor',
    icon: Monitor,
    children: [
      { label: '监控看板', path: '/monitor', icon: Monitor },
    ],
  },
  {
    label: '报表档案',
    path: '/report/score',
    icon: FolderOpen,
    children: [
      { label: '成绩报表', path: '/report/score', icon: BarChart3 },
      { label: '统计报表', path: '/report/statistics', icon: BarChart3 },
      { label: '上报数据', path: '/report/data-upload', icon: Upload },
      { label: '报名报表', path: '/report/registration', icon: FileText },
      { label: '编排报表', path: '/report/arrangement', icon: FileSpreadsheet },
      { label: '档案管理', path: '/archive', icon: Archive },
    ],
  },
  {
    label: '文件传输',
    path: '/file/distribute',
    icon: Upload,
    children: [
      { label: '文档分发', path: '/file/distribute', icon: Upload },
      { label: '文档接收', path: '/file/receive', icon: Receipt },
      { label: '文档阅览', path: '/file/viewer', icon: Eye },
      { label: '私有文档', path: '/file/private', icon: FolderOpen },
      { label: '参数设置', path: '/file/settings', icon: Settings },
    ],
  },
  {
    label: '消息中心',
    path: '/messages',
    icon: Bell,
    children: [
      { label: '消息管理', path: '/messages', icon: Bell },
    ],
  },
  {
    label: '个人中心',
    path: '/personal/score',
    icon: User,
    children: [
      { label: '成绩查询', path: '/personal/score', icon: Search },
      { label: '证书查询', path: '/personal/cert', icon: Award },
    ],
  },
]

export default function Sidebar() {
  const { toggleSidebar, sidebarCollapsed, user } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const currentRole = (user?.role || 'group_admin') as UserRole
  const brandName = user?.org || '中广核集团'

  // Filter menus by role
  const filteredModuleGroups = useMemo(() => {
    if (currentRole === 'group_admin') return groupModuleGroups
    const source = currentRole === 'branch_admin' ? branchModuleGroups : defaultModuleGroups
    return source.filter(g => {
      // Check if any child has access
      return g.children.some(c => hasMenuAccess(currentRole, c.path))
    })
  }, [currentRole])

  const filteredOtherMenus = useMemo(() => {
    if (currentRole === 'group_admin' || currentRole === 'branch_admin') return []
    return otherMenus.filter(m => {
      if (hasMenuAccess(currentRole, m.path)) return true
      if (m.children) return m.children.some(c => hasMenuAccess(currentRole, c.path))
      return false
    })
  }, [currentRole])
  const hasOtherMenus = filteredOtherMenus.length > 0

  // Expand state for filtered groups
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    cert: false,
    'cert-branch': true,
    theory: false,
    skill: false,
    trace: false,
    finance: false,
    docs: false,
    expert: false,
    filing: false,
    'filing-branch': false,
    basic: false,
    'basic-branch': false,
  })
  const [expandedOthers, setExpandedOthers] = useState<Record<string, boolean>>({
    '成绩管理': false,
    '证书管理': false,
    '考生管理': false,
    '考试中心': false,
    '阅卷管理': false,
    '考务监控': false,
    '报表档案': false,
    '文件传输': false,
    '消息中心': false,
    '个人中心': false,
  })

  const toggleModule = (key: string) => {
    setExpandedModules(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleOther = (label: string) => {
    setExpandedOthers(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (path: string) => location.pathname === path

  if (sidebarCollapsed) {
    return (
      <aside className="w-16 bg-[#F9FAFB] border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          <Atom className="w-8 h-8 text-[#1A56DB]" />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {/* Module workbench icons */}
          {filteredModuleGroups.map(mod => {
            const Icon = mod.icon
            const active = location.pathname === mod.path || location.pathname.startsWith(mod.path.replace('/wb', ''))
            return (
              <button
                key={mod.key}
                onClick={() => navigate(mod.path)}
                className={`w-full h-10 flex items-center justify-center mb-1 transition-all duration-200 ${
                  active ? 'text-[#1A56DB] bg-[#E8EFFF] border-l-[3px] border-[#1A56DB]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={mod.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
          {hasOtherMenus && (
            <>
              <div className="mx-2 my-2 border-t border-gray-200" />
              {/* Other menu icons */}
              {filteredOtherMenus.map(item => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full h-10 flex items-center justify-center mb-1 transition-all duration-200 ${
                      active ? 'text-[#1A56DB] bg-[#E8EFFF] border-l-[3px] border-[#1A56DB]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="h-10 flex items-center justify-center border-t border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-60 bg-[#F9FAFB] border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-200">
        <Atom className="w-8 h-8 text-[#1A56DB] flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-gray-900 truncate">{brandName}</div>
          <div className="text-[11px] text-gray-500 truncate">职业技能等级认定系统</div>
        </div>
      </div>
      {/* Role badge */}
      {user && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1A56DB]" />
            <span className="text-xs font-medium text-[#1A56DB]">{getRoleLabel(currentRole)}</span>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Home */}
        {hasMenuAccess(currentRole, '/dashboard') && (
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all duration-200 ${
              isActive('/dashboard')
                ? 'text-[#1A56DB] bg-[#E8EFFF] border-l-[3px] border-[#1A56DB]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">首页看板</span>
          </button>
        )}

        <div className="mx-4 my-2 border-t border-gray-200" />

        {/* 7 Main Module Workbenches */}
        <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">核心模块</div>
        {filteredModuleGroups.map(mod => {
          const Icon = mod.icon
          // Filter children by role
          const visibleChildren = mod.children.filter(c => {
            if (c.path === mod.path) return false // Skip workbench link duplicate
            return hasMenuAccess(currentRole, c.path)
          })
          const isModuleActive = location.pathname === mod.path || visibleChildren.some(c => location.pathname === c.path)
          const isExpanded = expandedModules[mod.key]
          return (
            <div key={mod.key} className="mb-0.5">
              <div
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all duration-200 ${
                  isModuleActive
                    ? 'text-[#1A56DB] bg-[#E8EFFF] border-l-[3px] border-[#1A56DB]'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => {
                    if (!isExpanded) toggleModule(mod.key)
                    navigate(mod.path)
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{mod.label}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleModule(mod.key) }}
                  className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
              {isExpanded && visibleChildren.length > 0 && (
                <div className="bg-gray-50/50">
                  {visibleChildren.map(child => {
                    const CIcon = child.icon
                    return (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        className={`w-full flex items-center gap-2.5 pl-10 pr-4 py-1.5 text-xs transition-all duration-200 ${
                          isActive(child.path)
                            ? 'text-[#1A56DB] bg-[#E8EFFF]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <CIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {hasOtherMenus && (
          <>
            <div className="mx-4 my-2 border-t border-gray-200" />
            <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">功能菜单</div>

            {/* Other menus */}
            {filteredOtherMenus.filter(item => !item.children).map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-[#1A56DB] bg-[#E8EFFF] border-l-[3px] border-[#1A56DB]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}

            {filteredOtherMenus.filter(item => item.children).map(item => {
              const Icon = item.icon
              // Filter children by role
              const visibleChildren = item.children?.filter(c => hasMenuAccess(currentRole, c.path)) || []
              const isMenuActive = visibleChildren.some(c => location.pathname === c.path)
              const isExpanded = expandedOthers[item.label] || false
              return (
                <div key={item.label} className="mb-0.5">
                  <button
                    onClick={() => toggleOther(item.label)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all duration-200 ${
                      isMenuActive
                        ? 'text-[#1A56DB] bg-[#E8EFFF]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  </button>
                  {isExpanded && visibleChildren.length > 0 && (
                    <div className="bg-gray-50/50">
                      {visibleChildren.map(child => {
                        const CIcon = child.icon
                        return (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={`w-full flex items-center gap-2.5 pl-10 pr-4 py-1.5 text-xs transition-all duration-200 ${
                              isActive(child.path)
                                ? 'text-[#1A56DB] bg-[#E8EFFF]'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <CIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
      <button
        onClick={toggleSidebar}
        className="h-10 flex items-center justify-center border-t border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-xs ml-1">收起</span>
      </button>
    </aside>
  )
}
