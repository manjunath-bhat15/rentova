package com.rentova.repository;

import com.rentova.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(String walletId);
    List<Transaction> findByBookingId(String bookingId);
}
