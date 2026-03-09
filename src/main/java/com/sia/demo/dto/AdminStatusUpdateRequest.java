package com.sia.demo.dto;

import com.sia.demo.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record AdminStatusUpdateRequest(
        @NotNull OrderStatus status
) {
}
