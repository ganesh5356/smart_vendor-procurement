package com.example.svmps.service;

import com.example.svmps.entity.*;
import com.example.svmps.repository.PurchaseRequisitionRepository;
import com.example.svmps.repository.ReportLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ScheduledReportService {

    private final ReportService reportService;
    private final ReportLogRepository repo;
    private final EmailService emailService;
    private final PurchaseRequisitionRepository prRepo;
    private final VendorService vendorService;

    @Value("${app.reports.email}")
    private String reportEmail;

    public ScheduledReportService(
            ReportService reportService,
            ReportLogRepository repo,
            EmailService emailService,
            PurchaseRequisitionRepository prRepo,
            VendorService vendorService) {

        this.reportService = reportService;
        this.repo = repo;
        this.emailService = emailService;
        this.prRepo = prRepo;
        this.vendorService = vendorService;
    }

    // 🔁 SEMI-ANNUAL – Runs every 182 days (approx 6 months) from startup
    @Scheduled(fixedRateString = "PT4368H") 
    public void semiAnnualReport() {
        processReport(null, ReportType.SEMI_ANNUAL);
    }

    // 🔁 ANNUAL – Runs every 365 days from startup
    @Scheduled(fixedRateString = "PT8760H")
    public void annualReport() {
        processReport(null, ReportType.ANNUAL);
    }

    public void retryReport(ReportLog log) {
        processReport(log, log.getReportType());
    }

    private void processReport(ReportLog log, ReportType type) {
        if (log == null) {
            log = new ReportLog();
            log.setReportType(type);
            log.setStatus(ReportStatus.PENDING);
            log.setGeneratedAt(LocalDateTime.now());
            log.setRetryCount(0);
        }
        repo.save(log);

        try {
            // 📊 Fetch data
            List<?> prData = prRepo.findAll();
            List<?> vendorData = vendorService.getAllVendors();

            // 📄 Generate reports
            byte[] prExcel = reportService.exportExcel("pr", prData);
            byte[] vendorExcel = reportService.exportExcel("vendor", vendorData);

            // 📎 Attachments
            Map<String, byte[]> attachments = new HashMap<>();
            attachments.put("pr-report.xlsx", prExcel);
            attachments.put("vendor-report.xlsx", vendorExcel);

            // 📧 Send email
            emailService.sendWithMultipleAttachments(
                    reportEmail,
                    type + " Procurement Reports",
                    "Attached are the PR and Vendor reports.",
                    attachments);

            log.setStatus(ReportStatus.SUCCESS);
            log.setErrorMessage(null);

        } catch (Exception e) {
            log.setStatus(ReportStatus.FAILED);
            log.setErrorMessage(e.getMessage());
        }

        repo.save(log);
    }
}
