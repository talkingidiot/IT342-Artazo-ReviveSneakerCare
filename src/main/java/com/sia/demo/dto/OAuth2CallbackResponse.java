package com.sia.demo.dto;

import com.sia.demo.model.Role;

public record OAuth2CallbackResponse(
        String token,
        Role role,
        String name,
        String email,
        String provider,
        String avatarUrl
) {
}
