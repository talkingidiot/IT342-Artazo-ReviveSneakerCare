package com.sia.demo.controller;

import com.sia.demo.dto.MessageCreateRequest;
import com.sia.demo.dto.MessageResponse;
import com.sia.demo.model.Order;
import com.sia.demo.model.User;
import com.sia.demo.service.CurrentUserService;
import com.sia.demo.service.MessageService;
import com.sia.demo.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/{orderId}/messages")
public class OrderMessageController {
    private final CurrentUserService currentUserService;
    private final OrderService orderService;
    private final MessageService messageService;

    public OrderMessageController(
            CurrentUserService currentUserService,
            OrderService orderService,
            MessageService messageService
    ) {
        this.currentUserService = currentUserService;
        this.orderService = orderService;
        this.messageService = messageService;
    }

    @GetMapping
    public List<MessageResponse> listMessages(@PathVariable Long orderId) {
        User user = currentUserService.getCurrentUser();
        Order order = orderService.getOrderForChat(orderId, user);
        return messageService.getMessages(order);
    }

    @PostMapping
    public MessageResponse addMessage(@PathVariable Long orderId, @Valid @RequestBody MessageCreateRequest request) {
        User user = currentUserService.getCurrentUser();
        Order order = orderService.getOrderForChat(orderId, user);
        return messageService.addMessage(order, user, request.message());
    }
}
