package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.*;
import com.rentova.repository.TransactionRepository;
import com.rentova.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Get wallet info with recent transactions for a user.
     */
    public WalletDTO getWallet(User user) {
        Wallet wallet = getOrCreateWallet(user);
        List<TransactionDTO> txns = transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());

        return WalletDTO.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .recentTransactions(txns)
                .build();
    }

    /**
     * Top up wallet — add credits (simulates payment gateway deposit).
     */
    @Transactional
    public WalletDTO topUp(User user, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ONE) < 0) {
            throw new RuntimeException("Minimum top-up is $1.00");
        }

        Wallet wallet = getOrCreateWallet(user);
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(TransactionType.TOP_UP)
                .amount(amount)
                .balanceAfter(newBalance)
                .description("Wallet top-up")
                .build();
        transactionRepository.save(txn);

        return getWallet(user);
    }

    /**
     * Debit customer wallet when booking is created.
     * Returns the created Transaction.
     */
    @Transactional
    public Transaction debitForBooking(User customer, BigDecimal amount, String bookingId, String vendorName) {
        Wallet wallet = getOrCreateWallet(customer);

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance. Please top up your wallet.");
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(TransactionType.BOOKING_PAYMENT)
                .amount(amount.negate()) // Negative = debit
                .balanceAfter(newBalance)
                .description("Payment for booking")
                .bookingId(bookingId)
                .counterpartyName(vendorName)
                .build();
        return transactionRepository.save(txn);
    }

    /**
     * Credit vendor wallet when booking is completed.
     */
    @Transactional
    public Transaction creditForBooking(User vendor, BigDecimal amount, String bookingId, String customerName) {
        Wallet wallet = getOrCreateWallet(vendor);

        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(TransactionType.BOOKING_PAYOUT)
                .amount(amount)
                .balanceAfter(newBalance)
                .description("Payout for completed booking")
                .bookingId(bookingId)
                .counterpartyName(customerName)
                .build();
        return transactionRepository.save(txn);
    }

    /**
     * Refund customer wallet when booking is cancelled.
     */
    @Transactional
    public Transaction refundForBooking(User customer, BigDecimal amount, String bookingId, String vendorName) {
        Wallet wallet = getOrCreateWallet(customer);

        BigDecimal refundAmount = amount.abs(); // ensure positive
        BigDecimal newBalance = wallet.getBalance().add(refundAmount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .type(TransactionType.REFUND)
                .amount(refundAmount)
                .balanceAfter(newBalance)
                .description("Refund for cancelled booking")
                .bookingId(bookingId)
                .counterpartyName(vendorName)
                .build();
        return transactionRepository.save(txn);
    }

    /**
     * Get the current balance for a user.
     */
    public BigDecimal getBalance(User user) {
        return getOrCreateWallet(user).getBalance();
    }

    // --- Helpers ---

    private Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(w);
                });
    }

    private TransactionDTO toDTO(Transaction t) {
        return TransactionDTO.builder()
                .id(t.getId())
                .type(t.getType().name())
                .amount(t.getAmount())
                .balanceAfter(t.getBalanceAfter())
                .description(t.getDescription())
                .bookingId(t.getBookingId())
                .counterpartyName(t.getCounterpartyName())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
