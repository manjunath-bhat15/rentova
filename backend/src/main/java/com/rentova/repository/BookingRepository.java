package com.rentova.repository;

import com.rentova.model.Booking;
import com.rentova.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<Booking> findByVendorIdOrderByCreatedAtDesc(String vendorId);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    List<Booking> findByCustomerIdAndStatus(String customerId, BookingStatus status);
    List<Booking> findByVendorIdAndStatus(String vendorId, BookingStatus status);
    long countByVendorIdAndStatus(String vendorId, BookingStatus status);
}
