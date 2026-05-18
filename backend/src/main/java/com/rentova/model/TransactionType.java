package com.rentova.model;

public enum TransactionType {
    TOP_UP,           // Customer adds credits to wallet
    BOOKING_PAYMENT,  // Debit from customer on booking creation
    BOOKING_PAYOUT,   // Credit to vendor on booking completion
    REFUND,           // Return funds to customer on cancellation
    TRANSFER          // Manual admin transfer
}
