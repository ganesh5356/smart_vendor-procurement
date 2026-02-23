package com.example.svmps.service;

import com.example.svmps.entity.*;
import com.example.svmps.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class RoleRequestService {

    private final RoleSelectionRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final DocumentRepository documentRepository;

    public RoleRequestService(RoleSelectionRequestRepository requestRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            VendorRepository vendorRepository,
            DocumentRepository documentRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vendorRepository = vendorRepository;
        this.documentRepository = documentRepository;
    }

    public RoleSelectionRequest submitRequest(
            User user,
            String roleName,
            String fullName,
            String email,
            String phone,
            String location,
            String category,
            String gstNumber,
            String address,
            Double rating,
            String details,
            MultipartFile file) throws IOException {

        System.out.println("Submitting role request for user: " + user.getUsername() + ", role: " + roleName);

        // Validate file type
        String contentType = file.getContentType();
        System.out.println("File content type: " + contentType);
        if (contentType == null
                || (!contentType.equalsIgnoreCase("image/jpeg") && !contentType.equalsIgnoreCase("image/jpg"))) {
            throw new IllegalArgumentException("Only JPG format is allowed. Received: " + contentType);
        }

        try {
            // Create and save Document
            Document document = new Document();
            document.setName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setData(file.getBytes());
            document = documentRepository.save(document);

            RoleSelectionRequest request = new RoleSelectionRequest();
            request.setUser(user);
            request.setRequestedRole(roleName.toUpperCase());
            request.setFullName(fullName);
            request.setEmail(email);
            request.setPhoneNumber(phone);

            // Vendor specific
            if ("VENDOR".equalsIgnoreCase(roleName)) {
                request.setLocation(location);
                request.setCategory(category);
                request.setGstNumber(gstNumber);
                request.setAddress(address);
                request.setRating(rating);
            }

            request.setAdditionalDetails(details);
            request.setDocument(document);
            request.setStatus(RoleSelectionRequest.RequestStatus.PENDING);

            System.out.println("Saving request to database...");
            return requestRepository.save(request);
        } catch (Exception e) {
            System.err.println("Error during role request submission: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public RoleSelectionRequest getLatestRequest(User user) {
        return requestRepository.findFirstByUserOrderByCreatedAtDesc(user).orElse(null);
    }

    public List<RoleSelectionRequest> getPendingRequests() {
        return requestRepository.findByStatus(RoleSelectionRequest.RequestStatus.PENDING);
    }

    public RoleSelectionRequest approveRequest(Long requestId) {
        RoleSelectionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() != RoleSelectionRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not in PENDING status");
        }

        User user = request.getUser();
        Role role = roleRepository.findByName(request.getRequestedRole())
                .orElseGet(() -> roleRepository.save(new Role(request.getRequestedRole())));

        user.addRole(role);
        userRepository.save(user);

        // Sync to Vendors table if role is VENDOR
        if ("VENDOR".equalsIgnoreCase(request.getRequestedRole())) {
            syncToVendor(request);
        }

        request.setStatus(RoleSelectionRequest.RequestStatus.APPROVED);
        return requestRepository.save(request);
    }

    private void syncToVendor(RoleSelectionRequest request) {
        User user = request.getUser();
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElse(new Vendor());

        vendor.setUser(user);
        vendor.setName(request.getFullName() != null ? request.getFullName() : user.getUsername() + " Company");
        vendor.setContactName(request.getFullName() != null ? request.getFullName() : user.getUsername());
        vendor.setEmail(request.getEmail() != null ? request.getEmail() : user.getEmail());
        vendor.setPhone(request.getPhoneNumber());
        vendor.setAddress(request.getAddress());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setLocation(request.getLocation());
        vendor.setCategory(request.getCategory());
        vendor.setRating(request.getRating() != null ? request.getRating() : 5.0);
        vendor.setIsActive(true);
        vendor.setCompliant(true);

        vendorRepository.save(vendor);
        System.out.println("DEBUG: Synchronized vendor profile for user: " + user.getUsername());
    }

    public RoleSelectionRequest rejectRequest(Long requestId) {
        RoleSelectionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() != RoleSelectionRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not in PENDING status");
        }

        request.setStatus(RoleSelectionRequest.RequestStatus.REJECTED);
        return requestRepository.save(request);
    }
}
