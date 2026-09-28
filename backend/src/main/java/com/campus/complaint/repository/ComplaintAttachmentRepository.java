package com.campus.complaint.repository;

import com.campus.complaint.entity.ComplaintAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, Long> {
    List<ComplaintAttachment> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
    Optional<ComplaintAttachment> findByComplaintIdAndId(Long complaintId, Long id);
}
