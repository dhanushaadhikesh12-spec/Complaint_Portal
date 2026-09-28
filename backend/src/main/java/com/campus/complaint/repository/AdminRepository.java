package com.campus.complaint.repository;

import com.campus.complaint.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);
    Optional<Admin> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<Admin> findByRole(Admin.Role role);
    List<Admin> findByDepartmentId(Long departmentId);
    List<Admin> findByRoleAndDepartmentId(Admin.Role role, Long departmentId);
    List<Admin> findByDepartmentIdAndRole(Long departmentId, Admin.Role role);
    List<Admin> findByActive(boolean active);
}
