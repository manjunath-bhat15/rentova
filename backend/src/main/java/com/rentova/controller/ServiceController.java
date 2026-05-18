package com.rentova.controller;

import com.rentova.dto.*;
import com.rentova.model.User;
import com.rentova.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getServices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @AuthenticationPrincipal User user) {

        List<ServiceDTO> services;
        if (search != null && !search.isBlank()) {
            services = serviceService.searchServices(search);
        } else if (category != null && !category.isBlank()) {
            services = serviceService.getServicesByCategory(category);
        } else {
            services = serviceService.getAllActiveServices();
        }
        return ResponseEntity.ok(services);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ServiceDTO>> getMyServices(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serviceService.getServicesByVendor(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getService(@PathVariable String id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceDTO> createService(
            @Valid @RequestBody CreateServiceRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(serviceService.createService(request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(
            @PathVariable String id,
            @Valid @RequestBody CreateServiceRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(serviceService.updateService(id, request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleService(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            serviceService.toggleServiceStatus(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
