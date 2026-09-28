# Campus Complaint Portal — Fast-Lookup Project File Map

> **Purpose:** Compact, high-density index for AI coding assistants and developers to immediately locate where features, classes, endpoints, queries, and UI components reside in the repository.

---

## Complete Folder Tree

```text
PROJECT_ROOT/
├── .vscode/
│   └── settings.json
├── database/
│   └── schema.sql
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/
│       │   └── application.yml
│       └── java/com/campus/complaint/
│           ├── CampusComplaintPortalApplication.java
│           ├── config/
│           │   ├── DataSeeder.java
│           │   └── SecurityConfig.java
│           ├── controller/
│           │   ├── AdminManagementController.java
│           │   ├── AuditLogController.java
│           │   ├── AuthController.java
│           │   ├── ComplaintController.java
│           │   ├── DashboardController.java
│           │   ├── DepartmentPortalController.java
│           │   ├── HandlerPortalController.java
│           │   ├── NotificationController.java
│           │   ├── StudentPortalController.java
│           │   └── SuperAdminPortalController.java
│           ├── dto/
│           │   ├── request/
│           │   │   ├── AddCommentRequest.java
│           │   │   ├── AssignComplaintRequest.java
│           │   │   ├── CreateAdminRequest.java
│           │   │   ├── CreateComplaintRequest.java
│           │   │   ├── EscalateRequest.java
│           │   │   ├── LoginRequest.java
│           │   │   ├── RegisterStudentRequest.java
│           │   │   ├── StudentNewComplaintRequest.java
│           │   │   ├── UpdateStatusRequest.java
│           │   │   └── VerifyComplaintRequest.java
│           │   └── response/
│           │       ├── ApiResponse.java
│           │       ├── AuthResponse.java
│           │       ├── ComplaintResponse.java
│           │       ├── DashboardResponse.java
│           │       └── StudentDashboardResponse.java
│           ├── entity/
│           │   ├── Admin.java
│           │   ├── AuditLog.java
│           │   ├── Comment.java
│           │   ├── Complaint.java
│           │   ├── Department.java
│           │   ├── Escalation.java
│           │   ├── Notification.java
│           │   └── Student.java
│           ├── exception/
│           │   ├── BusinessException.java
│           │   ├── GlobalExceptionHandler.java
│           │   └── ResourceNotFoundException.java
│           ├── repository/
│           │   ├── AdminRepository.java
│           │   ├── AuditLogRepository.java
│           │   ├── CommentRepository.java
│           │   ├── ComplaintRepository.java
│           │   ├── DepartmentRepository.java
│           │   ├── EscalationRepository.java
│           │   ├── NotificationRepository.java
│           │   └── StudentRepository.java
│           ├── security/
│           │   ├── CustomUserDetailsService.java
│           │   ├── JwtAuthenticationFilter.java
│           │   └── JwtTokenProvider.java
│           └── service/
│               ├── AdminService.java
│               ├── AuditLogService.java
│               ├── ComplaintService.java
│               └── NotificationService.java
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   ├── axios.js
        │   └── services.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── layout/
        │   │   └── Layout.jsx
        │   └── ui/
        │       └── NewComplaintModal.jsx
        └── pages/
            ├── AdminUsersPage.jsx
            ├── AuditLogsPage.jsx
            ├── ComplaintDetailPage.jsx
            ├── ComplaintsPage.jsx
            ├── DashboardPage.jsx
            ├── LoginPage.jsx
            ├── SettingsPage.jsx
            └── StudentsPage.jsx
```

---

## File-by-File Index & Responsibility Matrix

### 1. Database & Configuration

| File Path | Status | Main Classes / Content | Responsibilities & Purpose | Dependencies & Relations |
| :--- | :---: | :--- | :--- | :--- |
| `database/schema.sql` | **ACTIVE** | DDL for 8 MySQL tables + indexes | Authoritative database structure for `departments`, `admins`, `students`, `complaints`, `comments`, `escalations`, `notifications`, `audit_logs`. | Used by MySQL to initialize schema; mapped by JPA entities. |
| `backend/pom.xml` | **ACTIVE** | Maven Project Config | Declares Spring Boot 3.3.5, Java 21, JJWT, MySQL Connector, Lombok, and Spring Security dependencies. | Read by Maven build system. |
| `backend/src/main/resources/application.yml` | **ACTIVE** | Spring YAML config | Configures MySQL JDBC datasource, Hibernate dialect (`validate`), Jackson UTC dates, JWT secret/expiry, and logging levels. | Read by Spring Boot at runtime. |
| `.vscode/settings.json` | **ACTIVE** | JSON config | Sets VS Code Java compilation null analysis mode to automatic. | Developer tooling. |

