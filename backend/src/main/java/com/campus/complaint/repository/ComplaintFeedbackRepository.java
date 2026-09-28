package com.campus.complaint.repository;

import com.campus.complaint.entity.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, Long> {
    Optional<ComplaintFeedback> findByComplaintId(Long complaintId);
    boolean existsByComplaintIdAndStudentId(Long complaintId, Long studentId);
}
