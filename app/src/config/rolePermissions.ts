// Role-based permission configuration
// Defines which menus each role can access

export type UserRole = 'group_admin' | 'branch_admin' | 'expert' | 'supervisor' | 'exam_staff' | 'proctor' | 'candidate'

export interface RoleInfo {
  key: UserRole
  label: string
  description: string
  portalPath: string
}

export const ROLES: RoleInfo[] = [
  { key: 'group_admin', label: '集团管理员', description: '集团端系统管理，拥有全部权限', portalPath: '/wb/cert' },
  { key: 'branch_admin', label: '机构管理员', description: '分支机构管理，负责本单位认定工作', portalPath: '/branch/portal' },
  { key: 'expert', label: '评价专家', description: '参与命题、阅卷、考评工作', portalPath: '/wb/expert' },
  { key: 'supervisor', label: '督导人员', description: '质量督导、现场监督、评价工作', portalPath: '/supervisor/portal' },
  { key: 'exam_staff', label: '考务人员', description: '考务安排、考试组织管理', portalPath: '/examstaff/portal' },
  { key: 'proctor', label: '监考人员', description: '考场监考、秩序维护', portalPath: '/proctor/portal' },
  { key: 'candidate', label: '考生', description: '个人报名、成绩查询、证书查询', portalPath: '/candidate/portal' },
]

// Menu path whitelist for each role
// If undefined, role has access to all menus
// If empty array, role has minimal access
export const ROLE_MENU_ACCESS: Record<UserRole, string[] | undefined> = {
  // Group admin: full access
  group_admin: undefined,

  // Branch admin: certification flow + local management
  branch_admin: [
    '/dashboard',
    '/wb/theory',
    '/question/subjects',
    '/question/paper-require',
    '/wb/skill',
    '/question/skill-subjects',
    '/question/skill-require',
    '/traceability',
    '/wb/filing',
    '/filing/group',
    '/system/filing-branch',
    '/system/filing-branch/apply',
    '/system/filing-branch/modify',
    '/cert/exec/plans',
    '/cert/exec/registration',
    '/cert/exec/arrangement',
    '/cert/exec/session',
    '/cert/exec/score',
    '/cert/exec/publicity',
    '/cert/exec/cert',
    '/cert/exec/print',
    '/cert/declaration',
    '/cert/exam-rooms',
    '/cert/registration-orgs',
    '/cert/exam-staff',
    '/cert/supervisors',
    '/cert/evaluator-staff',
    '/cert/marking-lead',
    '/cert/statistics',
    '/cert/historical',
    '/cert/special',
    '/cert/video-monitor',
    '/cert/enroll-modify',
    '/cert/modifications',
    '/score/entry',
    '/score/review',
    '/score/publicity',
    '/score/correction',
    '/certificate/issue',
    '/certificate/view',
    '/grading',
    '/monitor',
    '/report/statistics',
    '/report/registration',
    '/report/arrangement',
    '/personal/ticket',
    '/personal/score',
    '/personal/cert',
    '/system/users',
    '/system/personnel',
    '/branch/portal',
  ],

  // Expert: question bank + grading + supervision
  expert: [
    '/dashboard',
    '/wb/theory',
    '/question/subject-sort',
    '/wb/skill',
    '/question/skill-subject-sort',
    '/question/subjects',
    '/question/knowledge',
    '/question/ratio',
    '/question/paper-rules',
    '/question/paper-require',
    '/question/paper-library',
    '/question/theory',
    '/question/skill-subjects',
    '/question/skill-modules',
    '/question/skill',
    '/question/skill-rules',
    '/question/skill-require',
    '/grading',
    '/grading/marking',
    '/wb/expert',
    '/supervision/training',
    '/supervision/evaluator-training',
    '/supervision/expert-info',
    '/supervision/hiring',
    '/supervision/dispatch',
    '/supervision/forms',
    '/supervision/personnel-statistics',
    '/personal/score',
    '/personal/cert',
  ],

  // Supervisor: supervision focused
  supervisor: [
    '/dashboard',
    '/monitor',
    '/wb/expert',
    '/wb/traceability',
    '/supervision/training',
    '/supervision/evaluator-training',
    '/supervision/expert-info',
    '/supervision/hiring',
    '/supervision/dispatch',
    '/supervision/forms',
    '/supervision/personnel-statistics',
    '/traceability',
    '/report/statistics',
    '/personal/score',
    '/personal/cert',
    '/supervisor/portal',
  ],

  // Exam staff: exam management focused
  exam_staff: [
    '/dashboard',
    '/exam/manage',
    '/exam/online',
    '/exam/seats',
    '/personal/ticket',
    '/cert/exec/session',
    '/cert/exec/score',
    '/cert/exec/publicity',
    '/score/entry',
    '/score/review',
    '/score/publicity',
    '/score/correction',
    '/grading',
    '/grading/marking',
    '/monitor',
    '/cert/exam-staff',
    '/cert/evaluator-staff',
    '/cert/marking-lead',
    '/cert/supervisors',
    '/examstaff/portal',
  ],

  // Proctor: exam proctoring focused
  proctor: [
    '/dashboard',
    '/monitor',
    '/exam/online',
    '/personal/ticket',
    '/cert/supervisors',
    '/proctor/portal',
  ],

  // Candidate: personal services only
  candidate: [
    '/dashboard',
    '/personal/register',
    '/personal/ticket',
    '/personal/score',
    '/personal/cert',
    '/cert/public-query',
    '/cert/declaration',
    '/cert/evaluator-staff',
    '/candidate/portal',
  ],
}

