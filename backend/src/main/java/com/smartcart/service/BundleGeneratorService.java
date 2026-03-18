package com.smartcart.service;

import com.smartcart.dto.BundleResponse;
import com.smartcart.dto.ProductDTO;
import com.smartcart.entity.Category;
import com.smartcart.entity.Product;
import com.smartcart.repository.CategoryRepository;
import com.smartcart.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BundleGeneratorService {

    private final ProblemParserService problemParserService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;

    public BundleGeneratorService(ProblemParserService problemParserService,
                                   ProductRepository productRepository,
                                   CategoryRepository categoryRepository,
                                   ProductService productService) {
        this.problemParserService = problemParserService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productService = productService;
    }

    public BundleResponse generateBundle(String problem, Double maxBudgetOverride) {
        // 1. Parse the problem
        String intent = problemParserService.detectIntent(problem);
        List<String> keywords = problemParserService.extractKeywords(problem);
        BigDecimal budget = maxBudgetOverride != null
                ? BigDecimal.valueOf(maxBudgetOverride)
                : problemParserService.extractBudget(problem);

        // 2. Get relevant categories for the intent
        List<String> categoryNames = problemParserService.getCategoriesForIntent(intent);

        // 3. Find matching categories from DB
        List<Category> matchedCategories = new ArrayList<>();
        for (String catName : categoryNames) {
            List<Category> found = categoryRepository.findByNameContainingIgnoreCase(catName);
            matchedCategories.addAll(found);
        }

        // If no categories matched, try keyword-based search
        if (matchedCategories.isEmpty()) {
            for (String keyword : keywords) {
                List<Category> found = categoryRepository.findByNameContainingIgnoreCase(keyword);
                matchedCategories.addAll(found);
            }
        }

        // 4. Get candidate products
        List<Product> candidates;
        if (!matchedCategories.isEmpty()) {
            if (budget != null) {
                candidates = productRepository.findByCategoriesAndMaxPrice(matchedCategories, budget);
            } else {
                candidates = productRepository.findByCategoriesOrderByRating(matchedCategories);
            }
        } else {
            // Fallback: keyword search across all products
            candidates = new ArrayList<>();
            for (String keyword : keywords) {
                if (budget != null) {
                    candidates.addAll(productRepository.searchByKeywordAndMaxPrice(keyword, budget));
                } else {
                    candidates.addAll(productRepository.searchByKeyword(keyword));
                }
            }
        }

        // Remove duplicates
        candidates = candidates.stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (p1, p2) -> p1))
                .values()
                .stream()
                .collect(Collectors.toList());

        // 5. Build optimized bundle - pick best product per category
        List<Product> bundleProducts = selectOptimalBundle(candidates, matchedCategories, budget);

        // 6. Build response
        BigDecimal totalPrice = bundleProducts.stream()
                .map(Product::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProductDTO> productDTOs = bundleProducts.stream()
                .map(productService::toDTO)
                .collect(Collectors.toList());

        BundleResponse response = new BundleResponse();
        response.setDetectedIntent(intent);
        response.setBudget(budget);
        response.setTotalPrice(totalPrice);
        response.setProducts(productDTOs);
        response.setDetectedKeywords(keywords);
        response.setSummary(buildSummary(intent, bundleProducts.size(), totalPrice, budget));

        return response;
    }

    private List<Product> selectOptimalBundle(List<Product> candidates, List<Category> categories, BigDecimal budget) {
        // Group candidates by category
        Map<Long, List<Product>> byCategoryId = candidates.stream()
                .collect(Collectors.groupingBy(p -> p.getCategory().getId()));

        List<Product> selected = new ArrayList<>();
        BigDecimal remaining = budget != null ? budget : BigDecimal.valueOf(999999);

        // Pick best product from each category (highest rated that fits budget)
        for (Map.Entry<Long, List<Product>> entry : byCategoryId.entrySet()) {
            List<Product> catProducts = entry.getValue();
            catProducts.sort((a, b) -> {
                // Prefer higher rating, then lower price
                int ratingCmp = (b.getRating() != null ? b.getRating() : BigDecimal.ZERO)
                        .compareTo(a.getRating() != null ? a.getRating() : BigDecimal.ZERO);
                if (ratingCmp != 0) return ratingCmp;
                return a.getPrice().compareTo(b.getPrice());
            });

            for (Product product : catProducts) {
                if (product.getPrice().compareTo(remaining) <= 0 && product.getStock() > 0) {
                    selected.add(product);
                    remaining = remaining.subtract(product.getPrice());
                    break;
                }
            }
        }

        // If we have fewer than 3 products, try adding more from remaining candidates
        if (selected.size() < 3) {
            Set<Long> selectedIds = selected.stream().map(Product::getId).collect(Collectors.toSet());
            for (Product product : candidates) {
                if (!selectedIds.contains(product.getId())
                        && product.getPrice().compareTo(remaining) <= 0
                        && product.getStock() > 0) {
                    selected.add(product);
                    remaining = remaining.subtract(product.getPrice());
                    selectedIds.add(product.getId());
                    if (selected.size() >= 8) break; // Max 8 items in a bundle
                }
            }
        }

        return selected;
    }

    private String buildSummary(String intent, int productCount, BigDecimal totalPrice, BigDecimal budget) {
        StringBuilder sb = new StringBuilder();
        sb.append("We found a ").append(intent).append(" bundle with ").append(productCount).append(" products");
        sb.append(" totaling ₹").append(totalPrice.setScale(2));

        if (budget != null) {
            BigDecimal savings = budget.subtract(totalPrice);
            if (savings.compareTo(BigDecimal.ZERO) > 0) {
                sb.append(". You save ₹").append(savings.setScale(2)).append(" from your budget!");
            }
        }

        return sb.toString();
    }
}
