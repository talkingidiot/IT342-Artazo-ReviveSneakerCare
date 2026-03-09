package com.sia.demo.service;

import com.sia.demo.dto.MessageResponse;
import com.sia.demo.dto.OrderResponse;
import com.sia.demo.model.Message;
import com.sia.demo.model.Order;

public final class DtoMapper {
    private DtoMapper() {
    }

    public static OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getName(),
                order.getUser().getEmail(),
                order.getImageUrls(),
                order.getShoeType(),
                order.getServiceType(),
                order.getDropOffDate(),
                order.getQuotedPrice(),
                order.getEstimatedCompletionDate(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }

    public static MessageResponse toMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSenderRole(),
                message.getMessage(),
                message.getTimestamp()
        );
    }
}
