CREATE TABLE mdm_person (
  id VARCHAR(64) PRIMARY KEY,
  employee_no VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(64),
  org_id VARCHAR(64),
  org_name VARCHAR(256),
  position VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE app_user_permission (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  module VARCHAR(128) NOT NULL,
  permission_type VARCHAR(32) DEFAULT 'view' NOT NULL,
  status VARCHAR(32) DEFAULT 'granted' NOT NULL,
  granted_by VARCHAR(128),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, module)
);
--;;

CREATE INDEX idx_mdm_person_org ON mdm_person(org_id);
--;;
CREATE INDEX idx_app_user_permission_user ON app_user_permission(user_id);
--;;
