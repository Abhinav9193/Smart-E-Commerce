package com.smartcart.repository;

import com.smartcart.entity.Product;
import com.smartcart.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategory(Category category, Pageable pageable);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category IN :categories AND p.price <= :maxPrice ORDER BY p.rating DESC")
    List<Product> findByCategoriesAndMaxPrice(@Param("categories") List<Category> categories,
                                              @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT p FROM Product p WHERE p.category IN :categories ORDER BY p.rating DESC")
    List<Product> findByCategoriesOrderByRating(@Param("categories") List<Category> categories);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.price <= :maxPrice ORDER BY p.rating DESC")
    List<Product> searchByKeywordAndMaxPrice(@Param("keyword") String keyword, @Param("maxPrice") BigDecimal maxPrice);

    long countByCategory(Category category);
}
