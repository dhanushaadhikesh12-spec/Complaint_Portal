package com.campus.complaint.repository;

import com.campus.complaint.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    List<Escalation> findByComplaintIdOrderByEscalatedAtDesc(Long complaintId);
    List<Escalation> findByResolvedFalse();
    long countByResolvedFalse();
}
