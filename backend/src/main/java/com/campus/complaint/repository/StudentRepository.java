package com.campus.complaint.repository;

import com.campus.complaint.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByStudentIdIgnoreCase(String studentId);
    Optional<Student> findByEmail(String email);
    Optional<Student> findByEmailIgnoreCase(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByEmail(String email);
}
