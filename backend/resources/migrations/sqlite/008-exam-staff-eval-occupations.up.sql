-- ============================================================
-- 008-exam-staff-eval-occupations.up.sql
-- v3.0 考评员按职业筛选
-- ============================================================

ALTER TABLE cgn_exam_staff ADD COLUMN eval_occupations TEXT;
--;;

UPDATE cgn_exam_staff
SET eval_occupations = '核反应堆运行值班员,核安全工程师'
WHERE id = 'exam-staff-003' AND (eval_occupations IS NULL OR eval_occupations = '');
--;;

UPDATE cgn_exam_staff
SET eval_occupations = '电气试验员,机械设备检修工'
WHERE id = 'exam-staff-005' AND (eval_occupations IS NULL OR eval_occupations = '');
--;;
