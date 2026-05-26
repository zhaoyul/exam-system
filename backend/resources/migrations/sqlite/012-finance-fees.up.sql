CREATE TABLE IF NOT EXISTS cgn_fee_standard (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  profession_code TEXT NOT NULL DEFAULT '',
  profession_name TEXT NOT NULL,
  level1 REAL DEFAULT 0,
  level2 REAL DEFAULT 0,
  level3 REAL DEFAULT 0,
  level4 REAL DEFAULT 0,
  level5 REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cgn_fee_standard_profession ON cgn_fee_standard(profession_name);
--;;
CREATE TABLE IF NOT EXISTS cgn_fee_charge (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  batch_no TEXT DEFAULT '',
  amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  pay_date TEXT DEFAULT '',
  pay_method TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cgn_fee_charge_plan_candidate ON cgn_fee_charge(plan_id, candidate_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_fee_charge_status ON cgn_fee_charge(status);
