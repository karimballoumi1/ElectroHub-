package com.ecommerce.app.service;

import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setEmail(userDetails.getEmail());
        user.setName(userDetails.getName());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.isEnabled());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        return userRepository.save(user);
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        // Clean up linked data because JPA might fail due to FK constraints
        entityManager.createNativeQuery("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = :userId)").setParameter("userId", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM orders WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reviews WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = :userId)").setParameter("userId", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM carts WHERE user_id = :userId").setParameter("userId", id).executeUpdate();

        userRepository.deleteById(id);
    }
}
