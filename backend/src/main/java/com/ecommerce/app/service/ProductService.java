package com.ecommerce.app.service;

import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.ProductImage;
import com.ecommerce.app.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${notification.email}")
    private String notificationEmail;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Product createProduct(Product product) {
        if (product.getImages() != null) {
            product.getImages().forEach(img -> img.setProduct(product));
        } else {
            product.setImages(new java.util.ArrayList<>());
        }
        Product savedProduct = productRepository.save(product);
        
        // Send email notification
        emailService.sendNewProductNotification(savedProduct, notificationEmail);
        
        return savedProduct;
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setImageUrl(productDetails.getImageUrl());
        product.setStock(productDetails.getStock());
        
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            product.setCategory(productDetails.getCategory());
        }

        // Manage images: clear and replace to ensure orphanRemoval works
        if (product.getImages() == null) {
            product.setImages(new java.util.ArrayList<>());
        } else {
            product.getImages().clear();
        }

        if (productDetails.getImages() != null) {
            for (ProductImage imgDetails : productDetails.getImages()) {
                if (imgDetails.getUrl() != null && !imgDetails.getUrl().trim().isEmpty()) {
                    ProductImage newImg = new ProductImage();
                    newImg.setUrl(imgDetails.getUrl());
                    newImg.setProduct(product);
                    product.getImages().add(newImg);
                }
            }
        }
        
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
