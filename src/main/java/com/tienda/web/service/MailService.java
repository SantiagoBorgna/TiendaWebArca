package com.tienda.web.service;

import com.tienda.web.model.PedidoWeb;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.concurrent.CompletableFuture;
import java.util.Map;
import java.util.HashMap;

@Service
public class MailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    public void enviarMailConfirmacionAsync(PedidoWeb pedido, boolean esTransferencia) {
        // Ejecutamos en otro hilo para no bloquear la respuesta HTTP
        CompletableFuture.runAsync(() -> {
            try {
                System.out.println("Iniciando envío asíncrono de correo via Resend a: " + pedido.getEmail());
                
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + resendApiKey);

                String subject = esTransferencia ? "Confirmación de Pedido - Pendiente de Transferencia (#" + pedido.getId() + ")" 
                                                 : "¡Pago Exitoso! Tu pedido en El Arca Home (#" + pedido.getId() + ")";
                
                String htmlMsg = generarCuerpoHtml(pedido, esTransferencia);

                Map<String, Object> body = new HashMap<>();
                body.put("from", "ventas@elarcahome.com.ar"); 
                body.put("to", pedido.getEmail());
                body.put("subject", subject);
                body.put("html", htmlMsg);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                
                ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
                System.out.println("Correo enviado exitosamente via Resend a: " + pedido.getEmail() + " - Code: " + response.getStatusCode());

                // --- ALERTA A LA DUEÑA ---
                enviarMailNuevaVentaDuenaAsync(pedido);
                
            } catch (Exception e) {
                System.err.println("Error enviando correo con Resend: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    public void enviarMailNuevaVentaDuenaAsync(PedidoWeb pedido) {
        CompletableFuture.runAsync(() -> {
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + resendApiKey);

                String subjectDuena = "NUEVA VENTA ONLINE - Pedido #" + pedido.getId();
                String htmlDuena = "<html><body style='font-family: Arial;'><h2 style='color:#111;'>Ingresó un nuevo pedido</h2>"
                                 + "<p>El cliente <b>" + pedido.getNombreCliente() + " " + pedido.getApellidoCliente() + "</b> acaba de realizar un pedido por <b>$" + String.format("%,.2f", pedido.getTotalFinal()).replace(",", "X").replace(".", ",").replace("X", ".") + "</b>.</p>"
                                 + "<p>Por favor, revisá el sistema para ver los detalles y procesar el envío/retiro.</p></body></html>";

                Map<String, Object> bodyDuena = new HashMap<>();
                bodyDuena.put("from", "ventas@elarcahome.com.ar"); 
                bodyDuena.put("to", "elarcahome.deco@gmail.com");
                bodyDuena.put("subject", subjectDuena);
                bodyDuena.put("html", htmlDuena);

                HttpEntity<Map<String, Object>> requestDuena = new HttpEntity<>(bodyDuena, headers);
                restTemplate.postForEntity("https://api.resend.com/emails", requestDuena, String.class);
                System.out.println("Alerta de nueva venta enviada a la dueña.");
            } catch (Exception e) {
                System.err.println("Error enviando alerta a la dueña: " + e.getMessage());
            }
        });
    }

    private String generarCuerpoHtml(PedidoWeb pedido, boolean esTransferencia) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family: \"Inter\", Arial, sans-serif; background-color: #f9f9f9; color: #111; padding: 20px 0;'>");
        
        html.append("<div style='max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);'>");
        
        html.append("<div style='text-align: center; margin-bottom: 30px;'>");
        html.append("<img src='https://elarcahome.com.ar/images/logo-arca.png' alt='El Arca Home' style='max-width: 150px; height: auto;' />");
        html.append("</div>");
        
        if (esTransferencia) {
            html.append("<h2 style='text-align: center; color: #111; font-size: 24px; font-weight: 700; margin-bottom: 10px;'>¡Gracias por tu compra, ").append(pedido.getNombreCliente()).append("!</h2>");
            html.append("<p style='text-align: center; font-size: 16px; color: #555; line-height: 1.5;'>Tu pedido <strong>#").append(pedido.getId()).append("</strong> ha sido registrado correctamente.</p>");
            html.append("<p style='text-align: center; font-size: 16px; color: #555; line-height: 1.5;'>Al haber seleccionado pago por transferencia bancaria, estamos a la espera de que nos envíes el comprobante para procesar tu pedido.</p>");
        } else {
            html.append("<h2 style='text-align: center; color: #111; font-size: 24px; font-weight: 700; margin-bottom: 10px;'>¡Pago exitoso, ").append(pedido.getNombreCliente()).append("!</h2>");
            html.append("<p style='text-align: center; font-size: 16px; color: #555; line-height: 1.5;'>Tu pedido <strong>#").append(pedido.getId()).append("</strong> ha sido pagado y confirmado. ¡Ya estamos preparando todo!</p>");
        }

        html.append("<hr style='border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;'>");
        
        html.append("<h4 style='color: #111; font-size: 18px; margin-bottom: 15px;'>Resumen de tu compra</h4>");
        
        html.append("<div style='background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px;'>");
        html.append("<ul style='list-style-type: none; padding: 0; margin: 0;'>");
        
        if (pedido.getResumenArticulos() != null) {
            String[] items = pedido.getResumenArticulos().split("\\|");
            for (String item : items) {
                String itemLimpio = item.replaceAll("\\(id:\\d+\\)", "").trim();
                html.append("<li style='padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333;'>").append(itemLimpio).append("</li>");
            }
        }
        
        String tipoEnvio = pedido.getMetodoEnvio() != null ? pedido.getMetodoEnvio() : "Retiro en local";
        html.append("<li style='padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333;'><strong>Envío:</strong> ").append(tipoEnvio).append("</li>");
        html.append("<li style='padding: 12px 0 0 0; font-size: 18px; color: #111; font-weight: bold; text-align: right;'>Total: $").append(String.format("%,.2f", pedido.getTotalFinal()).replace(",", "X").replace(".", ",").replace("X", ".")).append("</li>");
        html.append("</ul>");
        html.append("</div>");

        html.append("<div style='margin-top: 40px; text-align: center;'>");
        html.append("<a href='https://elarcahome.com.ar' style='background-color: #111; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;'>Volver a la tienda</a>");
        html.append("</div>");

        html.append("<hr style='border: 0; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;'>");
        html.append("<p style='font-size: 12px; color: #999; text-align: center; margin: 0;'>Este es un correo automático de El Arca Home, por favor no respondas a esta dirección.</p>");
        
        html.append("</div></body></html>");
        
        return html.toString();
    }
}
