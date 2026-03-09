package com.sia.demo.dto;

import com.sia.demo.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderResponse(
        Long id,
        Long userId,
        String clientName,
        String clientEmail,
        List<String> imageUrls,
        String shoeType,
        String serviceType,
        LocalDate dropOffDate,
        BigDecimal quotedPrice,
        LocalDate estimatedCompletionDate,
        OrderStatus status,
        Instant createdAt
) {
}
