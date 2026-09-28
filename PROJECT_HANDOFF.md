# Campus Complaint & Compliance Portal — Complete Technical Handoff & System Context

> **Document Type:** Senior Software Architect Codebase Audit & AI Technical Handoff  
> **Source of Truth:** Inspected Workspace Repository (`backend/`, `frontend/`, `database/`, `.vscode/`)  
> **Target Audience:** AI Coding Assistants, Lead Engineers, System Architects  
> **Repository Version:** 1.0.0  

---

## Table of Contents
1. [Executive Summary & Repository Identity](#1-executive-summary--repository-identity)
2. [Exact Project Tree & Directory Structure](#2-exact-project-tree--directory-structure)
3. [Technology Stack & Dependency Inventory](#3-technology-stack--dependency-inventory)
4. [System Architecture & Data Flows](#4-system-architecture--data-flows)
5. [Application Workflows](#5-application-workflows)
6. [User Roles, Permissions & Security Matrix](#6-user-roles-permissions--security-matrix)
7. [Frontend Deep-Dive Documentation](#7-frontend-deep-dive-documentation)
8. [Backend Deep-Dive Documentation](#8-backend-deep-dive-documentation)
9. [Complete API Specification](#9-complete-api-specification)
10. [Database Architecture & Schema](#10-database-architecture--schema)
11. [Data Models, Entities & DTOs](#11-data-models-entities--dtos)
12. [Authentication, Authorization & Security Audit](#12-authentication-authorization--security-audit)
13. [Environment Variables & Configuration Registry](#13-environment-variables--configuration-registry)
14. [Dependency Analysis](#14-dependency-analysis)
15. [Execution, Build & Operational Commands](#15-execution-build--operational-commands)
16. [File-by-File Responsibility Map](#16-file-by-file-responsibility-map)
17. [Dependency & Import Graphs](#17-dependency--import-graphs)
18. [Complete End-to-End User Journeys](#18-complete-end-to-end-user-journeys)
19. [Current Implementation Status](#19-current-implementation-status)
20. [Bugs, Issues, Risks & Discrepancies](#20-bugs-issues-risks--discrepancies)
21. [Hardcoded & Seed Data Registry](#21-hardcoded--seed-data-registry)
22. [External Services & Third-Party Integrations](#22-external-services--third-party-integrations)
23. [UI & Design System Specifications](#23-ui--design-system-specifications)
24. [Project-Specific Business Logic & SLA Engine](#24-project-specific-business-logic--sla-engine)
25. [Important Constants, Enums & Status Transitions](#25-important-constants-enums--status-transitions)
26. [Error Handling & Exception Propagation](#26-error-handling--exception-propagation)
27. [Testing Infrastructure](#27-testing-infrastructure)
28. [Build & Deployment Architecture](#28-build--deployment-architecture)
29. [Codebase History & Evolution Evidence](#29-codebase-history--evolution-evidence)
30. ["How to Modify This Project" Developer Guide](#30-how-to-modify-this-project-developer-guide)
31. [Rules for an AI Continuing This Project](#31-rules-for-an-ai-continuing-this-project)
32. [AI Quick Context](#32-ai-quick-context)
33. [Source of Truth Declaration](#33-source-of-truth-declaration)

---

## 1. Executive Summary & Repository Identity

The **Campus Complaint & Compliance Portal** is an institutional issue-tracking, resolution, SLA-monitoring, and compliance management system tailored for university and college campuses. It bridges communication between students, department administrators, assigned complaint handlers, and central executive super administrators.

### Core Objectives
1. **Student Complaint Intake:** Structured submission of issues across categories (Academic, Infrastructure, Hostel, Transport, Canteen, IT, Maintenance, Safety, Other).
2. **Automated Category Routing:** Auto-assigning complaints to corresponding institutional departments based on category rules.
3. **SLA & Escalation Engine:** Strict enforcement of resolution SLAs (4h for Critical, 24h for High, 72h for Medium, 168h for Low), scheduled background checks, and escalation workflows for breached or unresolved grievances.
4. **Lifecycle Auditability:** Immutable logging of status changes, reassignments, comments, and role actions in an audit log ledger.
5. **Role-Tailored Dashboards & Action Portals:** Granular views and permissions for Super Admins, Department Admins, Complaint Handlers, and Students.

---

## 2. Exact Project Tree & Directory Structure

```text
PROJECT_ROOT/
├── .vscode/
│   └── settings.json                    # VS Code Java configuration settings
├── backend/
│   ├── pom.xml                          # Maven project descriptor (Spring Boot 3.3.5, Java 21)
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── campus/
│       │   │           └── complaint/
│       │   │               ├── CampusComplaintPortalApplication.java # Spring Boot entry point (@EnableScheduling)
│       │   │               ├── config/
│       │   │               │   ├── DataSeeder.java                   # Database initial seeder (CommandLineRunner)
│       │   │               │   └── SecurityConfig.java               # Spring Security filter chain & CORS config
│       │   │               ├── controller/
│       │   │               │   ├── AdminManagementController.java    # Super Admin admin CRUD (/api/admin-mgmt)
│       │   │               │   ├── AuditLogController.java           # Super Admin audit log querying (/api/audit-logs)
│       │   │               │   ├── AuthController.java               # Authentication, token generation, register, /me (/api/auth)
│       │   │               │   ├── ComplaintController.java          # Core complaint workflows (/api/complaints)
│       │   │               │   ├── DashboardController.java          # Analytics, reports & health (/api/dashboard, /api/reports, /api/health)
│       │   │               │   ├── DepartmentPortalController.java   # Dept Admin scoped portal endpoints (/api/department)
│       │   │               │   ├── HandlerPortalController.java      # Handler scoped portal endpoints (/api/handler)
│       │   │               │   ├── NotificationController.java       # User notifications (/api/notifications)
│       │   │               │   ├── StudentPortalController.java      # Student scoped portal endpoints (/api/student)
│       │   │               │   └── SuperAdminPortalController.java   # Super Admin specialized portal (/api/admin)
│       │   │               ├── dto/
│       │   │               │   ├── request/
│       │   │               │   │   ├── AddCommentRequest.java        # Payload for adding remarks/comments
│       │   │               │   │   ├── AssignComplaintRequest.java   # Payload for handler assignment
│       │   │               │   │   ├── CreateAdminRequest.java       # Payload for creating staff/admin accounts
│       │   │               │   │   ├── CreateComplaintRequest.java   # Staff payload for complaint creation
│       │   │               │   │   ├── EscalateRequest.java          # Escalation reason & optional assignee payload
│       │   │               │   │   ├── LoginRequest.java             # Username & password authentication payload
│       │   │               │   │   ├── RegisterStudentRequest.java   # Student self-registration payload
│       │   │               │   │   ├── StudentNewComplaintRequest.java # Student intake payload
│       │   │               │   │   ├── UpdateStatusRequest.java      # State transition request payload
│       │   │               │   │   └── VerifyComplaintRequest.java   # Student verification (CLOSE/REOPEN) payload
│       │   │               │   └── response/
│       │   │               │       ├── ApiResponse.java              # Generic standardized JSON envelope
│       │   │               │       ├── AuthResponse.java             # JWT token and user identity metadata response
│       │   │               │       ├── ComplaintResponse.java        # Flattened DTO for Complaint entity
│       │   │               │       ├── DashboardResponse.java        # Aggregated admin analytics response
│       │   │               │       └── StudentDashboardResponse.java # Aggregated student metrics response
│       │   │               ├── entity/
│       │   │               │   ├── Admin.java                        # Admin/staff user entity (UserDetails)
│       │   │               │   ├── AuditLog.java                     # System audit log record entity
│       │   │               │   ├── Comment.java                      # Internal/external discussion entity
│       │   │               │   ├── Complaint.java                    # Primary complaint record entity
│       │   │               │   ├── Department.java                   # Department taxonomy entity
│       │   │               │   ├── Escalation.java                   # Complaint escalation record entity
│       │   │               │   ├── Notification.java                 # In-app notifications entity
│       │   │               │   └── Student.java                      # Student user entity (UserDetails)
│       │   │               ├── exception/
│       │   │               │   ├── BusinessException.java            # Unchecked business rule violation exception
│       │   │               │   ├── GlobalExceptionHandler.java       # @RestControllerAdvice global error handler
│       │   │               │   └── ResourceNotFoundException.java    # HTTP 404 entity lookup exception
│       │   │               ├── repository/
│       │   │               │   ├── AdminRepository.java              # JPA repository for Admin entity
│       │   │               │   ├── AuditLogRepository.java           # JPA repository for AuditLog entity
│       │   │               │   ├── CommentRepository.java            # JPA repository for Comment entity
│       │   │               │   ├── ComplaintRepository.java          # JPA & Specification repository for Complaint
│       │   │               │   ├── DepartmentRepository.java         # JPA repository for Department entity
│       │   │               │   ├── EscalationRepository.java         # JPA repository for Escalation entity
│       │   │               │   ├── NotificationRepository.java       # JPA repository for Notification entity
│       │   │               │   └── StudentRepository.java            # JPA repository for Student entity
│       │   │               ├── security/
│       │   │               │   ├── CustomUserDetailsService.java     # Dual Admin/Student UserDetailsService loader
│       │   │               │   ├── JwtAuthenticationFilter.java      # Bearer token extractor & SecurityContext setter
│       │   │               │   └── JwtTokenProvider.java             # HMAC-SHA JJWT generator & validator
│       │   │               └── service/
│       │   │                   ├── AdminService.java                 # Admin user CRUD and lifecycle management
│       │   │                   ├── AuditLogService.java              # Structured audit log creation & querying
│       │   │                   ├── ComplaintService.java             # Complaint lifecycle, SLA scheduling & metrics
│       │   │                   └── NotificationService.java          # Notification dispatch & read markers
│       │   └── resources/
│       │       └── application.yml      # Spring Boot application configuration (datasource, JPA, JWT, logging)
│       └── test/
│           └── java/
│               └── com/
│                   └── campus/
│                       └── complaint/   # Empty test package hierarchy (no test suites present)
├── database/
│   └── schema.sql                       # MySQL DDL schema for all tables, indexes, constraints
└── frontend/
    ├── dist/                            # Pre-compiled static production assets
    │   ├── assets/
    │   │   ├── index-BBBdFDI7.css
    │   │   └── index-Xt-UThl6.js
    │   └── index.html
    ├── index.html                       # HTML template with Google Fonts (Inter, Outfit)
    ├── package.json                     # NPM manifest (React 18, Vite 5, Recharts, Lucide, Axios)
    ├── package-lock.json                # NPM dependency lockfile
    ├── vite.config.js                   # Vite config with React plugin and /api proxy configuration
    └── src/
        ├── App.jsx                      # App root with React Router, ProtectedRoute & Toaster
        ├── index.css                    # Complete Vanilla CSS design system (Dark glassmorphism)
        ├── main.jsx                     # React DOM entry point
        ├── api/
        │   ├── axios.js                 # Axios instance with baseURL & JWT request/response interceptors
        │   └── services.js              # Frontend API client methods
        ├── components/
        │   ├── layout/
        │   │   └── Layout.jsx           # App shell with Sidebar, Topbar, Notifications dropdown
        │   └── ui/
        │       └── NewComplaintModal.jsx# Reusable modal for lodging complaints
        ├── context/
        │   └── AuthContext.jsx          # User state, token storage, auth helper flags
        ├── hooks/                       # Empty directory reserved for custom hooks
        └── pages/
            ├── AdminUsersPage.jsx       # Super Admin user management table & modal
            ├── AuditLogsPage.jsx        # System audit log trail with pagination
            ├── ComplaintDetailPage.jsx  # Complete complaint view, timeline, remarks, modals
            ├── ComplaintsPage.jsx       # Paginated complaint table with search & multi-filters
            ├── DashboardPage.jsx        # Metric stat cards, Recharts pie/bar charts, SLA progress
            ├── LoginPage.jsx            # Dark authentication screen with quick demo login buttons
            ├── SettingsPage.jsx         # Profile summary, department catalog, handler list & system info
            └── StudentsPage.jsx         # Student directory grid with quick search
```

---

## 3. Technology Stack & Dependency Inventory

### Frontend
- **Framework:** React 18.2.0 (SPA)
- **Language:** JavaScript (ESNext / JSX)
- **Build Tool / Dev Server:** Vite 5.2.11 (`@vitejs/plugin-react` 4.2.1)
- **Routing:** `react-router-dom` 6.23.0 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **State Management:** React Context API (`AuthContext.jsx`) & local component state (`useState`, `useEffect`)
- **HTTP Client:** `axios` 1.6.8 (with request interceptor for `Authorization: Bearer <token>` and 401 redirect interceptor)
- **Data Visualization & Charts:** `recharts` 2.12.4 (`ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `CartesianGrid`)
- **Date Utilities:** `date-fns` 3.6.0 (`formatDistanceToNow`)
- **Toasts & Notifications:** `react-hot-toast` 2.4.1
- **Icons:** `lucide-react` 0.378.0
- **Typography:** Google Fonts (`Inter` 300..800, `Outfit` 600..800) loaded in `index.html`
- **CSS Architecture:** Vanilla CSS in `src/index.css` (custom design system using CSS variables, flexbox, CSS Grid, dark glassmorphism, keyframe animations)

### Backend
- **Framework:** Spring Boot 3.3.5
- **Language & Runtime:** Java 21 (Maven compiler target 21)
- **Architecture:** Layered REST API (Controller -> Service -> Repository -> JPA/Hibernate -> MySQL)
- **Security:** Spring Security 6 (`SecurityConfig`, `DaoAuthenticationProvider`, `BCryptPasswordEncoder`)
- **Token Mechanism:** JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson`)
- **ORM / Persistence:** Spring Data JPA / Hibernate 6 (`MySQLDialect`, `ddl-auto: validate`)
- **Validation:** `spring-boot-starter-validation` (Jakarta Validation annotations: `@NotNull`, `@NotBlank`, `@Valid`)
- **Scheduling:** Spring `@EnableScheduling` with `@Scheduled(fixedRate = 3600000)` (hourly SLA breach detection)
- **Boilerplate Reduction:** Project Lombok 1.18.36 (note: source classes were delomboked in the current repository)
- **Logging:** SLF4J / Logback (Configured in `application.yml`: `com.campus.complaint: INFO`, `org.springframework.security: WARN`)

### Database
- **Engine:** MySQL 8.x
- **Database Name:** `campus_complaint_portal`
- **Character Set / Collation:** `utf8mb4` / `utf8mb4_unicode_ci`
- **Driver:** `com.mysql.cj.jdbc.Driver` (`mysql-connector-j`)
- **Tables (8):** `departments`, `admins`, `students`, `complaints`, `comments`, `escalations`, `notifications`, `audit_logs`

### Development & Operational Tooling
- **Package Managers:** Maven (`pom.xml`) for backend, NPM (`package.json`, `package-lock.json`) for frontend
- **IDE Support:** `.vscode/settings.json` configuring Java null analysis and build updates

---

## 4. System Architecture & Data Flows

### Architecture Layers

```text
+-------------------------------------------------------------------------+
|                                CLIENT                                   |
|   React 18 SPA (Vite Dev Server :3000 / Production Build in dist/)      |
|   - AuthContext (JWT Storage, User Identity)                            |
|   - Axios Client (Bearer Token Interceptor, BaseURL: localhost:8080/api)|
|   - Pages: Dashboard, Complaints, Detail, Students, AdminUsers, Audit  |
+------------------------------------+------------------------------------+
                                     |
                         HTTP / REST JSON (JWT Auth)
                                     |
+------------------------------------v------------------------------------+
|                         SPRING BOOT BACKEND (:8080)                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | SECURITY & FILTER LAYER                                           |  |
|  | - SecurityConfig (Stateless Session, CORS Configuration)          |  |
|  | - JwtAuthenticationFilter (Extract Bearer -> Validate -> Context) |  |
|  | - CustomUserDetailsService (Dual Lookup: Admin OR Student)        |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | CONTROLLER LAYER (/api/...)                                       |  |
|  | - AuthController (/api/auth)                                      |  |
|  | - ComplaintController (/api/complaints)                           |  |
|  | - DashboardController (/api/dashboard, /api/reports)             |  |
|  | - AdminManagementController (/api/admin-mgmt)                     |  |
|  | - AuditLogController (/api/audit-logs)                             |  |
|  | - NotificationController (/api/notifications)                     |  |
|  | - StudentPortalController (/api/student)                          |  |
|  | - DepartmentPortalController (/api/department)                   |  |
|  | - HandlerPortalController (/api/handler)                         |  |
|  | - SuperAdminPortalController (/api/admin)                         |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | SERVICE & BUSINESS LOGIC LAYER                                    |  |
|  | - ComplaintService (ID Gen, Category Routing, State Engine, SLA)  |  |
|  | - AdminService (Staff CRUD, Dept Bindings, Password Hashing)      |  |
|  | - AuditLogService (Immutable Event Logging)                       |  |
|  | - NotificationService (Staff Alert Dispatch & Read Tracking)      |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|  +---------------------------------v---------------------------------+  |
|  | REPOSITORY & PERSISTENCE LAYER                                    |  |
|  | - Spring Data JPA Repositories (Complaint, Admin, Student, etc.)  |  |
|  | - JpaSpecificationExecutor (Dynamic filtering & pagination)      |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
+------------------------------------+------------------------------------+
                                     | JDBC (HikariCP)
+------------------------------------v------------------------------------+
|                             DATABASE                                    |
|  MySQL Database: campus_complaint_portal                                |
|  Tables: departments, admins, students, complaints, comments,          |
|          escalations, notifications, audit_logs                         |
+-------------------------------------------------------------------------+
```

### Request & Data Flows

#### 1. Authentication Flow
```text
User Submits Credentials (LoginPage.jsx)
  -> POST /api/auth/login
  -> AuthController.login()
  -> CustomUserDetailsService.loadUserByUsername() (Searches Admin by username/email, then Student by studentId/email)
  -> PasswordEncoder.matches()
  -> JwtTokenProvider.generateToken()
  -> Returns { token, id, username/studentId, email, fullName, role, department }
  -> Frontend saves token and user to localStorage
  -> Subsequent Axios requests include 'Authorization: Bearer <token>'
```

#### 2. Complaint Intake & Auto-Routing Flow
```text
Intake Request Submitted (NewComplaintModal or StudentPortalController)
  -> POST /api/complaints OR POST /api/student/complaints
  -> ComplaintService.generateComplaintId() (Atomic query findMaxId() -> "CMP-XXXX")
  -> Auto-Routing Category:
       IT             -> Department code 'IT'
       HOSTEL         -> Department code 'HOSTEL'
       TRANSPORT      -> Department code 'TRANSPORT'
       INFRASTRUCTURE -> Department code 'FACILITIES'
       MAINTENANCE    -> Department code 'FACILITIES'
       ACADEMIC       -> Department code 'ACADEMIC'
       SAFETY         -> Department code 'SAFETY'
       CANTEEN/OTHER  -> Department code 'GENERAL'
  -> SLA Due Date calculated: LocalDateTime.now().plusHours(priority.getSlaHours())
  -> Status set to NEW
  -> Saved in MySQL `complaints` table
  -> AuditLog entry generated: "COMPLAINT_CREATED"
```

#### 3. Hourly SLA Monitoring Flow (Scheduled Background Task)
```text
Spring Scheduler (@Scheduled(fixedRate = 3600000))
  -> ComplaintService.checkSlaBreaches()
  -> Queries complaints with status NOT IN ('CLOSED', 'REJECTED') where dueDate is within 4 hours
  -> Dispatches SLA_WARNING notifications to assigned handlers via NotificationService
```

---

## 5. Application Workflows

### 1. Super Admin Workflow
```text
LOGIN (superadmin / Admin@123)
  ├── DASHBOARD
  │     ├── View campus-wide complaint metrics, overdue count, and SLA approaching counters
  │     └── Review distribution charts (Category, Status, Priority, Department)
  ├── COMPLAINTS MANAGEMENT
  │     ├── Filter by Status, Category, Priority, Department, Search string
  │     ├── Drill down to Complaint Details
  │     ├── Assign/Reassign Handler & Department
  │     ├── Change Priority (dynamically recalculates SLA deadline)
  │     ├── Transition Status (VALIDATING -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED)
  │     ├── Escalate complaint with reason and optional reassignment
  │     ├── Post internal or public comments
  │     └── Force Close complaint
  ├── ADMIN USERS MANAGEMENT
  │     ├── View all staff & administrators
  │     ├── Create new Department Admins or Complaint Handlers
  │     └── Toggle user active/inactive status
  ├── AUDIT LOGS TRAIL
  │     └── Inspect chronological ledger of actions, IP addresses, entity mutations
  └── SETTINGS & CONFIGURATION
        └── View institution departments, registered handlers, and system runtime parameters
```

### 2. Department Admin Workflow
```text
LOGIN (e.g., itadmin or hosteladmin / Admin@123)
  ├── DASHBOARD & COMPLAINTS
  │     ├── Automatically scoped to user's assigned department
  │     ├── Cannot access complaints from other departments (enforced via verifyDepartmentAccess())
  │     ├── Assign complaints to department-specific handlers
  │     ├── Escalate unresolved complaints to Super Admin
  │     ├── Mark complaints as RESOLVED with resolution notes
  │     └── Add internal/public comments
  └── SETTINGS
        └── View department roster and personal profile
```

### 3. Complaint Handler Workflow
```text
LOGIN (e.g., handler1, handler2, handler3 / Handler@123)
  ├── DASHBOARD & ASSIGNED COMPLAINTS
  │     ├── Filtered strictly to complaints where assigned_handler_id == current user
  │     ├── Update status to IN_PROGRESS
  │     ├── Add operational remarks/comments
  │     ├── Mark complaints as RESOLVED (supplying resolution note)
  │     └── Receive in-app notifications on new assignments and SLA warnings
```

### 4. Student Workflow (Backend Implemented, Specialized Portal Endpoints)
```text
REGISTRATION / LOGIN (STU001 / Student@123)
  ├── LODGE COMPLAINT (POST /api/student/complaints)
  │     └── Submit title, description, category, priority
  ├── TRACK GRIEVANCES (GET /api/student/complaints)
  │     └── View complaint status, assigned department, SLA deadline, comments
  ├── INTERACT
  │     └── Post public student comments (POST /api/student/complaints/{id}/comments)
  └── VERIFY RESOLUTION (POST /api/student/complaints/{id}/verify)
        ├── CLOSE / SATISFIED -> Confirms resolution, moves status to CLOSED, attaches feedback
        └── REOPEN / UNSATISFIED -> Moves status to REOPENED, appends reopening comment
```

---

## 6. User Roles, Permissions & Security Matrix

### Identified Roles
1. `ROLE_SUPER_ADMIN` (Staff/Admin table, role: `SUPER_ADMIN`)
2. `ROLE_DEPARTMENT_ADMIN` (Staff/Admin table, role: `DEPARTMENT_ADMIN`)
3. `ROLE_COMPLAINT_HANDLER` (Staff/Admin table, role: `COMPLAINT_HANDLER`)
4. `ROLE_STUDENT` (Students table, granted authority `ROLE_STUDENT`)

### Permissions Matrix

| Feature / Action | Super Admin | Department Admin | Complaint Handler | Student |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Login** | YES | YES | YES | YES |
| **View Campus-Wide Dashboard** | YES | NO (Dept Scoped) | NO (Assigned Scoped) | NO (Student Scoped) |
| **View All Complaints** | YES | NO (Dept Scoped) | NO (Assigned Scoped) | NO (Own Only) |
| **Lodge New Complaint** | YES | YES | NO | YES |
| **Assign / Reassign Handlers** | YES | YES (Within Dept) | NO | NO |
| **Update Complaint Priority** | YES | YES (Within Dept) | NO | NO |
| **Escalate Complaint** | YES | YES | NO | NO |
| **Update Status (General)** | YES | YES | YES (Assigned) | NO |
| **Mark Resolved** | YES | YES | YES (Assigned) | NO |
| **Close Complaint** | YES | YES | NO | YES (Via Verify) |
| **Reopen Complaint** | NO (Via Status) | NO (Via Status) | NO | YES (Via Verify) |
| **Add Internal Comments** | YES | YES | YES | NO |
| **Add Public Comments** | YES | YES | YES | YES |
| **Manage Admin Users** | YES | NO | NO | NO |
| **View Audit Logs** | YES | NO | NO | NO |
| **View Institution Reports** | YES | YES | NO | NO |
| **Manage Departments** | YES | NO | NO | NO |

---

## 7. Frontend Deep-Dive Documentation

### Frontend Structure & Routing (`src/App.jsx`)
- `BrowserRouter` wraps `AuthProvider` and `Toaster`.
- Routes are protected via `<ProtectedRoute adminOnly={boolean}>`.
- Loading spinner displayed while `AuthContext` validates JWT against `/api/auth/me`.

### Route Mapping

| Route Path | Component | Access Restriction | Purpose |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage.jsx` | Public (redirects to `/` if logged in) | Authentication and quick demo switcher |
| `/` | `DashboardPage.jsx` | Authenticated | High-level analytics, Recharts charts, SLA overview |
| `/complaints` | `ComplaintsPage.jsx` | Authenticated | Paginated complaint table with multi-filters & search |
| `/complaints/:id` | `ComplaintDetailPage.jsx`| Authenticated | Detailed complaint inspector, timeline, actions, remarks |
| `/students` | `StudentsPage.jsx` | Authenticated | Student directory cards with search and cross-linking |
| `/audit` | `AuditLogsPage.jsx` | Super Admin / Dept Admin (`adminOnly`) | System audit ledger |
| `/admin-users` | `AdminUsersPage.jsx`| Super Admin only | Staff account creation and status management |
| `/settings` | `SettingsPage.jsx` | Super Admin / Dept Admin (`adminOnly`) | Department directory, handler roster, system info |
| `*` | `Navigate to="/"` | Catch-all | Fallback redirect |

### Page-by-Page Specifications

#### 1. `LoginPage.jsx` (`frontend/src/pages/LoginPage.jsx`)
- **State:** `form` (`username`, `password`), `showPwd`, `loading`.
- **API Calls:** `loginApi({ username, password })` -> `POST /api/auth/login`.
- **Interactions:** Input fields for credentials, password visibility toggle, quick demo buttons that prefill credentials for `superadmin`, `itadmin`, `hosteladmin`, `handler1`, `handler2`, `handler3`.

#### 2. `DashboardPage.jsx` (`frontend/src/pages/DashboardPage.jsx`)
- **State:** `data` (`DashboardResponse`), `loading`.
- **API Calls:** `getDashboard()` -> `GET /api/dashboard`.
- **Visuals:** 8 Stat cards (Total, In Progress, Resolved, Escalated, New, Overdue, Closed, Rejected), Recharts Donut Pie for status breakdown, Horizontal Bar chart for categories, Vertical Bar chart for priorities, animated rate progress bars.

#### 3. `ComplaintsPage.jsx` (`frontend/src/pages/ComplaintsPage.jsx`)
- **State:** `complaints`, `meta` (page, totalPages, totalElements), `loading`, `filters` (`status`, `category`, `priority`, `search`, `page`, `size`), `showNew` (modal toggle).
- **API Calls:** `getComplaints(params)` -> `GET /api/complaints`.
- **Interactions:** Live search debounce/input, multi-select dropdowns, pagination buttons, "New Complaint" modal trigger, click row to navigate to `/complaints/:id`.

#### 4. `ComplaintDetailPage.jsx` (`frontend/src/pages/ComplaintDetailPage.jsx`)
- **State:** `complaint`, `comments`, `escalations`, `handlers`, `departments`, `loading`, modal states (`showAssign`, `showEscalate`, `showStatus`, `showResolve`), remark form inputs (`newComment`, `isInternal`).
- **API Calls:** `getComplaintById(id)`, `getComments(id)`, `getEscalations(id)`, `getHandlers()`, `getDepartments()`, `assignComplaint()`, `escalateComplaint()`, `updateStatus()`, `resolveComplaint()`, `closeComplaint()`, `addComment()`.
- **Visuals:** Breadcrumb navigation, header badges (Status, Priority, Category, SLA Countdown), Action toolbar, Tabbed sections (Overview, Details, Remarks/Comments thread, SLA & Escalations timeline, Audit history).

#### 5. `StudentsPage.jsx` (`frontend/src/pages/StudentsPage.jsx`)
- **State:** `students`, `loading`, `search`.
- **API Calls:** `getStudents()` -> `GET /api/complaints/students`.
- **Interactions:** Search bar filtering by student name, roll number, or email; "View Complaints" button navigating to `/complaints?search=<studentId>`.

#### 6. `AdminUsersPage.jsx` (`frontend/src/pages/AdminUsersPage.jsx`)
- **State:** `admins`, `departments`, `loading`, `showNew`, `form` (`username`, `email`, `fullName`, `password`, `role`, `departmentId`), `saving`.
- **API Calls:** `getAdmins()`, `getDepartments()`, `createAdmin()`.
- **Interactions:** View all system admins with role-colored badges; "Create Admin" modal.

#### 7. `AuditLogsPage.jsx` (`frontend/src/pages/AuditLogsPage.jsx`)
- **State:** `logs`, `meta`, `loading`, `page`.
- **API Calls:** `getAuditLogs({ page, size: 50 })` -> `GET /api/audit-logs`.
- **Visuals:** Chronological table displaying Timestamp, Actor, Action Badge, Target Entity, Description, and IP address.

#### 8. `SettingsPage.jsx` (`frontend/src/pages/SettingsPage.jsx`)
- **State:** `departments`, `handlers`, `loading`.
- **API Calls:** `getDepartments()`, `getHandlers()`.
- **Visuals:** Profile summary card, institution departments list with codes, complaint handler directory, and system environment info.

---

## 8. Backend Deep-Dive Documentation

### Architecture & Components

```text
com.campus.complaint
├── CampusComplaintPortalApplication.java # Spring Boot Runner (@SpringBootApplication, @EnableScheduling)
├── config/
│   ├── DataSeeder.java                  # Initial mock dataset generator
│   └── SecurityConfig.java              # Security filter chain, PasswordEncoder, CORS bean
├── controller/                          # REST Controllers (10 controllers)
├── dto/                                 # Request & Response Data Transfer Objects
├── entity/                              # JPA Entities (8 entity classes)
├── exception/                           # BusinessException, ResourceNotFoundException, GlobalExceptionHandler
├── repository/                          # Spring Data JPA Repositories (8 interfaces)
├── security/                            # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
└── service/                             # Business Services (ComplaintService, AdminService, NotificationService, AuditLogService)
```

### Services Overview

1. **`ComplaintService.java`**
   - **Responsibilities:**
     - `generateComplaintId()`: Synchronized method creating formatted IDs (`CMP-0001`, `CMP-0002`).
     - `routeToDepartment(Category)`: Maps categories to department codes.
     - `createComplaint(CreateComplaintRequest, Admin)`: Validates student, assigns department, computes SLA due date, persists complaint, and logs audit record.
     - `getAllComplaints(...)`: Constructs dynamic JPA `Specification<Complaint>` with role-based scoping (Handler sees only their assigned complaints; Dept Admin sees only their department's complaints).
     - `assignHandler()`, `updateStatus()`, `updatePriority()`, `addComment()`, `escalate()`, `resolve()`, `close()`: State mutation methods enforcing lifecycle transition rules.
     - `getDashboard(Admin)`: Aggregates metrics, overdue complaints, status/category/priority/department groupings, SLA approaching complaints.
     - `getReports()`: Aggregates high-level statistical summaries.
     - `checkSlaBreaches()`: `@Scheduled(fixedRate = 3600000)` background task notifying handlers of imminent SLA breaches (within 4 hours).

2. **`AdminService.java`**
   - **Responsibilities:**
     - Admin retrieval and validation.
     - `createAdmin(CreateAdminRequest, Admin)`: Uniqueness checks for username/email, BCrypt encoding, department linkage, audit logging.
     - `toggleActive(id, actor)`: Flips active status.
     - `deleteAdmin(id, actor)`: Deletes admin record with audit logging.

3. **`AuditLogService.java`**
   - **Responsibilities:**
     - `log(...)`: Overloaded methods to record immutable system events into `audit_logs` table.
     - `getAll(Pageable)`: Paginated audit query for Super Admins.
     - `getByComplaint(Long)`: History trail for specific complaint.

4. **`NotificationService.java`**
   - **Responsibilities:**
     - `send(Admin, Complaint, title, message, type)`: Dispatches notification to staff.
     - `getForAdmin(adminId)`, `getForAdminPaged(...)`, `countUnread(...)`: Notification query methods.
     - `markRead(notificationId)` & `markAllRead(adminId)`: Read status updates.

---

## 9. Complete API Specification

### Authentication API (`/api/auth`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Request Body | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | NO | Public | User login (Admin or Student) | `LoginRequest` (`username`, `password`) | `ApiResponse<AuthResponse>` |
| `POST` | `/api/auth/register-student` | NO | Public | Student self-registration | `RegisterStudentRequest` (`studentId`, `fullName`, `email`, `password`, `phone`, `department`, `yearOfStudy`) | `ApiResponse<AuthResponse>` |
| `GET` | `/api/auth/me` | YES | Any Authenticated | Retrieve current authenticated user profile | None | `ApiResponse<AuthResponse>` |
| `GET` | `/api/auth/health` | NO | Public | Auth health check | None | String `"OK"` |

### Core Complaints API (`/api/complaints`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Parameters / Body | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `GET` | `/api/complaints` | YES | Authenticated | Paginated, filtered complaints list | Query: `status`, `category`, `priority`, `departmentId`, `search`, `page`, `size` | `ApiResponse<Page<ComplaintResponse>>` |
| `GET` | `/api/complaints/{id}` | YES | Authenticated | Get complaint details by complaintId | Path: `id` (e.g. `CMP-0001`) | `ApiResponse<ComplaintResponse>` |
| `POST` | `/api/complaints` | YES | Authenticated | Create complaint (Staff/Admin) | `CreateComplaintRequest` (`studentId`, `title`, `description`, `category`, `priority`) | `ApiResponse<ComplaintResponse>` (HTTP 201) |
| `PUT` | `/api/complaints/{id}/assign` | YES | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Assign handler | Path: `id`, Body: `AssignComplaintRequest` (`handlerId`, `departmentId`, `note`) | `ApiResponse<ComplaintResponse>` |
| `PUT` | `/api/complaints/{id}/status` | YES | Authenticated | Update status | Path: `id`, Body: `UpdateStatusRequest` (`status`, `reason`) | `ApiResponse<ComplaintResponse>` |
| `PUT` | `/api/complaints/{id}/priority` | YES | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Change priority & recalculate SLA | Path: `id`, Body: `{"priority": "HIGH"}` | `ApiResponse<ComplaintResponse>` |
| `POST` | `/api/complaints/{id}/comments` | YES | Authenticated | Add comment | Path: `id`, Body: `AddCommentRequest` (`content`, `isInternal`) | `ApiResponse<Comment>` (HTTP 201) |
| `GET` | `/api/complaints/{id}/comments` | YES | Authenticated | Get remarks thread | Path: `id` | `ApiResponse<List<Comment>>` |
| `POST` | `/api/complaints/{id}/escalate` | YES | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Escalate complaint | Path: `id`, Body: `EscalateRequest` (`reason`, `newAssigneeId`) | `ApiResponse<ComplaintResponse>` |
| `GET` | `/api/complaints/{id}/escalations` | YES | Authenticated | Get escalation history | Path: `id` | `ApiResponse<List<Escalation>>` |
| `POST` | `/api/complaints/{id}/resolve` | YES | Authenticated | Mark resolved with note | Path: `id`, Body: `{"note": "Resolution details"}` | `ApiResponse<ComplaintResponse>` |
| `POST` | `/api/complaints/{id}/close` | YES | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Force close complaint | Path: `id` | `ApiResponse<ComplaintResponse>` |
| `GET` | `/api/complaints/students` | YES | Authenticated | Lookup student roster | None | `ApiResponse<List<Student>>` |
| `GET` | `/api/complaints/handlers` | YES | Authenticated | Lookup complaint handlers | None | `ApiResponse<List<Admin>>` |

### Dashboard & Analytics API (`/api`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Parameters | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | YES | Authenticated | Aggregated metrics & chart data | None | `ApiResponse<DashboardResponse>` |
| `GET` | `/api/reports` | YES | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | High-level reports | None | `ApiResponse<Map<String, Object>>` |
| `GET` | `/api/health` | NO | Public | Service health probe | None | String `"Campus Complaint Portal - Running"` |

### Admin Management API (`/api/admin-mgmt`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Parameters / Body | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin-mgmt` | YES | `SUPER_ADMIN` | List all staff & admins | None | `ApiResponse<List<Admin>>` |
| `GET` | `/api/admin-mgmt/{id}` | YES | `SUPER_ADMIN` | Get admin by ID | Path: `id` | `ApiResponse<Admin>` |
| `POST` | `/api/admin-mgmt` | YES | `SUPER_ADMIN` | Create new staff/admin | `CreateAdminRequest` (`username`, `email`, `password`, `fullName`, `role`, `departmentId`) | `ApiResponse<Admin>` (HTTP 201) |
| `PUT` | `/api/admin-mgmt/{id}/toggle-active`| YES | `SUPER_ADMIN` | Toggle active status | Path: `id` | `ApiResponse<Admin>` |
| `DELETE` | `/api/admin-mgmt/{id}` | YES | `SUPER_ADMIN` | Delete admin record | Path: `id` | `ApiResponse<Void>` |
| `GET` | `/api/admin-mgmt/departments` | YES | `SUPER_ADMIN` | List departments | None | `ApiResponse<List<Department>>` |

### Audit Logs API (`/api/audit-logs`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Parameters | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | YES | `SUPER_ADMIN` | Paginated system audit trail | Query: `page`, `size` | `ApiResponse<Page<AuditLog>>` |

### Notifications API (`/api/notifications`)

| Method | Endpoint | Auth Required | Authorized Roles | Purpose | Parameters | Response |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | YES | Authenticated Staff | Paginated notifications | Query: `page`, `size` | `ApiResponse<Page<Notification>>` |
| `GET` | `/api/notifications/unread-count` | YES | Authenticated Staff | Unread counter | None | `ApiResponse<Map<String, Long>>` |
| `PUT` | `/api/notifications/{id}/read` | YES | Authenticated Staff | Mark single notification read | Path: `id` | `ApiResponse<Void>` |
| `PUT` | `/api/notifications/mark-all-read` | YES | Authenticated Staff | Mark all notifications read | None | `ApiResponse<Void>` |

### Role-Specific Portal APIs

#### 1. Student Portal (`/api/student`) — Authorized: `STUDENT`
- `GET /api/student/dashboard` -> Student's metrics (`StudentDashboardResponse`).
- `GET /api/student/complaints` -> Student's complaints with pagination & filters.
- `GET /api/student/complaints/{id}` -> Specific complaint (ownership enforced).
- `POST /api/student/complaints` -> Lodge complaint (`StudentNewComplaintRequest`).
- `POST /api/student/complaints/{id}/verify` -> Verify resolution (`VerifyComplaintRequest`: `CLOSE` or `REOPEN`).
- `POST /api/student/complaints/{id}/comments` -> Add public student remark.
- `GET /api/student/profile` & `PUT /api/student/profile` -> View / update student phone/name.
- `GET /api/student/departments` -> List available departments.
- `GET /api/student/notifications` -> Returns empty list `[]`.

#### 2. Department Admin Portal (`/api/department`) — Authorized: `DEPARTMENT_ADMIN`
- `GET /api/department/dashboard` -> Department metrics.
- `GET /api/department/complaints` -> Department complaints list.
- `GET /api/department/complaints/{id}` -> Scoped complaint details.
- `PUT /api/department/complaints/{id}/assign` -> Assign department handler.
- `PUT /api/department/complaints/{id}/status` -> Update status.
- `PUT /api/department/complaints/{id}/priority` -> Update priority.
- `POST /api/department/complaints/{id}/comments` -> Add remark.
- `POST /api/department/complaints/{id}/resolve` -> Mark resolved.
- `POST /api/department/complaints/{id}/escalate` -> Escalate to Super Admin.
- `GET /api/department/handlers` -> Department complaint handlers.
- `GET /api/department/escalations` -> Department escalations.
- `GET /api/department/reports` -> Department summary.
- `GET /api/department/profile` -> Profile info.

#### 3. Complaint Handler Portal (`/api/handler`) — Authorized: `COMPLAINT_HANDLER`
- `GET /api/handler/dashboard` -> Handler's metrics.
- `GET /api/handler/complaints` -> Handler's assigned complaints.
- `GET /api/handler/complaints/{id}` -> Assigned complaint details (access verified).
- `PUT /api/handler/complaints/{id}/status` -> Update status.
- `POST /api/handler/complaints/{id}/comments` -> Add operational remarks.
- `POST /api/handler/complaints/{id}/resolve` -> Mark resolved.
- `GET /api/handler/profile` -> Profile info.

#### 4. Super Admin Portal (`/api/admin`) — Authorized: `SUPER_ADMIN`
- Specialized portal endpoints paralleling core APIs (`/api/admin/dashboard`, `/api/admin/complaints`, `/api/admin/escalations`, `/api/admin/reports`, `/api/admin/audit-logs`, `/api/admin/admin-users`, `/api/admin/departments`).

---

## 10. Database Architecture & Schema

### Entity Relationship Diagram (ASCII)

```text
       +--------------------+               +--------------------+
       |    DEPARTMENTS     |               |      STUDENTS      |
       +--------------------+               +--------------------+
       | id (PK)            |               | id (PK)            |
       | name (UQ)          |               | student_id (UQ)    |
       | code (UQ)          |               | full_name          |
       | description        |               | email (UQ)         |
       +---------+----------+               | password           |
                 |                          | phone, department  |
                 | 1:N                      | year_of_study      |
                 |                          +---------+----------+
                 v                                    |
       +--------------------+                         | 1:N
       |       ADMINS       |                         |
       +--------------------+                         |
       | id (PK)            |                         |
       | username (UQ)      |                         |
       | email (UQ)         |                         |
       | password           |                         |
       | full_name          |                         |
       | role (ENUM)        |                         |
       | department_id (FK) |                         |
       | is_active          |                         |
       +---------+----------+                         |
                 |                                    |
                 +-------------------+                |
                 | 1:N (Handler)     |                |
                 |                   v                v
                 |         +-----------------------------+
                 +-------->|         COMPLAINTS          |<-------+
                           +-----------------------------+        |
                           | id (PK)                     |        |
                           | complaint_id (UQ)           |        |
                           | student_id (FK)             |        |
                           | title, description          |        |
                           | category (ENUM)             |        |
                           | priority (ENUM)             |        |
                           | department_id (FK)          |        |
                           | assigned_handler_id (FK)    |        |
                           | status (ENUM)               |        |
                           | due_date, resolved_at       |        |
                           | closed_at, rejection_reason |        |
                           | resolution_note             |        |
                           +----+-----------+----------+-+        |
                                |           |          |          |
                           1:N  |      1:N  |     1:N  |          |
                                v           v          v          |
        +-------------------------+  +-------------+  +--------+  |
        |        COMMENTS         |  | ESCALATIONS |  | NOTIFS |  |
        +-------------------------+  +-------------+  +--------+  |
        | id (PK)                 |  | id (PK)     |  | id(PK) |  |
        | complaint_id (FK)       |  | complaint_id|  | comp_id|--+
        | admin_id (FK)           |  | escalated_by|  | admin  |
        | student_id (FK)         |  | prev_assign |  | title  |
        | author_name, author_role|  | new_assign  |  | message|
        | content, is_internal    |  | reason      |  | type   |
        +-------------------------+  +-------------+  | is_read|
                                                      +--------+
                                1:N
                                 v
                     +-----------------------+
                     |      AUDIT_LOGS       |
                     +-----------------------+
                     | id (PK)               |
                     | admin_id (FK)         |
                     | complaint_id (FK)     |
                     | action, entity_type   |
                     | old_value, new_value  |
                     | description, ip_addr  |
                     +-----------------------+
```

### Table Definitions

#### 1. `departments`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL, UNIQUE)
- `code` (VARCHAR(20), NOT NULL, UNIQUE)
- `description` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. `admins`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `username` (VARCHAR(50), NOT NULL, UNIQUE)
- `email` (VARCHAR(100), NOT NULL, UNIQUE)
- `password` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(100), NOT NULL)
- `role` (ENUM('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'COMPLAINT_HANDLER'), NOT NULL)
- `department_id` (BIGINT, FK -> `departments.id`, ON DELETE SET NULL)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

#### 3. `students`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `student_id` (VARCHAR(20), NOT NULL, UNIQUE)
- `full_name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), NOT NULL, UNIQUE)
- `password` (VARCHAR(255), NOT NULL)
- `phone` (VARCHAR(20))
- `department` (VARCHAR(100))
- `year_of_study` (INT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 4. `complaints`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `complaint_id` (VARCHAR(20), NOT NULL, UNIQUE) — e.g. `CMP-0001`
- `student_id` (BIGINT, NOT NULL, FK -> `students.id`)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (ENUM('ACADEMIC','INFRASTRUCTURE','HOSTEL','TRANSPORT','CANTEEN','IT','MAINTENANCE','SAFETY','OTHER'), NOT NULL)
- `priority` (ENUM('LOW','MEDIUM','HIGH','CRITICAL'), NOT NULL, DEFAULT 'MEDIUM')
- `department_id` (BIGINT, FK -> `departments.id`, ON DELETE SET NULL)
- `assigned_handler_id` (BIGINT, FK -> `admins.id`, ON DELETE SET NULL)
- `status` (ENUM('NEW','VALIDATING','ASSIGNED','IN_PROGRESS','RESOLVED','STUDENT_VERIFICATION','CLOSED','REJECTED','ESCALATED','REOPENED'), NOT NULL, DEFAULT 'NEW')
- `due_date` (TIMESTAMP)
- `resolved_at`, `closed_at` (TIMESTAMP)
- `rejection_reason`, `resolution_note` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 5. `comments`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `complaint_id` (BIGINT, NOT NULL, FK -> `complaints.id`, ON DELETE CASCADE)
- `admin_id` (BIGINT, FK -> `admins.id`)
- `student_id` (BIGINT, FK -> `students.id`)
- `author_name` (VARCHAR(100))
- `author_role` (VARCHAR(50))
- `content` (TEXT, NOT NULL)
- `is_internal` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)

#### 6. `escalations`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `complaint_id` (BIGINT, NOT NULL, FK -> `complaints.id`, ON DELETE CASCADE)
- `escalated_by_id` (BIGINT, NOT NULL, FK -> `admins.id`)
- `reason` (TEXT, NOT NULL)
- `previous_assignee_id` (BIGINT, FK -> `admins.id`, ON DELETE SET NULL)
- `new_assignee_id` (BIGINT, FK -> `admins.id`, ON DELETE SET NULL)
- `resolved` (BOOLEAN, DEFAULT FALSE)
- `escalated_at` (TIMESTAMP)

#### 7. `notifications`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `admin_id` (BIGINT, NOT NULL, FK -> `admins.id`, ON DELETE CASCADE)
- `complaint_id` (BIGINT, FK -> `complaints.id`, ON DELETE SET NULL)
- `title` (VARCHAR(255), NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (ENUM('ASSIGNMENT','SLA_WARNING','ESCALATION','RESOLUTION','STATUS_CHANGE','GENERAL'), DEFAULT 'GENERAL')
- `is_read` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)

#### 8. `audit_logs`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `admin_id` (BIGINT, FK -> `admins.id`, ON DELETE SET NULL)
- `complaint_id` (BIGINT, FK -> `complaints.id`, ON DELETE SET NULL)
- `action` (VARCHAR(100), NOT NULL)
- `entity_type` (VARCHAR(50))
- `old_value`, `new_value`, `description` (TEXT)
- `ip_address` (VARCHAR(50))
- `created_at` (TIMESTAMP)

### Indexes
- `idx_complaints_status` on `complaints(status)`
- `idx_complaints_category` on `complaints(category)`
- `idx_complaints_priority` on `complaints(priority)`
- `idx_complaints_department` on `complaints(department_id)`
- `idx_complaints_handler` on `complaints(assigned_handler_id)`
- `idx_complaints_created` on `complaints(created_at)`
- `idx_complaints_due_date` on `complaints(due_date)`
- `idx_notifications_admin` on `notifications(admin_id)`
- `idx_notifications_read` on `notifications(is_read)`
- `idx_audit_logs_admin` on `audit_logs(admin_id)`
- `idx_audit_logs_complaint` on `audit_logs(complaint_id)`

---

## 11. Data Models

### Summary of Primary Entities

```java
// Admin Entity
public class Admin implements UserDetails {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String fullName;
    private Role role; // SUPER_ADMIN, DEPARTMENT_ADMIN, COMPLAINT_HANDLER
    private Department department;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Student Entity
public class Student implements UserDetails {
    private Long id;
    private String studentId;
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String department;
    private Integer yearOfStudy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Complaint Entity
public class Complaint {
    private Long id;
    private String complaintId; // e.g. CMP-0001
    private Student student;
    private String title;
    private String description;
    private Category category; // ACADEMIC, INFRASTRUCTURE, HOSTEL, TRANSPORT, CANTEEN, IT, MAINTENANCE, SAFETY, OTHER
    private Priority priority; // LOW (168h), MEDIUM (72h), HIGH (24h), CRITICAL (4h)
    private Department department;
    private Admin assignedHandler;
    private Status status; // NEW, VALIDATING, ASSIGNED, IN_PROGRESS, RESOLVED, STUDENT_VERIFICATION, CLOSED, REJECTED, ESCALATED, REOPENED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private String rejectionReason;
    private String resolutionNote;
}
```

---

## 12. Authentication, Authorization & Security Audit

### Implementation Summary
- **Authentication Scheme:** Stateless JWT Bearer tokens signed with HMAC-SHA256.
- **Password Storage:** BCrypt hash via `BCryptPasswordEncoder`.
- **User Resolution:** `CustomUserDetailsService` queries `AdminRepository` (username or email), then falls back to `StudentRepository` (studentId or email).
- **Token Claims:** Subject is set to `username` or `studentId`.

### Security Audit & Vulnerabilities Identified in Current Codebase

> [!WARNING]
> **Audit Finding 1: Hardcoded Secrets in Default Configuration**  
> In `backend/src/main/resources/application.yml`:
> - Default database password is set to `Dhanush6Aarthi`.
> - Default JWT secret is hardcoded to a static Base64 string (`c2VjcmV0S2V5...`).  
> *Production remediation required via environment variable overrides.*

> [!WARNING]
> **Audit Finding 2: Student Password Nullability in JPA Entity**  
> In `Student.java`, `password` column is defined without `@Column(nullable = false)`. While `schema.sql` defines `password VARCHAR(255) NOT NULL`, in-memory tests or ORM-driven DDL could allow null passwords for student records.

> [!WARNING]
> **Audit Finding 3: Lack of Rate Limiting & Account Lockout**  
> No rate limiting exists on `/api/auth/login` or `/api/auth/register-student`, leaving authentication endpoints susceptible to brute-force attempts.

---

## 13. Environment Variables & Configuration Registry

| Variable | Purpose | Used In | Default Fallback Value | Safe to Expose? |
| :--- | :--- | :--- | :--- | :---: |
| `DB_USERNAME` | MySQL database username | `application.yml` | `root` | NO |
| `DB_PASSWORD` | MySQL database password | `application.yml` | `[SECRET PRESENT - VALUE NOT DOCUMENTED]` | NO |
| `JWT_SECRET` | 256-bit Base64 secret for JJWT | `application.yml` | `[SECRET PRESENT - VALUE NOT DOCUMENTED]` | NO |
| `PORT` | Spring Boot server listening port | `application.yml` | `8080` | YES |

---

## 14. Dependency Analysis

### Backend Dependencies (`pom.xml`)
- `org.springframework.boot:spring-boot-starter-web` (3.3.5) — REST API routing and embedded Tomcat.
- `org.springframework.boot:spring-boot-starter-data-jpa` (3.3.5) — Hibernate ORM & Spring Data repositories.
- `org.springframework.boot:spring-boot-starter-security` (3.3.5) — Authentication & authorization filters.
- `org.springframework.boot:spring-boot-starter-validation` (3.3.5) — Jakarta bean validation.
- `com.mysql:mysql-connector-j` (Runtime) — JDBC driver for MySQL.
- `io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson` — JWT creation and parsing.
- `org.projectlombok:lombok:1.18.36` — Annotations for getters/setters/constructors.
- `org.springframework.boot:spring-boot-starter-test`, `spring-security-test` — Testing runtime.

### Frontend Dependencies (`package.json`)
- `react` & `react-dom` (^18.2.0) — React UI rendering.
- `react-router-dom` (^6.23.0) — Client-side SPA routing.
- `axios` (^1.6.8) — HTTP client.
- `recharts` (^2.12.4) — SVG charting library for dashboards.
- `date-fns` (^3.6.0) — Relative date formatting.
- `react-hot-toast` (^2.4.1) — Toast notifications.
- `lucide-react` (^0.378.0) — SVG icon system.
- `vite` (^5.2.11) & `@vitejs/plugin-react` (^4.2.1) — Build tool and React compiler.

---

## 15. Execution, Build & Operational Commands

### Prerequisites
- JDK 21 installed (`java -version`)
- Maven 3.8+ or Maven wrapper (`mvn -version`)
- Node.js 18+ & NPM (`node -v`, `npm -v`)
- MySQL 8.x running on `localhost:3306`

### Step 1: Database Setup
```bash
# Log in to MySQL and run schema
mysql -u root -p < database/schema.sql
```

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
mvn clean spring-boot:run
# Server runs at http://localhost:8080
# DataSeeder automatically creates default departments, admins, students, and complaints on first startup.
```

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000 (proxies /api to http://localhost:8080)
```

### Building for Production
```bash
# Backend Jar
cd backend
mvn clean package -DskipTests
# Produces backend/target/complaint-portal-1.0.0.jar

# Frontend static bundle
cd frontend
npm run build
# Produces frontend/dist/
```

---

## 16. File-by-File Responsibility Map

*(Refer to [PROJECT_FILE_MAP.md](file:///Users/dhanushaadhikesh/Projects/Mini_Project/untitled%20folder/PROJECT_FILE_MAP.md) for the fast-lookup directory index).*

---

## 17. Dependency & Import Graphs

### Typical Complaint Mutation Request Graph
```text
ComplaintDetailPage.jsx
  ├── api/services.js (updateStatus / assignComplaint / resolveComplaint)
  │     └── api/axios.js (Attaches Authorization Header)
  │           └── Backend: PUT /api/complaints/{id}/...
  │                 └── ComplaintController
  │                       └── ComplaintService
  │                             ├── Complaint.canTransitionTo()
  │                             ├── ComplaintRepository.save()
  │                             ├── AuditLogService.log() -> AuditLogRepository
  │                             └── NotificationService.send() -> NotificationRepository
  │                                   └── MySQL Database
```

---

## 18. Complete End-to-End User Journeys

### User Journey 1: Super Admin Assigning and Resolving a Critical Issue
1. Super Admin logs in via `/login` (`superadmin` / `Admin@123`).
2. Navigates to `/complaints`, filters by `Status: NEW` and `Priority: CRITICAL`.
3. Opens complaint `CMP-0002` ("Broken water pipe in Hostel Room 204").
4. Clicks **Assign**, selects handler `Mr. Vikram Nair` (Facilities), selects Department `Facilities Management`, submits.
5. Status automatically transitions from `NEW` to `ASSIGNED`.
6. Audit log records `COMPLAINT_ASSIGNED`.
7. Assigned handler receives in-app `Notification`.
8. Once work is completed, handler or admin clicks **Mark Resolved**, inputs `"Pipe repaired and pressure tested"`.
9. Status transitions to `RESOLVED`, `resolved_at` is timestamped, resolution note saved.

### User Journey 2: Student Lodging and Verifying a Complaint
1. Student registers or logs in (`STU001` / `Student@123`).
2. Calls `POST /api/student/complaints` with category `IT` and priority `HIGH`.
3. Backend auto-routes complaint to IT Department and assigns 24-hour SLA.
4. Staff works on issue and marks it `RESOLVED`.
5. Student calls `POST /api/student/complaints/{id}/verify` with action `CLOSE` and feedback `"WiFi working perfectly now"`.
6. Complaint status transitions to `CLOSED` and `closed_at` is timestamped.

---

## 19. Current Implementation Status

| Feature / Subsystem | Status | Evidence | Notes / Gaps |
| :--- | :---: | :--- | :--- |
| **User Authentication (Staff/Admin)** | **IMPLEMENTED** | `AuthController.java`, `LoginPage.jsx` | Fully working JWT auth with role detection |
| **Student Registration & Login** | **IMPLEMENTED** | `AuthController.java` (`/register-student`) | Backend complete; UI login page lacks dedicated registration tab |
| **Complaint Intake & Auto-Routing** | **IMPLEMENTED** | `ComplaintService.java:49-60`, `NewComplaintModal.jsx` | Routes categories to depts; generates `CMP-XXXX` IDs |
| **SLA Countdown & Hourly Monitor** | **IMPLEMENTED** | `ComplaintService.java:363` (`@Scheduled`) | Background task runs hourly; UI displays SLA badges |
| **Escalation Management** | **IMPLEMENTED** | `EscalationRepository.java`, `ComplaintDetailPage.jsx` | Escalations persist and display in timeline |
| **Role-Scoped Dashboard Metrics** | **IMPLEMENTED** | `DashboardController.java`, `DashboardPage.jsx` | Recharts charts and overview stats |
| **System Audit Trail** | **IMPLEMENTED** | `AuditLogService.java`, `AuditLogsPage.jsx` | Immutable logging of state and user actions |
| **Admin User Management** | **IMPLEMENTED** | `AdminManagementController.java`, `AdminUsersPage.jsx` | Super Admin CRUD for staff |
| **Student Notification Channel** | **PLACEHOLDER** | `StudentPortalController.java:230` | Returns hardcoded empty array `[]` |
| **Mark All Notifications Read API** | **BROKEN (UI Endpoint)**| `services.js:37` vs `NotificationController.java:42` | Frontend calls `/notifications/read-all`; Backend is `/notifications/mark-all-read` |
| **Unit & Integration Tests** | **NOT IMPLEMENTED** | `backend/src/test/java` | Test directory is empty |

---

## 20. Bugs, Issues, Risks & Discrepancies

### Bug 1: Notification API Endpoint Name Mismatch
- **Severity:** Medium
- **Location:** [services.js](file:///Users/dhanushaadhikesh/Projects/Mini_Project/untitled%20folder/frontend/src/api/services.js#L37) vs [NotificationController.java](file:///Users/dhanushaadhikesh/Projects/Mini_Project/untitled%20folder/backend/src/main/java/com/campus/complaint/controller/NotificationController.java#L42)
- **Detail:** In `services.js`, `markAllNotificationsRead` invokes `api.put('/notifications/read-all')`. However, the Spring Boot backend exposes `@PutMapping("/mark-all-read")` under `@RequestMapping("/api/notifications")`. Clicking "Mark all read" in the topbar notification dropdown produces an HTTP 404/405 error.

### Bug 2: Student Notification Endpoint Stub
- **Severity:** Low
- **Location:** [StudentPortalController.java](file:///Users/dhanushaadhikesh/Projects/Mini_Project/untitled%20folder/backend/src/main/java/com/campus/complaint/controller/StudentPortalController.java#L230)
- **Detail:** The endpoint `GET /api/student/notifications` returns `ApiResponse.success(List.of())` because the `Notification` entity foreign key only binds to `admins` (`admin_id BIGINT NOT NULL`). Notifications for students are not stored in the database.

---

## 21. Hardcoded & Seed Data Registry

All initial seed data is defined in `backend/src/main/java/com/campus/complaint/config/DataSeeder.java`:

### Seeded Departments (7)
1. **IT** — Information Technology
2. **HOSTEL** — Hostel Administration
3. **TRANSPORT** — Transport Department
4. **FACILITIES** — Facilities Management
5. **ACADEMIC** — Academic Affairs
6. **SAFETY** — Safety & Security
7. **GENERAL** — General Administration

### Seeded Staff Accounts (7)
- `superadmin` / `Admin@123` (Role: `SUPER_ADMIN`, Dept: None)
- `itadmin` / `Admin@123` (Role: `DEPARTMENT_ADMIN`, Dept: IT)
- `hosteladmin` / `Admin@123` (Role: `DEPARTMENT_ADMIN`, Dept: HOSTEL)
- `handler1` / `Handler@123` (Role: `COMPLAINT_HANDLER`, Dept: IT)
- `handler2` / `Handler@123` (Role: `COMPLAINT_HANDLER`, Dept: HOSTEL)
- `handler3` / `Handler@123` (Role: `COMPLAINT_HANDLER`, Dept: FACILITIES)
- `handler4` / `Handler@123` (Role: `COMPLAINT_HANDLER`, Dept: ACADEMIC)

### Seeded Students (15)
- `STU001` through `STU015` with default password `Student@123`.

### Seeded Complaints (20)
- `CMP-0001` through `CMP-0020` spanning various statuses, priorities, categories, and SLA conditions (including overdue and SLA-approaching records).

---

## 22. External Services & Third-Party Integrations

- **External Services:** None active. The application is completely self-contained with no third-party email (SMTP), SMS, S3 object storage, or external OAuth providers configured. All operations execute locally against the Spring Boot runtime and MySQL database.

---

## 23. UI & Design System Specifications

The application uses a custom Vanilla CSS design system (`frontend/src/index.css`) built upon a dark theme with glassmorphism aesthetics.

- **Background Palette:**
  - Base: `#0a0a14`
  - Surface: `#111128`
  - Card: `#161630`
  - Elevated: `#1c1c3a`
  - Hover: `#222248`
- **Primary Brand Colors:** Indigo scale (`#6366f1` / `#4f46e5` / `#818cf8`) paired with Emerald accent (`#10b981` / `#34d399`).
- **Typography:**
  - Primary body text: `'Inter', sans-serif`
  - Brand headings: `'Outfit', sans-serif`
- **Component Styling:**
  - Badges for statuses (`.badge-new`, `.badge-inprogress`, `.badge-resolved`, `.badge-escalated`, `.badge-closed`, `.badge-rejected`).
  - Badges for priorities (`.priority-critical`, `.priority-high`, `.priority-medium`, `.priority-low`).
  - Modal dialogs with dark overlay backdrop blur (`.modal-overlay`, `.modal`).
  - Stat cards with dynamic glow colors via CSS custom properties (`--stat-color`, `--stat-bg`).

---

## 24. Project-Specific Business Logic & SLA Engine

### SLA Durations by Priority
```text
CRITICAL -> 4 Hours
HIGH     -> 24 Hours
MEDIUM   -> 72 Hours (3 Days)
LOW      -> 168 Hours (7 Days)
```

### Auto-Routing Table
```text
IT                         -> "IT" Department
HOSTEL                     -> "HOSTEL" Department
TRANSPORT                  -> "TRANSPORT" Department
INFRASTRUCTURE, MAINTENANCE-> "FACILITIES" Department
ACADEMIC                   -> "ACADEMIC" Department
SAFETY                     -> "SAFETY" Department
CANTEEN, OTHER             -> "GENERAL" Department
```

---

## 25. Important Constants, Enums & Status Transitions

### Status Transition State Machine (`Complaint.Status.canTransitionTo`)

```text
NEW                   -> VALIDATING, REJECTED
VALIDATING            -> ASSIGNED, REJECTED
ASSIGNED              -> IN_PROGRESS, ESCALATED
IN_PROGRESS           -> RESOLVED, ESCALATED
RESOLVED              -> STUDENT_VERIFICATION, IN_PROGRESS
STUDENT_VERIFICATION  -> CLOSED, REOPENED
ESCALATED             -> IN_PROGRESS, ASSIGNED
REOPENED              -> IN_PROGRESS
CLOSED                -> [TERMINAL STATE - NO TRANSITIONS]
REJECTED              -> [TERMINAL STATE - NO TRANSITIONS]
```

---

## 26. Error Handling & Exception Propagation

1. **`ResourceNotFoundException`** -> Caught by `GlobalExceptionHandler` -> Returns HTTP 404 with JSON:
   ```json
   { "success": false, "message": "Resource not found: ...", "data": null }
   ```
2. **`BusinessException`** -> Returns HTTP 400 with business violation message.
3. **`AccessDeniedException`** -> Returns HTTP 403 (`"Access denied: insufficient permissions"`).
4. **`BadCredentialsException`** -> Returns HTTP 401 (`"Invalid username or password"`).
5. **`MethodArgumentNotValidException`** -> Returns HTTP 400 with map of invalid field names and validation messages.
6. **Frontend Global Axios Interceptor** -> Intercepts HTTP 401 responses, clears `localStorage` tokens, and redirects to `/login`.

---

## 27. Testing Infrastructure

- **Current Status:** No test classes exist in `backend/src/test/java` or `frontend/`.
- **Dependencies Present:** `spring-boot-starter-test` and `spring-security-test` are present in `pom.xml`, allowing future addition of JUnit 5 and Mockito test suites.

---

## 28. Build & Deployment Architecture

- **Backend:** Packaged into an executable Spring Boot fat JAR (`complaint-portal-1.0.0.jar`) running on embedded Apache Tomcat on port 8080.
- **Frontend:** Built via `vite build` into static assets in `frontend/dist/`.
- **Local Dev Proxy:** Vite dev server on port 3000 proxies `/api` requests to `http://localhost:8080`.

---

## 29. Codebase History & Evolution Evidence

1. **Delomboked Source Files:** Header comments (`// Generated by delombok at Sat Sep 26 12:28:47 IST 2026`) across entity, service, and controller files demonstrate that Lombok annotations were expanded into explicit getter/setter/constructor Java code during development.
2. **Specialized Portal Controllers:** The presence of `SuperAdminPortalController`, `DepartmentPortalController`, `HandlerPortalController`, and `StudentPortalController` alongside `ComplaintController` and `DashboardController` reflects an architectural shift toward role-specific REST sub-APIs.

---

## 30. "How to Modify This Project" Developer Guide

### Adding a New Frontend Page
1. Create `frontend/src/pages/NewFeaturePage.jsx`.
2. Wrap content in `<Layout title="New Feature">...</Layout>`.
3. Register the route in `frontend/src/App.jsx` within `AppRoutes()` inside `<ProtectedRoute>`.
4. Add a navigation link in `frontend/src/components/layout/Layout.jsx` in the `navItems` array.
5. Define corresponding API client functions in `frontend/src/api/services.js`.

### Adding a New Backend REST Endpoint
1. If the endpoint is role-specific, add a method in the corresponding portal controller (`StudentPortalController`, `DepartmentPortalController`, `HandlerPortalController`, or `SuperAdminPortalController`). Otherwise, use `ComplaintController` or create a new `@RestController`.
2. Define request/response DTOs in `com.campus.complaint.dto.request` / `com.campus.complaint.dto.response`.
3. Implement business logic and `@Transactional` methods in `ComplaintService` or a dedicated service.
4. Add JPA repository queries in the appropriate interface under `com.campus.complaint.repository`.
5. If authorization rules apply, annotate the controller method with `@PreAuthorize("hasRole('...')")` or configure URL patterns in `SecurityConfig.java`.

### Adding a New Entity
1. Add table DDL to `database/schema.sql`.
2. Create `@Entity` class in `com.campus.complaint.entity`.
3. Create `@Repository` interface extending `JpaRepository<Entity, Long>` in `com.campus.complaint.repository`.
4. Inject the repository into the required service layer.

---

## 31. Rules for an AI Continuing This Project

1. **Treat the Inspected Workspace as Ground Truth:** Do not invent non-existent APIs, tables, or dependencies.
2. **Preserve Current Architecture:** Maintain the Spring Boot 3 layered architecture (Controller -> Service -> Repository -> Entity) and React 18 SPA structure.
3. **Respect Status Machine Rules:** Do not bypass `Complaint.Status.canTransitionTo()` when altering complaint statuses.
4. **Preserve Entity Relationships:** Maintain foreign keys on `departments`, `admins`, `students`, and `complaints`.
5. **Always Log System Mutations:** When adding new operations that alter data, invoke `auditLogService.log()` to preserve compliance auditability.
6. **Use Existing Design System:** Style all new UI components using CSS classes and variables defined in `frontend/src/index.css`.
7. **Fix Identified Discrepancies with Caution:** When correcting API mismatches (e.g., `/notifications/mark-all-read`), preserve existing route contracts.

---

## 32. AI Quick Context

```text
PROJECT NAME: Campus Complaint and Compliance Portal (campus-complaint-portal)
PROJECT PURPOSE: University complaint management, SLA tracking, category auto-routing, and audit compliance system.
CURRENT STATUS: Fully working full-stack application; core staff workflows and student APIs implemented.
TECH STACK: Java 21, Spring Boot 3.3.5, Spring Data JPA, Spring Security, MySQL 8, React 18, Vite 5, Recharts, Lucide React, Axios.
FRONTEND: React 18 SPA at frontend/src, dark glassmorphism Vanilla CSS design system, React Router 6.
BACKEND: Spring Boot 3.3.5 at backend/src, port 8080, JJWT auth, JPA with MySQL.
DATABASE: MySQL schema in database/schema.sql (8 tables: departments, admins, students, complaints, comments, escalations, notifications, audit_logs).
AUTHENTICATION: Stateless JWT Bearer token via /api/auth/login, Dual UserDetailsService (Admin & Student).
USER ROLES: SUPER_ADMIN, DEPARTMENT_ADMIN, COMPLAINT_HANDLER, STUDENT.
MAIN FEATURES: Category auto-routing, SLA countdown (4h-168h) & hourly checker, multi-role dashboards, remarks thread, escalations, audit trail.
MAIN FOLDERS: backend/, frontend/, database/, .vscode/.
IMPORTANT FILES:
  - backend/src/main/resources/application.yml
  - backend/src/main/java/com/campus/complaint/service/ComplaintService.java
  - backend/src/main/java/com/campus/complaint/config/SecurityConfig.java
  - backend/src/main/java/com/campus/complaint/config/DataSeeder.java
  - frontend/src/App.jsx
  - frontend/src/index.css
  - frontend/src/api/services.js
  - database/schema.sql
API STRUCTURE: /api/auth, /api/complaints, /api/dashboard, /api/reports, /api/admin-mgmt, /api/audit-logs, /api/notifications, /api/student, /api/department, /api/handler, /api/admin.
DATABASE STRUCTURE: departments (1:N) admins; students (1:N) complaints; admins (1:N) complaints; complaints (1:N) comments, escalations, audit_logs.
KNOWN ISSUES:
  1. Frontend services.js calls /notifications/read-all instead of /notifications/mark-all-read.
  2. GET /api/student/notifications returns a stub empty array.
  3. Default passwords & JWT secret in application.yml.
HOW TO RUN:
  1. mysql -u root -p < database/schema.sql
  2. cd backend && mvn spring-boot:run (Port 8080)
  3. cd frontend && npm install && npm run dev (Port 3000)
```

---

## 33. Source of Truth Declaration

1. **Repository Structure:** The directories `backend/`, `frontend/`, `database/`, and `.vscode/` represent the actual, complete structure.
2. **Actual Implementation:** The Java source code in `backend/src/main/java/com/campus/complaint/` and JSX code in `frontend/src/` define the true operational capabilities of the system.
3. **Actual APIs:** The endpoints exposed by the 10 Spring Boot controllers represent the definitive API surface.
4. **Actual Database:** The DDL in `database/schema.sql` and JPA entities represent the authoritative data model.
5. **Precedence Rule:** Any existing README files, outdated comments, or external specifications that contradict the inspected source code must be treated as secondary to this document and the actual codebase.
