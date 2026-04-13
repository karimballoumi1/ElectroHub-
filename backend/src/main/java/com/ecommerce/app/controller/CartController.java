package com.ecommerce.app.controller;

import com.ecommerce.app.model.Cart;
import com.ecommerce.app.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addCartItem(Authentication authentication, @RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.addCartItem(authentication.getName(), productId, quantity));
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> removeCartItem(Authentication authentication, @PathVariable Long id) {
        cartService.removeCartItem(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
