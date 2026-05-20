CREATE TABLE app_user (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(256) NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL,
  org_id VARCHAR(64),
  phone VARCHAR(64),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE organization (
  id VARCHAR(64) PRIMARY KEY,
  parent_id VARCHAR(64),
  org_type VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  credit_code VARCHAR(64),
  contact_name VARCHAR(128),
  contact_phone VARCHAR(64),
  mobile VARCHAR(64),
  address VARCHAR(512),
  duty VARCHAR(128),
  email VARCHAR(128),
  fax VARCHAR(64),
  postcode VARCHAR(32),
  login_name VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE TABLE resource_item (
  id VARCHAR(64) PRIMARY KEY,
  resource VARCHAR(128) NOT NULL,
  code VARCHAR(128),
  name VARCHAR(256) NOT NULL,
  status VARCHAR(32) DEFAULT 'active' NOT NULL,
  org_id VARCHAR(64),
  payload CLOB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE INDEX idx_resource_item_resource ON resource_item(resource);
--;;
CREATE INDEX idx_resource_item_resource_status ON resource_item(resource, status);
--;;
CREATE INDEX idx_resource_item_resource_org ON resource_item(resource, org_id);
--;;

CREATE TABLE audit_log (
  id VARCHAR(64) PRIMARY KEY,
  actor_id VARCHAR(64),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(128) NOT NULL,
  resource_id VARCHAR(64),
  payload CLOB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--;;

CREATE INDEX idx_audit_log_resource ON audit_log(resource, resource_id);
--;;
