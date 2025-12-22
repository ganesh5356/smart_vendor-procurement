package com.example.svmps.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.svmps.dto.VendorDto;
import com.example.svmps.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;
    public VendorController(VendorService vendorService) { this.vendorService = vendorService; }

    @PostMapping
    public ResponseEntity<VendorDto> createVendor(@Valid @RequestBody VendorDto dto) {
        VendorDto created = vendorService.createVendor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<VendorDto> getAllVendors() { return vendorService.getAllVendors(); }

    @GetMapping("/{id}")
    public VendorDto getVendorById(@PathVariable Long id) { return vendorService.getVendorById(id); }

    @PutMapping("/{id}")
    public VendorDto updateVendor(@PathVariable Long id, @Valid @RequestBody VendorDto dto) {
        return vendorService.updateVendor(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}
