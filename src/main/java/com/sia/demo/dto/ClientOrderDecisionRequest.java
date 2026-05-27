package com.sia.demo.dto;

import jakarta.validation.constraints.NotNull;

public record ClientOrderDecisionRequest(
        @NotNull Boolean approved
) {
}
