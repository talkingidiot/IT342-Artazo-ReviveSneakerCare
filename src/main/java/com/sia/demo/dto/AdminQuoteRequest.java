package com.sia.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminQuoteRequest(
        @NotBlank String serviceType,
        @NotNull @DecimalMin("0.00") BigDecimal quotedPrice,
        @NotNull LocalDate estimatedCompletionDate
) {
}
