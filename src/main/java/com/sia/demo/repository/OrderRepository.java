package com.sia.demo.repository;

import com.sia.demo.model.Order;
import com.sia.demo.model.OrderStatus;
import com.sia.demo.model.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findAllByOrderByCreatedAtDesc();

    long countByStatusAndEstimatedCompletionDateBetween(OrderStatus status, LocalDate startDate, LocalDate endDate);
    long countByStatusInAndClaimedAtBetween(Collection<OrderStatus> statuses, Instant startDate, Instant endDate);
    long countByStatus(OrderStatus status);

    @Query("""
            select coalesce(sum(o.quotedPrice), 0)
            from Order o
            where o.status = :status
              and o.claimedAt between :startDate and :endDate
              and o.quotedPrice is not null
            """)
    BigDecimal sumQuotedPriceByStatusAndClaimedAtBetween(
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("""
            select coalesce(sum(o.quotedPrice), 0)
            from Order o
            where o.status in :statuses
              and o.claimedAt between :startDate and :endDate
              and o.quotedPrice is not null
            """)
    BigDecimal sumQuotedPriceByStatusInAndClaimedAtBetween(
            @Param("statuses") Collection<OrderStatus> statuses,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );
}
