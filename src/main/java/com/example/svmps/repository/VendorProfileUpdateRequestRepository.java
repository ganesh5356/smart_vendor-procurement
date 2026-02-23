package com.example.svmps.repository;

import com.example.svmps.entity.VendorProfileUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorProfileUpdateRequestRepository extends JpaRepository<VendorProfileUpdateRequest, Long> {
    List<VendorProfileUpdateRequest> findByStatus(VendorProfileUpdateRequest.RequestStatus status);
}
