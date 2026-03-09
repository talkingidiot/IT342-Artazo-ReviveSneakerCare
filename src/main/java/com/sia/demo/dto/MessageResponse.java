package com.sia.demo.dto;

import com.sia.demo.model.Role;
import java.time.Instant;

public record MessageResponse(
        Long id,
        Role senderRole,
        String message,
        Instant timestamp
) {
}
