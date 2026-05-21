package com.rentova.config;

import com.rentova.model.Role;
import com.rentova.model.User;
import com.rentova.model.Wallet;
import com.rentova.model.ServiceEntity;
import com.rentova.model.ServiceUnit;
import com.rentova.repository.UserRepository;
import com.rentova.repository.WalletRepository;
import com.rentova.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("manjubhat8105@gmail.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("manjubhat8105@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setVerified(true);
            admin.setPhoneVerified(true);
            admin.setGovtIdVerified(true);
            admin.setGstVerified(true);
            admin = userRepository.save(admin);

            Wallet wallet = new Wallet();
            wallet.setUser(admin);
            wallet.setBalance(BigDecimal.ZERO);
            walletRepository.save(wallet);

            System.out.println("Admin user created successfully: manjubhat8105@gmail.com / admin123");
        }

        // Fetch or create the vendor
        Optional<User> vendorOpt = userRepository.findByEmail("vendor@rentova.local");
        User vendor;
        if (vendorOpt.isEmpty()) {
            vendor = new User();
            vendor.setName("Demo Vendor");
            vendor.setEmail("vendor@rentova.local");
            vendor.setPassword(passwordEncoder.encode("vendor123"));
            vendor.setRole(Role.VENDOR);
            vendor.setVerified(true);
            vendor.setPhoneVerified(true);
            vendor.setGovtIdVerified(true);
            vendor.setGstVerified(true);
            vendor.setAddress("Bangalore, India");
            vendor = userRepository.save(vendor);

            Wallet wallet = new Wallet();
            wallet.setUser(vendor);
            wallet.setBalance(BigDecimal.ZERO);
            walletRepository.save(wallet);
        } else {
            vendor = vendorOpt.get();
        }

        // Check if they already have services to avoid duplicates
        List<ServiceEntity> existingServices = serviceRepository.findByVendorId(vendor.getId());
        if (existingServices == null || existingServices.isEmpty()) {
            // Seed 15 services across categories
            List<ServiceEntity> services = Arrays.asList(
                createService(vendor, "Sony A7III Camera", "Professional Mirrorless Camera", "Electronics", 1500, ServiceUnit.DAY),
                createService(vendor, "DJI Mavic Air 2", "4K Drone with Extra Batteries", "Electronics", 2000, ServiceUnit.DAY),
                createService(vendor, "JBL Partybox 310", "High power portable Bluetooth speaker", "Electronics", 1200, ServiceUnit.DAY),
                createService(vendor, "Trek Marlin 7", "Mountain Bike for weekend rides", "Sports", 500, ServiceUnit.DAY),
                createService(vendor, "Coleman 4-Person Tent", "Spacious camping tent", "Sports", 300, ServiceUnit.DAY),
                createService(vendor, "Decathlon Kayak", "Inflatable 2-person kayak", "Sports", 800, ServiceUnit.DAY),
                createService(vendor, "Bosch Power Drill", "Professional hammering drill", "Tools", 200, ServiceUnit.DAY),
                createService(vendor, "Karcher High Pressure Washer", "Car and floor cleaning", "Tools", 400, ServiceUnit.DAY),
                createService(vendor, "Honda Generator 2KVA", "Portable silent generator", "Tools", 1000, ServiceUnit.DAY),
                createService(vendor, "MacBook Pro M2", "For editing and production tasks", "Electronics", 2500, ServiceUnit.DAY),
                createService(vendor, "PS5 Console", "Comes with 2 controllers", "Entertainment", 800, ServiceUnit.DAY),
                createService(vendor, "Nintendo Switch OLED", "Portable gaming console", "Entertainment", 600, ServiceUnit.DAY),
                createService(vendor, "Ford Endeavour SUV", "7-Seater Self-drive", "Vehicles", 4000, ServiceUnit.DAY),
                createService(vendor, "Royal Enfield Classic 350", "Cruiser bike", "Vehicles", 1500, ServiceUnit.DAY),
                createService(vendor, "Yamaha Acoustic Guitar", "Perfect for gigs", "Entertainment", 300, ServiceUnit.DAY)
            );

            serviceRepository.saveAll(services);
            System.out.println("15 services seeded for vendor@rentova.local");
        } else {
            System.out.println("Vendor already has " + existingServices.size() + " services. Skipping seeder.");
        }
    }

    private ServiceEntity createService(User vendor, String title, String desc, String category, int price, ServiceUnit unit) {
        ServiceEntity s = new ServiceEntity();
        s.setVendor(vendor);
        s.setTitle(title);
        s.setDescription(desc);
        s.setCategory(category);
        s.setPricePerUnit(new BigDecimal(price));
        s.setSecurityDeposit(new BigDecimal(price * 2));
        s.setUnit(unit);
        s.setLocation(vendor.getAddress() != null ? vendor.getAddress() : "Bangalore, India");
        s.setLatitude(12.9716);
        s.setLongitude(77.5946);
        s.setAllowPickup(true);
        s.setAllowDelivery(true);
        s.setActive(true);
        s.setImages("https://images.unsplash.com/photo-1542314831-c6a4d14eff51?auto=format&fit=crop&q=80&w=400");
        return s;
    }
}
