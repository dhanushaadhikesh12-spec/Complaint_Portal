package com.campus.complaint.repository;

import com.campus.complaint.entity.Complaint;
import com.campus.complaint.entity.Complaint.Status;
import com.campus.complaint.entity.Complaint.Category;
import com.campus.complaint.entity.Complaint.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByComplaintId(String complaintId);

    @Query("SELECT MAX(c.id) FROM Complaint c")
    Optional<Long> findMaxId();

    List<Complaint> findByStatus(Status status);
    List<Complaint> findByAssignedHandlerId(Long handlerId);
    List<Complaint> findByDepartmentId(Long departmentId);

    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('CLOSED', 'REJECTED') AND c.dueDate < :now")
    List<Complaint> findOverdueComplaints(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('CLOSED', 'REJECTED') AND c.dueDate BETWEEN :now AND :threshold")
    List<Complaint> findApproachingSla(@Param("now") LocalDateTime now, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    long countByStatus(@Param("status") Status status);

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategoryGrouped();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countByPriorityGrouped();

    @Query("SELECT c.department.name, COUNT(c) FROM Complaint c WHERE c.department IS NOT NULL GROUP BY c.department.name")
    List<Object[]> countByDepartmentGrouped();

    @Query("SELECT c FROM Complaint c ORDER BY c.createdAt DESC")
    List<Complaint> findRecentComplaints(Pageable pageable);

    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.resolvedAt)) FROM Complaint c WHERE c.resolvedAt IS NOT NULL")
    Double findAverageResolutionTimeHours();

    Page<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);
    Page<Complaint> findByAssignedHandlerIdOrderByCreatedAtDesc(Long handlerId, Pageable pageable);
    Page<Complaint> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId, Pageable pageable);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, Status status);

    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, Status status);

    long countByAssignedHandlerId(Long handlerId);
    long countByAssignedHandlerIdAndStatus(Long handlerId, Status status);
}
