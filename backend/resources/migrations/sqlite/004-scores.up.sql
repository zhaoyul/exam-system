-- ============================================================
-- 004-scores.up.sql
-- 职业技能等级认定信息化管理系统 — 成绩管理
-- ============================================================

-- 考生成绩表
CREATE TABLE IF NOT EXISTS cgn_score (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  candidate_name TEXT,
  theory_score REAL,
  skill_score REAL,
  total_score REAL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

-- 索引
CREATE INDEX IF NOT EXISTS idx_cgn_score_plan_id ON cgn_score(plan_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_score_candidate_id ON cgn_score(candidate_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_score_org_id ON cgn_score(org_id);
--;;
