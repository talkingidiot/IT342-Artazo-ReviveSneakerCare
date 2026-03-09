package com.sia.demo.service;

import com.sia.demo.dto.MessageResponse;
import com.sia.demo.model.Message;
import com.sia.demo.model.Order;
import com.sia.demo.model.User;
import com.sia.demo.repository.MessageRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Order order) {
        return messageRepository.findByOrderOrderByTimestampAsc(order).stream()
                .map(DtoMapper::toMessageResponse)
                .toList();
    }

    @Transactional
    public MessageResponse addMessage(Order order, User sender, String text) {
        Message message = new Message();
        message.setOrder(order);
        message.setSenderRole(sender.getRole());
        message.setMessage(text);
        return DtoMapper.toMessageResponse(messageRepository.save(message));
    }
}
