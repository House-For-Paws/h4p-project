-- =============================================================================
-- FILE: server/sql/schema.sql
-- ROLE: MySQL tables for House For Paws (applied on server boot)
-- =============================================================================
-- Tables: users | content_reports | pets | pet_likes | pet_favorites
--         pet_comments | posts | comments | auth_otps
--         adoption_applications | notifications
-- =============================================================================

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(40) DEFAULT '',
  birthday VARCHAR(40) DEFAULT '',
  firstName VARCHAR(80) DEFAULT '',
  lastName VARCHAR(80) DEFAULT '',
  gender VARCHAR(40) DEFAULT '',
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_username_unique (username),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS notify_new_pets TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS notify_application_updates TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS isBanned TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS banReason VARCHAR(120) NULL,
ADD COLUMN IF NOT EXISTS banDescription TEXT NULL,
ADD COLUMN IF NOT EXISTS bannedAt DATETIME NULL,
ADD COLUMN IF NOT EXISTS warningCount INT UNSIGNED NOT NULL DEFAULT 0;

-- ======================== CONTENT REPORTS ========================
CREATE TABLE IF NOT EXISTS content_reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reporterId INT UNSIGNED NOT NULL,
  targetType VARCHAR(20) NOT NULL,
  targetId INT UNSIGNED NOT NULL,
  reason VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  reviewedBy INT UNSIGNED NULL,
  reviewedAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY content_reports_status_index (status),
  KEY content_reports_target_index (targetType, targetId),
  KEY content_reports_reporterId_index (reporterId),
  CONSTRAINT content_reports_reporterId_fk FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT content_reports_reviewedBy_fk FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== PETS (adoption listings) ========================
CREATE TABLE IF NOT EXISTS pets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  age VARCHAR(60) NOT NULL,
  location VARCHAR(120) NOT NULL,
  type VARCHAR(40) NOT NULL,
  image LONGTEXT,
  images LONGTEXT NULL,
  gender VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'available',
  ownerId INT UNSIGNED NULL,
  createdAt DATETIME NULL,
  PRIMARY KEY (id),
  KEY pets_ownerId_index (ownerId),
  CONSTRAINT pets_ownerId_fk FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE pets
ADD COLUMN IF NOT EXISTS images LONGTEXT NULL;

ALTER TABLE pets
MODIFY COLUMN image LONGTEXT NULL;

ALTER TABLE pets
MODIFY COLUMN images LONGTEXT NULL;

ALTER TABLE pets
ADD COLUMN IF NOT EXISTS viewCount INT UNSIGNED NOT NULL DEFAULT 0;

-- ======================== PET LIKES ========================
CREATE TABLE IF NOT EXISTS pet_likes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  petId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY pet_likes_pet_user_unique (petId, userId),
  KEY pet_likes_petId_index (petId),
  KEY pet_likes_userId_index (userId),
  CONSTRAINT pet_likes_petId_fk FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_likes_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== PET FAVORITES ========================
CREATE TABLE IF NOT EXISTS pet_favorites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  petId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY pet_favorites_pet_user_unique (petId, userId),
  KEY pet_favorites_petId_index (petId),
  KEY pet_favorites_userId_index (userId),
  CONSTRAINT pet_favorites_petId_fk FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_favorites_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== PET COMMENTS ========================
CREATE TABLE IF NOT EXISTS pet_comments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  petId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY pet_comments_petId_index (petId),
  KEY pet_comments_userId_index (userId),
  CONSTRAINT pet_comments_petId_fk FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT pet_comments_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== LEGACY FORUM POSTS ========================
CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  userId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY posts_userId_index (userId),
  CONSTRAINT posts_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  postId INT UNSIGNED NOT NULL,
  userId INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY comments_postId_index (postId),
  KEY comments_userId_index (userId),
  CONSTRAINT comments_postId_fk FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== AUTH OTPS (reserved) ========================
CREATE TABLE IF NOT EXISTS auth_otps (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(160) NOT NULL,
  userId INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  code VARCHAR(12) NOT NULL,
  expiresAt DATETIME NOT NULL,
  usedAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY auth_otps_email_action_index (email, action),
  KEY auth_otps_userId_index (userId),
  CONSTRAINT auth_otps_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== ADOPTION APPLICATIONS ========================
CREATE TABLE IF NOT EXISTS adoption_applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  petId INT UNSIGNED NOT NULL,
  ownerId INT UNSIGNED NOT NULL,
  applicantId INT UNSIGNED NOT NULL,
  fullName VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) DEFAULT '',
  message TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY adoption_applications_petId_index (petId),
  KEY adoption_applications_ownerId_index (ownerId),
  KEY adoption_applications_applicantId_index (applicantId),
  CONSTRAINT adoption_applications_petId_fk FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT adoption_applications_ownerId_fk FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT adoption_applications_applicantId_fk FOREIGN KEY (applicantId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== NOTIFICATIONS ========================
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId INT UNSIGNED NOT NULL,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  relatedPetId INT UNSIGNED NULL,
  relatedApplicationId INT UNSIGNED NULL,
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY notifications_userId_index (userId),
  KEY notifications_isRead_index (isRead),
  CONSTRAINT notifications_userId_fk FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_relatedPetId_fk FOREIGN KEY (relatedPetId) REFERENCES pets(id) ON DELETE SET NULL,
  CONSTRAINT notifications_relatedApplicationId_fk FOREIGN KEY (relatedApplicationId) REFERENCES adoption_applications(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