---

### 2. Backend — Configuration, Security & Exceptions

| File Path | Status | Main Classes / Methods | Responsibilities & Purpose | Dependencies & Relations |
| :--- | :---: | :--- | :--- | :--- |
| `CampusComplaintPortalApplication.java` | **ACTIVE** | `CampusComplaintPortalApplication` | Spring Boot main entry point with `@EnableScheduling` for hourly SLA checks. | Starts the entire backend server. |
| `config/SecurityConfig.java` | **ACTIVE** | `SecurityConfig`, `securityFilterChain()`, `corsConfigurationSource()`, `passwordEncoder()` | Configures stateless session policy, CORS origins (`localhost:5173`, `localhost:3000`), BCrypt encoder, and role route permissions. | Uses `CustomUserDetailsService` & `JwtAuthenticationFilter`. |
| `config/DataSeeder.java` | **ACTIVE** | `DataSeeder.run()` | Seeds 7 departments, 7 admins, 15 students, and 20 complaints on first startup if tables are empty. | Injects all repositories and `PasswordEncoder`. |
| `security/JwtTokenProvider.java` | **ACTIVE** | `generateToken()`, `getUsernameFromToken()`, `validateToken()` | HMAC-SHA256 JJWT generator and parser. | Reads `app.jwt.secret` & `app.jwt.expiration-ms`. |
| `security/JwtAuthenticationFilter.java` | **ACTIVE** | `doFilterInternal()`, `getJwtFromRequest()` | Intercepts HTTP requests, extracts Bearer token, validates, and populates Spring `SecurityContextHolder`. | Extends `OncePerRequestFilter`, uses `JwtTokenProvider` & `UserDetailsService`. |
| `security/CustomUserDetailsService.java`| **ACTIVE** | `loadUserByUsername()` | Dual-lookup user loader checking `AdminRepository` first (by username or email), then `StudentRepository` (by studentId or email). | Injected into Spring Security `DaoAuthenticationProvider`. |
| `exception/GlobalExceptionHandler.java` | **ACTIVE** | `@RestControllerAdvice`, exception handler methods | Catches `ResourceNotFoundException`, `BusinessException`, `AccessDeniedException`, `BadCredentialsException`, and `MethodArgumentNotValidException`. | Returns uniform `ApiResponse<T>` envelopes. |
| `exception/BusinessException.java` | **ACTIVE** | `BusinessException` | Unchecked exception thrown for invalid state transitions or business constraint violations. | Caught by `GlobalExceptionHandler`. |
| `exception/ResourceNotFoundException.java` | **ACTIVE** | `ResourceNotFoundException` | Thrown when an entity ID or identifier is not found in the database. | Returns HTTP 404 via `GlobalExceptionHandler`. |

---

### 3. Backend — Entities & Data Models (`backend/.../entity/`)

| File Path | Status | Primary Entity / Enums | Database Table | Purpose & Key Fields |
| :--- | :---: | :--- | :--- | :--- |
| `entity/Admin.java` | **ACTIVE** | `Admin`, enum `Role` (`SUPER_ADMIN`, `DEPARTMENT_ADMIN`, `COMPLAINT_HANDLER`) | `admins` | Implements `UserDetails`. Stores username, email, hashed password, role, department linkage, active flag. |
| `entity/Student.java` | **ACTIVE** | `Student` | `students` | Implements `UserDetails` (`ROLE_STUDENT`). Stores studentId, fullName, email, phone, department, yearOfStudy. |
| `entity/Department.java` | **ACTIVE** | `Department` | `departments` | Stores institutional department name, unique uppercase code (`IT`, `HOSTEL`, `FACILITIES`, etc.), and description. |
| `entity/Complaint.java` | **ACTIVE** | `Complaint`, enums `Category`, `Priority`, `Status` | `complaints` | Core grievance entity. Includes SLA rules (`getSlaHours()`) and state machine (`canTransitionTo()`). Linked to Student, Department, and Handler. |
| `entity/Comment.java` | **ACTIVE** | `Comment` | `comments` | Discussion and remark records for complaints. Supports internal staff-only comments (`is_internal = true`) and student public comments. |
| `entity/Escalation.java` | **ACTIVE** | `Escalation` | `escalations` | Records escalation reasons, escalating admin, previous assignee, and new assignee. |
| `entity/Notification.java` | **ACTIVE** | `Notification`, enum `Type` | `notifications` | In-app notification alerts for staff/handlers. Stores alert type (`ASSIGNMENT`, `SLA_WARNING`, `ESCALATION`, `RESOLUTION`, `STATUS_CHANGE`, `GENERAL`). |
| `entity/AuditLog.java` | **ACTIVE** | `AuditLog` | `audit_logs` | Immutable audit trail record capturing actor admin, target complaint, action name, old/new values, IP address, and timestamp. |

