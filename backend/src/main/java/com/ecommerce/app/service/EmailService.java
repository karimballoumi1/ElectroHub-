package com.ecommerce.app.service;

import com.ecommerce.app.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import com.ecommerce.app.model.Order;
import com.ecommerce.app.model.OrderItem;
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

    public void sendWelcomeEmail(String recipientEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("ElectroHub <noreply@electrohub.com>");
        message.setTo(recipientEmail);
        message.setSubject("Inscription réussie - ElectroHub");
        
        String content = "Bonjour,\n\nLe compte a été créé avec succès.\nBienvenue sur ElectroHub !";
        
        message.setText(content);
        
        try {
            mailSender.send(message);
            System.out.println("Welcome email sent successfully to " + recipientEmail);
        } catch (Exception e) {
            System.err.println("Error sending welcome email: " + e.getMessage());
        }
    }

    public void sendOrderConfirmationEmail(Order order, String recipientEmail) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("ElectroHub <noreply@electrohub.com>");
            helper.setTo(recipientEmail);
            helper.setSubject("Confirmation de votre commande #" + order.getId());

            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<h2>Bonjour ").append(order.getFirstName()).append(",</h2>");
            htmlContent.append("<p>Merci pour votre commande ! Voici le récapitulatif :</p>");
            
            htmlContent.append("<table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%;'>");
            htmlContent.append("<tr style='background-color: #f2f2f2;'><th>Image</th><th>Produit</th><th>Quantité</th><th>Prix Unitaire</th><th>Sous-total</th></tr>");

            for (OrderItem item : order.getItems()) {
                String imageUrl = item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "https://via.placeholder.com/50";
                // If it's a relative URL, you might want to prepend your server address, e.g., http://localhost:8088/api/uploads/
                if (!imageUrl.startsWith("http")) {
                    imageUrl = "http://localhost:8088" + (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
                }
                
                double subTotal = item.getPrice() * item.getQuantity();
                htmlContent.append("<tr>");
                htmlContent.append("<td><img src='").append(imageUrl).append("' alt='produit' style='width: 50px; height: 50px; object-fit: cover;'/></td>");
                htmlContent.append("<td>").append(item.getProduct().getName()).append("</td>");
                htmlContent.append("<td style='text-align: center;'>").append(item.getQuantity()).append("</td>");
                htmlContent.append("<td>$").append(String.format("%.2f", item.getPrice())).append("</td>");
                htmlContent.append("<td>$").append(String.format("%.2f", subTotal)).append("</td>");
                htmlContent.append("</tr>");
            }
            
            htmlContent.append("</table>");
            htmlContent.append("<h3>Somme Totale : $").append(String.format("%.2f", order.getTotalPrice())).append("</h3>");
            htmlContent.append("<p>Votre commande sera expédiée à l'adresse suivante :<br/>");
            htmlContent.append(order.getAddress()).append("</p>");
            htmlContent.append("<p>À très bientôt sur ElectroHub !</p>");

            helper.setText(htmlContent.toString(), true);
            mailSender.send(message);
            System.out.println("Order confirmation email sent successfully to " + recipientEmail);

        } catch (Exception e) {
            System.err.println("Error sending order confirmation email: " + e.getMessage());
        }
    }
}
