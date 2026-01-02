package com.example.svmps.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.svmps.entity.ApprovalHistory;

public interface ApprovalHistoryRepository
        extends JpaRepository<ApprovalHistory, Long> {

    List<ApprovalHistory> findByPrId(Long prId);
}
