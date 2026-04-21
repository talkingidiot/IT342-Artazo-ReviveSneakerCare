package com.sia.demo.repository;

import com.sia.demo.model.Order;
import com.sia.demo.model.OrderStatus;
import com.sia.demo.model.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findAllByOrderByCreatedAtDesc();

    long countByStatusAndEstimatedCompletionDateBetween(OrderStatus status, LocalDate startDate, LocalDate endDate);

    @Query("""
            select coalesce(sum(o.quotedPrice), 0)
            from Order o
            where o.status = :status
              and o.estimatedCompletionDate between :startDate and :endDate
              and o.quotedPrice is not null
            """)
    BigDecimal sumQuotedPriceByStatusAndEstimatedCompletionDateBetween(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