---

### 4. Backend — Repositories (`backend/.../repository/`)

| Repository Interface | Entity Managed | Key Custom Queries / Methods |
| :--- | :--- | :--- |
| `AdminRepository.java` | `Admin` | `findByUsername`, `findByEmail`, `findByRole`, `findByDepartmentIdAndRole`, `findByActive` |
| `StudentRepository.java` | `Student` | `findByStudentId`, `findByEmail`, `existsByStudentId`, `existsByEmail` |
| `DepartmentRepository.java`| `Department` | `findByCode`, `findByName`, `existsByCode` |
| `ComplaintRepository.java` | `Complaint` | `findMaxId()`, `findOverdueComplaints()`, `findApproachingSla()`, `countByStatusGrouped()`, `countByCategoryGrouped()`, `countByPriorityGrouped()`, `countByDepartmentGrouped()`, `findAverageResolutionTimeHours()`, `findByStudentIdOrderByCreatedAtDesc` |
| `CommentRepository.java` | `Comment` | `findByComplaintIdOrderByCreatedAtAsc`, `findByComplaintIdAndInternalFalseOrderByCreatedAtAsc` |
| `EscalationRepository.java`| `Escalation` | `findByComplaintIdOrderByEscalatedAtDesc`, `findByResolvedFalse`, `countByResolvedFalse` |
| `NotificationRepository.java`| `Notification` | `findByAdminIdOrderByCreatedAtDesc`, `countByAdminIdAndReadFalse`, `markAllReadForAdmin` |
| `AuditLogRepository.java` | `AuditLog` | `findAllByOrderByCreatedAtDesc`, `findByComplaintIdOrderByCreatedAtAsc`, `findByAdminIdOrderByCreatedAtDesc` |

---

### 5. Backend — Services (`backend/.../service/`)

| Service Class | Responsibility | Key Methods | Injected Repositories / Services |
| :--- | :--- | :--- | :--- |
| `ComplaintService.java` | Complaint lifecycle, ID generation, category auto-routing, SLA enforcement, metrics aggregation | `generateComplaintId()`, `createComplaint()`, `getAllComplaints()`, `assignHandler()`, `updateStatus()`, `updatePriority()`, `addComment()`, `escalate()`, `resolve()`, `close()`, `getDashboard()`, `getReports()`, `checkSlaBreaches()` | `ComplaintRepository`, `StudentRepository`, `AdminRepository`, `DepartmentRepository`, `CommentRepository`, `EscalationRepository`, `AuditLogService`, `NotificationService` |
| `AdminService.java` | Staff/admin account lifecycle & CRUD | `getAllAdmins()`, `getById()`, `createAdmin()`, `toggleActive()`, `deleteAdmin()`, `getHandlers()`, `getAllDepartments()` | `AdminRepository`, `DepartmentRepository`, `PasswordEncoder`, `AuditLogService` |
| `AuditLogService.java` | Immutable audit logging and retrieval | `log(...)`, `getAll(Pageable)`, `getByComplaint(complaintId)` | `AuditLogRepository` |
| `NotificationService.java` | Notification creation and read status updates | `send(...)`, `getForAdmin(...)`, `countUnread(...)`, `markRead(...)`, `markAllRead(...)` | `NotificationRepository` |

---

### 6. Backend — Controllers (`backend/.../controller/`)

| Controller Class | Base Route | PreAuthorize Role | Purpose & Main Handlers |
| :--- | :--- | :--- | :--- |
| `AuthController.java` | `/api/auth` | Public / Authenticated | `/login`, `/register-student`, `/me`, `/health` |
| `ComplaintController.java` | `/api/complaints` | Authenticated | Multi-filter complaints query, CRUD, `/assign`, `/status`, `/priority`, `/comments`, `/escalate`, `/resolve`, `/close`, `/students`, `/handlers` |
| `DashboardController.java` | `/api` | Authenticated | `/dashboard` (aggregated analytics), `/reports`, `/health` |
| `AdminManagementController.java`| `/api/admin-mgmt` | `SUPER_ADMIN` | Admin user CRUD, `/toggle-active`, `/departments` |
| `AuditLogController.java` | `/api/audit-logs` | `SUPER_ADMIN` | Paginated system audit trail querying |
| `NotificationController.java` | `/api/notifications` | Staff Authenticated | `/`, `/unread-count`, `/{id}/read`, `/mark-all-read` |
| `StudentPortalController.java` | `/api/student` | `STUDENT` | Scoped student endpoints: `/dashboard`, `/complaints`, `/complaints/{id}/verify`, `/comments`, `/profile`, `/departments` |
| `DepartmentPortalController.java`| `/api/department` | `DEPARTMENT_ADMIN` | Department-scoped endpoints with access verification: `/dashboard`, `/complaints`, `/assign`, `/status`, `/resolve`, `/escalate`, `/handlers`, `/reports` |
| `HandlerPortalController.java` | `/api/handler` | `COMPLAINT_HANDLER` | Assigned-handler endpoints with access verification: `/dashboard`, `/complaints`, `/status`, `/comments`, `/resolve`, `/profile` |
| `SuperAdminPortalController.java`| `/api/admin` | `SUPER_ADMIN` | Executive endpoints: `/dashboard`, `/complaints`, `/escalations`, `/reports`, `/audit-logs`, `/admin-users`, `/departments` |

