package com.campus.complaint.repository;

import com.campus.complaint.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditLog> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
    List<AuditLog> findByAdminIdOrderByCreatedAtDesc(Long adminId);
}
