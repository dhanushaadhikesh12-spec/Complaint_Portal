package com.campus.complaint.dto.response;

import com.campus.complaint.entity.ComplaintAttachment;
import java.time.LocalDateTime;

public class ComplaintAttachmentResponse {
    private Long id;
    private Long complaintId;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private String url;

    public ComplaintAttachmentResponse() {
    }

    public static ComplaintAttachmentResponse from(ComplaintAttachment attachment) {
        ComplaintAttachmentResponse r = new ComplaintAttachmentResponse();
        r.setId(attachment.getId());
        r.setComplaintId(attachment.getComplaint().getId());
        r.setOriginalFilename(attachment.getOriginalFilename());
        r.setFileType(attachment.getFileType());
        r.setFileSize(attachment.getFileSize());
        r.setUploadedBy(attachment.getUploadedBy());
        r.setCreatedAt(attachment.getCreatedAt());
        r.setUrl("/api/complaints/" + attachment.getComplaint().getId() + "/attachments/" + attachment.getId());
        return r;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFileUrl() {
        return url;
    }

    public String getFileName() {
        return originalFilename;
    }
}
