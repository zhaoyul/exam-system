import type { User, Organization, Plan, Candidate, Expert, Certificate, Document, ExamRoom, Subject, Question, Notification } from '@/types'

export const organizations: Organization[] = [
  { id: '1', name: '中广核集团', parentId: null, province: '广东', contact: '张总', phone: '13800138000', status: 'active' },
  { id: '2', name: '大亚湾核电', parentId: '1', province: '广东', contact: '李经理', phone: '13800138001', status: 'active' },
  { id: '3', name: '阳江核电', parentId: '1', province: '广东', contact: '王经理', phone: '13800138002', status: 'active' },
  { id: '4', name: '台山核电', parentId: '1', province: '广东', contact: '赵经理', phone: '13800138003', status: 'active' },
  { id: '5', name: '宁德核电', parentId: '1', province: '福建', contact: '陈经理', phone: '13800138004', status: 'active' },
  { id: '6', name: '红沿河核电', parentId: '1', province: '辽宁', contact: '刘经理', phone: '13800138005', status: 'active' },
  { id: '7', name: '防城港核电', parentId: '1', province: '广西', contact: '黄经理', phone: '13800138006', status: 'active' },
]

export const users: User[] = [
  { id: '1', name: '张三', username: 'zhangsan', phone: '13800138001', org: '大亚湾核电', role: '管理员', status: 'active' },
  { id: '2', name: '李四', username: 'lisi', phone: '13800138002', org: '阳江核电', role: '考务人员', status: 'active' },
  { id: '3', name: '王五', username: 'wangwu', phone: '13800138003', org: '台山核电', role: '督导员', status: 'active' },
  { id: '4', name: '赵六', username: 'zhaoliu', phone: '13800138004', org: '宁德核电', role: '考评员', status: 'locked' },
  { id: '5', name: '孙七', username: 'sunqi', phone: '13800138005', org: '红沿河核电', role: '管理员', status: 'active' },
]

export const plans: Plan[] = [
  { id: '1', name: '2026年第一批技能认定', type: '技能认定', occupation: '核反应堆运行值班员', level: '三级', status: 'processing', person: '张三', deadline: '2026-06-30', org: '大亚湾核电', date: '2026-05-15', count: 45 },
  { id: '2', name: '2026年第二批技能认定', type: '技能认定', occupation: '电气试验员', level: '四级', status: 'pending', person: '李四', deadline: '2026-07-15', org: '阳江核电', date: '2026-05-20', count: 32 },
  { id: '3', name: '2026年第三批技能认定', type: '技能认定', occupation: '机械设备检修工', level: '三级', status: 'approved', person: '王五', deadline: '2026-08-01', org: '台山核电', date: '2026-06-01', count: 28 },
  { id: '4', name: '2026年第四批技能认定', type: '技能认定', occupation: '仪控设备检修工', level: '二级', status: 'completed', person: '赵六', deadline: '2026-04-30', org: '宁德核电', date: '2026-04-15', count: 56 },
  { id: '5', name: '2026年第五批技能认定', type: '技能认定', occupation: '核燃料操作工', level: '三级', status: 'draft', person: '孙七', deadline: '2026-09-01', org: '红沿河核电', date: '2026-06-15', count: 18 },
]

export const candidates: Candidate[] = [
  { id: '1', name: '陈小明', idCard: '440301199001011234', gender: '男', org: '大亚湾核电', condition: '条件1', photoStatus: 'uploaded', score: 85 },
  { id: '2', name: '林小红', idCard: '440301199002021567', gender: '女', org: '阳江核电', condition: '条件2', photoStatus: 'uploaded', score: 92 },
  { id: '3', name: '周小强', idCard: '440301199003031890', gender: '男', org: '台山核电', condition: '条件1', photoStatus: 'pending', score: 78 },
  { id: '4', name: '吴小丽', idCard: '440301199004042123', gender: '女', org: '宁德核电', condition: '条件3', photoStatus: 'uploaded', score: 88 },
]

export const experts: Expert[] = [
  { id: '1', name: '刘专家', username: 'liuzj', phone: '13800138101', unit: '清华大学', skillType: '标准编制', skillProject: '核反应堆运行值班员', status: 'active' },
  { id: '2', name: '郑专家', username: 'zhengzj', phone: '13800138102', unit: '华北电力大学', skillType: '题库编制', skillProject: '电气试验员', status: 'active' },
  { id: '3', name: '陈专家', username: 'chenzj', phone: '13800138103', unit: '中国核电工程', skillType: '审题专家', skillProject: '机械设备检修工', status: 'active' },
]

