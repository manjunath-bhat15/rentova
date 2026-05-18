package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.*;
import com.rentova.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    @Transactional
    public ServiceDTO createService(CreateServiceRequest request, User vendor) {
        if (vendor.getRole() != Role.VENDOR && vendor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only vendors can create services");
        }

        ServiceUnit unit;
        try {
            unit = ServiceUnit.valueOf(request.getUnit().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid unit. Must be HOUR, DAY, PIECE, or SESSION");
        }

        ServiceEntity service = ServiceEntity.builder()
                .vendor(vendor)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .pricePerUnit(request.getPricePerUnit())
                .unit(unit)
                .images(request.getImages())
                .isActive(true)
                .build();

        service = serviceRepository.save(service);
        return toDTO(service);
    }

    public List<ServiceDTO> getAllActiveServices() {
        return serviceRepository.findByIsActiveTrue()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ServiceDTO> getServicesByVendor(String vendorId) {
        return serviceRepository.findByVendorId(vendorId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ServiceDTO> searchServices(String keyword) {
        return serviceRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(keyword)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ServiceDTO> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryAndIsActiveTrue(category)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ServiceDTO getServiceById(String id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return toDTO(service);
    }

    @Transactional
    public ServiceDTO updateService(String id, CreateServiceRequest request, User vendor) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getVendor().getId().equals(vendor.getId()) && vendor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized to update this service");
        }

        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setPricePerUnit(request.getPricePerUnit());
        service.setUnit(ServiceUnit.valueOf(request.getUnit().toUpperCase()));
        if (request.getImages() != null) service.setImages(request.getImages());

        service = serviceRepository.save(service);
        return toDTO(service);
    }

    @Transactional
    public void toggleServiceStatus(String id, User vendor) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getVendor().getId().equals(vendor.getId()) && vendor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized");
        }
        service.setActive(!service.isActive());
        serviceRepository.save(service);
    }

    private ServiceDTO toDTO(ServiceEntity s) {
        return ServiceDTO.builder()
                .id(s.getId())
                .vendorId(s.getVendor().getId())
                .vendorName(s.getVendor().getName())
                .title(s.getTitle())
                .description(s.getDescription())
                .category(s.getCategory())
                .pricePerUnit(s.getPricePerUnit())
                .unit(s.getUnit().name())
                .active(s.isActive())
                .images(s.getImages())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
