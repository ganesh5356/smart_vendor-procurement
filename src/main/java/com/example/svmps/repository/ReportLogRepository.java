package com.example.svmps.repository;

import com.example.svmps.entity.ReportLog;
import com.example.svmps.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ReportLogRepository extends JpaRepository<ReportLog, Long> {

    List<ReportLog> findByStatusAndRetryCountLessThanOrderByGeneratedAtDesc(
            ReportStatus status,
            int retryCount,
            Pageable pageable);
}
