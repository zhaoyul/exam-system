-- ============================================================
-- 007-paper-demand-v3-fields.up.sql
-- v3.0 试卷需求按截图补充名称、考试类型、非题库编号、附件和备注
-- ============================================================

ALTER TABLE cgn_paper_demand_item ADD name VARCHAR(256);
--;;
ALTER TABLE cgn_paper_demand_item ADD exam_type VARCHAR(120);
--;;
ALTER TABLE cgn_paper_demand_item ADD remark VARCHAR(1000);
--;;
ALTER TABLE cgn_paper_demand_item ADD paper_no VARCHAR(120);
--;;
ALTER TABLE cgn_paper_demand_item ADD attachment_name VARCHAR(256);
--;;
