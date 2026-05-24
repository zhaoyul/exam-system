-- ============================================================
-- 005-paper-demand.up.sql
-- 职业技能等级认定信息化管理系统 — 试卷需求管理
-- ============================================================

-- cgn_paper_demand_item: 新增工种、组卷方式、推送字段
ALTER TABLE cgn_paper_demand_item ADD COLUMN occupation TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN level TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN assembly_method TEXT NOT NULL DEFAULT 'question_bank_random';
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN push_status TEXT NOT NULL DEFAULT 'pending';
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN push_time TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN assigned_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN returned_count INTEGER DEFAULT 0;
--;;

-- 试卷推送结果表 — 记录每张试卷的回推结果
CREATE TABLE IF NOT EXISTS cgn_paper_push_result (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  demand_item_id TEXT,
  candidate_id TEXT,
  candidate_name TEXT,
  occupation TEXT,
  level TEXT,
  paper_id TEXT,
  paper_score REAL,
  assembly_method TEXT,
  push_status TEXT NOT NULL DEFAULT 'pending',
  push_time TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 索引
CREATE INDEX IF NOT EXISTS idx_cgn_paper_demand_occupation ON cgn_paper_demand_item(occupation);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_demand_assembly ON cgn_paper_demand_item(assembly_method);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_demand_push ON cgn_paper_demand_item(push_status);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_push_plan ON cgn_paper_push_result(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_push_demand ON cgn_paper_push_result(demand_item_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_push_candidate ON cgn_paper_push_result(candidate_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_paper_push_org ON cgn_paper_push_result(org_id);
--;;
