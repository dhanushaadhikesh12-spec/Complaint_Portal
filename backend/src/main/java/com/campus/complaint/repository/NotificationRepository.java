package com.campus.complaint.repository;

import com.campus.complaint.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    Page<Notification> findByAdminIdOrderByCreatedAtDesc(Long adminId, Pageable pageable);
    long countByAdminIdAndReadFalse(Long adminId);
    List<Notification> findByAdminIdAndReadFalse(Long adminId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.admin.id = :adminId")
    void markAllReadForAdmin(@Param("adminId") Long adminId);
}
