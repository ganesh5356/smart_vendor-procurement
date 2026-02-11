package com.example.svmps.repository;

import com.example.svmps.entity.EmailLog;
import com.example.svmps.entity.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByStatusAndRetryCountLessThan(EmailStatus status, int maxRetries, Pageable pageable);
}
