-- ============================================================
-- 003-v2.0-core.up.sql
-- 职业技能等级认定信息化管理系统 — v2.0 核心表扩展与新建
-- ============================================================

-- ==================== 扩展已有表 ====================

-- organization: 增加地区字段
ALTER TABLE organization ADD COLUMN province TEXT;
--;;
ALTER TABLE organization ADD COLUMN city TEXT;
--;;
ALTER TABLE organization ADD COLUMN district TEXT;
--;;
ALTER TABLE organization ADD COLUMN short_name TEXT;
--;;

-- cgn_exam_staff: 增加考务人员扩展字段
ALTER TABLE cgn_exam_staff ADD COLUMN id_card TEXT;
--;;
ALTER TABLE cgn_exam_staff ADD COLUMN position TEXT;
--;;
ALTER TABLE cgn_exam_staff ADD COLUMN photo_url TEXT;
--;;

-- cgn_candidate: 增加考生扩展字段
ALTER TABLE cgn_candidate ADD COLUMN birth_date TEXT;
--;;
ALTER TABLE cgn_candidate ADD COLUMN photo_url TEXT;
--;;
ALTER TABLE cgn_candidate ADD COLUMN nation TEXT;
--;;

-- cgn_exam_room: 增加备案地树 + 联系人字段
ALTER TABLE cgn_exam_room ADD COLUMN province TEXT;
--;;
ALTER TABLE cgn_exam_room ADD COLUMN city TEXT;
--;;
ALTER TABLE cgn_exam_room ADD COLUMN district TEXT;
--;;
ALTER TABLE cgn_exam_room ADD COLUMN contact_person TEXT;
--;;

-- cgn_reg_org: 增加地区 + 地址字段
ALTER TABLE cgn_reg_org ADD COLUMN province TEXT;
--;;
ALTER TABLE cgn_reg_org ADD COLUMN city TEXT;
--;;
ALTER TABLE cgn_reg_org ADD COLUMN address TEXT;
--;;
ALTER TABLE cgn_reg_org ADD COLUMN org_type TEXT NOT NULL DEFAULT 'enterprise';
--;;

-- cgn_recog_plan: 增加计划类型、年度、批次、说明字段
ALTER TABLE cgn_recog_plan ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'regular';
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN year INTEGER;
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN batch_no TEXT;
--;;
ALTER TABLE cgn_recog_plan ADD COLUMN description TEXT;
--;;

-- ==================== 新建表 ====================

-- 认定计划项目 — 细化计划中的考试科目/项目编排
CREATE TABLE IF NOT EXISTS cgn_plan_item (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'theory',
  occupation TEXT,
  level TEXT,
  subject_id TEXT,
  sort_order INTEGER DEFAULT 0,
  total_score REAL DEFAULT 100,
  pass_score REAL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 考务人员分配 — 将考务人员分配到具体的考试场次/考场
CREATE TABLE IF NOT EXISTS cgn_exam_staff_assignment (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  exam_room_id TEXT,
  session_id TEXT,
  assignment_role TEXT NOT NULL DEFAULT 'invigilator',
  assignment_date TEXT,
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 试卷需求明细 — 按计划项目/场次指定所需试卷套数
CREATE TABLE IF NOT EXISTS cgn_paper_demand_item (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  plan_item_id TEXT,
  session_id TEXT,
  paper_rule_id TEXT,
  quantity INTEGER DEFAULT 1,
  paper_type TEXT NOT NULL DEFAULT 'A',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 成绩公示 — 管理各计划的成绩公示期间和状态
CREATE TABLE IF NOT EXISTS cgn_score_publicity (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  publicity_start TEXT,
  publicity_end TEXT,
  publicity_days INTEGER DEFAULT 7,
  candidate_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 证书批次 — 证书批量制作、上报、打印管理
CREATE TABLE IF NOT EXISTS cgn_cert_batch (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  batch_no TEXT NOT NULL,
  name TEXT NOT NULL,
  certificate_count INTEGER DEFAULT 0,
  issue_date TEXT,
  cert_type TEXT NOT NULL DEFAULT 'skill_level',
  report_status TEXT NOT NULL DEFAULT 'pending',
  print_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- ==================== 索引 ====================

CREATE INDEX IF NOT EXISTS idx_cgn_plan_item_plan_id ON cgn_plan_item(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_plan_item_org_id ON cgn_plan_item(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_exam_staff_assignment_plan ON cgn_exam_staff_assignment(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_exam_staff_assignment_staff ON cgn_exam_staff_assignment(staff_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_exam_staff_assignment_session ON cgn_exam_staff_assignment(session_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_demand_item_plan ON cgn_paper_demand_item(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_demand_item_session ON cgn_paper_demand_item(session_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_score_publicity_plan ON cgn_score_publicity(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_cert_batch_plan ON cgn_cert_batch(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_cert_batch_batch_no ON cgn_cert_batch(batch_no);
--;;
