package com.example.svmps.service;

import com.example.svmps.dto.LoginRequest;
import com.example.svmps.dto.LoginResponse;
import com.example.svmps.dto.RegisterRequest;
import com.example.svmps.dto.RegisterResponse;
import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.security.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            VendorRepository vendorRepository,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vendorRepository = vendorRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * ===============================
     * REGISTER (NO EXPIRATION IN RESPONSE)
     * ===============================
     */
    public RegisterResponse register(RegisterRequest req) {

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setIsActive(true);

        Set<Role> assignedRoles = new HashSet<>();

        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            for (String roleName : req.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() ->
                                new IllegalArgumentException("Role not found: " + roleName));
                assignedRoles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName("VENDOR")
                    .orElseThrow(() ->
                            new IllegalStateException("Default role VENDOR not found"));
            assignedRoles.add(defaultRole);
        }

        user.setRoles(assignedRoles);
        User savedUser = userRepository.save(user);

        // 🔥 If VENDOR role is assigned, create a Vendor profile
        if (assignedRoles.stream().anyMatch(r -> "VENDOR".equals(r.getName()))) {
            if (!vendorRepository.findByEmail(savedUser.getEmail()).isPresent()) {
                Vendor v = new Vendor();
                v.setName(savedUser.getUsername() + " Company");
                v.setEmail(savedUser.getEmail());
                v.setContactName(savedUser.getUsername());
                v.setPhone(req.getPhone() != null && !req.getPhone().isBlank() ? req.getPhone() : "0000000000");
                v.setAddress("Not Provided");
                v.setGstNumber("00AAAAA0000A0Z0");
                v.setIsActive(true);
                v.setCompliant(true);
                v.setRating(5.0);
                v.setLocation(req.getLocation() != null && !req.getLocation().isBlank() ? req.getLocation() : "Default");
                v.setCategory(req.getCategory() != null && !req.getCategory().isBlank() ? req.getCategory() : "Default");
                vendorRepository.save(v);
            }
        }

        String token = jwtUtil.generateToken(
                savedUser.getUsername(),
                savedUser.getRoles()
        );

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                token
        );
    }

    /**
     * ===============================
     * LOGIN (WITH EXPIRATION)
     * ===============================
     */
    public LoginResponse login(LoginRequest req) {

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("User account is inactive");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRoles()
        );

        Instant expiresAt = Instant.now()
                .plusMillis(jwtUtil.getExpirationTimeMs());

        return new LoginResponse(token, expiresAt, user.getId());
    }
}
