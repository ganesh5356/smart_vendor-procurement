package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.svmps.dto.UserDto;
import com.example.svmps.entity.Role;
import com.example.svmps.entity.User;
import com.example.svmps.entity.UserProfileUpdateRequest;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.RoleRepository;
import com.example.svmps.repository.UserProfileUpdateRequestRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final VendorService vendorService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserProfileUpdateRequestRepository userProfileUpdateRequestRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, VendorRepository vendorRepository,
            VendorService vendorService, BCryptPasswordEncoder passwordEncoder,
            UserProfileUpdateRequestRepository userProfileUpdateRequestRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vendorRepository = vendorRepository;
        this.vendorService = vendorService;
        this.passwordEncoder = passwordEncoder;
        this.userProfileUpdateRequestRepository = userProfileUpdateRequestRepository;
    }

    public UserDto createUser(UserDto dto) {
        User u = new User();
        u.setUsername(dto.getUsername());

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required for new users");
        }
        if (dto.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setEmail(dto.getEmail());
        u.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());

        // Assign roles if provided
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> userRoles = new HashSet<>();
            for (String roleName : dto.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                userRoles.add(role);
            }
            u.setRoles(userRoles);
        }

        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setUsername(dto.getUsername());
        u.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters long");
            }
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getIsActive() != null) {
            u.setIsActive(dto.getIsActive());
        }

        // 🔥 Bidirectional Sync: Keep Vendor profile in sync with User updates
        vendorRepository.findByUserId(u.getId()).ifPresent(v -> {
            if (dto.getIsActive() != null)
                v.setIsActive(u.getIsActive());
            v.setEmail(u.getEmail());
            // Optionally sync name if you want the vendor name to follow username
            // v.setName(u.getUsername() + " Company");
            vendorRepository.save(v);
        });

        // Update roles if provided
        if (dto.getRoles() != null) { // Update roles if provided (even if empty list to remove all roles)
            Set<Role> userRoles = new HashSet<>();
            boolean hadVendorRoleBefore = u.getRoles().stream().anyMatch(role -> "VENDOR".equals(role.getName()));

            for (String roleName : dto.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                userRoles.add(role);
            }
            u.setRoles(userRoles);

            // If VENDOR role is being assigned and user didn't have it before, create
            // vendor profile
            boolean hasVendorRoleNow = userRoles.stream().anyMatch(role -> "VENDOR".equals(role.getName()));
            if (hasVendorRoleNow && !hadVendorRoleBefore) {
                if (!vendorRepository.findByEmail(u.getEmail()).isPresent()) {
                    Vendor v = new Vendor();
                    v.setUser(u); // Link to the user
                    v.setName(u.getUsername() + " Company");
                    v.setEmail(u.getEmail());
                    v.setContactName(u.getUsername());
                    v.setPhone("0000000000");
                    v.setAddress("Not Provided");

                    v.setGstNumber("00AAAAA0000A0Z0");
                    v.setIsActive(true);
                    v.setCompliant(true);
                    v.setRating(5.0);
                    v.setLocation("Default");
                    v.setCategory("Default");
                    vendorRepository.save(v);
                }
            } else if (!hasVendorRoleNow && hadVendorRoleBefore) {
                // 🔥 Role removed: Delete vendor profile and all dependencies
                vendorRepository.findByUserId(u.getId()).ifPresent(v -> {
                    vendorService.deleteVendorOnly(v.getId());
                });
            }
        }

        User saved = userRepository.save(u);
        return toDto(saved);
    }

    // ================= SOFT DELETE =================
    @org.springframework.transaction.annotation.Transactional
    public void softDeleteUser(Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setIsActive(false);

        // 🔥 Sync with Vendor: Deactivate profile if exists
        vendorRepository.findByUserId(u.getId()).ifPresent(v -> {
            v.setIsActive(false);
            vendorRepository.save(v);
        });

        userRepository.save(u);
    }

    // ================= HARD DELETE =================
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 🔥 Cleanup associated Vendor profile and its data if it exists
        vendorRepository.findByUserId(u.getId()).ifPresent(v -> {
            vendorService.deleteVendorOnly(v.getId());
        });

        userRepository.delete(u);
    }

    public List<UserDto> getUsersWithNoRoles() {
        return userRepository.findByRolesIsEmpty()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public UserDto getMe(String username) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return toDto(u);
    }

    // ================= ADMIN DIRECT SELF-UPDATE =================
    @Transactional
    public UserDto updateAdminProfile(String username, UserDto dto) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            u.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            u.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return toDto(userRepository.save(u));
    }

    // ================= PR / FINANCE PROFILE UPDATE REQUEST =================
    @Transactional
    public UserProfileUpdateRequest submitProfileUpdateRequest(String username, UserDto dto) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        UserProfileUpdateRequest req = new UserProfileUpdateRequest();
        req.setUser(u);
        req.setUsername(dto.getUsername() != null && !dto.getUsername().isBlank() ? dto.getUsername() : null);
        req.setEmail(dto.getEmail() != null && !dto.getEmail().isBlank() ? dto.getEmail() : null);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            req.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        req.setStatus(UserProfileUpdateRequest.RequestStatus.PENDING);
        return userProfileUpdateRequestRepository.save(req);
    }

    public List<UserProfileUpdateRequest> getPendingUserProfileUpdates() {
        return userProfileUpdateRequestRepository.findByStatus(UserProfileUpdateRequest.RequestStatus.PENDING);
    }

    @Transactional
    public void approveUserProfileUpdate(Long requestId) {
        UserProfileUpdateRequest req = userProfileUpdateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (req.getStatus() != UserProfileUpdateRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be approved");
        }

        User u = req.getUser();
        if (req.getUsername() != null) u.setUsername(req.getUsername());
        if (req.getEmail() != null) u.setEmail(req.getEmail());
        if (req.getPassword() != null) u.setPassword(req.getPassword()); // already hashed

        userRepository.save(u);

        req.setStatus(UserProfileUpdateRequest.RequestStatus.APPROVED);
        userProfileUpdateRequestRepository.save(req);
    }

    @Transactional
    public void rejectUserProfileUpdate(Long requestId) {
        UserProfileUpdateRequest req = userProfileUpdateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (req.getStatus() != UserProfileUpdateRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be rejected");
        }

        req.setStatus(UserProfileUpdateRequest.RequestStatus.REJECTED);
        userProfileUpdateRequestRepository.save(req);
    }

    public UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setIsActive(u.getIsActive());

        // Extract role names from the user's roles
        Set<String> roleNames = u.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        dto.setRoles(roleNames);

        return dto;
    }
}
