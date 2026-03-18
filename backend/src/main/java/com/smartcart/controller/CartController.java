package com.smartcart.controller;

import com.smartcart.dto.CartDTO;
import com.smartcart.entity.User;
import com.smartcart.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = request.get("quantity") != null
                ? Integer.valueOf(request.get("quantity").toString()) : 1;
        return ResponseEntity.ok(cartService.addToCart(user, productId, quantity));
    }

    @PostMapping("/add-bundle")
    public ResponseEntity<CartDTO> addBundleToCart(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, List<Long>> request) {
        List<Long> productIds = request.get("productIds");
        return ResponseEntity.ok(cartService.addBundleToCart(user, productIds));
    }

    @PutMapping("/update")
    public ResponseEntity<CartDTO> updateCartItem(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateCartItem(user, productId, quantity));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeFromCart(user, productId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}
