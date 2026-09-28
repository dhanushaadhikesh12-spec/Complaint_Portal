package com.campus.complaint.controller;

import com.campus.complaint.dto.request.AddCommentRequest;
import com.campus.complaint.dto.request.StudentNewComplaintRequest;
import com.campus.complaint.dto.request.VerifyComplaintRequest;
import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.ComplaintResponse;
import com.campus.complaint.dto.response.StudentDashboardResponse;
import com.campus.complaint.entity.*;
import com.campus.complaint.exception.BusinessException;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.*;
import com.campus.complaint.service.ComplaintService;
import jakarta.transaction.Transactional;
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
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentPortalController {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CommentRepository commentRepository;
    private final ComplaintService complaintService;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ComplaintFeedbackRepository feedbackRepository;
    private final StudentNotificationRepository studentNotificationRepository;
    private final com.campus.complaint.service.AttachmentService attachmentService;

    public StudentPortalController(
            ComplaintRepository complaintRepository,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            CommentRepository commentRepository,
            ComplaintService complaintService,
            ComplaintStatusHistoryRepository statusHistoryRepository,
            ComplaintFeedbackRepository feedbackRepository,
            StudentNotificationRepository studentNotificationRepository,
            com.campus.complaint.service.AttachmentService attachmentService) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.commentRepository = commentRepository;
        this.complaintService = complaintService;
        this.statusHistoryRepository = statusHistoryRepository;
        this.feedbackRepository = feedbackRepository;
        this.studentNotificationRepository = studentNotificationRepository;
        this.attachmentService = attachmentService;
    }

    private Complaint findComplaintFlexible(String idOrCode) {
        try {
            Long numericId = Long.parseLong(idOrCode);
            return complaintRepository.findById(numericId)
                    .or(() -> complaintRepository.findByComplaintId(idOrCode))
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint", idOrCode));
        } catch (NumberFormatException e) {
            return complaintRepository.findByComplaintId(idOrCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint", idOrCode));
        }
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getDashboard(
            @AuthenticationPrincipal Student student) {

        StudentDashboardResponse resp = new StudentDashboardResponse();
        resp.setTotalComplaints(complaintRepository.countByStudentId(student.getId()));
        resp.setNewComplaints(
                complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.NEW)
                + complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.VALIDATING));
        resp.setInProgressComplaints(
                complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.ASSIGNED)
                + complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.IN_PROGRESS));
        resp.setResolvedComplaints(
                complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.RESOLVED)
                + complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.STUDENT_VERIFICATION));
        resp.setClosedComplaints(
                complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.CLOSED));
        resp.setEscalatedComplaints(
                complaintRepository.countByStudentIdAndStatus(student.getId(), Complaint.Status.ESCALATED));

        Pageable top5 = PageRequest.of(0, 5);
        Page<Complaint> recent = complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId(), top5);
        resp.setRecentComplaints(recent.getContent().stream()
                .map(ComplaintResponse::from).collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    // ============================================================
    // MY COMPLAINTS
    // ============================================================
    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal Student student) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Complaint> pageResult = complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId(), pageable);

        // Apply in-memory filters (student's dataset is small)
        Page<ComplaintResponse> mapped = pageResult.map(c -> {
            if (status != null && !status.isBlank() && !c.getStatus().name().equals(status)) return null;
            if (category != null && !category.isBlank() && !c.getCategory().name().equals(category)) return null;
            if (priority != null && !priority.isBlank() && !c.getPriority().name().equals(priority)) return null;
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = c.getTitle().toLowerCase().contains(q)
                        || c.getComplaintId().toLowerCase().contains(q)
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(q));
                if (!match) return null;
            }
            return ComplaintResponse.from(c);
        });

        return ResponseEntity.ok(ApiResponse.success(mapped));
    }

    // ============================================================
    // COMPLAINT DETAIL (ownership-enforced)
    // ============================================================
    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComplaintDetail(
            @PathVariable String complaintId,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to view this complaint"));
        }

        List<ComplaintStatusHistory> history = statusHistoryRepository
                .findByComplaintIdOrderByChangedAtAsc(complaint.getId());

        // Public (non-internal) comments only
        List<Comment> comments = commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId())
                .stream().filter(c -> !c.isInternal()).collect(Collectors.toList());

        ComplaintFeedback feedback = feedbackRepository
                .findByComplaintId(complaint.getId()).orElse(null);

        List<com.campus.complaint.dto.response.ComplaintAttachmentResponse> attachments = attachmentService
                .getAttachmentsForComplaint(complaint.getId())
                .stream()
                .map(com.campus.complaint.dto.response.ComplaintAttachmentResponse::from)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        ComplaintResponse compResp = ComplaintResponse.from(complaint);
        compResp.setAttachments(attachments);
        result.put("complaint", compResp);
        result.put("statusHistory", history);
        result.put("comments", comments);
        result.put("feedback", feedback);
        result.put("attachments", attachments);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping(value = "/complaints/{complaintId}/attachments")
    public ResponseEntity<ApiResponse<com.campus.complaint.dto.response.ComplaintAttachmentResponse>> uploadStudentAttachment(
            @PathVariable String complaintId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }

        String uploader = student.getFullName() + " (" + student.getStudentId() + ")";
        com.campus.complaint.entity.ComplaintAttachment saved = attachmentService.storeAttachment(complaint, file, uploader);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Evidence uploaded", com.campus.complaint.dto.response.ComplaintAttachmentResponse.from(saved)));
    }

    // ============================================================
    // STATUS HISTORY
    // ============================================================
    @GetMapping("/complaints/{complaintId}/status-history")
    public ResponseEntity<ApiResponse<List<ComplaintStatusHistory>>> getStatusHistory(
            @PathVariable String complaintId,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }

        List<ComplaintStatusHistory> history = statusHistoryRepository
                .findByComplaintIdOrderByChangedAtAsc(complaint.getId());

        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ============================================================
    // CREATE COMPLAINT
    // ============================================================
    @PostMapping("/complaints")
    @Transactional
    public ResponseEntity<ApiResponse<ComplaintResponse>> lodgeComplaint(
            @Valid @RequestBody StudentNewComplaintRequest req,
            @AuthenticationPrincipal Student student) {

        if (req.getTitle() == null || req.getTitle().isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Title is required"));
        if (req.getDescription() == null || req.getDescription().isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Description is required"));
        if (req.getCategory() == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Category is required"));
        if (req.getPriority() == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Priority is required"));

        Complaint c = new Complaint();
        c.setComplaintId(complaintService.generateComplaintId());
        c.setStudent(student);
        c.setTitle(req.getTitle().trim());
        c.setDescription(req.getDescription().trim());
        c.setCategory(req.getCategory());
        c.setPriority(req.getPriority());
        c.setStatus(Complaint.Status.NEW);

        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        }
        if (dept == null) {
            dept = routeCategoryToDept(req.getCategory());
        }
        c.setDepartment(dept);
        c.setDueDate(LocalDateTime.now().plusHours(req.getPriority().getSlaHours()));

        Complaint saved = complaintRepository.save(c);

        // Record initial status history
        statusHistoryRepository.save(new ComplaintStatusHistory(
                saved, Complaint.Status.NEW, student.getFullName(), "STUDENT",
                "Complaint submitted by student"));

        // Student notification: submitted
        studentNotificationRepository.save(new StudentNotification(
                student, saved,
                "Complaint Submitted",
                "Your complaint \"" + saved.getTitle() + "\" has been submitted with ID " + saved.getComplaintId() + ". It is now under review.",
                StudentNotification.Type.COMPLAINT_SUBMITTED));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted with tracking ID " + saved.getComplaintId(),
                        ComplaintResponse.from(saved)));
    }

    // ============================================================
    // COMMENTS (student-visible, non-internal)
    // ============================================================
    @PostMapping("/complaints/{complaintId}/comments")
    public ResponseEntity<ApiResponse<Comment>> addStudentComment(
            @PathVariable String complaintId,
            @Valid @RequestBody AddCommentRequest req,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }

        Comment comment = new Comment();
        comment.setComplaint(complaint);
        comment.setStudent(student);
        comment.setAuthorName(student.getFullName());
        comment.setAuthorRole("STUDENT");
        comment.setContent(req.getContent());
        comment.setInternal(false);
        Comment saved = commentRepository.save(comment);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added", saved));
    }

    // ============================================================
    // STUDENT VERIFICATION (CLOSE / REOPEN)
    // ============================================================
    @PostMapping("/complaints/{complaintId}/verify")
    @Transactional
    public ResponseEntity<ApiResponse<ComplaintResponse>> verifyResolution(
            @PathVariable String complaintId,
            @Valid @RequestBody VerifyComplaintRequest req,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }

        if (complaint.getStatus() != Complaint.Status.STUDENT_VERIFICATION
                && complaint.getStatus() != Complaint.Status.RESOLVED) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Complaint is not in a verifiable state. Current status: " + complaint.getStatus()));
        }

        String action = req.getAction().toUpperCase();
        if ("CLOSE".equals(action) || "SATISFIED".equals(action)) {
            complaint.setStatus(Complaint.Status.CLOSED);
            complaint.setClosedAt(LocalDateTime.now());
            complaintRepository.save(complaint);

            statusHistoryRepository.save(new ComplaintStatusHistory(
                    complaint, Complaint.Status.CLOSED, student.getFullName(), "STUDENT",
                    "Student confirmed resolution and closed the complaint"));

            studentNotificationRepository.save(new StudentNotification(
                    student, complaint,
                    "Complaint Closed",
                    "Your complaint \"" + complaint.getTitle() + "\" has been closed. Thank you for your feedback.",
                    StudentNotification.Type.CLOSED));

        } else if ("REOPEN".equals(action) || "UNSATISFIED".equals(action)) {
            complaint.setStatus(Complaint.Status.REOPENED);
            complaintRepository.save(complaint);

            Comment c = new Comment();
            c.setComplaint(complaint);
            c.setStudent(student);
            c.setAuthorName(student.getFullName());
            c.setAuthorRole("STUDENT");
            c.setContent("Complaint reopened by student. Reason: " + (req.getFeedback() != null ? req.getFeedback() : "Issue not resolved."));
            c.setInternal(false);
            commentRepository.save(c);

            statusHistoryRepository.save(new ComplaintStatusHistory(
                    complaint, Complaint.Status.REOPENED, student.getFullName(), "STUDENT",
                    "Student indicated issue was not resolved"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid action. Must be CLOSE or REOPEN"));
        }

        Complaint updated = complaintRepository.findById(complaint.getId()).orElse(complaint);
        return ResponseEntity.ok(ApiResponse.success("Complaint updated", ComplaintResponse.from(updated)));
    }

    // ============================================================
    // FEEDBACK
    // ============================================================
    @PostMapping("/complaints/{complaintId}/feedback")
    @Transactional
    public ResponseEntity<ApiResponse<ComplaintFeedback>> submitFeedback(
            @PathVariable String complaintId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Student student) {

        Complaint complaint = findComplaintFlexible(complaintId);

        if (!complaint.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }

        if (complaint.getStatus() != Complaint.Status.CLOSED
                && complaint.getStatus() != Complaint.Status.RESOLVED
                && complaint.getStatus() != Complaint.Status.STUDENT_VERIFICATION) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Feedback can only be submitted for resolved or closed complaints"));
        }

        if (feedbackRepository.existsByComplaintIdAndStudentId(complaint.getId(), student.getId())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("You have already submitted feedback for this complaint"));
        }

        Integer rating = body.get("rating") != null ? Integer.parseInt(body.get("rating").toString()) : null;
        String feedbackText = body.get("feedbackText") != null ? body.get("feedbackText").toString() : null;

        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Rating must be between 1 and 5"));
        }

        ComplaintFeedback feedback = new ComplaintFeedback();
        feedback.setComplaint(complaint);
        feedback.setStudent(student);
        feedback.setRating(rating);
        feedback.setFeedbackText(feedbackText);
        ComplaintFeedback saved = feedbackRepository.save(feedback);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted. Thank you!", saved));
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<StudentNotification>>> getNotifications(
            @AuthenticationPrincipal Student student) {
        List<StudentNotification> notifs = studentNotificationRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId());
        return ResponseEntity.ok(ApiResponse.success(notifs));
    }

    @PutMapping("/notifications/{id}/read")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markNotificationRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Student student) {

        StudentNotification notif = studentNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", String.valueOf(id)));

        if (!notif.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Unauthorized"));
        }
        notif.setRead(true);
        studentNotificationRepository.save(notif);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/notifications/read-all")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal Student student) {
        studentNotificationRepository.markAllReadForStudent(student.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    // ============================================================
    // PROFILE
    // ============================================================
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> getProfile(@AuthenticationPrincipal Student student) {
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Student student) {

        if (body.containsKey("phone")) student.setPhone(body.get("phone"));
        if (body.containsKey("fullName") && !body.get("fullName").isBlank()) {
            student.setFullName(body.get("fullName").trim());
        }
        Student updated = studentRepository.save(student);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    // ============================================================
    // DEPARTMENTS (for complaint creation form)
    // ============================================================
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(departmentRepository.findAll()));
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private Department routeCategoryToDept(Complaint.Category category) {
        String code = switch (category) {
            case IT -> "IT";
            case HOSTEL -> "HOSTEL";
            case TRANSPORT -> "TRANSPORT";
            case INFRASTRUCTURE, MAINTENANCE, FACILITY -> "FACILITIES";
            case ACADEMIC -> "ACADEMIC";
            case SAFETY -> "SAFETY";
            default -> "GENERAL";
        };
        return departmentRepository.findByCode(code).orElse(null);
    }
}
