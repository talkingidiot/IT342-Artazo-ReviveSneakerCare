package com.sia.demo.service;

import com.sia.demo.dto.AdminQuoteRequest;
import com.sia.demo.dto.OrderResponse;
import com.sia.demo.model.Order;
import com.sia.demo.model.OrderStatus;
import com.sia.demo.model.Role;
import com.sia.demo.model.User;
import com.sia.demo.repository.OrderRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse createOrder(User user, List<String> imageUrls, String shoeType, LocalDate dropOffDate) {
        Order order = new Order();
        order.setUser(user);
        order.setImageUrls(imageUrls);
        order.setShoeType(shoeType);
        order.setDropOffDate(dropOffDate);
        order.setStatus(OrderStatus.WAITING_FOR_QUOTE);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getClientOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(DtoMapper::toOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderForClient(Long id, User user) {
        Order order = getOrderById(id);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Order does not belong to current client");
        }
        return DtoMapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toOrderResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateQuote(Long id, AdminQuoteRequest req) {
        Order order = getOrderById(id);
        order.setServiceType(req.serviceType());
        order.setQuotedPrice(req.quotedPrice());
        order.setEstimatedCompletionDate(req.estimatedCompletionDate());
        order.setStatus(OrderStatus.QUOTED);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Order getOrderForChat(Long id, User user) {
        Order order = getOrderById(id);
        if (user.getRole() == Role.CLIENT && !order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Cannot access this order");
        }
        return order;
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));
    }
}
