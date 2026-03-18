package com.smartcart.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDTO {

    private Long id;
    private BigDecimal totalPrice;
    private List<CartItemDTO> items;

    public CartDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public List<CartItemDTO> getItems() { return items; }
    public void setItems(List<CartItemDTO> items) { this.items = items; }
}
