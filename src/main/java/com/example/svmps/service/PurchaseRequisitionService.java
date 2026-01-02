package com.example.svmps.service;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.PurchaseRequisitionDto;
import com.example.svmps.entity.ApprovalHistory;
import com.example.svmps.entity.PurchaseOrder;
import com.example.svmps.entity.PurchaseRequisition;
import com.example.svmps.entity.Vendor;
import com.example.svmps.repository.ApprovalHistoryRepository;
import com.example.svmps.repository.PurchaseOrderRepository;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.UserRepository;
import com.example.svmps.repository.VendorRepository;
import com.example.svmps.util.PrStatus;

@Service
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepository prRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository poRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;

    public PurchaseRequisitionService(
            PurchaseRequisitionRepository prRepository,
            VendorRepository vendorRepository,
            UserRepository userRepository,
            PurchaseOrderRepository poRepository,
            ApprovalHistoryRepository approvalHistoryRepository) {

        this.prRepository = prRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.poRepository = poRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
    }

    // ================= CREATE PR =================
    public PurchaseRequisitionDto createPr(PurchaseRequisitionDto dto) {

        if (prRepository.existsByPrNumber(dto.getPrNumber())) {
            throw new RuntimeException("PR number already exists");
        }

        if (!userRepository.existsById(dto.getRequesterId())) {
            throw new RuntimeException("Requester not found");
        }

        PurchaseRequisition pr = new PurchaseRequisition();
        pr.setPrNumber(dto.getPrNumber());
        pr.setRequesterId(dto.getRequesterId());
        pr.setTotalAmount(dto.getTotalAmount());
        pr.setStatus(PrStatus.DRAFT);

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        pr.setVendor(vendor);

        return toDto(prRepository.save(pr));
    }

    // ================= SUBMIT =================
    public PurchaseRequisitionDto submitPr(Long id) {
        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.DRAFT.equals(pr.getStatus())) {
            throw new RuntimeException("Only DRAFT PRs can be submitted");
        }

        pr.setStatus(PrStatus.SUBMITTED);
        return toDto(prRepository.save(pr));
    }

    // ================= APPROVE =================
    public PurchaseRequisitionDto approvePr(Long id, String comments, Long approverId) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.SUBMITTED.equals(pr.getStatus())) {
            throw new RuntimeException("Only SUBMITTED PRs can be approved");
        }

        pr.setStatus(PrStatus.APPROVED);
        prRepository.save(pr);

        saveHistory(id, approverId, "APPROVED", comments);
        createPoForApprovedPr(pr);

        return toDto(pr);
    }

    // ================= REJECT =================
    public PurchaseRequisitionDto rejectPr(Long id, String comments, Long approverId) {

        PurchaseRequisition pr = getPr(id);

        if (!PrStatus.SUBMITTED.equals(pr.getStatus())) {
            throw new RuntimeException("Only SUBMITTED PRs can be rejected");
        }

        pr.setStatus(PrStatus.REJECTED);
        prRepository.save(pr);

        saveHistory(id, approverId, "REJECTED", comments);

        return toDto(pr);
    }

    // ================= HELPERS =================
    private PurchaseRequisition getPr(Long id) {
        return prRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PR not found"));
    }

    private void saveHistory(Long prId, Long approverId, String action, String comments) {
        ApprovalHistory history = new ApprovalHistory();
        history.setPrId(prId);
        history.setApproverId(approverId);
        history.setAction(action);
        history.setComments(comments);
        approvalHistoryRepository.save(history);
    }

    private void createPoForApprovedPr(PurchaseRequisition pr) {
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + System.currentTimeMillis());
        po.setPr(pr);
        po.setVendor(pr.getVendor());
        po.setTotalAmount(pr.getTotalAmount());
        po.setStatus("DRAFT");
        poRepository.save(po);
    }

    private PurchaseRequisitionDto toDto(PurchaseRequisition pr) {
        PurchaseRequisitionDto dto = new PurchaseRequisitionDto();
        dto.setId(pr.getId());
        dto.setPrNumber(pr.getPrNumber());
        dto.setRequesterId(pr.getRequesterId());
        dto.setVendorId(pr.getVendor().getId());
        dto.setStatus(pr.getStatus());
        dto.setTotalAmount(pr.getTotalAmount());
        return dto;
    }
}
