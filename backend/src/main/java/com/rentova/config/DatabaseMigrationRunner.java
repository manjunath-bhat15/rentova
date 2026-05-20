package com.rentova.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            System.out.println("Running self-healing database schema migrations...");
            
            // Patch users table to fill in null values for newly added columns
            jdbcTemplate.execute("UPDATE users SET phone_verified = false WHERE phone_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET govt_id_verified = false WHERE govt_id_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET gst_verified = false WHERE gst_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET trust_score = 10 WHERE trust_score IS NULL");
            
            // Patch services and bookings tables to fill in null security deposits
            jdbcTemplate.execute("UPDATE services SET security_deposit = 0 WHERE security_deposit IS NULL");
            jdbcTemplate.execute("UPDATE bookings SET security_deposit = 0 WHERE security_deposit IS NULL");
            
            System.out.println("Database migrations successfully applied!");
        } catch (Exception e) {
            System.err.println("Database migration note (might be normal if columns don't exist yet): " + e.getMessage());
        }
    }
}
