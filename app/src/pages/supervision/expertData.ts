export type ExpertRole = '督导人员' | '考评人员' | '督导/考评'
export type ExpertStatus = '在聘' | '待聘' | '培训中' | '已解聘'
export type TrainingType = '督导培训' | '考评培训'
export type TrainingStep = '制定计划' | '人员报名' | '培训考核' | '证书发放' | '历次培训'

export interface ExpertProfile {
  id: string
  name: string
  idCard: string
  phone: string
  org: string
  title: string
  specialty: string
  role: ExpertRole
  status: ExpertStatus
  certificateNo: string
  hireDate: string
  expireDate: string
  dispatchCount: number
  rating: number
}

export interface TrainingPlan {
  id: string
  type: TrainingType
  name: string
  buildType: '自建培训' | '报名培训'
  date: string
  location: string
  teacher: string
  hours: number
  status: TrainingStep
  registered: number
  passed: number
  certified: number
}

export interface DispatchTask {
  id: string
  planName: string
  org: string
  date: string
  type: '现场督导' | '实操考评' | '理论考评'
  status: '待派遣' | '已派遣' | '已回评'
  experts: string[]
  supervisorScore?: number
  feedback?: string
}

export interface ExpertFormDef {
  id: string
  name: string
  type: '督导人员工作填表' | '评价督导人员工作填表' | '考评人员工作填表'
  status: '草稿' | '已发布'
  fields: string[]
  updatedAt: string
}

export const experts: ExpertProfile[] = [
  { id: 'EXP-001', name: '陈建国', idCard: '440301198001011234', phone: '13800138001', org: '大亚湾核电', title: '高级工程师', specialty: '核反应堆运行', role: '督导/考评', status: '在聘', certificateNo: 'DDPX-2026-001', hireDate: '2026-01-01', expireDate: '2026-12-31', dispatchCount: 32, rating: 4.8 },
  { id: 'EXP-002', name: '刘秀芳', idCard: '440301198002022345', phone: '13900139001', org: '中广核研究院', title: '教授级高工', specialty: '电气试验', role: '考评人员', status: '在聘', certificateNo: 'KPPX-2026-008', hireDate: '2026-01-01', expireDate: '2026-12-31', dispatchCount: 28, rating: 4.9 },
  { id: 'EXP-003', name: '黄志强', idCard: '440301198003033456', phone: '13700137001', org: '阳江核电', title: '高级工程师', specialty: '机械设备检修', role: '督导人员', status: '待聘', certificateNo: 'DDPX-2026-011', hireDate: '--', expireDate: '--', dispatchCount: 12, rating: 4.5 },
  { id: 'EXP-004', name: '赵丽华', idCard: '440301198004044567', phone: '13600136001', org: '台山核电', title: '工程师', specialty: '仪控设备检修', role: '考评人员', status: '培训中', certificateNo: '--', hireDate: '--', expireDate: '--', dispatchCount: 4, rating: 4.3 },
]

export const trainingPlans: TrainingPlan[] = [
  { id: 'tp1', type: '督导培训', name: '2026年上半年督导人员岗前培训', buildType: '自建培训', date: '2026-04-10', location: '集团培训中心', teacher: '王教授', hours: 16, status: '历次培训', registered: 38, passed: 36, certified: 36 },
  { id: 'tp5', type: '督导培训', name: '现场督导能力提升培训', buildType: '自建培训', date: '2026-06-06', location: '集团培训中心', teacher: '韩老师', hours: 12, status: '制定计划', registered: 0, passed: 0, certified: 0 },
  { id: 'tp2', type: '督导培训', name: '2026年下半年督导培训', buildType: '报名培训', date: '2026-09-01', location: '待定', teacher: '待定', hours: 16, status: '人员报名', registered: 22, passed: 0, certified: 0 },
  { id: 'tp3', type: '考评培训', name: '2026年考评人员业务培训第一期', buildType: '自建培训', date: '2026-04-15', location: '集团培训中心', teacher: '李教授', hours: 24, status: '证书发放', registered: 46, passed: 43, certified: 41 },
  { id: 'tp4', type: '考评培训', name: '实操评分标准专项培训', buildType: '报名培训', date: '2026-06-18', location: '阳江核电培训室', teacher: '周老师', hours: 12, status: '培训考核', registered: 30, passed: 18, certified: 0 },
]

export const dispatchTasks: DispatchTask[] = [
  { id: 'd1', planName: '大亚湾核电三级认定督导', org: '大亚湾核电', date: '2026-05-25', type: '现场督导', status: '待派遣', experts: [] },
  { id: 'd2', planName: '阳江核电四级认定督导', org: '阳江核电', date: '2026-05-28', type: '现场督导', status: '已派遣', experts: ['陈建国', '黄志强'], supervisorScore: 92 },
  { id: 'd3', planName: '台山核电实操考评', org: '台山核电', date: '2026-06-02', type: '实操考评', status: '已回评', experts: ['刘秀芳', '赵丽华'], supervisorScore: 95, feedback: '评分过程规范，记录完整。' },
]

export const formDefs: ExpertFormDef[] = [
  { id: 'f1', name: '督导人员现场工作记录表', type: '督导人员工作填表', status: '已发布', fields: ['现场签到', '考务检查', '视频记录', '问题描述', '督导意见'], updatedAt: '2026-04-20' },
  { id: 'f2', name: '评价督导人员工作回评表', type: '评价督导人员工作填表', status: '已发布', fields: ['任务完成度', '专业能力', '响应效率', '综合评价'], updatedAt: '2026-04-22' },
  { id: 'f3', name: '考评人员评分规范检查表', type: '考评人员工作填表', status: '草稿', fields: ['评分一致性', '扣分依据', '签字确认'], updatedAt: '2026-05-08' },
]

export const trainingSteps: TrainingStep[] = ['制定计划', '人员报名', '培训考核', '证书发放', '历次培训']

export function nextTrainingStep(step: TrainingStep): TrainingStep {
  const index = trainingSteps.indexOf(step)
  return trainingSteps[Math.min(index + 1, trainingSteps.length - 1)]
}
