package com.smartcart.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProblemParserService {

    // Intent-to-category mapping
    private static final Map<String, List<String>> INTENT_CATEGORIES = new HashMap<>();
    private static final Map<String, List<String>> INTENT_KEYWORDS = new HashMap<>();

    static {
        // Gaming setup
        INTENT_KEYWORDS.put("gaming", Arrays.asList(
            "gaming", "game", "gamer", "fps", "esports", "playstation", "xbox", "pc gaming", "rgb"
        ));
        INTENT_CATEGORIES.put("gaming", Arrays.asList(
            "Laptops", "Keyboards", "Mouse", "Headphones", "Monitors", "Gaming Chairs", "Mousepads", "Webcams"
        ));

        // Study setup
        INTENT_KEYWORDS.put("study", Arrays.asList(
            "study", "student", "college", "university", "learning", "education", "exam", "school", "homework"
        ));
        INTENT_CATEGORIES.put("study", Arrays.asList(
            "Laptops", "Tablets", "Headphones", "Books", "Stationery", "Desk Lamps", "Bags"
        ));

        // Hostel setup
        INTENT_KEYWORDS.put("hostel", Arrays.asList(
            "hostel", "dorm", "dormitory", "room", "pg", "paying guest", "shared room"
        ));
        INTENT_CATEGORIES.put("hostel", Arrays.asList(
            "Laptops", "Headphones", "Fans", "Desk Lamps", "Storage", "Bags", "Water Bottles", "Extension Cords"
        ));

        // YouTube / Content creation
        INTENT_KEYWORDS.put("youtube", Arrays.asList(
            "youtube", "youtuber", "content", "vlog", "streaming", "recording", "podcast", "creator", "influencer"
        ));
        INTENT_CATEGORIES.put("youtube", Arrays.asList(
            "Cameras", "Microphones", "Tripods", "Lighting", "Laptops", "Monitors", "Webcams", "Headphones"
        ));

        // Office/Work from home
        INTENT_KEYWORDS.put("office", Arrays.asList(
            "office", "work from home", "wfh", "remote work", "professional", "business", "corporate", "workspace"
        ));
        INTENT_CATEGORIES.put("office", Arrays.asList(
            "Laptops", "Monitors", "Keyboards", "Mouse", "Headphones", "Office Chairs", "Webcams", "Desk Lamps"
        ));

        // Travel
        INTENT_KEYWORDS.put("travel", Arrays.asList(
            "travel", "trip", "journey", "adventure", "backpacking", "camping", "hiking", "outdoor"
        ));
        INTENT_CATEGORIES.put("travel", Arrays.asList(
            "Bags", "Cameras", "Power Banks", "Headphones", "Water Bottles", "Watches", "Sunglasses"
        ));

        // Fitness
        INTENT_KEYWORDS.put("fitness", Arrays.asList(
            "fitness", "gym", "workout", "exercise", "running", "yoga", "sports", "health", "training"
        ));
        INTENT_CATEGORIES.put("fitness", Arrays.asList(
            "Fitness Bands", "Headphones", "Water Bottles", "Shoes", "Smartwatches", "Bags"
        ));

        // Music
        INTENT_KEYWORDS.put("music", Arrays.asList(
            "music", "musician", "instrument", "audio", "dj", "beats", "sound", "listening"
        ));
        INTENT_CATEGORIES.put("music", Arrays.asList(
            "Headphones", "Speakers", "Microphones", "Laptops", "Audio Interfaces"
        ));

        // Photography
        INTENT_KEYWORDS.put("photography", Arrays.asList(
            "photography", "photographer", "photo", "camera", "dslr", "mirrorless", "lens", "shoot"
        ));
        INTENT_CATEGORIES.put("photography", Arrays.asList(
            "Cameras", "Lenses", "Tripods", "Camera Bags", "Memory Cards", "Lighting"
        ));

        // Cooking
        INTENT_KEYWORDS.put("cooking", Arrays.asList(
            "cooking", "kitchen", "chef", "baking", "food", "recipe", "cook"
        ));
        INTENT_CATEGORIES.put("cooking", Arrays.asList(
            "Kitchen Appliances", "Cookware", "Utensils", "Storage Containers", "Blenders"
        ));
    }

    public String detectIntent(String problem) {
        String lowerProblem = problem.toLowerCase();
        String bestIntent = "general";
        int maxMatches = 0;

        for (Map.Entry<String, List<String>> entry : INTENT_KEYWORDS.entrySet()) {
            int matches = 0;
            for (String keyword : entry.getValue()) {
                if (lowerProblem.contains(keyword)) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestIntent = entry.getKey();
            }
        }

        return bestIntent;
    }

    public List<String> extractKeywords(String problem) {
        String lowerProblem = problem.toLowerCase();
        List<String> keywords = new ArrayList<>();

        for (List<String> intentKeywords : INTENT_KEYWORDS.values()) {
            for (String keyword : intentKeywords) {
                if (lowerProblem.contains(keyword) && !keywords.contains(keyword)) {
                    keywords.add(keyword);
                }
            }
        }

        return keywords;
    }

    public BigDecimal extractBudget(String problem) {
        // Try patterns like "under 70000", "budget 50000", "within 30000", "₹40000", etc.
        Pattern[] patterns = {
            Pattern.compile("(?:under|below|within|budget|max|upto|up to|less than|around|approximately|approx)\\s*(?:Rs\\.?|₹|INR)?\\s*(\\d[\\d,]*)"),
            Pattern.compile("(?:Rs\\.?|₹|INR)\\s*(\\d[\\d,]*)"),
            Pattern.compile("(\\d[\\d,]*)\\s*(?:rs|rupees|budget|max)")
        };

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(problem.toLowerCase().replace(",", ""));
            if (matcher.find()) {
                try {
                    return new BigDecimal(matcher.group(1).replace(",", ""));
                } catch (NumberFormatException e) {
                    // Continue to next pattern
                }
            }
        }

        return null; // No budget detected
    }

    public List<String> getCategoriesForIntent(String intent) {
        return INTENT_CATEGORIES.getOrDefault(intent, Arrays.asList(
            "Laptops", "Headphones", "Keyboards", "Mouse", "Bags"
        ));
    }
}