// Portal dashboard cards for each role
export interface PortalCard {
  title: string
  value: string | number
  unit?: string
  trend?: string
  icon: string
  color: string
  path?: string
}

export const ROLE_PORTAL_CARDS: Record<UserRole, PortalCard[]> = {
  group_admin: [
    { title: '本月认定人数', value: 342, unit: '人', trend: '+12.5%', icon: 'Users', color: 'blue', path: '/cert/exec/plans' },
    { title: '备案机构数', value: 7, unit: '个', trend: '+1', icon: 'Building', color: 'emerald', path: '/filing/group' },
    { title: '待审批事项', value: 12, unit: '项', trend: '需关注', icon: 'AlertTriangle', color: 'amber', path: '/cert/approval' },
    { title: '证书发放数', value: 1289, unit: '张', trend: '+8.3%', icon: 'Award', color: 'purple', path: '/certificate/issue' },
  ],
  branch_admin: [
    { title: '本月报名考生', value: 56, unit: '人', trend: '+5', icon: 'UserPlus', color: 'blue', path: '/cert/exec/registration' },
    { title: '待编排考场', value: 3, unit: '场', trend: '需关注', icon: 'LayoutGrid', color: 'amber', path: '/cert/exec/arrangement' },
    { title: '待录入成绩', value: 45, unit: '人', trend: '', icon: 'PenTool', color: 'emerald', path: '/score/entry' },
    { title: '已发证人数', value: 38, unit: '人', trend: '+12', icon: 'Award', color: 'purple', path: '/certificate/issue' },
  ],
  expert: [
    { title: '待阅卷份数', value: 30, unit: '份', trend: '新任务', icon: 'BookOpen', color: 'blue', path: '/grading' },
    { title: '已完成阅卷', value: 128, unit: '份', trend: '+15', icon: 'CheckCircle', color: 'green', path: '/grading' },
    { title: '培训课程', value: 2, unit: '门', trend: '进行中', icon: 'GraduationCap', color: 'amber', path: '/supervision/training' },
    { title: '派遣任务', value: 3, unit: '次', trend: '', icon: 'Send', color: 'purple', path: '/supervision/dispatch' },
  ],
  supervisor: [
    { title: '待督导计划', value: 5, unit: '个', trend: '新分配', icon: 'ClipboardList', color: 'blue', path: '/supervision/dispatch' },
    { title: '已完成督导', value: 23, unit: '次', trend: '+3', icon: 'CheckSquare', color: 'green', path: '/supervision/dispatch' },
    { title: '待填表单', value: 2, unit: '份', trend: '需完成', icon: 'FileText', color: 'amber', path: '/supervision/forms' },
    { title: '培训学时', value: 16, unit: '小时', trend: '', icon: 'Clock', color: 'purple', path: '/supervision/training' },
  ],
  exam_staff: [
    { title: '待安排考试', value: 4, unit: '场', trend: '需关注', icon: 'Calendar', color: 'blue', path: '/exam/manage' },
    { title: '本周考试', value: 2, unit: '场', trend: '', icon: 'Monitor', color: 'emerald', path: '/monitor' },
    { title: '待复核成绩', value: 56, unit: '人', trend: '', icon: 'ClipboardCheck', color: 'amber', path: '/score/review' },
    { title: '已完成编排', value: 12, unit: '场', trend: '+2', icon: 'LayoutGrid', color: 'purple', path: '/exam/seats' },
  ],
  proctor: [
    { title: '本周监考', value: 3, unit: '场', trend: '', icon: 'Eye', color: 'blue', path: '/monitor' },
    { title: '已完成监考', value: 15, unit: '场', trend: '+3', icon: 'CheckCircle', color: 'green', path: '/monitor' },
    { title: '异常记录', value: 1, unit: '条', trend: '需关注', icon: 'AlertTriangle', color: 'red', path: '/monitor' },
    { title: '累计监考', value: 48, unit: '场', trend: '', icon: 'Award', color: 'purple', path: '/monitor' },
  ],
  candidate: [
    { title: '我的报名', value: 2, unit: '个', trend: '进行中', icon: 'FileText', color: 'blue', path: '/personal/register' },
    { title: '考试通知', value: 1, unit: '条', trend: '新消息', icon: 'Bell', color: 'amber', path: '/personal/ticket' },
    { title: '已获证书', value: 1, unit: '张', trend: '', icon: 'Award', color: 'emerald', path: '/personal/cert' },
    { title: '成绩查询', value: '查看', unit: '', trend: '', icon: 'BarChart', color: 'purple', path: '/personal/score' },
  ],
}

export function hasMenuAccess(role: UserRole, path: string): boolean {
  const allowedPaths = ROLE_MENU_ACCESS[role]
  // undefined means full access
  if (allowedPaths === undefined) return true
  return allowedPaths.includes(path)
}

export function getRoleLabel(role: UserRole): string {
  return ROLES.find(r => r.key === role)?.label || role
}

export function getRolePortal(role: UserRole): string {
  return ROLES.find(r => r.key === role)?.portalPath || '/dashboard'
}
