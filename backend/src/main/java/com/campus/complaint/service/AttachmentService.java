package com.campus.complaint.service;

import com.campus.complaint.entity.Admin;
import com.campus.complaint.entity.Complaint;
import com.campus.complaint.entity.ComplaintAttachment;
import com.campus.complaint.entity.Student;
import com.campus.complaint.exception.BusinessException;
import com.campus.complaint.exception.ResourceNotFoundException;
import com.campus.complaint.repository.ComplaintAttachmentRepository;
import com.campus.complaint.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class AttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentService.class);
    private static final String UPLOAD_DIR = "uploads/attachments";
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    private final ComplaintAttachmentRepository attachmentRepository;
    private final ComplaintRepository complaintRepository;

    public AttachmentService(ComplaintAttachmentRepository attachmentRepository, ComplaintRepository complaintRepository) {
        this.attachmentRepository = attachmentRepository;
        this.complaintRepository = complaintRepository;
        initStorage();
    }

    private void initStorage() {
        try {
            Path path = Paths.get(UPLOAD_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("Created attachment upload directory at {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Failed to initialize attachment storage directory", e);
        }
    }

    public ComplaintAttachment storeAttachment(Complaint complaint, MultipartFile file, String uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("No file provided");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds 5MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("Invalid file type. Supported types: JPG, JPEG, PNG, WEBP");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "evidence.jpg";
        }

        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = originalFilename.substring(dotIdx).toLowerCase();
        } else {
            extension = contentType.contains("png") ? ".png" : (contentType.contains("webp") ? ".webp" : ".jpg");
        }

        String safeStoredName = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(UPLOAD_DIR, safeStoredName);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store physical file", e);
            throw new BusinessException("Failed to store uploaded file: " + e.getMessage());
        }

        ComplaintAttachment attachment = new ComplaintAttachment(
                complaint,
                originalFilename,
                safeStoredName,
                contentType,
                file.getSize(),
                targetPath.toString(),
                uploadedBy
        );

        return attachmentRepository.save(attachment);
    }

    public List<ComplaintAttachment> getAttachmentsForComplaint(Long complaintId) {
        return attachmentRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId);
    }

    public ComplaintAttachment getAttachment(Long complaintId, Long attachmentId) {
        return attachmentRepository.findByComplaintIdAndId(complaintId, attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", String.valueOf(attachmentId)));
    }

    public Resource loadAttachmentAsResource(ComplaintAttachment attachment) {
        Path filePath = Paths.get(attachment.getStoragePath());
        File file = filePath.toFile();
        if (!file.exists() || !file.canRead()) {
            throw new ResourceNotFoundException("Attachment file on disk", attachment.getStoredFilename());
        }
        return new FileSystemResource(file);
    }

    public boolean canUserAccessComplaint(Complaint complaint, Object principal) {
        if (principal == null) return false;

        if (principal instanceof Student student) {
            return complaint.getStudent() != null && complaint.getStudent().getId().equals(student.getId());
        }

        if (principal instanceof Admin admin) {
            if (admin.getRole() == Admin.Role.SUPER_ADMIN) {
                return true;
            }
            if (admin.getRole() == Admin.Role.DEPARTMENT_ADMIN) {
                return admin.getDepartment() != null && complaint.getDepartment() != null
                        && admin.getDepartment().getId().equals(complaint.getDepartment().getId());
            }
            if (admin.getRole() == Admin.Role.COMPLAINT_HANDLER) {
                boolean isAssigned = complaint.getAssignedHandler() != null
                        && complaint.getAssignedHandler().getId().equals(admin.getId());
                boolean sameDept = admin.getDepartment() != null && complaint.getDepartment() != null
                        && admin.getDepartment().getId().equals(complaint.getDepartment().getId());
                return isAssigned || sameDept;
            }
        }

        return false;
    }
}
