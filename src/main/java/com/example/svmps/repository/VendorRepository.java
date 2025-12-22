package com.example.svmps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.svmps.entity.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByIsActiveTrue();
}
