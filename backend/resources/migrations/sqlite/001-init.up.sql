CREATE TABLE IF NOT EXISTS app_user (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  org_id TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS organization (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  org_type TEXT NOT NULL,
  name TEXT NOT NULL,
  credit_code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  mobile TEXT,
  address TEXT,
  duty TEXT,
  email TEXT,
  fax TEXT,
  postcode TEXT,
  login_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS resource_item (
  id TEXT PRIMARY KEY,
  resource TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  org_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE INDEX IF NOT EXISTS idx_resource_item_resource ON resource_item(resource);
--;;
CREATE INDEX IF NOT EXISTS idx_resource_item_resource_status ON resource_item(resource, status);
--;;
CREATE INDEX IF NOT EXISTS idx_resource_item_resource_org ON resource_item(resource, org_id);
--;;

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource, resource_id);
--;;
