package com.ecommerce.app.controller;

import com.ecommerce.app.model.Order;
import com.ecommerce.app.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(Authentication authentication, @RequestBody java.util.Map<String, String> shippingDetails) {
        return ResponseEntity.ok(orderService.createOrder(authentication.getName(), shippingDetails));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/status/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, statusMap.get("status")));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats() {
        return ResponseEntity.ok(orderService.getStats());
    }
}
