export type SubjectStatus = '有效' | '无效'
export type QuestionStatus = '有效' | '无效' | '草稿'
export type Difficulty = '简单' | '中等' | '困难'

export interface TheorySubject {
  id: string
  code: string
  name: string
  category: string
  level: string
  version: string
  status: SubjectStatus
  questions: number
  papers: number
  resources: number
  authorizedOrgs: string[]
  maintainOrgs: string[]
  typeCounts: Record<string, number>
}

export interface KnowledgeNode {
  id: string
  code: string
  name: string
  parentId?: string
  valid: boolean
  scene: string
  questionCount: number
}

export interface TheoryQuestion {
  id: string
  subjectId: string
  knowledge: string
  type: string
  content: string
  difficulty: Difficulty
  score: number
  status: QuestionStatus
  updatedAt: string
}

export const theorySubjects: TheorySubject[] = [
  {
    id: 's1',
    code: '6-28-01-01',
    name: '核反应堆运行值班员',
    category: '核能工程',
    level: '三级',
    version: '2026版',
    status: '有效',
    questions: 156,
    papers: 12,
    resources: 28,
    authorizedOrgs: ['大亚湾核电', '阳江核电', '防城港核电'],
    maintainOrgs: ['集团题库中心'],
    typeCounts: { 单选题: 76, 多选题: 42, 判断题: 25, 简答题: 13 },
  },
  {
    id: 's2',
    code: '6-28-01-02',
    name: '电气值班员',
    category: '电气工程',
    level: '四级',
    version: '2025版',
    status: '有效',
    questions: 128,
    papers: 9,
    resources: 21,
    authorizedOrgs: ['台山核电', '宁德核电'],
    maintainOrgs: ['集团题库中心', '阳江核电'],
    typeCounts: { 单选题: 62, 多选题: 31, 判断题: 24, 填空题: 11 },
  },
  {
    id: 's3',
    code: '6-28-01-03',
    name: '汽轮机运行值班员',
    category: '热能动力',
    level: '三级',
    version: '2024版',
    status: '有效',
    questions: 98,
    papers: 7,
    resources: 16,
    authorizedOrgs: ['防城港核电'],
    maintainOrgs: ['集团题库中心'],
    typeCounts: { 单选题: 50, 多选题: 22, 判断题: 18, 简答题: 8 },
  },
  {
    id: 's4',
    code: '6-28-01-04',
    name: '仪器仪表维修工',
    category: '自动化',
    level: '四级',
    version: '2023版',
    status: '无效',
    questions: 86,
    papers: 4,
    resources: 12,
    authorizedOrgs: [],
    maintainOrgs: ['集团题库中心'],
    typeCounts: { 单选题: 40, 多选题: 21, 判断题: 18, 填空题: 7 },
  },
]

export const knowledgeNodes: KnowledgeNode[] = [
  { id: 'k1', code: 'KN-001', name: '核反应堆物理', valid: true, scene: '理论考试', questionCount: 45 },
  { id: 'k11', code: 'KN-001-01', name: '中子物理学', parentId: 'k1', valid: true, scene: '理论考试', questionCount: 15 },
  { id: 'k12', code: 'KN-001-02', name: '反应性控制', parentId: 'k1', valid: true, scene: '理论考试', questionCount: 18 },
  { id: 'k13', code: 'KN-001-03', name: '核燃料管理', parentId: 'k1', valid: false, scene: '练习题', questionCount: 12 },
  { id: 'k2', code: 'KN-002', name: '热工水力学', valid: true, scene: '理论考试', questionCount: 38 },
  { id: 'k21', code: 'KN-002-01', name: '单相流体力学', parentId: 'k2', valid: true, scene: '理论考试', questionCount: 12 },
  { id: 'k22', code: 'KN-002-02', name: '两相流体力学', parentId: 'k2', valid: true, scene: '理论考试', questionCount: 14 },
  { id: 'k3', code: 'KN-003', name: '辐射防护', valid: true, scene: '理论考试', questionCount: 32 },
]

export const theoryQuestions: TheoryQuestion[] = [
  { id: 'q1', subjectId: 's1', knowledge: '反应性控制', type: '单选题', content: '控制棒插入堆芯后，反应性变化方向是什么？', difficulty: '简单', score: 1, status: '有效', updatedAt: '2026-05-18' },
  { id: 'q2', subjectId: 's1', knowledge: '核安全文化', type: '多选题', content: '核安全文化的核心要求包括哪些？', difficulty: '中等', score: 2, status: '有效', updatedAt: '2026-05-17' },
  { id: 'q3', subjectId: 's1', knowledge: '核燃料管理', type: '简答题', content: '简述换料期间燃料组件管理要点。', difficulty: '困难', score: 10, status: '草稿', updatedAt: '2026-05-15' },
  { id: 'q4', subjectId: 's2', knowledge: '电气试验', type: '判断题', content: '绝缘电阻测试前无需确认设备隔离状态。', difficulty: '简单', score: 1, status: '有效', updatedAt: '2026-05-16' },
]

export const orgOptions = ['大亚湾核电', '阳江核电', '防城港核电', '台山核电', '宁德核电']
export const questionTypes = ['单选题', '多选题', '判断题', '填空题', '简答题']
export const levels = ['一级', '二级', '三级', '四级', '五级']

export function subjectName(id: string) {
  return theorySubjects.find(subject => subject.id === id)?.name || id
}
