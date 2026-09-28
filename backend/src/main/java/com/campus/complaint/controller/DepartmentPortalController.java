package com.campus.complaint.controller;

import com.campus.complaint.dto.request.AddCommentRequest;
import com.campus.complaint.dto.request.AssignComplaintRequest;
import com.campus.complaint.dto.request.EscalateRequest;
import com.campus.complaint.dto.request.UpdateStatusRequest;
import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.ComplaintResponse;
import com.campus.complaint.dto.response.DashboardResponse;
import com.campus.complaint.entity.*;
import com.campus.complaint.exception.BusinessException;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.AdminRepository;
import com.campus.complaint.repository.ComplaintRepository;
import com.campus.complaint.repository.DepartmentRepository;
import com.campus.complaint.repository.EscalationRepository;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/department")
@PreAuthorize("hasRole('DEPARTMENT_ADMIN')")
public class DepartmentPortalController {

    private final ComplaintRepository complaintRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final EscalationRepository escalationRepository;
    private final ComplaintService complaintService;

    public DepartmentPortalController(ComplaintRepository complaintRepository,
                                      AdminRepository adminRepository,
                                      DepartmentRepository departmentRepository,
                                      EscalationRepository escalationRepository,
                                      ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.adminRepository = adminRepository;
        this.departmentRepository = departmentRepository;
        this.escalationRepository = escalationRepository;
        this.complaintService = complaintService;
    }

    private void verifyDepartmentAccess(Complaint complaint, Admin actor) {
        if (actor.getDepartment() == null || complaint.getDepartment() == null ||
                !complaint.getDepartment().getId().equals(actor.getDepartment().getId())) {
            throw new BusinessException("Access Denied: You can only access complaints for your department (" +
                    (actor.getDepartment() != null ? actor.getDepartment().getName() : "Unassigned") + ")");
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getDashboard(actor)));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getDepartmentComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Admin actor) {

        Long deptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponse> result = complaintService.getAllComplaints(status, category, priority, deptId, search, actor, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintDetail(
            @PathVariable String complaintId,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);
        return ResponseEntity.ok(ApiResponse.success(ComplaintResponse.from(complaint)));
    }

    @PutMapping("/complaints/{complaintId}/assign")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignHandler(
            @PathVariable String complaintId,
            @Valid @RequestBody AssignComplaintRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        Admin handler = adminRepository.findById(req.getHandlerId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin", req.getHandlerId()));

        // Ensure handler belongs to same department or is complaint handler
        if (handler.getDepartment() != null && actor.getDepartment() != null &&
                !handler.getDepartment().getId().equals(actor.getDepartment().getId())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Handler must belong to your department"));
        }

        return ResponseEntity.ok(ApiResponse.success("Assigned successfully", complaintService.assignHandler(complaintId, req, actor)));
    }

    @PutMapping("/complaints/{complaintId}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable String complaintId,
            @Valid @RequestBody UpdateStatusRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        return ResponseEntity.ok(ApiResponse.success("Status updated", complaintService.updateStatus(complaintId, req, actor)));
    }

    @PutMapping("/complaints/{complaintId}/priority")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updatePriority(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        Complaint.Priority priority = Complaint.Priority.valueOf(body.get("priority"));
        return ResponseEntity.ok(ApiResponse.success("Priority updated", complaintService.updatePriority(complaintId, priority, actor)));
    }

    @PostMapping("/complaints/{complaintId}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable String complaintId,
            @Valid @RequestBody AddCommentRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        Comment comment = complaintService.addComment(complaintId, req, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added", comment));
    }

    @PostMapping("/complaints/{complaintId}/resolve")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolve(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        String note = body.getOrDefault("resolutionNote", "Resolved by department administrator.");
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved", complaintService.resolve(complaintId, note, actor)));
    }

    @PostMapping("/complaints/{complaintId}/escalate")
    public ResponseEntity<ApiResponse<ComplaintResponse>> escalate(
            @PathVariable String complaintId,
            @Valid @RequestBody EscalateRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyDepartmentAccess(complaint, actor);

        return ResponseEntity.ok(ApiResponse.success("Escalated to Super Admin", complaintService.escalate(complaintId, req, actor)));
    }

    @GetMapping("/handlers")
    public ResponseEntity<ApiResponse<List<Admin>>> getDepartmentHandlers(@AuthenticationPrincipal Admin actor) {
        if (actor.getDepartment() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        List<Admin> handlers = adminRepository.findByDepartmentIdAndRole(actor.getDepartment().getId(), Admin.Role.COMPLAINT_HANDLER);
        return ResponseEntity.ok(ApiResponse.success(handlers));
    }

    @GetMapping("/escalations")
    public ResponseEntity<ApiResponse<List<Escalation>>> getEscalations(@AuthenticationPrincipal Admin actor) {
        Long deptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
        List<Escalation> all = escalationRepository.findAll();
        List<Escalation> filtered = all.stream()
                .filter(e -> e.getComplaint() != null && e.getComplaint().getDepartment() != null &&
                        e.getComplaint().getDepartment().getId().equals(deptId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(filtered));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDepartmentReports(@AuthenticationPrincipal Admin actor) {
        Long deptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
        Map<String, Object> reports = new HashMap<>();
        reports.put("total", complaintRepository.countByDepartmentId(deptId));
        reports.put("department", actor.getDepartment() != null ? actor.getDepartment().getName() : "Unassigned");
        reports.put("resolved", complaintRepository.countByDepartmentIdAndStatus(deptId, Complaint.Status.RESOLVED)
                + complaintRepository.countByDepartmentIdAndStatus(deptId, Complaint.Status.CLOSED));
        reports.put("inProgress", complaintRepository.countByDepartmentIdAndStatus(deptId, Complaint.Status.IN_PROGRESS));
        reports.put("escalated", complaintRepository.countByDepartmentIdAndStatus(deptId, Complaint.Status.ESCALATED));
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Admin>> getProfile(@AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success(actor));
    }
}
