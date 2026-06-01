package com.tienda.web.service;

import com.tienda.web.model.PedidoWeb;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void enviarMailConfirmacionAsync(PedidoWeb pedido, boolean esTransferencia) {
        // Temporalmente sincrónico para forzar el logueo de errores en el request thread
        try {
            System.out.println("Iniciando envío de correo a: " + pedido.getEmail());
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(pedido.getEmail());

            String subject = esTransferencia ? "Confirmación de Pedido - Pendiente de Transferencia (#" + pedido.getId() + ")" 
                                             : "¡Pago Exitoso! Tu pedido en El Arca Home (#" + pedido.getId() + ")";
            helper.setSubject(subject);

            String htmlMsg = generarCuerpoHtml(pedido, esTransferencia);
            helper.setText(htmlMsg, true);

            mailSender.send(message);
            System.out.println("Correo enviado exitosamente a: " + pedido.getEmail());
        } catch (Exception e) {
            System.err.println("¡CRÍTICO! Error al enviar el correo a " + pedido.getEmail());
            e.printStackTrace();
        }
    }

    private String generarCuerpoHtml(PedidoWeb pedido, boolean esTransferencia) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
        
        html.append("<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>");
        
        html.append("<h2 style='color: #4CAF50; text-align: center;'>El Arca Home</h2>");
        
        if (esTransferencia) {
            html.append("<h3 style='text-align: center;'>¡Gracias por tu compra, ").append(pedido.getNombreCliente()).append("!</h3>");
            html.append("<p>Tu pedido <strong>#").append(pedido.getId()).append("</strong> ha sido registrado correctamente.</p>");
            html.append("<p>Al haber seleccionado pago por transferencia bancaria, estamos a la espera de que nos envíes el comprobante para procesar tu pedido.</p>");
        } else {
            html.append("<h3 style='text-align: center;'>¡Pago exitoso, ").append(pedido.getNombreCliente()).append("!</h3>");
            html.append("<p>Tu pedido <strong>#").append(pedido.getId()).append("</strong> ha sido pagado y confirmado. ¡Ya estamos preparando todo!</p>");
        }

        html.append("<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>");
        
        html.append("<h4>Resumen de tu compra:</h4>");
        html.append("<ul>");
        
        // Formatear el resumen que viene en formato "Silla x2 (id:4) | Mesa x1 (id:8)"
        if (pedido.getResumenArticulos() != null) {
            String[] items = pedido.getResumenArticulos().split("\\|");
            for (String item : items) {
                // Limpiar el (id:X) para el cliente
                String itemLimpio = item.replaceAll("\\(id:\\d+\\)", "").trim();
                html.append("<li>").append(itemLimpio).append("</li>");
            }
        }
        html.append("</ul>");

        html.append("<p><strong>Envío:</strong> ").append(pedido.getMetodoEnvio() != null ? pedido.getMetodoEnvio() : "Retiro en local").append("</p>");
        html.append("<p><strong>Total abonado:</strong> $").append(String.format("%.2f", pedido.getTotalFinal())).append("</p>");

        html.append("<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>");
        html.append("<p style='font-size: 12px; color: #777; text-align: center;'>Este es un correo automático, por favor no respondas a esta dirección.</p>");
        
        html.append("</div></body></html>");
        
        return html.toString();
    }
}
