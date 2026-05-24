-- ============================================================
-- 005-certificates.up.sql (DM)
-- 证书管理 — 扩展 cgn_certificate 表 + 索引
-- ============================================================

-- cgn_certificate: 增加批次关联、等级编码、机构字段
ALTER TABLE cgn_certificate ADD COLUMN batch_id TEXT;
--;;
ALTER TABLE cgn_certificate ADD COLUMN level_code TEXT;
--;;

-- 创建批次关联索引
CREATE INDEX IF NOT EXISTS idx_cgn_certificate_batch_id ON cgn_certificate(batch_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_certificate_level_code ON cgn_certificate(level_code);
--;;
