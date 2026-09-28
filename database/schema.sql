-- Campus Complaint & Compliance Portal
-- Production Schema for MySQL / Aiven MySQL

-- =============================================
-- 1. DEPARTMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS `departments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. ADMINS (Staff & Handlers)
-- =============================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'COMPLAINT_HANDLER') NOT NULL,
  `department_id` BIGINT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_admin_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. STUDENTS
-- =============================================
CREATE TABLE IF NOT EXISTS `students` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(20) NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20),
  `department` VARCHAR(100),
  `year_of_study` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. COMPLAINTS
-- =============================================
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(20) NOT NULL UNIQUE,
  `student_id` BIGINT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM('ACADEMIC','INFRASTRUCTURE','HOSTEL','TRANSPORT','CANTEEN','IT','MAINTENANCE','SAFETY','OTHER') NOT NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `department_id` BIGINT,
  `assigned_handler_id` BIGINT,
  `status` ENUM('NEW','VALIDATING','ASSIGNED','IN_PROGRESS','RESOLVED','STUDENT_VERIFICATION','CLOSED','REJECTED','ESCALATED','REOPENED') NOT NULL DEFAULT 'NEW',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `due_date` TIMESTAMP NULL DEFAULT NULL,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  `closed_at` TIMESTAMP NULL DEFAULT NULL,
  `rejection_reason` TEXT,
  `resolution_note` TEXT,
  CONSTRAINT `fk_complaint_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  CONSTRAINT `fk_complaint_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaint_handler` FOREIGN KEY (`assigned_handler_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. ATTACHMENTS (EVIDENCE)
-- =============================================
CREATE TABLE IF NOT EXISTS `complaint_attachments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `storage_path` VARCHAR(500) NOT NULL,
  `uploaded_by` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attachment_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. STATUS HISTORY
-- =============================================
CREATE TABLE IF NOT EXISTS `complaint_status_history` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT NOT NULL,
  `status` ENUM('NEW','VALIDATING','ASSIGNED','IN_PROGRESS','RESOLVED','STUDENT_VERIFICATION','CLOSED','REJECTED','ESCALATED','REOPENED') NOT NULL,
  `actor_name` VARCHAR(100),
  `actor_role` VARCHAR(50),
  `note` TEXT,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_history_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. FEEDBACK
-- =============================================
CREATE TABLE IF NOT EXISTS `complaint_feedback` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT NOT NULL UNIQUE,
  `student_id` BIGINT NOT NULL,
  `rating` INT NOT NULL,
  `feedback_text` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_feedback_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. COMMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT NOT NULL,
  `admin_id` BIGINT NULL,
  `student_id` BIGINT NULL,
  `author_name` VARCHAR(100) NULL,
  `author_role` VARCHAR(50) NULL,
  `content` TEXT NOT NULL,
  `is_internal` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comment_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comment_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. ESCALATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS `escalations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT NOT NULL,
  `escalated_by_id` BIGINT NOT NULL,
  `reason` TEXT NOT NULL,
  `escalated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `previous_assignee_id` BIGINT,
  `new_assignee_id` BIGINT,
  `resolved` BOOLEAN DEFAULT FALSE,
  CONSTRAINT `fk_escalation_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_escalation_by` FOREIGN KEY (`escalated_by_id`) REFERENCES `admins`(`id`),
  CONSTRAINT `fk_escalation_prev` FOREIGN KEY (`previous_assignee_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_escalation_new` FOREIGN KEY (`new_assignee_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. ADMIN NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` BIGINT NOT NULL,
  `complaint_id` BIGINT,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ASSIGNMENT','SLA_WARNING','ESCALATION','RESOLUTION','STATUS_CHANGE','GENERAL') NOT NULL DEFAULT 'GENERAL',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notification_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. STUDENT NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS `student_notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT NOT NULL,
  `complaint_id` BIGINT,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_st_notification_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_st_notification_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. AUDIT LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` BIGINT,
  `complaint_id` BIGINT,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50),
  `old_value` TEXT,
  `new_value` TEXT,
  `description` TEXT,
  `ip_address` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
