package com.rentova.service;

import com.rentova.dto.*;
import com.rentova.model.*;
import com.rentova.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

        ServiceUnit unit = parseUnit(request.getUnit());

        ServiceEntity service = ServiceEntity.builder()
                .vendor(vendor)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .pricePerUnit(request.getPricePerUnit())
                .securityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : BigDecimal.ZERO)
                .allowPickup(request.getAllowPickup() != null ? request.getAllowPickup() : true)
                .allowDelivery(request.getAllowDelivery() != null ? request.getAllowDelivery() : false)
                .unit(unit)
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .serviceRadiusKm(request.getServiceRadiusKm() == null ? 10.0 : request.getServiceRadiusKm())
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

    public List<ServiceDTO> getAllServicesForAdmin() {
        return serviceRepository.findAll()
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

    public List<ServiceDTO> getNearbyServices(double latitude, double longitude, double radiusKm,
                                              String search, String category) {
        double normalizedRadius = radiusKm <= 0 ? 10.0 : radiusKm;
        return serviceRepository.findByIsActiveTrue()
                .stream()
                .filter(service -> service.getLatitude() != null && service.getLongitude() != null)
                .filter(service -> search == null || search.isBlank()
                        || service.getTitle().toLowerCase().contains(search.toLowerCase()))
                .filter(service -> category == null || category.isBlank()
                        || "All".equalsIgnoreCase(category)
                        || service.getCategory().equalsIgnoreCase(category))
                .map(service -> toDTO(service, distanceKm(latitude, longitude, service.getLatitude(), service.getLongitude())))
                .filter(service -> service.getDistanceKm() != null && service.getDistanceKm() <= normalizedRadius)
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
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
        service.setSecurityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : BigDecimal.ZERO);
        service.setAllowPickup(request.getAllowPickup() != null ? request.getAllowPickup() : true);
        service.setAllowDelivery(request.getAllowDelivery() != null ? request.getAllowDelivery() : false);
        service.setUnit(parseUnit(request.getUnit()));
        if (request.getLocation() != null) service.setLocation(request.getLocation());
        if (request.getLatitude() != null) service.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) service.setLongitude(request.getLongitude());
        if (request.getServiceRadiusKm() != null) service.setServiceRadiusKm(request.getServiceRadiusKm());
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

    private ServiceUnit parseUnit(String unit) {
        try {
            return ServiceUnit.valueOf(unit.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid unit. Must be HOUR, DAY, PIECE, or SESSION");
        }
    }

    private double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return BigDecimal.valueOf(earthRadiusKm * c)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private ServiceDTO toDTO(ServiceEntity s) {
        return toDTO(s, null);
    }

    private ServiceDTO toDTO(ServiceEntity s, Double distanceKm) {
        return ServiceDTO.builder()
                .id(s.getId())
                .vendorId(s.getVendor().getId())
                .vendorName(s.getVendor().getName())
                .title(s.getTitle())
                .description(s.getDescription())
                .category(s.getCategory())
                .pricePerUnit(s.getPricePerUnit())
                .securityDeposit(s.getSecurityDeposit())
                .allowPickup(s.isAllowPickup())
                .allowDelivery(s.isAllowDelivery())
                .unit(s.getUnit().name())
                .location(s.getLocation())
                .latitude(s.getLatitude())
                .longitude(s.getLongitude())
                .serviceRadiusKm(s.getServiceRadiusKm())
                .distanceKm(distanceKm)
                .active(s.isActive())
                .images(s.getImages())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
