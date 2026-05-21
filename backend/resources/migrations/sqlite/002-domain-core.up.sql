-- ============================================================
-- 002-domain-core.up.sql
-- 职业技能等级认定信息化管理系统 — 核心业务表
-- ============================================================

-- -------------------- 系统基础表 --------------------

-- 系统组织（扩展 organization，用于后台组织管理）
CREATE TABLE IF NOT EXISTS sys_org (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  parent_id TEXT,
  org_type TEXT NOT NULL DEFAULT 'branch',
  name TEXT NOT NULL,
  credit_code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS sys_user (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS sys_person (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  id_card TEXT,
  gender TEXT,
  birth_date TEXT,
  phone TEXT,
  education TEXT,
  org_name TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS sys_role (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS sys_menu (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  parent_id TEXT,
  name TEXT NOT NULL,
  path TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS sys_user_role (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 等级认定 — 认定机构 / 计划 --------------------

CREATE TABLE IF NOT EXISTS cgn_recog_org (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  org_type TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_recog_plan (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  recog_org_id TEXT,
  occupation TEXT,
  level TEXT,
  planned_month TEXT,
  registration_deadline TEXT,
  exam_start_date TEXT,
  exam_end_date TEXT,
  candidate_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_recog_plan_item (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 报名机构 / 考生 --------------------

CREATE TABLE IF NOT EXISTS cgn_reg_org (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  login_name TEXT,
  org_code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  site_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_candidate (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  id_card TEXT,
  gender TEXT,
  phone TEXT,
  org_name TEXT,
  occupation TEXT,
  level TEXT,
  education TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_candidate_reg (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  reg_org_id TEXT,
  exam_room_id TEXT,
  seat_no TEXT,
  admission_ticket_no TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 考场 / 考试 / 编排 / 考务 --------------------

CREATE TABLE IF NOT EXISTS cgn_exam_room (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  room_type TEXT,
  seat_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_exam_session (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  session_type TEXT,
  start_at TEXT,
  end_at TEXT,
  exam_room_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_exam_arrange (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  session_id TEXT,
  exam_room_id TEXT,
  arrange_date TEXT,
  candidate_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_exam_staff (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  login_name TEXT,
  phone TEXT,
  gender TEXT,
  staff_type TEXT,
  unit_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 批复 / 预警 / 特办 --------------------

CREATE TABLE IF NOT EXISTS cgn_approval_setting (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  template_name TEXT,
  approval_mode TEXT,
  enabled INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_warning_record (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  trace_no TEXT,
  candidate_name TEXT,
  org_name TEXT,
  stage TEXT,
  level TEXT,
  problem TEXT,
  plan_id TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_special_apply (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT,
  name TEXT NOT NULL,
  apply_type TEXT,
  reason TEXT,
  apply_org TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 证书 --------------------

CREATE TABLE IF NOT EXISTS cgn_certificate (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  cert_no TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  id_card TEXT,
  occupation TEXT,
  level TEXT,
  plan_id TEXT,
  issue_date TEXT,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_cert_report (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  batch_no TEXT NOT NULL,
  plan_id TEXT,
  candidate_count INTEGER DEFAULT 0,
  report_org TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 题库 --------------------

CREATE TABLE IF NOT EXISTS cgn_qb_subject (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  level TEXT,
  category_id TEXT,
  question_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_knowledge_node (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_question (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  subject_id TEXT,
  knowledge_node_id TEXT,
  question_type TEXT,
  difficulty TEXT,
  content TEXT NOT NULL,
  options_json TEXT,
  answer TEXT,
  score REAL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'valid',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_answer (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  question_id TEXT NOT NULL,
  answer_content TEXT,
  is_correct INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_weight_rule (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  knowledge_node_id TEXT,
  ratio REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_paper_rule (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rule_type TEXT,
  single_count INTEGER DEFAULT 0,
  multi_count INTEGER DEFAULT 0,
  judge_count INTEGER DEFAULT 0,
  total_score REAL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_paper_demand (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  paper_rule_id TEXT NOT NULL,
  name TEXT NOT NULL,
  total_score REAL DEFAULT 100,
  duration_minutes INTEGER DEFAULT 120,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qb_paper (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  paper_rule_id TEXT,
  name TEXT NOT NULL,
  bank_type TEXT,
  question_count INTEGER DEFAULT 0,
  total_score REAL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 评价专家 --------------------

CREATE TABLE IF NOT EXISTS cgn_qa_expert (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  phone TEXT,
  unit_name TEXT,
  skill_type TEXT,
  skill_project TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qa_expert_employ (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  expert_id TEXT NOT NULL,
  plan_id TEXT,
  start_date TEXT,
  end_date TEXT,
  employ_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qa_train_plan (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  train_type TEXT,
  hours INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qa_dispatch (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  expert_id TEXT NOT NULL,
  dispatch_type TEXT,
  dispatch_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_qa_form (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  form_type TEXT,
  content_json TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 备案 --------------------

CREATE TABLE IF NOT EXISTS cgn_filing_application (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  filing_type TEXT,
  province TEXT,
  apply_org TEXT,
  submit_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_filing_site (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  filing_id TEXT,
  name TEXT NOT NULL,
  site_type TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 评价范围 --------------------

CREATE TABLE IF NOT EXISTS cgn_eval_scope (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  occupation TEXT,
  level TEXT,
  scope_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 文件 / 档案 --------------------

CREATE TABLE IF NOT EXISTS cgn_doc_file (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER DEFAULT 0,
  file_path TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_doc_distribution (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  doc_file_id TEXT,
  sender TEXT,
  recipient_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS cgn_doc_receive (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  distribution_id TEXT,
  name TEXT NOT NULL,
  sender_org TEXT,
  receive_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 归档 --------------------

CREATE TABLE IF NOT EXISTS cgn_archive_event (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT,
  name TEXT NOT NULL,
  archive_type TEXT,
  file_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- -------------------- 索引 --------------------

CREATE INDEX IF NOT EXISTS idx_sys_org_org_id ON sys_org(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_sys_user_username ON sys_user(username);
--;;
CREATE INDEX IF NOT EXISTS idx_sys_user_org_id ON sys_user(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_sys_person_id_card ON sys_person(id_card);
--;;
CREATE INDEX IF NOT EXISTS idx_sys_person_org_id ON sys_person(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_recog_plan_org_id ON cgn_recog_plan(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_candidate_id_card ON cgn_candidate(id_card);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_candidate_org_id ON cgn_candidate(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_candidate_reg_plan_id ON cgn_candidate_reg(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_candidate_reg_candidate ON cgn_candidate_reg(candidate_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_exam_session_plan_id ON cgn_exam_session(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_exam_arrange_plan_id ON cgn_exam_arrange(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_certificate_cert_no ON cgn_certificate(cert_no);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_qb_question_subject_id ON cgn_qb_question(subject_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_qb_knowledge_node_subject ON cgn_qb_knowledge_node(subject_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_qa_expert_employ_expert ON cgn_qa_expert_employ(expert_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_qa_dispatch_plan_id ON cgn_qa_dispatch(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_qa_dispatch_expert ON cgn_qa_dispatch(expert_id);
--;;
