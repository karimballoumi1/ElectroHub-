package com.ecommerce.app.config;

import com.ecommerce.app.model.Category;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.ProductImage;
import com.ecommerce.app.model.Role;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.CategoryRepository;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Bean
    @org.springframework.transaction.annotation.Transactional
    public CommandLineRunner initData() {
        return args -> {
            // Force role column expansion to avoid truncation errors
            try {
                entityManager.createNativeQuery("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)").executeUpdate();
                System.out.println(">>> SEEDER: Database column 'role' expanded successfully.");

                // PATCH: Unlock all pre-existing users whose 'enabled' column defaulted to false during table update
                int unlocked = entityManager.createNativeQuery("UPDATE users SET enabled = 1 WHERE enabled = 0").executeUpdate();
                System.out.println(">>> SEEDER: Unblocked " + unlocked + " legacy users successfully.");
            } catch (Exception e) {
                System.out.println(">>> SEEDER: DB Migration check skipped: " + e.getMessage());
            }

            if (categoryRepository.count() == 0) {
                Category c1 = new Category(null, "Smartphones", "Latest smartphones", null);
                Category c2 = new Category(null, "Laptops", "High performance laptops", null);
                Category c3 = new Category(null, "Headphones", "Audio gears", null);
                Category c4 = new Category(null, "Smart Watches", "Wearables", null);
                Category c5 = new Category(null, "Accessories", "Electronic accessories", null);

                categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));

                Product p1 = new Product(null, "iPhone 15 Pro", "A17 Pro chip, Titanium design.", 999.00, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+1", 50, c1, null, null);
                p1.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+1", p1),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+2", p1),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+3", p1),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+4", p1),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=iPhone+5", p1)
                ));

                Product p2 = new Product(null, "Samsung Galaxy S24 Ultra", "AI features, Titanium.", 1299.00, "https://placehold.co/600x600/f8fafc/64748b?text=S24+1", 40, c1, null, null);
                p2.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=S24+1", p2),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=S24+2", p2),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=S24+3", p2),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=S24+4", p2),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=S24+5", p2)
                ));

                Product p3 = new Product(null, "MacBook Pro M3", "14-inch, powerful for programming.", 1599.00, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+1", 20, c2, null, null);
                p3.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+1", p3),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+2", p3),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+3", p3),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+4", p3),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MacBook+5", p3)
                ));

                Product p4 = new Product(null, "Dell XPS 15", "OLED display, Intel i9.", 1799.00, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+1", 15, c2, null, null);
                p4.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+1", p4),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+2", p4),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+3", p4),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+4", p4),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=XPS+5", p4)
                ));

                Product p5 = new Product(null, "Sony WH-1000XM5", "Top-tier noise cancellation.", 398.00, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+1", 100, c3, null, null);
                p5.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+1", p5),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+2", p5),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+3", p5),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+4", p5),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Sony+5", p5)
                ));

                Product p6 = new Product(null, "AirPods Pro 2", "In-ear with ANC.", 249.00, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+1", 120, c3, null, null);
                p6.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+1", p6),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+2", p6),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+3", p6),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+4", p6),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=AirPods+5", p6)
                ));

                Product p7 = new Product(null, "Apple Watch Series 9", "Smooth and responsive.", 399.00, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+1", 60, c4, null, null);
                p7.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+1", p7),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+2", p7),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+3", p7),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+4", p7),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Watch+5", p7)
                ));

                Product p8 = new Product(null, "Logitech MX Master 3S", "Best ergonomic mouse.", 99.00, "https://placehold.co/600x600/f8fafc/64748b?text=MX+1", 80, c5, null, null);
                p8.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MX+1", p8),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MX+2", p8),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MX+3", p8),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MX+4", p8),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=MX+5", p8)
                ));

                Product p9 = new Product(null, "Asus ROG Zephyrus G14", "Gaming laptop under 1500 dollars, AMD Ryzen, RTX 4060.", 1449.00, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+1", 30, c2, null, null);
                p9.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+1", p9),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+2", p9),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+3", p9),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+4", p9),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=ROG+5", p9)
                ));

                Product p10 = new Product(null, "Razer BlackShark V2", "Good gaming headphones with strong bass.", 99.00, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+1", 150, c3, null, null);
                p10.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+1", p10),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+2", p10),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+3", p10),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+4", p10),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Razer+5", p10)
                ));

                Product p11 = new Product(null, "Moto G 5G (2022)", "Brand Motorola Operating System Android 11.0 Ram Memory Installed Size 6 GB CPU Model MediaTek Helio CPU Speed 2 GHz Memory Storage Capacity 6 GB Screen Size 6 Inches Resolution 1600 x 720 Refresh Rate 90 Hz Model Name Moto G 5G (2022). 2-Day Battery life.", 299.00, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G", 200, c1, null, null);
                p11.setImages(Arrays.asList(
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G+1", p11),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G+2", p11),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G+3", p11),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G+4", p11),
                    new ProductImage(null, "https://placehold.co/600x600/f8fafc/64748b?text=Moto+G+5G+5", p11)
                ));

                productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11));
            }

            User admin = userRepository.findByEmail("admin@ecommerce.com").orElse(new User());
            admin.setName("Admin User");
            admin.setEmail("admin@ecommerce.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> SEEDER: Admin account ready: " + admin.getEmail());

            User superAdmin = userRepository.findByEmail("superadmin@ecommerce.com").orElse(new User());
            superAdmin.setName("Super Admin");
            superAdmin.setEmail("superadmin@ecommerce.com");
            superAdmin.setPassword(passwordEncoder.encode("super123"));
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setEnabled(true);
            userRepository.save(superAdmin);
            System.out.println(">>> SEEDER: Super Admin account ready: " + superAdmin.getEmail());
        };
    }
}
