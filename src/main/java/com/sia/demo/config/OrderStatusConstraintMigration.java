package com.sia.demo.config;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusConstraintMigration {
    private static final Logger log = LoggerFactory.getLogger(OrderStatusConstraintMigration.class);

    private final DataSource dataSource;

    public OrderStatusConstraintMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void migrate() {
        String sql = """
                alter table if exists orders drop constraint if exists orders_status_check;
                alter table if exists orders
                add constraint orders_status_check
                check (status in (
                    'WAITING_FOR_QUOTE',
                    'QUOTED',
                    'ONGOING_CLEANING',
                    'READY_FOR_PICKUP',
                    'CLAIMED',
                    'COMPLETED',
                    'CANCELLED'
                ));
                """;
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            for (String part : sql.split(";")) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    statement.execute(trimmed);
                }
            }
            log.info("Ensured orders_status_check includes CLAIMED");
        } catch (Exception ex) {
            log.warn("Could not update orders_status_check", ex);
        }
    }
}
