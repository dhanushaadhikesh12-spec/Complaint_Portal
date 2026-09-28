package com.campus.complaint.security;

import com.campus.complaint.entity.Admin;
import com.campus.complaint.entity.Student;
import com.campus.complaint.repository.AdminRepository;
import com.campus.complaint.repository.StudentRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(AdminRepository adminRepository, StudentRepository studentRepository) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String cleanUsername = username != null ? username.trim() : "";

        Optional<Admin> admin = adminRepository.findByUsername(cleanUsername)
                .or(() -> adminRepository.findByEmail(cleanUsername));
        if (admin.isPresent()) {
            return admin.get();
        }

        Optional<Student> student = studentRepository.findByStudentIdIgnoreCase(cleanUsername);
        if (student.isPresent()) {
            return student.get();
        }

        student = studentRepository.findByEmailIgnoreCase(cleanUsername);
        if (student.isPresent()) {
            return student.get();
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
