package com.smartcart.repository;

import com.smartcart.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    List<Category> findByNameIn(List<String> names);
    List<Category> findByNameContainingIgnoreCase(String name);
}
