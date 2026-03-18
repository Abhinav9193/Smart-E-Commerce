package com.smartcart.service;

import com.smartcart.dto.CartDTO;
import com.smartcart.dto.CartItemDTO;
import com.smartcart.entity.Cart;
import com.smartcart.entity.CartItem;
import com.smartcart.entity.Product;
import com.smartcart.entity.User;
import com.smartcart.exception.BadRequestException;
import com.smartcart.exception.ResourceNotFoundException;
import com.smartcart.repository.CartItemRepository;
import com.smartcart.repository.CartRepository;
import com.smartcart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public CartDTO getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(User user, Long productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (product.getStock() < quantity) {
            throw new BadRequestException("Not enough stock. Available: " + product.getStock());
        }

        Cart cart = getOrCreateCart(user);

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + quantity;
            if (newQty > product.getStock()) {
                throw new BadRequestException("Not enough stock. Available: " + product.getStock());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, product, quantity);
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO addBundleToCart(User user, List<Long> productIds) {
        Cart cart = getOrCreateCart(user);

        for (Long productId : productIds) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            if (product.getStock() < 1) continue;

            Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
            if (existing.isPresent()) {
                CartItem item = existing.get();
                item.setQuantity(item.getQuantity() + 1);
                cartItemRepository.save(item);
            } else {
                CartItem newItem = new CartItem(cart, product, 1);
                cart.getItems().add(newItem);
                cartItemRepository.save(newItem);
            }
        }

        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO updateCartItem(User user, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStock()) {
                throw new BadRequestException("Not enough stock. Available: " + item.getProduct().getStock());
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO removeFromCart(User user, Long productId) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        cart = cartRepository.findById(cart.getId()).orElse(cart);
        return toDTO(cart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }

    private CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setItems(cart.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private CartItemDTO toItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImageUrl(item.getProduct().getImageUrl());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}
