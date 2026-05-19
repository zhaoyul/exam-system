export type TraceStatus = '已完成' | '进行中' | '待处理' | '异常'
export type TraceStageKey = 'plan' | 'register' | 'arrange' | 'execute' | 'score' | 'cert' | 'archive'

export interface TraceStage {
  id: string
  key: TraceStageKey
  name: string
  businessNo: string
  date: string
  org: string
  operator: string
  status: TraceStatus
  dataSource: string
  material: string
  detail: string
  exception?: string
}

export interface TraceCase {
  id: string
  traceNo: string
  candidateName: string
  idCard: string
  certNo: string
  ticketNo: string
  planNo: string
  planName: string
  occupation: string
  level: string
  org: string
  site: string
  issueDate: string
  status: TraceStatus
  traceType: '证书溯源' | '人员溯源' | '认定溯源'
  stages: TraceStage[]
}

export interface TraceAlert {
  id: string
  traceNo: string
  candidateName: string
  org: string
  stage: string
  level: '高' | '中' | '低'
  problem: string
  status: '待处理' | '处理中' | '已关闭'
}

export const stageOrder: Array<{ key: TraceStageKey; label: string }> = [
  { key: 'plan', label: '评价计划' },
  { key: 'register', label: '考生报名' },
  { key: 'arrange', label: '考场安排' },
  { key: 'execute', label: '组织实施' },
  { key: 'score', label: '成绩管理' },
  { key: 'cert', label: '证书颁发' },
  { key: 'archive', label: '档案归档' },
]

