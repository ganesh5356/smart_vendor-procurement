package com.example.svmps.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.repository.UserRepository;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;

    public VendorService(
            VendorRepository vendorRepository,
            PurchaseRequisitionRepository purchaseRequisitionRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository) {

        this.vendorRepository = vendorRepository;
        this.purchaseRequisitionRepository = purchaseRequisitionRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
    }

    // ================= CREATE =================
    public VendorDto createVendor(VendorDto dto) {

        Vendor v = new Vendor();
        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());
        v.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());

        v.setRating(dto.getRating());
        v.setLocation(dto.getLocation());
        v.setCategory(dto.getCategory());
        v.setCompliant(dto.getCompliant());

        return toDto(vendorRepository.save(v));
    }

    // ================= READ ALL (ACTIVE ONLY) =================
    public List<VendorDto> getAllVendors() {

        return vendorRepository.findByIsActiveTrue()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ================= READ BY ID =================
    @Transactional(readOnly = true)
    public VendorDto getVendorById(Long id) {

        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        return toDto(v);
    }

    // ================= UPDATE =================
    public VendorDto updateVendor(Long id, VendorDto dto) {

        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        v.setName(dto.getName());
        v.setContactName(dto.getContactName());
        v.setEmail(dto.getEmail());
        v.setPhone(dto.getPhone());
        v.setAddress(dto.getAddress());
        v.setGstNumber(dto.getGstNumber());

        if (dto.getIsActive() != null) {
            v.setIsActive(dto.getIsActive());
        }

        v.setRating(dto.getRating());
        v.setLocation(dto.getLocation());
        v.setCategory(dto.getCategory());
        v.setCompliant(dto.getCompliant());

        return toDto(vendorRepository.save(v));
    }

    // ================= SOFT DELETE =================
    public void softDeleteVendor(Long id) {

        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        v.setIsActive(false);
        vendorRepository.save(v);
    }

    // ================= HARD DELETE (ADMIN ONLY) =================
    @Transactional
    public void hardDeleteVendor(Long id) {

        Vendor v = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        List<PurchaseRequisition> prs =
                purchaseRequisitionRepository.findByVendorId(id);

        for (PurchaseRequisition pr : prs) {
            List<PurchaseOrder> pos =
                    purchaseOrderRepository.findByPrId(pr.getId());
            if (!pos.isEmpty()) {
                purchaseOrderRepository.deleteAll(pos);
            }
        }

        if (!prs.isEmpty()) {
            purchaseRequisitionRepository.deleteAll(prs);
        }

        vendorRepository.delete(v);
    }

    // ================= 🔥 NEW METHOD (IMPORTANT) =================
    // Used to map JWT username → vendorId
    @Transactional
    public Long getVendorIdByUsername(String username) {

        // 1. Find user to get their email
        com.example.svmps.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 2. Find vendor by that email
        Optional<Vendor> vendorOpt = vendorRepository.findByEmail(user.getEmail());
        
        if (vendorOpt.isPresent()) {
            return vendorOpt.get().getId();
        }

        // 3. Fallback: If they have VENDOR role but no profile, create one on the fly
        boolean isVendor = user.getRoles().stream().anyMatch(r -> "VENDOR".equals(r.getName()));
        if (isVendor) {
            Vendor v = new Vendor();
            v.setName(user.getUsername() + " Company");
            v.setEmail(user.getEmail());
            v.setContactName(user.getUsername());
            v.setIsActive(true);
            v.setCompliant(true);
            v.setRating(5.0);
            v.setLocation("Default");
            v.setCategory("Default");
            return vendorRepository.save(v).getId();
        }

        throw new RuntimeException("No vendor profile associated with email: " + user.getEmail());
    }

    // ================= SEARCH =================
    public Page<VendorDto> searchVendors(
            Double rating, String location, String category,
            Boolean compliant, Pageable pageable) {

        var spec = com.example.svmps.specification.VendorSpecification
                .hasRating(rating)
                .and(com.example.svmps.specification.VendorSpecification.hasLocation(location))
                .and(com.example.svmps.specification.VendorSpecification.hasCategory(category))
                .and(com.example.svmps.specification.VendorSpecification.isCompliant(compliant));

        return vendorRepository.findAll(spec, pageable)
                .map(this::toDto);
    }

    // ================= DTO MAPPER =================
    private VendorDto toDto(Vendor v) {

        VendorDto dto = new VendorDto();
        dto.setId(v.getId());
        dto.setName(v.getName());
        dto.setContactName(v.getContactName());
        dto.setEmail(v.getEmail());
        dto.setPhone(v.getPhone());
        dto.setAddress(v.getAddress());
        dto.setGstNumber(v.getGstNumber());
        dto.setIsActive(v.getIsActive());
        dto.setRating(v.getRating());
        dto.setLocation(v.getLocation());
        dto.setCategory(v.getCategory());
        dto.setCompliant(v.getCompliant());

        return dto;
    }
}
