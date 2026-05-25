-- ============================================================
-- 006-v3.0-core.up.sql
-- v3.0 机构备案、标准题库、成绩留痕字段补充
-- ============================================================

ALTER TABLE cgn_filing_application ADD org_type VARCHAR(120);
--;;
ALTER TABLE cgn_filing_application ADD filing_place VARCHAR(120);
--;;
ALTER TABLE cgn_filing_application ADD filing_mode VARCHAR(120);
--;;
ALTER TABLE cgn_filing_application ADD site_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD project_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD staff_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD supervisor_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD assessor_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD exam_room_count INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_filing_application ADD reject_reason VARCHAR(1000);
--;;

CREATE INDEX idx_cgn_filing_application_type_status
  ON cgn_filing_application(filing_type, status);
--;;
