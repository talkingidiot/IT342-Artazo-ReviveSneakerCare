package com.sia.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.sia.demo.repository")
public class ReviveApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReviveApplication.class, args);
	}

}
