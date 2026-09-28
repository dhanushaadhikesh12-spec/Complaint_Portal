package com.campus.complaint.controller;

import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.ComplaintAttachmentResponse;
import com.campus.complaint.entity.Admin;
import com.campus.complaint.entity.Complaint;
import com.campus.complaint.entity.ComplaintAttachment;
import com.campus.complaint.entity.Student;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.ComplaintRepository;
import com.campus.complaint.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final ComplaintRepository complaintRepository;

    public AttachmentController(AttachmentService attachmentService, ComplaintRepository complaintRepository) {
        this.attachmentService = attachmentService;
        this.complaintRepository = complaintRepository;
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

    @PostMapping(value = "/{complaintId}/attachments")
    public ResponseEntity<ApiResponse<ComplaintAttachmentResponse>> uploadAttachment(
            @PathVariable String complaintId,
            @RequestParam("file") MultipartFile file) {

        Complaint complaint = findComplaintFlexible(complaintId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;

        if (!attachmentService.canUserAccessComplaint(complaint, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to upload attachments to this complaint"));
        }

        String uploader = "SYSTEM";
        if (principal instanceof Student s) {
            uploader = s.getFullName() + " (" + s.getStudentId() + ")";
        } else if (principal instanceof Admin a) {
            uploader = a.getFullName() + " (" + a.getUsername() + ")";
        }

        ComplaintAttachment saved = attachmentService.storeAttachment(complaint, file, uploader);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Evidence attachment uploaded successfully", ComplaintAttachmentResponse.from(saved)));
    }

    @GetMapping("/{complaintId}/attachments")
    public ResponseEntity<ApiResponse<List<ComplaintAttachmentResponse>>> getAttachments(
            @PathVariable String complaintId) {

        Complaint complaint = findComplaintFlexible(complaintId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;

        if (!attachmentService.canUserAccessComplaint(complaint, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to view attachments for this complaint"));
        }

        List<ComplaintAttachmentResponse> responses = attachmentService.getAttachmentsForComplaint(complaint.getId())
                .stream()
                .map(ComplaintAttachmentResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{complaintId}/attachments/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String complaintId,
            @PathVariable Long attachmentId) {

        Complaint complaint = findComplaintFlexible(complaintId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;

        if (principal != null && !"anonymousUser".equals(principal) && !attachmentService.canUserAccessComplaint(complaint, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ComplaintAttachment attachment = attachmentService.getAttachment(complaint.getId(), attachmentId);
        Resource resource = attachmentService.loadAttachmentAsResource(attachment);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (attachment.getFileType() != null) {
            try {
                mediaType = MediaType.parseMediaType(attachment.getFileType());
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getOriginalFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600, must-revalidate")
                .body(resource);
    }
}
