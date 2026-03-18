package com.smartcart.controller;

import com.smartcart.dto.BundleResponse;
import com.smartcart.dto.ProblemRequest;
import com.smartcart.service.BundleGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bundle")
public class BundleController {

    private final BundleGeneratorService bundleGeneratorService;

    public BundleController(BundleGeneratorService bundleGeneratorService) {
        this.bundleGeneratorService = bundleGeneratorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<BundleResponse> generateBundle(@Valid @RequestBody ProblemRequest request) {
        BundleResponse response = bundleGeneratorService.generateBundle(request.getProblem(), request.getMaxBudget());
        return ResponseEntity.ok(response);
    }
}
