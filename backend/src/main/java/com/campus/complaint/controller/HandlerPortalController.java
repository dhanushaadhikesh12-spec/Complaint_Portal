package com.campus.complaint.controller;

import com.campus.complaint.dto.request.AddCommentRequest;
import com.campus.complaint.dto.request.UpdateStatusRequest;
import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.ComplaintResponse;
import com.campus.complaint.dto.response.DashboardResponse;
import com.campus.complaint.entity.Admin;
import com.campus.complaint.entity.Comment;
import com.campus.complaint.entity.Complaint;
import com.campus.complaint.exception.BusinessException;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.ComplaintRepository;
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

import java.util.Map;

@RestController
@RequestMapping("/api/handler")
@PreAuthorize("hasRole('COMPLAINT_HANDLER')")
public class HandlerPortalController {

    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    public HandlerPortalController(ComplaintRepository complaintRepository,
                                   ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
    }

    private void verifyHandlerAccess(Complaint complaint, Admin actor) {
        if (complaint.getAssignedHandler() == null || !complaint.getAssignedHandler().getId().equals(actor.getId())) {
            throw new BusinessException("Access Denied: This complaint is not assigned to you.");
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getDashboard(actor)));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAssignedComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Admin actor) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponse> result = complaintService.getAllComplaints(status, category, priority, null, search, actor, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintDetail(
            @PathVariable String complaintId,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyHandlerAccess(complaint, actor);
        return ResponseEntity.ok(ApiResponse.success(ComplaintResponse.from(complaint)));
    }

    @PutMapping("/complaints/{complaintId}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable String complaintId,
            @Valid @RequestBody UpdateStatusRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyHandlerAccess(complaint, actor);

        return ResponseEntity.ok(ApiResponse.success("Status updated", complaintService.updateStatus(complaintId, req, actor)));
    }

    @PostMapping("/complaints/{complaintId}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable String complaintId,
            @Valid @RequestBody AddCommentRequest req,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyHandlerAccess(complaint, actor);

        Comment comment = complaintService.addComment(complaintId, req, actor);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Remark added", comment));
    }

    @PostMapping("/complaints/{complaintId}/resolve")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolve(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Admin actor) {

        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", complaintId));
        verifyHandlerAccess(complaint, actor);

        String note = body.getOrDefault("resolutionNote", "Issue resolved and tested by handler.");
        return ResponseEntity.ok(ApiResponse.success("Complaint marked as resolved", complaintService.resolve(complaintId, note, actor)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Admin>> getProfile(@AuthenticationPrincipal Admin actor) {
        return ResponseEntity.ok(ApiResponse.success(actor));
    }
}
