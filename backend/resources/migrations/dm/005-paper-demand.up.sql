-- ============================================================
-- 005-paper-demand.up.sql (达梦数据库版)
-- 职业技能等级认定信息化管理系统 — 试卷需求管理
-- ============================================================

-- cgn_paper_demand_item: 新增工种、组卷方式、推送字段
ALTER TABLE cgn_paper_demand_item ADD COLUMN occupation VARCHAR(256);
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN level VARCHAR(64);
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN assembly_method VARCHAR(64) DEFAULT 'question_bank_random' NOT NULL;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN push_status VARCHAR(32) DEFAULT 'pending' NOT NULL;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN push_time TIMESTAMP;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN assigned_count INT DEFAULT 0;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN returned_count INT DEFAULT 0;
--;;

-- 试卷推送结果表 — 记录每张试卷的回推结果
CREATE TABLE cgn_paper_push_result (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(64) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  demand_item_id VARCHAR(64),
  candidate_id VARCHAR(64),
  candidate_name VARCHAR(128),
  occupation VARCHAR(256),
  level VARCHAR(64),
  paper_id VARCHAR(64),
  paper_score DECIMAL(5,1),
  assembly_method VARCHAR(64),
  push_status VARCHAR(32) DEFAULT 'pending' NOT NULL,
  push_time TIMESTAMP,
  error_message VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

-- 索引
CREATE INDEX idx_cgn_paper_demand_occupation ON cgn_paper_demand_item(occupation);
--;;
CREATE INDEX idx_cgn_paper_demand_assembly ON cgn_paper_demand_item(assembly_method);
--;;
CREATE INDEX idx_cgn_paper_demand_push ON cgn_paper_demand_item(push_status);
--;;
CREATE INDEX idx_cgn_paper_push_plan ON cgn_paper_push_result(plan_id);
--;;
CREATE INDEX idx_cgn_paper_push_demand ON cgn_paper_push_result(demand_item_id);
--;;
CREATE INDEX idx_cgn_paper_push_candidate ON cgn_paper_push_result(candidate_id);
--;;
CREATE INDEX idx_cgn_paper_push_org ON cgn_paper_push_result(org_id);
--;;
