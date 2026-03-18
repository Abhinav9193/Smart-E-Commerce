package com.smartcart.dto;

public class CategoryDTO {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private int productCount;

    public CategoryDTO() {
    }

    public CategoryDTO(Long id, String name, String description, String imageUrl, int productCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.productCount = productCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public int getProductCount() { return productCount; }
    public void setProductCount(int productCount) { this.productCount = productCount; }
}
