package com.example.svmps.repository;

import com.example.svmps.entity.UserProfileUpdateRequest;
import com.example.svmps.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserProfileUpdateRequestRepository extends JpaRepository<UserProfileUpdateRequest, Long> {
    List<UserProfileUpdateRequest> findByStatus(UserProfileUpdateRequest.RequestStatus status);
    List<UserProfileUpdateRequest> findByUser(User user);
}
