-- ============================================================
-- 002-domain-core.up.sql (达梦数据库版)
-- 职业技能等级认定信息化管理系统 — 核心业务表
-- ============================================================

-- -------------------- 系统基础表 --------------------

CREATE TABLE sys_org (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  parent_id VARCHAR(64),
  org_type VARCHAR(64) DEFAULT 'branch' NOT NULL,
  name VARCHAR(256) NOT NULL,
  credit_code VARCHAR(64),
  contact_name VARCHAR(128),
  contact_phone VARCHAR(64),
  address VARCHAR(512),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE sys_user (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  username VARCHAR(128) NOT NULL UNIQUE,
  display_name VARCHAR(128) NOT NULL,
  role VARCHAR(64) DEFAULT 'user' NOT NULL,
  phone VARCHAR(64),
  email VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE sys_person (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(128) NOT NULL,
  id_card VARCHAR(32),
  gender VARCHAR(16),
  birth_date VARCHAR(32),
  phone VARCHAR(64),
  education VARCHAR(64),
  org_name VARCHAR(256),
  position VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE sys_role (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(512),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE sys_menu (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  parent_id VARCHAR(64),
  name VARCHAR(128) NOT NULL,
  path VARCHAR(256),
  icon VARCHAR(128),
  sort_order INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE sys_user_role (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  role_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 等级认定 — 认定机构 / 计划 --------------------

CREATE TABLE cgn_recog_org (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  org_type VARCHAR(64),
  contact_name VARCHAR(128),
  contact_phone VARCHAR(64),
  address VARCHAR(512),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_recog_plan (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  recog_org_id VARCHAR(64),
  occupation VARCHAR(128),
  level VARCHAR(32),
  planned_month VARCHAR(32),
  registration_deadline VARCHAR(32),
  exam_start_date VARCHAR(32),
  exam_end_date VARCHAR(32),
  candidate_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_recog_plan_item (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  item_type VARCHAR(64),
  sort_order INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 报名机构 / 考生 --------------------

CREATE TABLE cgn_reg_org (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  login_name VARCHAR(128),
  org_code VARCHAR(64),
  contact_name VARCHAR(128),
  contact_phone VARCHAR(64),
  site_name VARCHAR(256),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_candidate (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(128) NOT NULL,
  id_card VARCHAR(32),
  gender VARCHAR(16),
  phone VARCHAR(64),
  org_name VARCHAR(256),
  occupation VARCHAR(128),
  level VARCHAR(32),
  education VARCHAR(64),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_candidate_reg (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  candidate_id VARCHAR(64) NOT NULL,
  reg_org_id VARCHAR(64),
  exam_room_id VARCHAR(64),
  seat_no VARCHAR(32),
  admission_ticket_no VARCHAR(128),
  status VARCHAR(32) DEFAULT 'submitted' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 考场 / 考试 / 编排 / 考务 --------------------

CREATE TABLE cgn_exam_room (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  address VARCHAR(512),
  phone VARCHAR(64),
  room_type VARCHAR(64),
  seat_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_exam_session (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  session_type VARCHAR(64),
  start_at VARCHAR(32),
  end_at VARCHAR(32),
  exam_room_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'scheduled' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_exam_arrange (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64),
  exam_room_id VARCHAR(64),
  arrange_date VARCHAR(32),
  candidate_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_exam_staff (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(128) NOT NULL,
  login_name VARCHAR(128),
  phone VARCHAR(64),
  gender VARCHAR(16),
  staff_type VARCHAR(64),
  unit_name VARCHAR(256),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 批复 / 预警 / 特办 --------------------

CREATE TABLE cgn_approval_setting (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  template_name VARCHAR(128),
  approval_mode VARCHAR(64),
  enabled INT DEFAULT 1,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_warning_record (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  trace_no VARCHAR(128),
  candidate_name VARCHAR(128),
  org_name VARCHAR(256),
  stage VARCHAR(64),
  level VARCHAR(16),
  problem VARCHAR(512),
  plan_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'processing' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_special_apply (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64),
  name VARCHAR(256) NOT NULL,
  apply_type VARCHAR(64),
  reason VARCHAR(512),
  apply_org VARCHAR(256),
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 证书 --------------------

CREATE TABLE cgn_certificate (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  cert_no VARCHAR(128) NOT NULL,
  candidate_name VARCHAR(128) NOT NULL,
  id_card VARCHAR(32),
  occupation VARCHAR(128),
  level VARCHAR(32),
  plan_id VARCHAR(64),
  issue_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'issued' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_cert_report (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  batch_no VARCHAR(128) NOT NULL,
  plan_id VARCHAR(64),
  candidate_count INT DEFAULT 0,
  report_org VARCHAR(256),
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 题库 --------------------

CREATE TABLE cgn_qb_subject (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  level VARCHAR(32),
  category_id VARCHAR(64),
  question_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_knowledge_node (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  parent_id VARCHAR(64),
  sort_order INT DEFAULT 0,
  question_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_question (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  subject_id VARCHAR(64),
  knowledge_node_id VARCHAR(64),
  question_type VARCHAR(32),
  difficulty VARCHAR(16),
  content CLOB NOT NULL,
  options_json CLOB,
  answer CLOB,
  score REAL DEFAULT 1,
  status VARCHAR(32) DEFAULT 'valid' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_answer (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  answer_content CLOB,
  is_correct INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_weight_rule (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  knowledge_node_id VARCHAR(64),
  ratio REAL DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_paper_rule (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  rule_type VARCHAR(64),
  single_count INT DEFAULT 0,
  multi_count INT DEFAULT 0,
  judge_count INT DEFAULT 0,
  total_score REAL DEFAULT 100,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_paper_demand (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  paper_rule_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  total_score REAL DEFAULT 100,
  duration_minutes INT DEFAULT 120,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qb_paper (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  paper_rule_id VARCHAR(64),
  name VARCHAR(256) NOT NULL,
  bank_type VARCHAR(64),
  question_count INT DEFAULT 0,
  total_score REAL DEFAULT 100,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 评价专家 --------------------

CREATE TABLE cgn_qa_expert (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(64),
  unit_name VARCHAR(256),
  skill_type VARCHAR(128),
  skill_project VARCHAR(256),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qa_expert_employ (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  expert_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64),
  start_date VARCHAR(32),
  end_date VARCHAR(32),
  employ_type VARCHAR(64),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qa_train_plan (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  train_type VARCHAR(64),
  hours INT DEFAULT 0,
  start_date VARCHAR(32),
  end_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qa_dispatch (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  expert_id VARCHAR(64) NOT NULL,
  dispatch_type VARCHAR(64),
  dispatch_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_qa_form (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  form_type VARCHAR(64),
  content_json CLOB,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 备案 --------------------

CREATE TABLE cgn_filing_application (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  filing_type VARCHAR(64),
  province VARCHAR(64),
  apply_org VARCHAR(256),
  submit_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_filing_site (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  filing_id VARCHAR(64),
  name VARCHAR(256) NOT NULL,
  site_type VARCHAR(64),
  address VARCHAR(512),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 评价范围 --------------------

CREATE TABLE cgn_eval_scope (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  occupation VARCHAR(128),
  level VARCHAR(32),
  scope_type VARCHAR(64),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 文件 / 档案 --------------------

CREATE TABLE cgn_doc_file (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  file_type VARCHAR(64),
  file_size INT DEFAULT 0,
  file_path VARCHAR(512),
  owner VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_doc_distribution (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  name VARCHAR(256) NOT NULL,
  doc_file_id VARCHAR(64),
  sender VARCHAR(128),
  recipient_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE cgn_doc_receive (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  distribution_id VARCHAR(64),
  name VARCHAR(256) NOT NULL,
  sender_org VARCHAR(256),
  receive_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 归档 --------------------

CREATE TABLE cgn_archive_event (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64),
  name VARCHAR(256) NOT NULL,
  archive_type VARCHAR(64),
  file_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- -------------------- 索引 --------------------

CREATE INDEX idx_sys_org_org_id ON sys_org(org_id);
--;;
CREATE INDEX idx_sys_user_username ON sys_user(username);
--;;
CREATE INDEX idx_sys_user_org_id ON sys_user(org_id);
--;;
CREATE INDEX idx_sys_person_id_card ON sys_person(id_card);
--;;
CREATE INDEX idx_sys_person_org_id ON sys_person(org_id);
--;;
CREATE INDEX idx_cgn_recog_plan_org_id ON cgn_recog_plan(org_id);
--;;
CREATE INDEX idx_cgn_candidate_id_card ON cgn_candidate(id_card);
--;;
CREATE INDEX idx_cgn_candidate_org_id ON cgn_candidate(org_id);
--;;
CREATE INDEX idx_cgn_candidate_reg_plan_id ON cgn_candidate_reg(plan_id);
--;;
CREATE INDEX idx_cgn_candidate_reg_candidate ON cgn_candidate_reg(candidate_id);
--;;
CREATE INDEX idx_cgn_exam_session_plan_id ON cgn_exam_session(plan_id);
--;;
CREATE INDEX idx_cgn_exam_arrange_plan_id ON cgn_exam_arrange(plan_id);
--;;
CREATE INDEX idx_cgn_certificate_cert_no ON cgn_certificate(cert_no);
--;;
CREATE INDEX idx_cgn_qb_question_subject_id ON cgn_qb_question(subject_id);
--;;
CREATE INDEX idx_cgn_qb_knowledge_node_subject ON cgn_qb_knowledge_node(subject_id);
--;;
CREATE INDEX idx_cgn_qa_expert_employ_expert ON cgn_qa_expert_employ(expert_id);
--;;
CREATE INDEX idx_cgn_qa_dispatch_plan_id ON cgn_qa_dispatch(plan_id);
--;;
CREATE INDEX idx_cgn_qa_dispatch_expert ON cgn_qa_dispatch(expert_id);
--;;
