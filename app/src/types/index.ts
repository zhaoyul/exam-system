export interface User {
  id: string
  name: string
  username: string
  phone: string
  org: string
  role: string
  status: 'active' | 'locked'
}

export interface Organization {
  id: string
  name: string
  parentId: string | null
  province: string
  contact: string
  phone: string
  status: 'active' | 'inactive'
  children?: Organization[]
}

export interface NavItem {
  label: string
  path?: string
  icon?: string
  children?: NavItem[]
}

export interface Plan {
  id: string
  name: string
  type: string
  occupation: string
  level: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  person: string
  deadline: string
  org: string
  date: string
  count: number
}

export interface Candidate {
  id: string
  name: string
  idCard: string
  gender: string
  org: string
  condition: string
  photoStatus: 'uploaded' | 'pending'
  score?: number
  status?: string
}

export interface Expert {
  id: string
  name: string
  username: string
  phone: string
  unit: string
  skillType: string
  skillProject: string
  status: 'active' | 'inactive'
}

export interface Certificate {
  id: string
  batchNo: string
  planName: string
  count: number
  status: 'pending' | 'confirmed' | 'printed'
  org: string
}

export interface Document {
  id: string
  name: string
  type: string
  feedbackType: 'none' | 'receipt' | 'feedback'
  status: 'pending' | 'sent' | 'received' | 'feedback_done'
  org: string
  date: string
}

export interface ExamRoom {
  id: string
  name: string
  type: string
  seats: number
  site: string
}

export interface Subject {
  id: string
  code: string
  name: string
  version: string
  level: string
  questionCount: number
  status: 'active' | 'inactive'
}

export interface Question {
  id: string
  type: string
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
  valid: boolean
}

export interface Notification {
  id: string
  title: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}
