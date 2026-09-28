package com.campus.complaint.dto.request;

import com.campus.complaint.entity.Complaint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StudentNewComplaintRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Complaint.Category category;

    @NotNull(message = "Priority is required")
    private Complaint.Priority priority;

    private Long departmentId;

    public StudentNewComplaintRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Complaint.Category getCategory() { return category; }
    public void setCategory(Complaint.Category category) { this.category = category; }

    public Complaint.Priority getPriority() { return priority; }
    public void setPriority(Complaint.Priority priority) { this.priority = priority; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
}
