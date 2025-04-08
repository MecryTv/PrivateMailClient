CREATE TABLE IF NOT EXISTS email_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NOT NULL UNIQUE,
  user_id INT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_address (address),
  INDEX idx_user_id (user_id)
);