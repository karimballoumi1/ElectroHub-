package com.ecommerce.app.service;

import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    public Order createOrder(String userEmail, java.util.Map<String, String> shippingDetails) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Cart cart = cartService.getCart(userEmail);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");
        
        // Setting shipping info
        order.setFirstName(shippingDetails.get("firstName"));
        order.setLastName(shippingDetails.get("lastName"));
        order.setPhone(shippingDetails.get("phone"));
        order.setAddress(shippingDetails.get("address"));

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0.0;

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItems.add(orderItem);

            totalPrice += (cartItem.getProduct().getPrice() * cartItem.getQuantity());
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);

        Order savedOrder = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getUserOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return orderRepository.findByUserId(user.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public java.util.Map<String, Object> getStats() {
        List<Order> allOrders = orderRepository.findAll();
        double totalRevenue = allOrders.stream().mapToDouble(Order::getTotalPrice).sum();
        long totalOrders = allOrders.size();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", allOrders.stream().filter(o -> "PLACED".equals(o.getStatus())).count());
        return stats;
    }
}
