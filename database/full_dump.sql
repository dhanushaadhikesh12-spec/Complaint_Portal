
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4bcdcbd4-b5a2-11f1-8803-727c16f89a1d:1-268';

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `campus_complaint_portal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `campus_complaint_portal`;
DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','DEPARTMENT_ADMIN','COMPLAINT_HANDLER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_admin_department` (`department_id`),
  CONSTRAINT `fk_admin_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'superadmin','superadmin@campus.local','$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm','Super Administrator','SUPER_ADMIN',NULL,1,'2026-09-26 06:51:27','2026-09-28 01:21:54'),(2,'deptadmin','deptadmin@campus.edu','$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm','Department Admin','DEPARTMENT_ADMIN',2,1,'2026-09-26 06:51:27','2026-09-28 01:21:54'),(3,'handler1','handler1@campus.local','$2b$10$ctMTp/K/.RJH0cMbcD2gkuVy6ZWh70UmrUBBbXfg1jeQrioS.TfiG','John Handler','COMPLAINT_HANDLER',2,1,'2026-09-26 06:51:27','2026-09-28 01:21:54'),(7,'handler2','handler2@campus.local','$2b$10$ctMTp/K/.RJH0cMbcD2gkuVy6ZWh70UmrUBBbXfg1jeQrioS.TfiG','Ms. Kavya Reddy','COMPLAINT_HANDLER',3,1,'2026-09-26 01:36:08','2026-09-28 01:21:54'),(8,'handler3','handler3@campus.edu','$2b$10$ctMTp/K/.RJH0cMbcD2gkuVy6ZWh70UmrUBBbXfg1jeQrioS.TfiG','Mr. Vikram Nair','COMPLAINT_HANDLER',5,1,'2026-09-26 01:36:08','2026-09-28 01:21:54'),(9,'handler4','handler4@campus.edu','$2b$10$ctMTp/K/.RJH0cMbcD2gkuVy6ZWh70UmrUBBbXfg1jeQrioS.TfiG','Ms. Ananya Iyer','COMPLAINT_HANDLER',1,1,'2026-09-26 01:36:08','2026-09-28 01:21:54'),(10,'itadmin','itadmin@campus.local','$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm','IT Administrator','DEPARTMENT_ADMIN',2,1,'2026-09-26 07:29:42','2026-09-28 01:21:54'),(11,'hosteladmin','hosteladmin@campus.local','$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm','Hostel Administrator','DEPARTMENT_ADMIN',3,1,'2026-09-26 07:29:42','2026-09-28 01:21:54');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint DEFAULT NULL,
  `complaint_id` bigint DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_admin` (`admin_id`),
  KEY `idx_audit_logs_complaint` (`complaint_id`),
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:31:46'),(2,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:32:12'),(3,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:32:25'),(4,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:36:18'),(5,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:37:28'),(6,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:41:19'),(7,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:42:43'),(8,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:46:26'),(9,8,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler3',NULL,'2026-09-26 01:51:56'),(10,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:54:06'),(11,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 01:59:15'),(12,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-26 02:00:38'),(13,3,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler1',NULL,'2026-09-26 02:00:44'),(14,11,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: hosteladmin',NULL,'2026-09-26 02:00:53'),(15,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 02:05:30'),(16,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 02:09:35'),(17,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 02:18:21'),(18,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-26 04:09:38'),(19,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:04:20'),(20,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:05:33'),(21,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:05:44'),(22,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:06:23'),(23,1,26,'COMPLAINT_CREATED','COMPLAINT',NULL,'CMP-0026','Complaint created: Test from API',NULL,'2026-09-27 19:06:24'),(24,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:09:22'),(25,1,26,'STATUS_CHANGED','COMPLAINT','NEW','REJECTED','Status changed: NEW → REJECTED',NULL,'2026-09-27 19:12:16'),(26,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-27 19:13:08'),(27,11,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: hosteladmin',NULL,'2026-09-27 19:23:18'),(28,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:51:43'),(29,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-27 19:51:44'),(30,2,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: deptadmin',NULL,'2026-09-27 19:51:44'),(31,11,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: hosteladmin',NULL,'2026-09-27 19:51:45'),(32,8,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler3',NULL,'2026-09-27 19:51:46'),(33,9,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler4',NULL,'2026-09-27 19:51:46'),(34,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:52:37'),(35,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-27 19:52:37'),(36,2,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: deptadmin',NULL,'2026-09-27 19:52:37'),(37,11,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: hosteladmin',NULL,'2026-09-27 19:52:37'),(38,3,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler1',NULL,'2026-09-27 19:52:37'),(39,7,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler2',NULL,'2026-09-27 19:52:37'),(40,8,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler3',NULL,'2026-09-27 19:52:37'),(41,9,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler4',NULL,'2026-09-27 19:52:37'),(42,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:53:06'),(43,3,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler1',NULL,'2026-09-27 19:53:06'),(44,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:56:04'),(45,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-27 19:56:05'),(46,3,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler1',NULL,'2026-09-27 19:56:05'),(47,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 19:56:16'),(48,1,29,'COMPLAINT_ASSIGNED','COMPLAINT','Unassigned','John Handler','Assigned to: John Handler',NULL,'2026-09-27 20:09:56'),(49,1,29,'STATUS_CHANGED','COMPLAINT','ASSIGNED','IN_PROGRESS','Status changed: ASSIGNED → IN_PROGRESS',NULL,'2026-09-27 20:10:22'),(50,1,29,'STATUS_CHANGED','COMPLAINT','IN_PROGRESS','RESOLVED','Status changed: IN_PROGRESS → RESOLVED',NULL,'2026-09-27 20:10:34'),(51,1,28,'STATUS_CHANGED','COMPLAINT','NEW','VALIDATING','Status changed: NEW → VALIDATING',NULL,'2026-09-27 22:06:47'),(52,1,28,'STATUS_CHANGED','COMPLAINT','VALIDATING','REJECTED','Status changed: VALIDATING → REJECTED',NULL,'2026-09-27 22:06:56'),(53,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:17:23'),(54,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:18:03'),(55,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:23:04'),(56,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:24:15'),(57,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:24:21'),(58,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:26:37'),(59,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:26:47'),(60,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:26:58'),(61,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:27:12'),(62,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:27:21'),(63,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-27 22:36:02'),(64,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:10:13'),(65,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-28 00:10:13'),(66,3,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: handler1',NULL,'2026-09-28 00:10:13'),(67,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:11:08'),(68,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:11:40'),(69,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:12:00'),(70,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:15:08'),(71,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:21:08'),(72,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:23:59'),(73,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:26:27'),(74,10,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: itadmin',NULL,'2026-09-28 00:28:35'),(75,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:28:42'),(76,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:29:26'),(77,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:30:39'),(78,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:33:47'),(79,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:33:55'),(80,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:37:42'),(81,1,NULL,'LOGIN','SYSTEM',NULL,NULL,'Admin logged in: superadmin',NULL,'2026-09-28 00:43:11'),(82,1,39,'STATUS_CHANGED','COMPLAINT','NEW','REJECTED','Status changed: NEW → REJECTED',NULL,'2026-09-28 00:43:51');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `admin_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_internal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `student_id` bigint DEFAULT NULL,
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comment_complaint` (`complaint_id`),
  KEY `fk_comment_admin` (`admin_id`),
  CONSTRAINT `fk_comment_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_comment_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,28,NULL,'Please look into this before the 2 PM presentation.',0,'2026-09-27 19:48:17',1,'Alice Johnson','STUDENT');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `complaint_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `storage_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `complaint_id` (`complaint_id`),
  CONSTRAINT `complaint_attachments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `complaint_attachments` WRITE;
/*!40000 ALTER TABLE `complaint_attachments` DISABLE KEYS */;
INSERT INTO `complaint_attachments` VALUES (2,31,'broken_chair_photo.png','2d20e20f-ba71-4985-994c-9119eec5eae8.png','image/png',69,'uploads/attachments/2d20e20f-ba71-4985-994c-9119eec5eae8.png','Alice Johnson (STU001)','2026-09-27 22:18:03'),(3,32,'broken_urinal_flush_photo.png','2b750737-43eb-404f-89bb-900d5221965c.png','image/png',10893,'uploads/attachments/2b750737-43eb-404f-89bb-900d5221965c.png','Alice Johnson (STU001)','2026-09-27 22:26:38'),(4,8,'electrical_panel_hazard.png','11c894c5-821e-4591-b8eb-f14e37765d18.png','image/png',7247,'uploads/attachments/11c894c5-821e-4591-b8eb-f14e37765d18.png','Super Administrator (superadmin)','2026-09-27 22:26:38'),(5,30,'lab_chair_damage.png','d8c2f92d-5a6b-40d8-883d-00cf04c9bfed.png','image/png',6589,'uploads/attachments/d8c2f92d-5a6b-40d8-883d-00cf04c9bfed.png','Super Administrator (superadmin)','2026-09-27 22:26:38'),(6,6,'wifi_router_blinking_red.png','bd6f6504-3e66-470e-8233-9c2ef410899d.png','image/png',4495,'uploads/attachments/bd6f6504-3e66-470e-8233-9c2ef410899d.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(7,7,'water_pipe_leak_bathroom.png','032ef868-ddb8-4ad3-adf4-9d42ecddb9e7.png','image/png',4664,'uploads/attachments/032ef868-ddb8-4ad3-adf4-9d42ecddb9e7.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(8,8,'library_ac_unit_fault.png','e3d0cbc4-9bcd-4791-ae63-0304a0e749ca.png','image/png',4664,'uploads/attachments/e3d0cbc4-9bcd-4791-ae63-0304a0e749ca.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(9,9,'projector_lens_broken.png','af5380e0-8be1-4826-b3ce-39a9be9ebd67.png','image/png',4491,'uploads/attachments/af5380e0-8be1-4826-b3ce-39a9be9ebd67.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(10,10,'bus_delay_board.png','512bb584-682b-464e-af8d-1269649495df.png','image/png',4950,'uploads/attachments/512bb584-682b-464e-af8d-1269649495df.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(11,11,'canteen_meal_tray.png','42f5d981-698b-44a4-a3a2-a9787b004fb5.png','image/png',4495,'uploads/attachments/42f5d981-698b-44a4-a3a2-a9787b004fb5.png','Super Administrator (superadmin)','2026-09-27 22:26:48'),(12,33,'cracked_glass_evidence.png','f4aae38b-21f7-4c0a-bb74-d743376111e3.png','image/png',4191,'uploads/attachments/f4aae38b-21f7-4c0a-bb74-d743376111e3.png','Alice Johnson (STU001)','2026-09-27 22:27:21'),(13,37,'light_flicker_photo.png','b46f0287-c107-4e47-8adf-decc1b94640a.png','image/png',2790,'uploads/attachments/b46f0287-c107-4e47-8adf-decc1b94640a.png','Alice Johnson (STU001)','2026-09-27 22:36:02'),(14,38,'broken_light.jpeg','259d9d0c-aca8-482b-9dea-3733a91c9f16.jpeg','image/jpeg',33523,'uploads/attachments/259d9d0c-aca8-482b-9dea-3733a91c9f16.jpeg','Alice Johnson (STU001)','2026-09-27 22:37:26'),(15,39,'broken_light.jpeg','ef7dc564-1304-4f4c-ad3c-8f15324709af.jpeg','image/jpeg',33523,'uploads/attachments/ef7dc564-1304-4f4c-ad3c-8f15324709af.jpeg','Alice Johnson (STU001)','2026-09-28 00:30:33'),(16,40,'broken_light.jpeg','a8512779-6498-445d-8432-5332884b5389.jpeg','image/jpeg',33523,'uploads/attachments/a8512779-6498-445d-8432-5332884b5389.jpeg','Alice Johnson (STU001)','2026-09-28 00:37:18');
/*!40000 ALTER TABLE `complaint_attachments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `complaint_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_feedback` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `feedback_text` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_complaint_student` (`complaint_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `complaint_feedback_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `complaint_feedback_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `complaint_feedback` WRITE;
/*!40000 ALTER TABLE `complaint_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint_feedback` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `complaint_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `complaint_id` (`complaint_id`),
  CONSTRAINT `complaint_status_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `complaint_status_history` WRITE;
/*!40000 ALTER TABLE `complaint_status_history` DISABLE KEYS */;
INSERT INTO `complaint_status_history` VALUES (1,28,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 01:17:23'),(2,29,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 01:38:41'),(3,30,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 03:47:23'),(4,31,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 03:48:03'),(5,32,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 03:50:08'),(6,33,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 03:57:21'),(7,34,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 04:01:12'),(8,35,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 04:01:24'),(9,36,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 04:01:57'),(10,37,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 04:06:02'),(11,38,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 04:07:25'),(12,39,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 06:00:33'),(13,40,'NEW','Alice Johnson','STUDENT','Complaint submitted by student','2026-09-28 06:07:18');
/*!40000 ALTER TABLE `complaint_status_history` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('ACADEMIC','INFRASTRUCTURE','HOSTEL','TRANSPORT','CANTEEN','IT','MAINTENANCE','SAFETY','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `department_id` bigint DEFAULT NULL,
  `assigned_handler_id` bigint DEFAULT NULL,
  `status` enum('NEW','VALIDATING','ASSIGNED','IN_PROGRESS','RESOLVED','STUDENT_VERIFICATION','CLOSED','REJECTED','ESCALATED','REOPENED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `due_date` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `resolution_note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `complaint_id` (`complaint_id`),
  KEY `fk_complaint_student` (`student_id`),
  KEY `idx_complaints_status` (`status`),
  KEY `idx_complaints_category` (`category`),
  KEY `idx_complaints_priority` (`priority`),
  KEY `idx_complaints_department` (`department_id`),
  KEY `idx_complaints_handler` (`assigned_handler_id`),
  KEY `idx_complaints_created` (`created_at`),
  KEY `idx_complaints_due_date` (`due_date`),
  CONSTRAINT `fk_complaint_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaint_handler` FOREIGN KEY (`assigned_handler_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaint_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (6,'CMP-0001',1,'Campus WiFi not working in Block A','WiFi in Block A has been down for 3 days. Students cannot access online resources.','IT','HIGH',2,NULL,'NEW','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08',NULL,NULL,NULL,NULL),(7,'CMP-0002',2,'Broken water pipe in Hostel Room 204','There is a broken water pipe leaking water into room 204. Urgent repair needed.','HOSTEL','CRITICAL',3,NULL,'VALIDATING','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-26 05:36:08',NULL,NULL,NULL,NULL),(8,'CMP-0003',3,'Library AC not functioning','The air conditioning in the main library has stopped working. Very uncomfortable for students.','INFRASTRUCTURE','MEDIUM',5,8,'ASSIGNED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-29 01:36:08',NULL,NULL,NULL,NULL),(9,'CMP-0004',4,'Projector broken in Classroom 301','The projector in Room 301 is broken. Cannot conduct proper lectures.','IT','HIGH',2,3,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08',NULL,NULL,NULL,NULL),(10,'CMP-0005',5,'Bus route 5 not running on time','Bus route 5 is consistently 30-45 minutes late causing students to miss morning classes.','TRANSPORT','MEDIUM',NULL,NULL,'RESOLVED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-29 01:36:08','2026-09-24 01:36:08',NULL,NULL,'Bus schedule has been adjusted. New timing: 7:30 AM.'),(11,'CMP-0006',1,'Canteen food quality poor','The food served in the main canteen is often stale and unhygienic.','CANTEEN','LOW',7,NULL,'CLOSED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-10-03 01:36:08','2026-09-21 01:36:08','2026-09-23 01:36:08',NULL,'Canteen vendor has been warned and new hygiene standards implemented.'),(12,'CMP-0007',2,'Exam result not uploaded','Results for the mid-semester examination have not been uploaded on the portal for 2 weeks.','ACADEMIC','HIGH',1,9,'ESCALATED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08',NULL,NULL,NULL,NULL),(13,'CMP-0008',3,'Electrical hazard in Lab 5','There is a live exposed wire in Lab 5. Immediate action required to prevent accidents.','SAFETY','CRITICAL',6,8,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-25 17:36:08',NULL,NULL,NULL,NULL),(14,'CMP-0009',4,'Hostel common room lights not working','All lights in the hostel common room have been non-functional for 5 days.','HOSTEL','MEDIUM',3,7,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-24 01:36:08',NULL,NULL,NULL,NULL),(15,'CMP-0010',5,'Printer not working in Computer Lab','All 5 printers in Computer Lab 2 are non-functional. Students cannot print assignments.','IT','HIGH',2,3,'ASSIGNED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-26 04:36:08',NULL,NULL,NULL,NULL),(16,'CMP-0011',1,'Scholarship portal login failing','Cannot log into the scholarship portal to submit application before deadline.','IT','CRITICAL',2,3,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-26 05:36:08',NULL,NULL,NULL,NULL),(17,'CMP-0012',2,'Classroom 102 seating inadequate','Classroom 102 has 60 students but only 45 seats. Some students must stand.','INFRASTRUCTURE','HIGH',5,8,'ASSIGNED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08',NULL,NULL,NULL,NULL),(18,'CMP-0013',3,'Garbage not collected in Hostel Block C','Garbage bins in Hostel Block C haven\'t been collected for 4 days.','MAINTENANCE','MEDIUM',5,NULL,'NEW','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-29 01:36:08',NULL,NULL,NULL,NULL),(19,'CMP-0014',4,'Attendance marked incorrect','My attendance for CS-301 on Sept 15 shows absent but I was present.','ACADEMIC','MEDIUM',1,9,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-29 01:36:08',NULL,NULL,NULL,NULL),(20,'CMP-0015',5,'Gym equipment broken','Multiple gym equipment items are broken and poses risk of injury.','INFRASTRUCTURE','HIGH',5,8,'STUDENT_VERIFICATION','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08','2026-09-25 01:36:08',NULL,NULL,'All broken equipment has been replaced and serviced.'),(21,'CMP-0016',1,'Campus network blocked gaming sites','The campus network is blocking educational gaming sites used for programming practice.','IT','LOW',2,NULL,'REJECTED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-10-03 01:36:08',NULL,NULL,'Gaming sites are blocked as per campus IT policy. This is not a complaint matter.',NULL),(22,'CMP-0017',2,'Hostel water supply cut at night','Water supply in Hostel Block B is being cut at 11 PM. Students need water late at night too.','HOSTEL','HIGH',3,7,'RESOLVED','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08','2026-09-25 01:36:08',NULL,NULL,'Water supply has been extended to 24 hours per day.'),(23,'CMP-0018',3,'Canteen closed during exam hours','Main canteen closes at 3 PM but exams often run until 5 PM. Students have no food.','CANTEEN','MEDIUM',7,NULL,'VALIDATING','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-29 01:36:08',NULL,NULL,NULL,NULL),(24,'CMP-0019',4,'Stray dogs on campus','Multiple stray dogs on campus are aggressive and causing fear among students.','SAFETY','HIGH',6,NULL,'NEW','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-27 01:36:08',NULL,NULL,NULL,NULL),(25,'CMP-0020',5,'Chemistry lab chemicals expired','Several chemicals in Chem Lab 3 are past their expiry date. Safety concern.','SAFETY','CRITICAL',6,8,'IN_PROGRESS','2026-09-26 01:36:08','2026-09-26 01:36:08','2026-09-26 05:36:08',NULL,NULL,NULL,NULL),(26,'CMP-0026',1,'Test from API','Testing complaint creation end-to-end','IT','MEDIUM',2,NULL,'REJECTED','2026-09-27 19:06:24','2026-09-27 19:12:16','2026-09-30 19:06:24',NULL,NULL,'',NULL),(27,'CMP-0027',1,'Air Conditioner Leaking Water in Lab 304','The AC unit above workstation 12 has been dripping water continuously since morning, creating a safety hazard.','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 19:46:38','2026-09-27 19:46:38','2026-09-28 19:46:38',NULL,NULL,NULL,NULL),(28,'CMP-0028',1,'Projector not working in Seminar Hall B','The HDMI and VGA display connections fail to project any video input.','INFRASTRUCTURE','HIGH',5,NULL,'REJECTED','2026-09-27 19:47:23','2026-09-27 22:06:56','2026-09-28 19:47:23',NULL,NULL,'',NULL),(29,'CMP-0029',1,'Water pipe broken in C block 3rd floor boys restroom','Water pipe broken in C block 3rd floor boys restroom due to a fight','INFRASTRUCTURE','MEDIUM',5,3,'RESOLVED','2026-09-27 20:08:41','2026-09-27 20:10:34','2026-09-30 20:08:41','2026-09-27 20:10:34',NULL,NULL,''),(30,'CMP-0030',1,'Broken Lab Chair with Nails Exposed','Chair #4 in Physics Lab 201 has exposed sharp nails causing injury hazard.','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:17:23','2026-09-27 22:17:23','2026-09-28 22:17:23',NULL,NULL,NULL,NULL),(31,'CMP-0031',1,'Broken Lab Chair with Nails Exposed','Chair #4 in Physics Lab 201 has exposed sharp nails causing injury hazard.','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:18:03','2026-09-27 22:18:03','2026-09-28 22:18:03',NULL,NULL,NULL,NULL),(32,'CMP-0032',1,'Urinal broken in C block 3rd floor boys restroom','Urinal broken in C block 3rd floor boys restroom','INFRASTRUCTURE','MEDIUM',5,NULL,'NEW','2026-09-27 22:20:08','2026-09-27 22:20:08','2026-09-30 22:20:08',NULL,NULL,NULL,NULL),(33,'CMP-0033',1,'Cracked Window Pane in Hostel 1st Floor','The glass window pane near room 108 is cracked and shaking when wind blows.','HOSTEL','HIGH',3,NULL,'NEW','2026-09-27 22:27:21','2026-09-27 22:27:21','2026-09-28 22:27:21',NULL,NULL,NULL,NULL),(34,'CMP-0034',1,'broken tube light','tube light broken due to a fight','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:31:12','2026-09-27 22:31:12','2026-09-28 22:31:12',NULL,NULL,NULL,NULL),(35,'CMP-0035',1,'broken tube light','tube light broken due to a fight','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:31:24','2026-09-27 22:31:24','2026-09-28 22:31:24',NULL,NULL,NULL,NULL),(36,'CMP-0036',1,'broken tube light','tube light broken due to a fight','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:31:57','2026-09-27 22:31:57','2026-09-28 22:31:57',NULL,NULL,NULL,NULL),(37,'CMP-0037',1,'Library 2nd Floor Light Flickering Constantly','The fluorescent tubes in aisle 4 of 2nd floor library are flickering continuously causing eye strain.','INFRASTRUCTURE','MEDIUM',5,NULL,'NEW','2026-09-27 22:36:02','2026-09-27 22:36:02','2026-09-30 22:36:02',NULL,NULL,NULL,NULL),(38,'CMP-0038',1,'broken tube light','broken tube light due to fight','INFRASTRUCTURE','HIGH',5,NULL,'NEW','2026-09-27 22:37:25','2026-09-27 22:37:25','2026-09-28 22:37:25',NULL,NULL,NULL,NULL),(39,'CMP-0039',1,'Broken light in room 1232','Broken light in room 1232','INFRASTRUCTURE','MEDIUM',5,NULL,'REJECTED','2026-09-28 00:30:33','2026-09-28 00:43:51','2026-10-01 00:30:33',NULL,NULL,'',NULL),(40,'CMP-0040',1,'Broken light in class 2078','Broken light in class 2078 , cause unknown','INFRASTRUCTURE','MEDIUM',5,NULL,'NEW','2026-09-28 00:37:17','2026-09-28 00:37:17','2026-10-01 00:37:17',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Academic Affairs','ACADEMIC','Handles academic-related complaints','2026-09-26 06:51:27','2026-09-26 06:51:27'),(2,'IT & Systems','IT','Handles IT infrastructure complaints','2026-09-26 06:51:27','2026-09-26 06:51:27'),(3,'Hostel Administration','HOSTEL','Handles hostel-related complaints','2026-09-26 06:51:27','2026-09-26 06:51:27'),(4,'Transport Department','TRANSPORT','Handles transport complaints','2026-09-26 06:51:27','2026-09-26 06:51:27'),(5,'Facilities Management','FACILITIES','Handles infrastructure & maintenance','2026-09-26 06:51:27','2026-09-26 06:51:27'),(6,'Safety & Security','SAFETY','Handles safety-related complaints','2026-09-26 06:51:27','2026-09-26 06:51:27'),(7,'General Administration','GENERAL','General complaints and others','2026-09-26 06:51:27','2026-09-26 06:51:27');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `escalations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escalations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `escalated_by_id` bigint NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `escalated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `previous_assignee_id` bigint DEFAULT NULL,
  `new_assignee_id` bigint DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_escalation_complaint` (`complaint_id`),
  KEY `fk_escalation_by` (`escalated_by_id`),
  KEY `fk_escalation_prev` (`previous_assignee_id`),
  KEY `fk_escalation_new` (`new_assignee_id`),
  CONSTRAINT `fk_escalation_by` FOREIGN KEY (`escalated_by_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_escalation_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_escalation_new` FOREIGN KEY (`new_assignee_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_escalation_prev` FOREIGN KEY (`previous_assignee_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `escalations` WRITE;
/*!40000 ALTER TABLE `escalations` DISABLE KEYS */;
INSERT INTO `escalations` VALUES (1,12,1,'No action taken in 2 weeks despite HIGH priority. Escalating to department head.','2026-09-26 01:36:08',9,NULL,0);
/*!40000 ALTER TABLE `escalations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint NOT NULL,
  `complaint_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ASSIGNMENT','SLA_WARNING','ESCALATION','RESOLUTION','STATUS_CHANGE','GENERAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notification_complaint` (`complaint_id`),
  KEY `idx_notifications_admin` (`admin_id`),
  KEY `idx_notifications_read` (`is_read`),
  CONSTRAINT `fk_notification_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,15,'SLA Warning: CMP-0010','Complaint CMP-0010 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:41:04'),(2,3,16,'SLA Warning: CMP-0011','Complaint CMP-0011 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:41:04'),(3,8,25,'SLA Warning: CMP-0020','Complaint CMP-0020 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:41:04'),(4,3,15,'SLA Warning: CMP-0010','Complaint CMP-0010 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:58:22'),(5,3,16,'SLA Warning: CMP-0011','Complaint CMP-0011 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:58:22'),(6,8,25,'SLA Warning: CMP-0020','Complaint CMP-0020 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 01:58:22'),(7,3,15,'SLA Warning: CMP-0010','Complaint CMP-0010 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 02:00:34'),(8,3,16,'SLA Warning: CMP-0011','Complaint CMP-0011 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 02:00:34'),(9,8,25,'SLA Warning: CMP-0020','Complaint CMP-0020 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 02:00:34'),(10,3,15,'SLA Warning: CMP-0010','Complaint CMP-0010 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 03:42:40'),(11,3,16,'SLA Warning: CMP-0011','Complaint CMP-0011 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 03:42:40'),(12,8,25,'SLA Warning: CMP-0020','Complaint CMP-0020 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 03:42:40'),(13,3,16,'SLA Warning: CMP-0011','Complaint CMP-0011 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 04:42:40'),(14,8,25,'SLA Warning: CMP-0020','Complaint CMP-0020 is approaching its SLA deadline.','SLA_WARNING',0,'2026-09-26 04:42:40'),(15,3,29,'New Assignment: CMP-0029','Complaint CMP-0029 has been assigned to you.','ASSIGNMENT',0,'2026-09-27 20:09:56'),(16,3,29,'Status Update: CMP-0029','Status changed to IN_PROGRESS','STATUS_CHANGE',0,'2026-09-27 20:10:22'),(17,3,29,'Status Update: CMP-0029','Status changed to RESOLVED','STATUS_CHANGE',0,'2026-09-27 20:10:34');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `student_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `complaint_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `complaint_id` (`complaint_id`),
  CONSTRAINT `student_notifications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_notifications_ibfk_2` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `student_notifications` WRITE;
/*!40000 ALTER TABLE `student_notifications` DISABLE KEYS */;
INSERT INTO `student_notifications` VALUES (1,1,28,'Complaint Submitted','Your complaint \"Projector not working in Seminar Hall B\" has been submitted with ID CMP-0028. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 01:17:23'),(2,1,29,'Complaint Submitted','Your complaint \"Water pipe broken in C block 3rd floor boys restroom\" has been submitted with ID CMP-0029. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 01:38:41'),(3,1,30,'Complaint Submitted','Your complaint \"Broken Lab Chair with Nails Exposed\" has been submitted with ID CMP-0030. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 03:47:23'),(4,1,31,'Complaint Submitted','Your complaint \"Broken Lab Chair with Nails Exposed\" has been submitted with ID CMP-0031. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 03:48:03'),(5,1,32,'Complaint Submitted','Your complaint \"Urinal broken in C block 3rd floor boys restroom\" has been submitted with ID CMP-0032. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 03:50:08'),(6,1,33,'Complaint Submitted','Your complaint \"Cracked Window Pane in Hostel 1st Floor\" has been submitted with ID CMP-0033. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 03:57:21'),(7,1,34,'Complaint Submitted','Your complaint \"broken tube light\" has been submitted with ID CMP-0034. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 04:01:12'),(8,1,35,'Complaint Submitted','Your complaint \"broken tube light\" has been submitted with ID CMP-0035. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 04:01:24'),(9,1,36,'Complaint Submitted','Your complaint \"broken tube light\" has been submitted with ID CMP-0036. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 04:01:57'),(10,1,37,'Complaint Submitted','Your complaint \"Library 2nd Floor Light Flickering Constantly\" has been submitted with ID CMP-0037. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 04:06:02'),(11,1,38,'Complaint Submitted','Your complaint \"broken tube light\" has been submitted with ID CMP-0038. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 04:07:26'),(12,1,39,'Complaint Submitted','Your complaint \"Broken light in room 1232\" has been submitted with ID CMP-0039. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 06:00:33'),(13,1,40,'Complaint Submitted','Your complaint \"Broken light in class 2078\" has been submitted with ID CMP-0040. It is now under review.','COMPLAINT_SUBMITTED',0,'2026-09-28 06:07:18');
/*!40000 ALTER TABLE `student_notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year_of_study` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'STU001','Alice Johnson','student1@campus.local','9876543210','Computer Science',3,'2026-09-26 06:51:27','2026-09-28 01:21:54','$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e'),(2,'STU002','Bob Smith','bob@student.edu','9876543211','Mechanical Eng.',2,'2026-09-26 06:51:27','2026-09-28 01:21:54','$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e'),(3,'STU003','Carol White','carol@student.edu','9876543212','Electronics',1,'2026-09-26 06:51:27','2026-09-28 01:21:54','$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e'),(4,'STU004','Dave Brown','dave@student.edu','9876543213','Civil Eng.',4,'2026-09-26 06:51:27','2026-09-28 01:21:54','$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e'),(5,'STU005','Emma Davis','emma@student.edu','9876543214','Computer Science',2,'2026-09-26 06:51:27','2026-09-28 01:21:54','$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

