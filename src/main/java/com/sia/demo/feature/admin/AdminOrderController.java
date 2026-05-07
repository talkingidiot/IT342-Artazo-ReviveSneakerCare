package com.sia.demo.feature.admin;

import com.sia.demo.dto.AdminMonthlySalesResponse;
import com.sia.demo.dto.AdminQuoteRequest;
import com.sia.demo.dto.AdminStatusUpdateRequest;
import com.sia.demo.dto.OrderResponse;
import com.sia.demo.service.DtoMapper;
import com.sia.demo.service.OrderService;
import jakarta.validation.Valid;
import java.time.YearMonth;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> allOrders() {
        return orderService.getAllOrdersForAdmin();
    }

    @GetMapping("/sales/monthly")
    public AdminMonthlySalesResponse monthlySales(@RequestParam(required = false) String month) {
        YearMonth targetMonth = month == null || month.isBlank() ? YearMonth.now() : YearMonth.parse(month);
        return orderService.getMonthlySalesSummary(targetMonth);
    }

    @GetMapping("/{id}")
    public OrderResponse orderDetail(@PathVariable Long id) {
        return DtoMapper.toOrderResponse(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/quote")
    public OrderResponse updateQuote(@PathVariable Long id, @Valid @RequestBody AdminQuoteRequest req) {
        return orderService.updateQuote(id, req);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody AdminStatusUpdateRequest req) {
        return orderService.updateStatus(id, req.status());
    }
}
