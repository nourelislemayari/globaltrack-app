CREATE DATABASE IF NOT EXISTS globaltrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE globaltrack;

CREATE TABLE IF NOT EXISTS USERS (
  user_id       INT             NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SHIPMENTS (
  shipment_id       INT             NOT NULL AUTO_INCREMENT,
  tracking_code     VARCHAR(20)     NOT NULL,
  sender_name       VARCHAR(200)    NOT NULL,
  receiver_name     VARCHAR(200)    NOT NULL,
  origin            VARCHAR(300)    NOT NULL,
  destination       VARCHAR(300)    NOT NULL,
  current_status    ENUM(
    'Registered',
    'In Transit',
    'Customs Inspection',
    'Customs Cleared',
    'Out for Delivery',
    'Delivered',
    'Exception',
    'Returned'
  ) NOT NULL DEFAULT 'Registered',
  estimated_delivery DATE            NOT NULL,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (shipment_id),
  UNIQUE KEY uq_shipments_tracking (tracking_code),
  KEY idx_shipments_status (current_status),
  KEY idx_shipments_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CHECKPOINTS (
  checkpoint_id   INT             NOT NULL AUTO_INCREMENT,
  shipment_id     INT             NOT NULL,
  location        VARCHAR(300)    NOT NULL,
  status_note     VARCHAR(500)    NOT NULL,
  checkpoint_time TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (checkpoint_id),
  KEY idx_checkpoints_shipment_time (shipment_id, checkpoint_time),
  CONSTRAINT fk_checkpoints_shipment
    FOREIGN KEY (shipment_id)
    REFERENCES SHIPMENTS (shipment_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
