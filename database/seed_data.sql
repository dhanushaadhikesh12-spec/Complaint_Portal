-- Campus Complaint & Compliance Portal
-- Seed Data for Production / Aiven MySQL

-- =============================================
-- 1. DEPARTMENTS
-- =============================================
INSERT INTO `departments` (`id`, `name`, `code`, `description`) VALUES
(1, 'Information Technology', 'IT', 'Campus IT infrastructure, networking, WiFi, smart boards, and lab computer systems'),
(2, 'Hostel & Residential Life', 'HOSTEL', 'Hostel rooms, water supply, electricity, furniture, and cleanliness'),
(3, 'Academic Affairs', 'ACADEMIC', 'Course registration, exam schedule, grade queries, and timetable conflicts'),
(4, 'Transport & Parking', 'TRANSPORT', 'College shuttle buses, route schedules, passes, and parking lots'),
(5, 'Facilities & Maintenance', 'FACILITIES', 'Civil maintenance, electrical repairs, plumbing, air conditioning, and gardens'),
(6, 'Canteen & Food Services', 'CANTEEN', 'Cafeteria hygiene, food quality, pricing, and operating hours'),
(7, 'Security & Student Safety', 'SAFETY', 'Campus gates, security patrols, surveillance cameras, and visitor access')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- =============================================
-- 2. ADMIN ACCOUNTS (Passwords: Admin@123 / Handler@123)
-- =============================================
INSERT INTO `admins` (`id`, `username`, `email`, `password`, `full_name`, `role`, `department_id`, `is_active`) VALUES
(1, 'superadmin', 'superadmin@campus.local', '$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm', 'System Administrator', 'SUPER_ADMIN', NULL, TRUE),
(2, 'itadmin', 'itadmin@campus.local', '$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm', 'Dr. Ramesh Sharma (IT Head)', 'DEPARTMENT_ADMIN', 1, TRUE),
(3, 'hosteladmin', 'hosteladmin@campus.local', '$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm', 'Prof. Sunita Rao (Chief Warden)', 'DEPARTMENT_ADMIN', 2, TRUE),
(4, 'handler1', 'handler1@campus.local', '$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm', 'Rajesh Kumar (Network Specialist)', 'COMPLAINT_HANDLER', 1, TRUE),
(5, 'handler2', 'handler2@campus.local', '$2b$10$OdS8sozKQ967DCqFvD7/quXGrRUPSwNC77TREg.EXUPvan4FILoMm', 'Karthik Raja (Maintenance Supervisor)', 'COMPLAINT_HANDLER', 5, TRUE)
ON DUPLICATE KEY UPDATE `password`=VALUES(`password`);

-- =============================================
-- 3. STUDENT ACCOUNTS (Password: Student@123)
-- =============================================
INSERT INTO `students` (`id`, `student_id`, `full_name`, `email`, `password`, `phone`, `department`, `year_of_study`) VALUES
(1, 'STU001', 'Alice Johnson', 'student1@campus.local', '$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e', '+91 98765 43210', 'Computer Science', 3),
(2, 'STU002', 'Bob Smith', 'bob@student.edu', '$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e', '+91 98765 43211', 'Electronics & Comm.', 2),
(3, 'STU003', 'Carol White', 'carol@student.edu', '$2b$10$sVkRBVSHg9HsXgPK8omvnORZZzDaq46sYW2A2jHaNUoQb.1A7t00e', '+91 98765 43212', 'Mechanical Eng.', 4)
ON DUPLICATE KEY UPDATE `password`=VALUES(`password`);
