package com.smartcart.dto;

import jakarta.validation.constraints.NotBlank;

public class ProblemRequest {

    @NotBlank(message = "Problem description is required")
    private String problem;

    private Double maxBudget;

    public ProblemRequest() {
    }

    public ProblemRequest(String problem, Double maxBudget) {
        this.problem = problem;
        this.maxBudget = maxBudget;
    }

    public String getProblem() { return problem; }
    public void setProblem(String problem) { this.problem = problem; }

    public Double getMaxBudget() { return maxBudget; }
    public void setMaxBudget(Double maxBudget) { this.maxBudget = maxBudget; }
}
