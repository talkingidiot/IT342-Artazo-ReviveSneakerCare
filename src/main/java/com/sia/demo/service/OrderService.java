package com.sia.demo.service;

import com.sia.demo.dto.AdminQuoteRequest;
import com.sia.demo.dto.AdminMonthlySalesResponse;
import com.sia.demo.dto.OrderResponse;
import com.sia.demo.model.Order;
import com.sia.demo.model.OrderStatus;
import com.sia.demo.model.Role;
import com.sia.demo.model.User;
import com.sia.demo.repository.OrderRepository;
import java.time.LocalDate;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class OrderService {
    private static final Map<OrderStatus, OrderStatus> NEXT_STATUS = new EnumMap<>(OrderStatus.class);

    static {
        NEXT_STATUS.put(OrderStatus.WAITING_FOR_QUOTE, OrderStatus.QUOTED);
        NEXT_STATUS.put(OrderStatus.QUOTED, OrderStatus.ONGOING_CLEANING);
        NEXT_STATUS.put(OrderStatus.ONGOING_CLEANING, OrderStatus.READY_FOR_PICKUP);
        NEXT_STATUS.put(OrderStatus.READY_FOR_PICKUP, OrderStatus.CLAIMED);
    }

    private final OrderRepository orderRepository;
    private final StorageService storageService;

    public OrderService(OrderRepository orderRepository, StorageService storageService) {
        this.orderRepository = orderRepository;
        this.storageService = storageService;
    }

    @Transactional
    public OrderResponse createOrder(
            User user,
            List<String> imageUrls,
            String shoeType,
            LocalDate dropOffDate
    ) {
        if (dropOffDate == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Drop-off date is required");
        }
        if (dropOffDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(BAD_REQUEST, "Drop-off date cannot be in the past");
        }
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

    @Transactional(readOnly = true)
    public AdminMonthlySalesResponse getMonthlySalesSummary(YearMonth month) {
        YearMonth targetMonth = month == null ? YearMonth.now() : month;
        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).minusNanos(1).toInstant();

        var completedStatuses = EnumSet.of(OrderStatus.CLAIMED, OrderStatus.COMPLETED);
        long completedOrders = orderRepository.countByStatusInAndClaimedAtBetween(
                completedStatuses,
                startInstant,
                endInstant
        );
        var totalSales = orderRepository.sumQuotedPriceByStatusInAndClaimedAtBetween(
                completedStatuses,
                startInstant,
                endInstant
        );
        long unclaimedOrders = orderRepository.countByStatus(OrderStatus.READY_FOR_PICKUP);

        return new AdminMonthlySalesResponse(targetMonth.toString(), totalSales, completedOrders, unclaimedOrders);
    }

    @Transactional
    public OrderResponse updateQuote(Long id, AdminQuoteRequest req) {
        Order order = getOrderById(id);
        if (order.getStatus() != OrderStatus.WAITING_FOR_QUOTE) {
            throw new ResponseStatusException(BAD_REQUEST, "Quote can only be set while waiting for quote");
        }
        if (req.estimatedCompletionDate().isBefore(order.getDropOffDate())) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Estimated completion date cannot be before drop-off date"
            );
        }
        order.setServiceType(req.serviceType());
        order.setQuotedPrice(req.quotedPrice());
        order.setEstimatedCompletionDate(req.estimatedCompletionDate());
        order.setStatus(OrderStatus.QUOTED);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = getOrderById(id);
        if (status == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Status is required");
        }
        OrderStatus currentStatus = order.getStatus();
        OrderStatus expectedNext = NEXT_STATUS.get(currentStatus);
        if (expectedNext == null || status != expectedNext) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Invalid status transition. Allowed next status from " + currentStatus + " is " + expectedNext
            );
        }
        order.setStatus(status);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse claimOrder(Long id) {
        Order order = getOrderById(id);
        OrderStatus currentStatus = order.getStatus();
        if (currentStatus != OrderStatus.READY_FOR_PICKUP && currentStatus != OrderStatus.ONGOING_CLEANING) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "Order can only be claimed from ongoing cleaning or ready for pickup"
            );
        }
        order.setStatus(OrderStatus.CLAIMED);
        order.setClaimedAt(Instant.now());
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse clientDecideOnQuote(Long id, User user, boolean approved) {
        Order order = getOrderById(id);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Order does not belong to current client");
        }
        if (order.getStatus() != OrderStatus.QUOTED) {
            throw new ResponseStatusException(BAD_REQUEST, "Order is not awaiting client approval");
        }
        if (!approved) {
            order.setStatus(OrderStatus.CANCELLED);
            return DtoMapper.toOrderResponse(orderRepository.save(order));
        }
        order.setStatus(OrderStatus.ONGOING_CLEANING);
        return DtoMapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse submitPaymentReceipt(Long id, User user, MultipartFile receipt, String paymentMethod) {
        Order order = getOrderById(id);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Order does not belong to current client");
        }
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new ResponseStatusException(BAD_REQUEST, "Receipt can only be submitted when order is ready for pickup");
        }
        String receiptUrl = storageService.storeImage(receipt);
        order.setPaymentProofUrl(receiptUrl);
        if (paymentMethod != null && !paymentMethod.isBlank()) {
            order.setPaymentMethod(paymentMethod.trim());
        }
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
