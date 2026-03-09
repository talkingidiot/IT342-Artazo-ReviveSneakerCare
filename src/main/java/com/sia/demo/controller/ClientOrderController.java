package com.sia.demo.controller;

import com.sia.demo.dto.OrderResponse;
import com.sia.demo.model.User;
import com.sia.demo.service.CurrentUserService;
import com.sia.demo.service.OrderService;
import com.sia.demo.service.StorageService;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/client/orders")
public class ClientOrderController {
    private final CurrentUserService currentUserService;
    private final StorageService storageService;
    private final OrderService orderService;

    public ClientOrderController(
            CurrentUserService currentUserService,
            StorageService storageService,
            OrderService orderService
    ) {
        this.currentUserService = currentUserService;
        this.storageService = storageService;
        this.orderService = orderService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OrderResponse createOrder(
            @RequestPart("images") MultipartFile[] images,
            @RequestParam(value = "shoeType", required = false) String shoeType,
            @RequestParam("dropOffDate") @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dropOffDate
    ) {
        User user = currentUserService.getCurrentUser();
        List<String> imageUrls = storageService.storeImages(images);
        return orderService.createOrder(user, imageUrls, shoeType, dropOffDate);
    }

    @GetMapping
    public List<OrderResponse> myOrders() {
        User user = currentUserService.getCurrentUser();
        return orderService.getClientOrders(user);
    }

    @GetMapping("/{id}")
    public OrderResponse orderDetail(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        return orderService.getOrderForClient(id, user);
    }
}
