package com.unimarket.config;

import com.unimarket.entity.Category;
import com.unimarket.entity.User;
import com.unimarket.repository.CategoryRepository;
import com.unimarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
    }

    private void seedAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@unimarket.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("UniMarket")
                    .lastName("Admin")
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin / admin123");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                Category.builder().name("Electronics").description("Phones, laptops, tablets and more").active(true).build(),
                Category.builder().name("Textbooks").description("Academic books and study materials").active(true).build(),
                Category.builder().name("Furniture").description("Chairs, desks, shelves and more").active(true).build(),
                Category.builder().name("Clothing").description("Clothes, shoes and accessories").active(true).build(),
                Category.builder().name("Sports & Fitness").description("Sports equipment and fitness gear").active(true).build(),
                Category.builder().name("Music & Instruments").description("Musical instruments and accessories").active(true).build(),
                Category.builder().name("Stationery").description("Pens, notebooks, art supplies").active(true).build(),
                Category.builder().name("Kitchen & Appliances").description("Kitchen equipment and small appliances").active(true).build(),
                Category.builder().name("Vehicles").description("Bicycles, scooters and accessories").active(true).build(),
                Category.builder().name("Other").description("Miscellaneous items").active(true).build()
            );
            categoryRepository.saveAll(categories);
            log.info("Seeded {} categories", categories.size());
        }
    }
}
