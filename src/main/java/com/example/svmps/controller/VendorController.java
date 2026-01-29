package com.example.svmps.controller;

import java.util.List;
import java.security.Principal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    // CREATE VENDOR → ADMIN, PROCUREMENT
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT')")
    public ResponseEntity<VendorDto> createVendor(
            @Valid @RequestBody VendorDto dto) {

        VendorDto created = vendorService.createVendor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET ALL VENDORS → ADMIN, PROCUREMENT, FINANCE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public List<VendorDto> getAllVendors() {
        return vendorService.getAllVendors();
    }

    // GET VENDOR BY ID → ADMIN, PROCUREMENT, FINANCE, VENDOR
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE','VENDOR')")
    public VendorDto getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id);
    }

    // UPDATE VENDOR → ADMIN, PROCUREMENT, VENDOR (own profile)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','VENDOR')")
    public VendorDto updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorDto dto) {

        return vendorService.updateVendor(id, dto);
    }

    // SOFT DELETE → ADMIN, PROCUREMENT, FINANCE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public ResponseEntity<String> softDeleteVendor(@PathVariable Long id) {
        vendorService.softDeleteVendor(id);
        return ResponseEntity.ok("Vendor soft deleted successfully");
    }

    // HARD DELETE → ADMIN ONLY
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> hardDeleteVendor(@PathVariable Long id) {
        vendorService.hardDeleteVendor(id);
        return ResponseEntity.ok("Vendor permanently deleted");
    }

    // SEARCH → ADMIN, PROCUREMENT, FINANCE
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT','FINANCE')")
    public Page<VendorDto> searchVendors(
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean compliant,
            @RequestParam(required = false) Boolean isActive,
            Pageable pageable) {

        return vendorService.searchVendors(
                rating, location, category, compliant, isActive, pageable);
    }

    // 🔥 NEW: MAPPING USERNAME TO VENDOR ID
    @GetMapping("/me/id")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Long> getMyVendorId(Principal principal) {
        return ResponseEntity.ok(vendorService.getVendorIdByUsername(principal.getName()));
    }
}
