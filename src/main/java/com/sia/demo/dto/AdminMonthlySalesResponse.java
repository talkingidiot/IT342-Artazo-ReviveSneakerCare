package com.sia.demo.dto;

import java.math.BigDecimal;

public record AdminMonthlySalesResponse(
        String month,
        BigDecimal totalSales,
        long completedOrders,
        long unclaimedOrders
) {
}
