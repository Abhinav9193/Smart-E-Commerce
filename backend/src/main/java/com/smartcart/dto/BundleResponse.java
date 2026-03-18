package com.smartcart.dto;

import java.math.BigDecimal;
import java.util.List;

public class BundleResponse {

    private String detectedIntent;
    private BigDecimal budget;
    private BigDecimal totalPrice;
    private List<ProductDTO> products;
    private String summary;
    private List<String> detectedKeywords;

    public BundleResponse() {
    }

    public String getDetectedIntent() { return detectedIntent; }
    public void setDetectedIntent(String detectedIntent) { this.detectedIntent = detectedIntent; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public List<ProductDTO> getProducts() { return products; }
    public void setProducts(List<ProductDTO> products) { this.products = products; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getDetectedKeywords() { return detectedKeywords; }
    public void setDetectedKeywords(List<String> detectedKeywords) { this.detectedKeywords = detectedKeywords; }
}
