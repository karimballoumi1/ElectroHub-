package com.ecommerce.app.service;

import com.ecommerce.app.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNewProductNotification(Product product, String recipientEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("ElectroHub <noreply@electrohub.com>");
        message.setTo(recipientEmail);
        message.setSubject("New Product Added: " + product.getName());
        
        String content = String.format(
            "Hello,\n\nA new product has been added to ElectroHub:\n\n" +
            "Name: %s\n" +
            "Price: $%.2f\n" +
            "Stock: %d\n" +
            "Description: %s\n\n" +
            "Check it out on our store!",
            product.getName(), product.getPrice(), product.getStock(), product.getDescription()
        );
        
        message.setText(content);
        
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to " + recipientEmail);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            // We don't throw an exception to avoid breaking the product creation flow
        }
    }
}
