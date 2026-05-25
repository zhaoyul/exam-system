-- ============================================================
-- 006-v3.0-core.up.sql
-- v3.0 机构备案、标准题库、成绩留痕字段补充
-- ============================================================

ALTER TABLE cgn_filing_application ADD COLUMN org_type TEXT;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN filing_place TEXT;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN filing_mode TEXT;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN site_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN project_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN staff_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN supervisor_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN assessor_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN exam_room_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD COLUMN reject_reason TEXT;
--;;

CREATE INDEX IF NOT EXISTS idx_cgn_filing_application_type_status
  ON cgn_filing_application(filing_type, status);
--;;
