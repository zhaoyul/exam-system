-- ============================================================
-- 007-paper-demand-v3-fields.up.sql
-- v3.0 试卷需求按截图补充名称、考试类型、非题库编号、附件和备注
-- ============================================================

ALTER TABLE cgn_paper_demand_item ADD COLUMN name TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN exam_type TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN remark TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN paper_no TEXT;
--;;
ALTER TABLE cgn_paper_demand_item ADD COLUMN attachment_name TEXT;
--;;
