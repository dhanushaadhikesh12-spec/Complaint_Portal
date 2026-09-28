package com.campus.complaint.controller;

import com.campus.complaint.dto.request.AssignComplaintRequest;
import com.campus.complaint.dto.request.CreateAdminRequest;
import com.campus.complaint.dto.request.CreateComplaintRequest;
import com.campus.complaint.dto.request.EscalateRequest;
import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.ComplaintResponse;
import com.campus.complaint.dto.response.DashboardResponse;
import com.campus.complaint.entity.*;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.AdminRepository;
import com.campus.complaint.repository.AuditLogRepository;
import com.campus.complaint.repository.ComplaintRepository;
import com.campus.complaint.repository.DepartmentRepository;
import com.campus.complaint.repository.EscalationRepository;
import com.campus.complaint.service.AdminService;
import com.campus.complaint.service.AuditLogService;
import com.campus.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminPortalController {

    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;
    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final EscalationRepository escalationRepository;
    private final AuditLogRepository auditLogRepository;

    public SuperAdminPortalController(ComplaintService complaintService,
                                     ComplaintRepository complaintRepository,
                                     AdminService adminService,
                                     AdminRepository adminRepository,
                                     DepartmentRepository departmentRepository,
                                     EscalationRepository escalationRepository,
                                     AuditLogRepository auditLogRepository) {
        this.complaintService = complaintService;
        this.complaintRepository = complaintRepository;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.departmentRepository = departmentRepository;
        this.escalationRepository = escalationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getDashboard(actor)));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAllComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Admin actor) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponse> result = complaintService.getAllComplaints(status, category, priority, departmentId, search, actor, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintDetail(@PathVariable String complaintId) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getById(complaintId)));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody CreateComplaintRequest req,
            @AuthenticationPrincipal Admin actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Created", complaintService.createComplaint(req, actor)));
    }

    @PutMapping("/complaints/{complaintId}/assign")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assign(
            @PathVariable String complaintId,
            @Valid @RequestBody AssignComplaintRequest req,
            @AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success("Assigned", complaintService.assignHandler(complaintId, req, actor)));
    }

    @PutMapping("/complaints/{complaintId}/priority")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updatePriority(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Admin actor) {
        Complaint.Priority p = Complaint.Priority.valueOf(body.get("priority"));
        return ResponseEntity.ok(ApiResponse.success("Priority updated", complaintService.updatePriority(complaintId, p, actor)));
    }

    @PostMapping("/complaints/{complaintId}/escalate")
    public ResponseEntity<ApiResponse<ComplaintResponse>> escalate(
            @PathVariable String complaintId,
            @Valid @RequestBody EscalateRequest req,
            @AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success("Escalated", complaintService.escalate(complaintId, req, actor)));
    }

    @GetMapping("/escalations")
    public ResponseEntity<ApiResponse<List<Escalation>>> getEscalations() {
        return ResponseEntity.ok(ApiResponse.success(escalationRepository.findAll()));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getReports()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogRepository.findAll(PageRequest.of(page, size))));
    }

    @GetMapping("/admin-users")
    public ResponseEntity<ApiResponse<List<Admin>>> getAdmins() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllAdmins()));
    }

    @PostMapping("/admin-users")
    public ResponseEntity<ApiResponse<Admin>> createAdmin(
            @Valid @RequestBody CreateAdminRequest req,
            @AuthenticationPrincipal Admin actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Admin created", adminService.createAdmin(req, actor)));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.findAll()));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@RequestBody Map<String, String> body) {
        Department d = new Department();
        d.setName(body.get("name"));
        d.setCode(body.get("code"));
        d.setDescription(body.get("description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created", departmentRepository.save(d)));
    }
}
