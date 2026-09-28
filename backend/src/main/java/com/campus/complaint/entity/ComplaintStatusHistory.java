package com.campus.complaint.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_status_history")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ComplaintStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonIgnoreProperties({"student","assignedHandler","department","statusHistory"})
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Complaint.Status status;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    public ComplaintStatusHistory() {}

    public ComplaintStatusHistory(Complaint complaint, Complaint.Status status, String actorName, String actorRole, String note) {
        this.complaint = complaint;
        this.status = status;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.note = note;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public Complaint.Status getStatus() { return status; }
    public void setStatus(Complaint.Status status) { this.status = status; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
