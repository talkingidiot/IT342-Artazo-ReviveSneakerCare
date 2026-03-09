package com.sia.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageCreateRequest(
        @NotBlank @Size(max = 2000) String message
) {
}
