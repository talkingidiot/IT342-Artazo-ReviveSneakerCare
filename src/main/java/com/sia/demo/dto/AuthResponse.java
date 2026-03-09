package com.sia.demo.dto;

import com.sia.demo.model.Role;

public record AuthResponse(
        String token,
        Role role,
        String name,
        String email
) {
}
