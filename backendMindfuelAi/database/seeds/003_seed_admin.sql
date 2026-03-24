-- This should be run manually with a secure password
-- Example admin user (DO NOT use this in production)
/*
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) 
VALUES (
  'admin@mindfuel.ai',
  -- This is 'Admin123!' hashed with bcrypt
  '$2b$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'super_admin',
  true
);
*/
