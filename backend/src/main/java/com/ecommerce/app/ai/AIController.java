package com.ecommerce.app.ai;

import com.ecommerce.app.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/ai/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        return ResponseEntity.ok(aiService.chat(message));
    }

    @GetMapping("/products/ai-search")
    public ResponseEntity<List<Product>> aiSearch(@RequestParam String query) {
        return ResponseEntity.ok(aiService.semanticSearch(query));
    }
}
