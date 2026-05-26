CREATE TABLE IF NOT EXISTS cgn_fee_standard (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '',
  profession_code VARCHAR(64) DEFAULT '',
  profession_name VARCHAR(255) NOT NULL,
  level1 DECIMAL(12,2) DEFAULT 0,
  level2 DECIMAL(12,2) DEFAULT 0,
  level3 DECIMAL(12,2) DEFAULT 0,
  level4 DECIMAL(12,2) DEFAULT 0,
  level5 DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cgn_fee_standard_profession ON cgn_fee_standard(profession_name);
--;;
CREATE TABLE IF NOT EXISTS cgn_fee_charge (
  id VARCHAR(64) PRIMARY KEY,
  org_id VARCHAR(64) DEFAULT '',
  plan_id VARCHAR(64) NOT NULL,
  candidate_id VARCHAR(64) NOT NULL,
  batch_no VARCHAR(64) DEFAULT '',
  amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'unpaid',
  pay_date VARCHAR(32) DEFAULT '',
  pay_method VARCHAR(64) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cgn_fee_charge_plan_candidate ON cgn_fee_charge(plan_id, candidate_id);
--;;
CREATE INDEX IF NOT EXISTS idx_cgn_fee_charge_status ON cgn_fee_charge(status);
