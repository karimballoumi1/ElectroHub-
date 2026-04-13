package com.ecommerce.app.ai;

import com.ecommerce.app.model.Product;
import com.ecommerce.app.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Value("${spring.ai.openai.api-key:null}")
    private String openaiApiKey;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${spring.ai.ollama.chat.model:qwen:7b}")
    private String ollamaModel;

    private final ProductService productService;
    private final RestTemplate restTemplate;

    public AIService(ProductService productService) {
        this.productService = productService;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> chat(String message) {
        String msg = message.toLowerCase();
        List<Product> allProducts = productService.getAllProducts();

        // 1. Extract price constraint from the message
        Double maxPrice = extractMaxPrice(msg);
        Double minPrice = extractMinPrice(msg);

        // 2. Detect category intent
        String categoryIntent = detectCategory(msg);

        // 3. Pre-filter products by category and price BEFORE sending to AI
        List<Product> filteredProducts = allProducts.stream()
            .filter(p -> {
                // Category filter
                if (categoryIntent != null && p.getCategory() != null) {
                    String catName = p.getCategory().getName().toLowerCase();
                    if (!catName.contains(categoryIntent)) return false;
                }
                // Price filters
                if (maxPrice != null && p.getPrice() > maxPrice) return false;
                if (minPrice != null && p.getPrice() < minPrice) return false;
                return true;
            })
            .collect(Collectors.toList());

        // If category filter returned nothing, try keyword matching on all products
        if (filteredProducts.isEmpty()) {
            String[] keywords = msg.replaceAll("[^a-zA-Z0-9àâéèêëïîôùûüç ]", "").split("\\s+");
            filteredProducts = allProducts.stream()
                .filter(p -> {
                    String fullText = (p.getName() + " " + (p.getDescription() != null ? p.getDescription() : "")).toLowerCase();
                    for (String kw : keywords) {
                        if (kw.length() >= 3 && fullText.contains(kw)) return true;
                    }
                    return false;
                })
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .collect(Collectors.toList());
        }

        // Limit to 10 for context window
        List<Product> recommendedProducts = filteredProducts.stream().limit(10).collect(Collectors.toList());

        // 4. Build a strict product list ONLY from filtered results
        StringBuilder productList = new StringBuilder();
        int idx = 1;
        for (Product p : recommendedProducts) {
            String catName = p.getCategory() != null ? p.getCategory().getName() : "N/A";
            productList.append(String.format("%d. %s - $%.2f [%s]\n", idx++, p.getName(), p.getPrice(), catName));
        }

        String aiResponse = "";

        // 5. Query Ollama with a STRICT prompt
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String systemPrompt = 
                "Tu es l'assistant de la boutique ElectroHub. " +
                "RÈGLE ABSOLUE : Tu ne dois JAMAIS inventer de produits. Tu ne dois mentionner QUE les produits listés ci-dessous.\n\n" +
                "PRODUITS DISPONIBLES DANS NOTRE BOUTIQUE :\n" +
                (recommendedProducts.isEmpty() 
                    ? "Aucun produit ne correspond aux critères.\n" 
                    : productList.toString()) +
                "\nINSTRUCTIONS :\n" +
                "- Réponds UNIQUEMENT en citant les produits de la liste ci-dessus avec leurs vrais noms et vrais prix.\n" +
                "- Ne mentionne AUCUN produit qui n'est pas dans la liste.\n" +
                "- Si la liste est vide ou qu'aucun produit ne correspond, dis : 'Désolé, nous n'avons pas ce type de produit dans notre catalogue.'\n" +
                "- Sois bref, amical et professionnel.\n" +
                "- Réponds en français.";

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("model", ollamaModel);
            reqBody.put("stream", false);
            
            // Low temperature to avoid hallucinations
            Map<String, Object> options = new HashMap<>();
            options.put("temperature", 0.1);
            options.put("top_p", 0.9);
            reqBody.put("options", options);

            List<Map<String, String>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", message));

            reqBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                ollamaBaseUrl + "/api/chat", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map messageMap = (Map) response.getBody().get("message");
                if (messageMap != null) {
                    aiResponse = (String) messageMap.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("Ollama API call failed: " + e.getMessage());
        }

        // 6. Fallback if Ollama is down — generate response from filtered data
        if (aiResponse == null || aiResponse.isEmpty()) {
            if (recommendedProducts.isEmpty()) {
                aiResponse = "Désolé, nous n'avons pas de produit correspondant à votre recherche dans notre catalogue.";
            } else {
                StringBuilder sb = new StringBuilder("Voici les produits de notre boutique qui correspondent :\n\n");
                for (Product p : recommendedProducts) {
                    sb.append(String.format("• **%s** — $%.2f\n", p.getName(), p.getPrice()));
                }
                aiResponse = sb.toString();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", aiResponse);
        response.put("products", recommendedProducts);

        return response;
    }

    // --- Helper: Extract max price from message ---
    private Double extractMaxPrice(String msg) {
        // Patterns: "moins de 1000", "under 1000", "inférieur à 1000", "< 1000", "max 1000"
        java.util.regex.Pattern[] patterns = {
            java.util.regex.Pattern.compile("(?:moins de|under|inférieur à|inferieur a|max|maximum|below|cheaper than|pas plus de|en dessous de)\\s*(\\d+(?:\\.\\d+)?)"),
            java.util.regex.Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:dollar|\\$|euros?)\\s*(?:max|maximum)"),
            java.util.regex.Pattern.compile("<\\s*(\\d+(?:\\.\\d+)?)"),
            java.util.regex.Pattern.compile("budget\\s*(?:de|of|:)?\\s*(\\d+(?:\\.\\d+)?)"),
        };
        for (var pattern : patterns) {
            var matcher = pattern.matcher(msg);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1));
            }
        }
        return null;
    }

    // --- Helper: Extract min price from message ---
    private Double extractMinPrice(String msg) {
        java.util.regex.Pattern[] patterns = {
            java.util.regex.Pattern.compile("(?:plus de|over|supérieur à|superieur a|min|minimum|above|more than)\\s*(\\d+(?:\\.\\d+)?)"),
            java.util.regex.Pattern.compile(">\\s*(\\d+(?:\\.\\d+)?)"),
        };
        for (var pattern : patterns) {
            var matcher = pattern.matcher(msg);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1));
            }
        }
        return null;
    }

    // --- Helper: Detect category intent ---
    private String detectCategory(String msg) {
        Map<String, List<String>> categoryKeywords = new HashMap<>();
        categoryKeywords.put("smartphone", List.of("phone", "téléphone", "telephone", "smartphone", "mobile", "cellulaire", "iphone", "samsung", "android"));
        categoryKeywords.put("laptop", List.of("laptop", "ordinateur", "portable", "pc", "notebook", "macbook", "computer"));
        categoryKeywords.put("tablet", List.of("tablet", "tablette", "ipad"));
        categoryKeywords.put("headphone", List.of("headphone", "casque", "écouteur", "ecouteur", "earphone", "earbud", "audio"));
        categoryKeywords.put("watch", List.of("watch", "montre", "smartwatch"));
        categoryKeywords.put("camera", List.of("camera", "caméra", "appareil photo"));
        categoryKeywords.put("accessori", List.of("accessoire", "accessory", "cable", "chargeur", "charger", "case", "coque"));

        for (var entry : categoryKeywords.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (msg.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    public List<Product> semanticSearch(String query) {
        String q = query.toLowerCase();
        List<Product> products = productService.getAllProducts();
        return products.stream()
                .filter(p -> p.getName().toLowerCase().contains(q) || 
                             p.getDescription().toLowerCase().contains(q) ||
                             (p.getCategory() != null && p.getCategory().getName().toLowerCase().contains(q)))
                .collect(Collectors.toList());
    }
}
