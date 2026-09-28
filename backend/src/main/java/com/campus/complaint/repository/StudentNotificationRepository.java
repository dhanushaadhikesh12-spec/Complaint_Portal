package com.campus.complaint.repository;

import com.campus.complaint.entity.StudentNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentNotificationRepository extends JpaRepository<StudentNotification, Long> {
    List<StudentNotification> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    long countByStudentIdAndReadFalse(Long studentId);

    @Modifying
    @Query("UPDATE StudentNotification n SET n.read = true WHERE n.student.id = :studentId")
    void markAllReadForStudent(@Param("studentId") Long studentId);
}
