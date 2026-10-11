package com.smartstock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartStockApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartStockApplication.class, args);
    }
}
