package com.sia.demo.repository;

import com.sia.demo.model.Message;
import com.sia.demo.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByOrderOrderByTimestampAsc(Order order);
}
