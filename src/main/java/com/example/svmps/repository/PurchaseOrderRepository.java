package com.example.svmps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.svmps.entity.PurchaseOrder;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    // Existing usage (by PR)
    List<PurchaseOrder> findByPrId(Long prId);

    // 🔥 REQUIRED: Vendor should see ONLY their own POs
    @Query("""
        SELECT po
        FROM PurchaseOrder po
        JOIN PurchaseRequisition pr ON po.prId = pr.id
        WHERE pr.vendor.id = :vendorId
    """)
    List<PurchaseOrder> findByVendorId(@Param("vendorId") Long vendorId);
}
