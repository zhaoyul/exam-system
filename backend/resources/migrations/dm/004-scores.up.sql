-- ============================================================
-- 004-scores.up.sql (达梦 DM)
-- 职业技能等级认定信息化管理系统 — 成绩管理
-- ============================================================

-- 考生成绩表
CREATE TABLE cgn_score (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '' NOT NULL,
  code VARCHAR(128) DEFAULT '' NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  candidate_id VARCHAR(64) NOT NULL,
  candidate_name VARCHAR(256),
  theory_score DOUBLE,
  skill_score DOUBLE,
  total_score DOUBLE,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE INDEX idx_cgn_score_plan_id ON cgn_score(plan_id);
--;;
CREATE INDEX idx_cgn_score_candidate_id ON cgn_score(candidate_id);
--;;
CREATE INDEX idx_cgn_score_org_id ON cgn_score(org_id);
--;;
