package com.campus.complaint.controller;

import com.campus.complaint.dto.request.LoginRequest;
import com.campus.complaint.dto.request.RegisterStudentRequest;
import com.campus.complaint.dto.response.ApiResponse;
import com.campus.complaint.dto.response.AuthResponse;
import com.campus.complaint.entity.Admin;
import com.campus.complaint.entity.Student;
import com.campus.complaint.repository.AdminRepository;
import com.campus.complaint.repository.StudentRepository;
import com.campus.complaint.security.JwtTokenProvider;
import com.campus.complaint.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          AdminRepository adminRepository,
                          StudentRepository studentRepository,
                          AuditLogService auditLogService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername().trim(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        Object principal = auth.getPrincipal();

        if (principal instanceof Admin admin) {
            String token = tokenProvider.generateToken(admin);
            auditLogService.log(admin, "LOGIN", "Admin logged in: " + admin.getUsername());
            AuthResponse response = new AuthResponse(
                token, admin.getId(), admin.getUsername(), admin.getEmail(),
                admin.getFullName(), admin.getRole().name(),
                admin.getDepartment() != null ? admin.getDepartment().getName() : null
            );
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } else if (principal instanceof Student student) {
            String token = tokenProvider.generateToken(student);
            AuthResponse response = new AuthResponse(
                token, student.getId(), student.getStudentId(), student.getEmail(),
                student.getFullName(), "STUDENT", student.getDepartment()
            );
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        }

        return ResponseEntity.badRequest().body(ApiResponse.error("Unknown user type"));
    }

    @PostMapping("/student-register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerStudent(@Valid @RequestBody RegisterStudentRequest req) {
        if (studentRepository.existsByStudentId(req.getStudentId().trim().toUpperCase())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Student ID already exists"));
        }
        if (studentRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already exists"));
        }

        Student student = new Student();
        student.setStudentId(req.getStudentId().trim().toUpperCase());
        student.setFullName(req.getFullName().trim());
        student.setEmail(req.getEmail().trim().toLowerCase());
        student.setPassword(passwordEncoder.encode(req.getPassword()));
        student.setPhone(req.getPhone());
        student.setDepartment(req.getDepartment());
        student.setYearOfStudy(req.getYearOfStudy() != null ? req.getYearOfStudy() : 1);
        Student saved = studentRepository.save(student);

        String token = tokenProvider.generateToken(saved);
        AuthResponse response = new AuthResponse(
            token, saved.getId(), saved.getStudentId(), saved.getEmail(),
            saved.getFullName(), "STUDENT", saved.getDepartment()
        );
        return ResponseEntity.ok(ApiResponse.success("Student registered successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }
        Object principal = auth.getPrincipal();

        if (principal instanceof Admin admin) {
            AuthResponse response = new AuthResponse(
                null, admin.getId(), admin.getUsername(), admin.getEmail(),
                admin.getFullName(), admin.getRole().name(),
                admin.getDepartment() != null ? admin.getDepartment().getName() : null
            );
            return ResponseEntity.ok(ApiResponse.success(response));
        } else if (principal instanceof Student student) {
            AuthResponse response = new AuthResponse(
                null, student.getId(), student.getStudentId(), student.getEmail(),
                student.getFullName(), "STUDENT", student.getDepartment()
            );
            return ResponseEntity.ok(ApiResponse.success(response));
        }

        return ResponseEntity.status(401).body(ApiResponse.error("User details not found"));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
