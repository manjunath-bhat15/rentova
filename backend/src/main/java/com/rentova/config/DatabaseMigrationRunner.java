package com.rentova.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1) // Run FIRST, before DatabaseSeeder
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            System.out.println("Running self-healing database schema migrations...");

            // Add missing columns to users table (safe: no-op if column already exists)
            safeAddColumn("users", "rating", "DOUBLE PRECISION DEFAULT 0.0");
            safeAddColumn("users", "total_orders", "INTEGER DEFAULT 0");
            safeAddColumn("users", "total_ratings", "INTEGER DEFAULT 0");
            safeAddColumn("users", "trust_score", "INTEGER DEFAULT 10");
            safeAddColumn("users", "phone_verified", "BOOLEAN DEFAULT false");
            safeAddColumn("users", "govt_id_verified", "BOOLEAN DEFAULT false");
            safeAddColumn("users", "gst_verified", "BOOLEAN DEFAULT false");
            safeAddColumn("users", "govt_id_number", "VARCHAR(255)");
            safeAddColumn("users", "govt_id_url", "TEXT");
            safeAddColumn("users", "gst_number", "VARCHAR(255)");
            safeAddColumn("users", "phone_number", "VARCHAR(255)");
            safeAddColumn("users", "otp_code", "VARCHAR(255)");
            safeAddColumn("users", "bio", "TEXT");
            safeAddColumn("users", "avatar", "TEXT");
            safeAddColumn("users", "address", "VARCHAR(255)");

            // Add missing columns to services table
            safeAddColumn("services", "security_deposit", "NUMERIC(19,2) DEFAULT 0");
            safeAddColumn("services", "allow_pickup", "BOOLEAN DEFAULT true");
            safeAddColumn("services", "allow_delivery", "BOOLEAN DEFAULT false");

            // Add missing columns to bookings table
            safeAddColumn("bookings", "security_deposit", "NUMERIC(19,2) DEFAULT 0");

            // Patch null values for existing rows
            jdbcTemplate.execute("UPDATE users SET phone_verified = false WHERE phone_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET govt_id_verified = false WHERE govt_id_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET gst_verified = false WHERE gst_verified IS NULL");
            jdbcTemplate.execute("UPDATE users SET trust_score = 10 WHERE trust_score IS NULL");
            jdbcTemplate.execute("UPDATE users SET rating = 0.0 WHERE rating IS NULL");
            jdbcTemplate.execute("UPDATE users SET total_orders = 0 WHERE total_orders IS NULL");
            jdbcTemplate.execute("UPDATE users SET total_ratings = 0 WHERE total_ratings IS NULL");

            jdbcTemplate.execute("UPDATE services SET security_deposit = 0 WHERE security_deposit IS NULL");
            jdbcTemplate.execute("UPDATE bookings SET security_deposit = 0 WHERE security_deposit IS NULL");
            jdbcTemplate.execute("UPDATE services SET allow_pickup = true WHERE allow_pickup IS NULL");
            jdbcTemplate.execute("UPDATE services SET allow_delivery = false WHERE allow_delivery IS NULL");

            System.out.println("Database migrations successfully applied!");
        } catch (Exception e) {
            System.err.println("Database migration error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Safely adds a column to a table. If the column already exists, the exception is caught and ignored.
     */
    private void safeAddColumn(String table, String column, String definition) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
            System.out.println("  Added column: " + table + "." + column);
        } catch (Exception e) {
            // Column already exists — safe to ignore
        }
    }
}
