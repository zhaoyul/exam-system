export type SkillStatus = '有效' | '无效'
export type SkillQuestionStatus = '有效' | '无效' | '草稿'

export interface SkillSubject {
  id: string
  code: string
  name: string
  category: string
  level: string
  version: string
  status: SkillStatus
  modules: number
  questions: number
  papers: number
  resources: number
  authorizedOrgs: string[]
  maintainOrgs: string[]
}

export interface SkillModule {
  id: string
  subjectId: string
  code: string
  name: string
  parentId?: string
  valid: boolean
  scene: string
  score: number
  time: number
  questionCount: number
  description: string
}

export interface SkillQuestion {
  id: string
  subjectId: string
  moduleId: string
  content: string
  questionType: string
  assessment: string
  score: number
  duration: number
  status: SkillQuestionStatus
  updatedAt: string
}

export const skillSubjects: SkillSubject[] = [
  { id: 'ss1', code: 'SK-001', name: '反应堆控制棒操作', category: '运行操作', level: '三级', version: '2026版', status: '有效', modules: 5, questions: 32, papers: 6, resources: 18, authorizedOrgs: ['大亚湾核电', '阳江核电'], maintainOrgs: ['集团题库中心'] },
  { id: 'ss2', code: 'SK-002', name: '主泵检修', category: '机械维修', level: '四级', version: '2025版', status: '有效', modules: 4, questions: 28, papers: 5, resources: 15, authorizedOrgs: ['防城港核电'], maintainOrgs: ['集团题库中心', '台山核电'] },
  { id: 'ss3', code: 'SK-003', name: '汽轮机叶片检查', category: '机械维修', level: '三级', version: '2025版', status: '有效', modules: 3, questions: 18, papers: 4, resources: 10, authorizedOrgs: ['台山核电'], maintainOrgs: ['集团题库中心'] },
  { id: 'ss4', code: 'SK-004', name: '电气设备继电保护校验', category: '电气维修', level: '四级', version: '2024版', status: '无效', modules: 6, questions: 24, papers: 3, resources: 12, authorizedOrgs: [], maintainOrgs: ['集团题库中心'] },
]

export const skillModules: SkillModule[] = [
  { id: 'sm1', subjectId: 'ss1', code: 'SM-001', name: '控制棒手动操作', valid: true, scene: '实操考试', score: 20, time: 30, questionCount: 8, description: '手动提升/插入控制棒的操作流程' },
  { id: 'sm11', subjectId: 'ss1', code: 'SM-001-01', name: '操作前检查', parentId: 'sm1', valid: true, scene: '实操考试', score: 5, time: 8, questionCount: 2, description: '确认工况、许可和安全联锁' },
  { id: 'sm12', subjectId: 'ss1', code: 'SM-001-02', name: '手动插棒操作', parentId: 'sm1', valid: true, scene: '实操考试', score: 10, time: 15, questionCount: 4, description: '按规程执行手动插棒' },
  { id: 'sm2', subjectId: 'ss1', code: 'SM-002', name: '异常工况处理', valid: true, scene: '实操考试', score: 25, time: 35, questionCount: 5, description: '控制棒卡涩、信号异常处理' },
  { id: 'sm3', subjectId: 'ss2', code: 'SM-101', name: '主泵拆装检查', valid: true, scene: '实操考试', score: 30, time: 45, questionCount: 6, description: '主泵检修拆装与质量控制' },
]

export const skillQuestions: SkillQuestion[] = [
  { id: 'sq1', subjectId: 'ss1', moduleId: 'sm1', content: '按规程完成控制棒手动插入操作并记录关键参数。', questionType: '实操题', assessment: '过程评分', score: 20, duration: 30, status: '有效', updatedAt: '2026-05-18' },
  { id: 'sq2', subjectId: 'ss1', moduleId: 'sm2', content: '模拟控制棒卡涩信号，完成异常判断和应急处置。', questionType: '情景题', assessment: '结果+过程评分', score: 25, duration: 35, status: '有效', updatedAt: '2026-05-16' },
  { id: 'sq3', subjectId: 'ss2', moduleId: 'sm3', content: '完成主泵检修前隔离确认和拆装工具准备。', questionType: '实操题', assessment: '过程评分', score: 15, duration: 25, status: '草稿', updatedAt: '2026-05-15' },
]

export const skillQuestionTypes = ['实操题', '情景题', '口述题', '综合题']
export const skillLevels = ['一级', '二级', '三级', '四级', '五级']

export function skillSubjectName(id: string) {
  return skillSubjects.find(subject => subject.id === id)?.name || id
}

export function skillModuleName(id: string) {
  return skillModules.find(module => module.id === id)?.name || id
}
