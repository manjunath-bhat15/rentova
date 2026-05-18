package com.rentova.repository;

import com.rentova.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, String> {
    List<ServiceEntity> findByVendorId(String vendorId);
    List<ServiceEntity> findByIsActiveTrue();
    List<ServiceEntity> findByCategoryAndIsActiveTrue(String category);
    List<ServiceEntity> findByTitleContainingIgnoreCaseAndIsActiveTrue(String keyword);
}
