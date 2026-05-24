-- ============================================================
-- 004-numbering.up.sql
-- 编号/证书号生成服务 — 全局唯一序列号管理
-- ============================================================

CREATE TABLE IF NOT EXISTS cgn_sequence (
  seq_key TEXT PRIMARY KEY,
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
