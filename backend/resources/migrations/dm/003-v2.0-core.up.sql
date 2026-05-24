-- ============================================================
-- 003-v2.0-core.up.sql (达梦数据库版)
-- 职业技能等级认定信息化管理系统 — v2.0 核心表扩展与新建
-- ============================================================

-- ==================== 扩展已有表 ====================

-- organization: 增加地区字段
ALTER TABLE organization ADD COLUMN province VARCHAR(64);
--;;
ALTER TABLE organization ADD COLUMN city VARCHAR(64);
--;;
ALTER TABLE organization ADD COLUMN district VARCHAR(64);
--;;
ALTER TABLE organization ADD COLUMN short_name VARCHAR(256);
--;;

-- cgn_exam_staff: 增加考务人员扩展字段
ALTER TABLE cgn_exam_staff ADD COLUMN id_card VARCHAR(32);
--;;
ALTER TABLE cgn_exam_staff ADD COLUMN position VARCHAR(128);
--;;
ALTER TABLE cgn_exam_staff ADD COLUMN photo_url VARCHAR(512);
--;;

-- cgn_candidate: 增加考生扩展字段
ALTER TABLE cgn_candidate ADD COLUMN birth_date VARCHAR(32);
--;;
ALTER TABLE cgn_candidate ADD COLUMN photo_url VARCHAR(512);
--;;
ALTER TABLE cgn_candidate ADD COLUMN nation VARCHAR(64);
--;;

-- cgn_exam_room: 增加备案地树 + 联系人字段
ALTER TABLE cgn_exam_room ADD COLUMN province VARCHAR(64);
--;;
ALTER TABLE cgn_exam_room ADD COLUMN city VARCHAR(64);
--;;
ALTER TABLE cgn_exam_room ADD COLUMN district VARCHAR(64);
--;;
ALTER TABLE cgn_exam_room ADD COLUMN contact_person VARCHAR(128);
--;;

-- cgn_reg_org: 增加地区 + 地址字段
ALTER TABLE cgn_reg_org ADD COLUMN province VARCHAR(64);
--;;
ALTER TABLE cgn_reg_org ADD COLUMN city VARCHAR(64);
--;;
ALTER TABLE cgn_reg_org ADD COLUMN address VARCHAR(512);
--;;
ALTER TABLE cgn_reg_org ADD COLUMN org_type VARCHAR(64) DEFAULT 'enterprise' NOT NULL;
--;;

-- cgn_recog_plan: 增加计划类型、年度、批次、说明字段
ALTER TABLE cgn_recog_plan ADD COLUMN plan_type VARCHAR(64) DEFAULT 'regular' NOT NULL;
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN year INT;
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN batch_no VARCHAR(64);
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN description VARCHAR(1024);
--;;

-- ==================== 新建表 ====================

-- 认定计划项目 — 细化计划中的考试科目/项目编排
CREATE TABLE cgn_plan_item (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  item_type VARCHAR(64) DEFAULT 'theory' NOT NULL,
  occupation VARCHAR(256),
  level VARCHAR(64),
  subject_id VARCHAR(64),
  sort_order INT DEFAULT 0,
  total_score DECIMAL(5,1) DEFAULT 100,
  pass_score DECIMAL(5,1) DEFAULT 60,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- 考务人员分配 — 将考务人员分配到具体的考试场次/考场
CREATE TABLE cgn_exam_staff_assignment (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  staff_id VARCHAR(64) NOT NULL,
  exam_room_id VARCHAR(64),
  session_id VARCHAR(64),
  assignment_role VARCHAR(64) DEFAULT 'invigilator' NOT NULL,
  assignment_date VARCHAR(32),
  status VARCHAR(32) DEFAULT 'assigned' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- 试卷需求明细 — 按计划项目/场次指定所需试卷套数
CREATE TABLE cgn_paper_demand_item (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  plan_item_id VARCHAR(64),
  session_id VARCHAR(64),
  paper_rule_id VARCHAR(64),
  quantity INT DEFAULT 1,
  paper_type VARCHAR(64) DEFAULT 'A' NOT NULL,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- 成绩公示 — 管理各计划的成绩公示期间和状态
CREATE TABLE cgn_score_publicity (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  publicity_start VARCHAR(32),
  publicity_end VARCHAR(32),
  publicity_days INT DEFAULT 7,
  candidate_count INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- 证书批次 — 证书批量制作、上报、打印管理
CREATE TABLE cgn_cert_batch (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  batch_no VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  certificate_count INT DEFAULT 0,
  issue_date VARCHAR(32),
  cert_type VARCHAR(64) DEFAULT 'skill_level' NOT NULL,
  report_status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  print_status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  status VARCHAR(32) DEFAULT 'processing' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- ==================== 索引 ====================

CREATE INDEX idx_cgn_plan_item_plan_id ON cgn_plan_item(plan_id);
--;;
CREATE INDEX idx_cgn_plan_item_org_id ON cgn_plan_item(org_id);
--;;
CREATE INDEX idx_cgn_exam_staff_assignment_plan ON cgn_exam_staff_assignment(plan_id);
--;;
CREATE INDEX idx_cgn_exam_staff_assignment_staff ON cgn_exam_staff_assignment(staff_id);
--;;
CREATE INDEX idx_cgn_exam_staff_assignment_session ON cgn_exam_staff_assignment(session_id);
--;;
CREATE INDEX idx_cgn_paper_demand_item_plan ON cgn_paper_demand_item(plan_id);
--;;
CREATE INDEX idx_cgn_paper_demand_item_session ON cgn_paper_demand_item(session_id);
--;;
CREATE INDEX idx_cgn_score_publicity_plan ON cgn_score_publicity(plan_id);
--;;
CREATE INDEX idx_cgn_cert_batch_plan ON cgn_cert_batch(plan_id);
--;;
CREATE INDEX idx_cgn_cert_batch_batch_no ON cgn_cert_batch(batch_no);
--;;
