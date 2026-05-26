CREATE TABLE IF NOT EXISTS cgn_exam_reg_batch (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  reg_org_id TEXT,
  name TEXT NOT NULL,
  profession TEXT,
  level TEXT,
  candidate_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  import_mode TEXT DEFAULT '',
  photo_status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;
ALTER TABLE cgn_candidate ADD COLUMN email TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN ethnicity TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN political_status TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN graduation_school TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN major TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN graduation_date TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN work_unit TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN department TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN position TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN work_years INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_candidate ADD COLUMN profession TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN exam_type TEXT DEFAULT 'normal';
--;;
ALTER TABLE cgn_candidate ADD COLUMN condition_no TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN photo_status TEXT DEFAULT 'pending';
--;;
ALTER TABLE cgn_candidate ADD COLUMN batch_id TEXT DEFAULT '';
--;;
ALTER TABLE cgn_candidate ADD COLUMN candidate_type TEXT DEFAULT 'batch';
--;;
ALTER TABLE cgn_candidate_reg ADD COLUMN photo_uploaded INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_candidate_reg ADD COLUMN materials_complete INTEGER DEFAULT 0;
--;;
ALTER TABLE cgn_candidate_reg ADD COLUMN batch_id TEXT DEFAULT '';
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_candidate_reg_batch_id ON cgn_candidate_reg(batch_id);
--;;
