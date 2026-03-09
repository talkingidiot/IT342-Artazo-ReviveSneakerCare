package com.sia.demo.config;

import com.sia.demo.model.Role;
import com.sia.demo.model.User;
import com.sia.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@revive.local";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setName("Default Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin1234!"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}