export const traceCases: TraceCase[] = [
  {
    id: 'tc1',
    traceNo: 'TR-2026-0001',
    candidateName: '张三',
    idCard: '440301199001011234',
    certNo: 'CGN-2026-001',
    ticketNo: '2605204403010001',
    planNo: 'PL-2026-01',
    planName: '2026年第一批核反应堆运行值班员三级认定',
    occupation: '核反应堆运行值班员',
    level: '三级/高级工',
    org: '大亚湾核电',
    site: '培训中心A栋301',
    issueDate: '2026-06-01',
    status: '已完成',
    traceType: '证书溯源',
    stages: [
      { id: 'tc1-s1', key: 'plan', name: '评价计划发布', businessNo: 'PL-2026-01', date: '2026-04-01 09:10', org: '集团评价中心', operator: '集团管理员', status: '已完成', dataSource: '认定计划', material: '计划报表.pdf', detail: '发布2026年第一批核反应堆运行值班员三级认定计划。' },
      { id: 'tc1-s2', key: 'register', name: '考生报名与审核', businessNo: 'BM-20260405-001', date: '2026-04-05 14:22', org: '大亚湾核电', operator: '报名管理员', status: '已完成', dataSource: '考试报名', material: '报名表、照片、申报材料', detail: '考生通过在线报名提交资料，资格审核通过。' },
      { id: 'tc1-s3', key: 'arrange', name: '考场与准考证编排', businessNo: 'KC-20260415-001', date: '2026-04-15 16:30', org: '集团评价中心', operator: '考务管理员', status: '已完成', dataSource: '考场编排', material: '准考证.pdf', detail: '分配第一考场，座位15，准考证已生成。' },
      { id: 'tc1-s4', key: 'execute', name: '理论与实操考试', businessNo: 'KS-20260520-001', date: '2026-05-20 09:00', org: '第一考场/实操考场1', operator: '监考员甲、考评员乙', status: '已完成', dataSource: '考试中心/阅卷管理', material: '签到记录、视频片段、评分表', detail: '理论考试85分，实操考试88分，考试过程无违规。' },
      { id: 'tc1-s5', key: 'score', name: '成绩录入、复核与公示', businessNo: 'CJ-20260522-001', date: '2026-05-22 10:00', org: '集团评价中心', operator: '成绩管理员、督导员', status: '已完成', dataSource: '成绩管理', material: '成绩报表.xlsx、公示记录', detail: '综合成绩86.8分，复核通过，公示期无异议。' },
      { id: 'tc1-s6', key: 'cert', name: '证书生成与确认打印', businessNo: 'ZS-20260601-001', date: '2026-06-01 11:20', org: '集团评价中心', operator: '证书管理员', status: '已完成', dataSource: '集团证书', material: '电子证书、打印确认记录', detail: '证书编号CGN-2026-001已生成并确认打印。' },
      { id: 'tc1-s7', key: 'archive', name: '认定批次归档', businessNo: 'GD-20260603-001', date: '2026-06-03 17:00', org: '集团评价中心', operator: '系统', status: '已完成', dataSource: '历次认定', material: '归档包.zip', detail: '计划、报名、考务、成绩、证书数据已归档。' },
    ],
  },
  {
    id: 'tc2',
    traceNo: 'TR-2026-0002',
    candidateName: '李四',
    idCard: '440301199002022345',
    certNo: 'CGN-2026-002',
    ticketNo: '2605204403010002',
    planNo: 'PL-2026-01',
    planName: '2026年第一批电气试验员四级认定',
    occupation: '电气试验员',
    level: '四级/中级工',
    org: '阳江核电',
    site: '培训中心A栋302',
    issueDate: '--',
    status: '进行中',
    traceType: '人员溯源',
    stages: [
      { id: 'tc2-s1', key: 'plan', name: '评价计划发布', businessNo: 'PL-2026-01', date: '2026-04-01 09:10', org: '集团评价中心', operator: '集团管理员', status: '已完成', dataSource: '认定计划', material: '计划报表.pdf', detail: '发布2026年第一批电气试验员四级认定计划。' },
      { id: 'tc2-s2', key: 'register', name: '考生报名与审核', businessNo: 'BM-20260408-002', date: '2026-04-08 10:05', org: '阳江核电', operator: '报名管理员', status: '已完成', dataSource: '考试报名', material: '报名表、照片、申报材料', detail: '考生报名资料审核通过。' },
      { id: 'tc2-s3', key: 'arrange', name: '考场与准考证编排', businessNo: 'KC-20260415-002', date: '2026-04-15 16:45', org: '集团评价中心', operator: '考务管理员', status: '已完成', dataSource: '考场编排', material: '准考证.pdf', detail: '分配第二考场，座位08。' },
      { id: 'tc2-s4', key: 'execute', name: '理论与实操考试', businessNo: 'KS-20260520-002', date: '2026-05-20 09:00', org: '第二考场/实操考场2', operator: '监考员乙、考评员丙', status: '已完成', dataSource: '考试中心/阅卷管理', material: '签到记录、评分表', detail: '理论78分，实操82分，等待成绩复核。' },
      { id: 'tc2-s5', key: 'score', name: '成绩复核', businessNo: 'CJ-20260522-002', date: '2026-05-22 15:30', org: '集团评价中心', operator: '成绩管理员', status: '进行中', dataSource: '成绩管理', material: '成绩报表.xlsx', detail: '成绩已录入，等待督导复核确认。' },
      { id: 'tc2-s6', key: 'cert', name: '证书生成', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '集团证书', material: '--', detail: '等待成绩公示结束后生成证书。' },
      { id: 'tc2-s7', key: 'archive', name: '认定批次归档', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '历次认定', material: '--', detail: '等待证书发放完成后归档。' },
    ],
  },
  {
    id: 'tc3',
    traceNo: 'TR-2026-0003',
    candidateName: '王五',
    idCard: '440301199003033456',
    certNo: 'CGN-2026-003',
    ticketNo: '2605204403010003',
    planNo: 'PL-2026-02',
    planName: '2026年第二批机械设备检修工三级认定',
    occupation: '机械设备检修工',
    level: '三级/高级工',
    org: '台山核电',
    site: '台山评价站',
    issueDate: '--',
    status: '异常',
    traceType: '认定溯源',
    stages: [
      { id: 'tc3-s1', key: 'plan', name: '评价计划发布', businessNo: 'PL-2026-02', date: '2026-04-12 09:00', org: '集团评价中心', operator: '集团管理员', status: '已完成', dataSource: '认定计划', material: '计划报表.pdf', detail: '发布2026年第二批机械设备检修工三级认定计划。' },
      { id: 'tc3-s2', key: 'register', name: '考生报名与审核', businessNo: 'BM-20260418-003', date: '2026-04-18 11:15', org: '台山核电', operator: '报名管理员', status: '异常', dataSource: '考试报名', material: '报名表、申报材料', detail: '报名材料未通过完整性校验。', exception: '缺少工作年限证明，照片识别未完成。' },
      { id: 'tc3-s3', key: 'arrange', name: '考场与准考证编排', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '考场编排', material: '--', detail: '报名异常未关闭，暂未进入考场编排。' },
      { id: 'tc3-s4', key: 'execute', name: '组织实施', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '考试中心/阅卷管理', material: '--', detail: '等待报名审核通过。' },
      { id: 'tc3-s5', key: 'score', name: '成绩管理', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '成绩管理', material: '--', detail: '未进入考试阶段。' },
      { id: 'tc3-s6', key: 'cert', name: '证书颁发', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '集团证书', material: '--', detail: '未达到证书生成条件。' },
      { id: 'tc3-s7', key: 'archive', name: '档案归档', businessNo: '--', date: '--', org: '--', operator: '--', status: '待处理', dataSource: '历次认定', material: '--', detail: '等待流程结束。' },
    ],
  },
]

export const traceAlerts: TraceAlert[] = [
  { id: 'a1', traceNo: 'TR-2026-0003', candidateName: '王五', org: '台山核电', stage: '考生报名', level: '高', problem: '缺少工作年限证明，照片识别未完成', status: '待处理' },
  { id: 'a2', traceNo: 'TR-2026-0002', candidateName: '李四', org: '阳江核电', stage: '成绩管理', level: '中', problem: '成绩复核超过批复设置时限', status: '处理中' },
  { id: 'a3', traceNo: 'TR-2026-0001', candidateName: '张三', org: '大亚湾核电', stage: '档案归档', level: '低', problem: '归档包待同步省级备案目录', status: '已关闭' },
]

export function findTraceCase(query: string) {
  const value = query.trim()
  if (!value) return null
  return traceCases.find(item =>
    [item.traceNo, item.candidateName, item.idCard, item.certNo, item.ticketNo, item.planNo, item.planName]
      .some(field => field.includes(value))
  ) || null
}

export function traceSummary() {
  const totalStages = traceCases.reduce((sum, item) => sum + item.stages.length, 0)
  const completedStages = traceCases.flatMap(item => item.stages).filter(stage => stage.status === '已完成').length
  return {
    records: 15820,
    thisMonth: 486,
    completeChains: traceCases.filter(item => item.status === '已完成').length,
    completeRate: Math.round((completedStages / totalStages) * 100),
    alerts: traceAlerts.filter(item => item.status !== '已关闭').length,
  }
}
