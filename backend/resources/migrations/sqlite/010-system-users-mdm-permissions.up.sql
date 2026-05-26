CREATE TABLE IF NOT EXISTS mdm_person (
  id TEXT PRIMARY KEY,
  employee_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  org_id TEXT,
  org_name TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--;;

CREATE TABLE IF NOT EXISTS app_user_permission (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module TEXT NOT NULL,
  permission_type TEXT NOT NULL DEFAULT 'view',
  status TEXT NOT NULL DEFAULT 'granted',
  granted_by TEXT,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module)
);
--;;

CREATE INDEX IF NOT EXISTS idx_mdm_person_org ON mdm_person(org_id);
--;;
CREATE INDEX IF NOT EXISTS idx_app_user_permission_user ON app_user_permission(user_id);
--;;