export const certificates: Certificate[] = [
  { id: '1', batchNo: 'Y0041GD0000012603001', planName: '2026年第一批技能认定', count: 45, status: 'pending', org: '大亚湾核电' },
  { id: '2', batchNo: 'Y0041GD0000022603002', planName: '2026年第四批技能认定', count: 56, status: 'confirmed', org: '宁德核电' },
  { id: '3', batchNo: 'Y0041GD0000032603003', planName: '2026年第三批技能认定', count: 28, status: 'printed', org: '台山核电' },
]

export const documents: Document[] = [
  { id: '1', name: '2026年度认定工作计划', type: '工作计划', feedbackType: 'receipt', status: 'sent', org: '大亚湾核电', date: '2026-05-01' },
  { id: '2', name: '认定工作规范通知', type: '规范文件', feedbackType: 'feedback', status: 'feedback_done', org: '阳江核电', date: '2026-05-05' },
  { id: '3', name: '考务安排指南', type: '操作指南', feedbackType: 'none', status: 'sent', org: '台山核电', date: '2026-05-10' },
]

export const examRooms: ExamRoom[] = [
  { id: '1', name: '第一考场', type: '理论考场', seats: 50, site: '大亚湾基地' },
  { id: '2', name: '第二考场', type: '理论考场', seats: 40, site: '大亚湾基地' },
  { id: '3', name: '实操考场A', type: '实操考场', seats: 20, site: '阳江基地' },
  { id: '4', name: '实操考场B', type: '答辩考场', seats: 15, site: '阳江基地' },
]

export const subjects: Subject[] = [
  { id: '1', code: '4-07-03-04', name: '核反应堆运行值班员', version: 'V1.0', level: '三级', questionCount: 520, status: 'active' },
  { id: '2', code: '4-07-03-05', name: '电气试验员', version: 'V1.0', level: '四级', questionCount: 380, status: 'active' },
  { id: '3', code: '4-07-03-06', name: '机械设备检修工', version: 'V1.0', level: '三级', questionCount: 450, status: 'active' },
  { id: '4', code: '4-07-03-07', name: '仪控设备检修工', version: 'V1.0', level: '二级', questionCount: 310, status: 'inactive' },
]

export const questions: Question[] = [
  { id: '1', type: '单选题', content: '核反应堆功率控制的基本原则是什么？', difficulty: 'medium', valid: true },
  { id: '2', type: '多选题', content: '以下哪些是核安全文化的核心要素？', difficulty: 'hard', valid: true },
  { id: '3', type: '判断题', content: '核反应堆冷却剂泵可以长时间在低流量下运行。', difficulty: 'easy', valid: true },
  { id: '4', type: '填空题', content: '压水堆核电站一回路压力通常维持在____MPa。', difficulty: 'medium', valid: true },
]

export const notifications: Notification[] = [
  { id: '1', title: '新认定计划待审批', time: '2026-05-18 10:30', read: false, type: 'warning' },
  { id: '2', title: '阳江核电备案已通过', time: '2026-05-18 09:15', read: false, type: 'success' },
  { id: '3', title: '系统将于今晚进行维护', time: '2026-05-17 18:00', read: true, type: 'info' },
]

export const filingStats = {
  total: 156,
  pending: 23,
  approved: 133,
}

export const certStats = {
  monthCount: 342,
  orgCount: 7,
  pendingApproval: 12,
  certIssued: 1289,
}

export const scoreData = [
  { month: '1月', count: 120 },
  { month: '2月', count: 85 },
  { month: '3月', count: 156 },
  { month: '4月', count: 198 },
  { month: '5月', count: 342 },
  { month: '6月', count: 0 },
  { month: '7月', count: 0 },
  { month: '8月', count: 0 },
  { month: '9月', count: 0 },
  { month: '10月', count: 0 },
  { month: '11月', count: 0 },
  { month: '12月', count: 0 },
]

export const statusPieData = [
  { name: '已完成', value: 45, color: '#0E9F6E' },
  { name: '进行中', value: 30, color: '#1A56DB' },
  { name: '待审批', value: 15, color: '#F59E0B' },
  { name: '草稿', value: 10, color: '#6B7280' },
]