---

### 7. Frontend — Architecture, Context & API Layer

| File Path | Status | Main Exports / Components | Purpose & Interactions |
| :--- | :---: | :--- | :--- |
| `frontend/src/main.jsx` | **ACTIVE** | React Root Render | Mounts `App` into `#root` with `React.StrictMode`. |
| `frontend/src/App.jsx` | **ACTIVE** | `App`, `AppRoutes`, `ProtectedRoute` | Sets up `BrowserRouter`, `AuthProvider`, `Toaster`, and route protection. |
| `frontend/src/index.css` | **ACTIVE** | Global CSS Design System | Defines CSS variables, dark glassmorphism theme, layout shell, sidebar, stat cards, tables, badges, modals, and animations. |
| `frontend/src/api/axios.js` | **ACTIVE** | Axios instance default export | Configures `baseURL: 'http://localhost:8080/api'`, attaches Bearer JWT token from `localStorage`, and handles 401 redirects. |
| `frontend/src/api/services.js` | **ACTIVE** | API client functions | Wraps all backend endpoints (`login`, `getComplaints`, `updateStatus`, `assignComplaint`, `getDashboard`, `getAuditLogs`, etc.). |
| `frontend/src/context/AuthContext.jsx` | **ACTIVE** | `AuthProvider`, `useAuth` hook | Manages `user`, `token`, `loading`, `login()`, `logout()`, role flags (`isSuperAdmin`, `isDeptAdmin`, `isHandler`, `canManage`). |
| `frontend/src/components/layout/Layout.jsx` | **ACTIVE** | `Layout` | Application shell containing responsive Sidebar, Topbar, User initials avatar, and interactive Notifications popover. |
| `frontend/src/components/ui/NewComplaintModal.jsx` | **ACTIVE** | `NewComplaintModal` | Modal dialog for creating complaints with student select, category, priority, and auto-assign department dropdown. |

---

### 8. Frontend — Pages (`frontend/src/pages/`)

| File Path | Status | Page Name | Key Features & Handlers |
| :--- | :---: | :--- | :--- |
| `pages/LoginPage.jsx` | **ACTIVE** | Login Screen | Username/password form, password toggle, Quick Demo buttons for `superadmin`, `itadmin`, `hosteladmin`, `handler1`, `handler2`, `handler3`. |
| `pages/DashboardPage.jsx` | **ACTIVE** | Executive Dashboard | 8 Stat cards, Recharts Donut Pie for status breakdown, Horizontal Bar for categories, Priority Bar chart, and SLA rate progress bars. |
| `pages/ComplaintsPage.jsx` | **ACTIVE** | Complaints Management | Paginated complaints table, live search, multi-filters (status, category, priority), "New Complaint" button, link to detail view. |
| `pages/ComplaintDetailPage.jsx` | **ACTIVE** | Complaint Inspector | Breadcrumbs, status/priority badges, action buttons (Assign, Escalate, Status, Resolve, Close), remarks thread with internal toggle, audit history. |
| `pages/StudentsPage.jsx` | **ACTIVE** | Students Directory | Student roster grid cards with search, student ID badges, department/year tags, and direct button to filter their complaints. |
| `pages/AdminUsersPage.jsx` | **ACTIVE** | Admin User Management | Super Admin table of staff accounts, role-colored badges, and "Create Admin User" modal. |
| `pages/AuditLogsPage.jsx` | **ACTIVE** | Audit Trail | Chronological table of audit logs with action tags, actor details, entity identifiers, and IP addresses. |
| `pages/SettingsPage.jsx` | **ACTIVE** | Settings & Overview | User profile summary, institutional department list, registered complaint handler catalog, and system environment info. |
