package com.example.svmps.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.svmps.dto.UserDto;
import com.example.svmps.entity.User;
import com.example.svmps.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) { this.userRepository = userRepository; }

    public UserDto createUser(UserDto dto) {
        User u = new User();
        u.setUsername(dto.getUsername());
        // NOTE: In prod, hash the password. For dev/testing, plain text is OK (but insecure).
        u.setPassword(dto.getPassword());
        u.setEmail(dto.getEmail());
        u.setIsActive(dto.getIsActive() == null ? true : dto.getIsActive());
        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setUsername(dto.getUsername());
        u.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPassword(dto.getPassword());
        }
        if (dto.getIsActive() != null) {
            u.setIsActive(dto.getIsActive());
        }
        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public void deleteUser(Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(u);
    }

    public UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setIsActive(u.getIsActive());
        return dto;
    }
}
