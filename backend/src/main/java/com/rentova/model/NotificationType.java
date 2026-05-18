package com.rentova.model;

public enum NotificationType {
    BOOKING_CREATED,     // Vendor receives: new booking request
    BOOKING_CONFIRMED,   // Customer receives: booking confirmed
    BOOKING_IN_PROGRESS, // Customer receives: service started
    BOOKING_COMPLETED,   // Both receive: booking completed
    BOOKING_CANCELLED,   // Both receive: booking cancelled
    WALLET_TOPUP,        // User receives: top-up success
    WALLET_PAYOUT,       // Vendor receives: payout received
    WALLET_REFUND,       // Customer receives: refund processed
    CHAT_MESSAGE         // User receives: new message
}
