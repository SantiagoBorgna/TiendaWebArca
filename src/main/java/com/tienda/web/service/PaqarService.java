package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaqarService {

    @Value("${paqar.api.key:}")
    private String apiKey;

    @Value("${paqar.agreement.id:}")
    private String agreementId;

    @Value("${paqar.cp.origen:5986}")
    private String cpOrigen;

    private static final String PAQAR_API_URL = "https://api.correoargentino.com.ar/api/v2/rates";

    /**
     * Intenta cotizar con la API de Correo Argentino.
     * Si no hay credenciales o la API falla, devuelve null para que el Controller use el fallback.
     */
    public Double cotizarEnvio(String cpDestino, Double pesoKg) {
        if (apiKey == null || apiKey.isEmpty() || agreementId == null || agreementId.isEmpty()) {
            System.out.println("⚠️ Credenciales de Paq.ar no configuradas. Usando tabla de contingencia.");
            return null;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Paq.ar API v2 usa típicamente estos headers para la autorización corporativa
            headers.set("api-key", apiKey);
            headers.set("agreement-id", agreementId);

            // Armamos el JSON de cotización estándar (ajustable según el manual definitivo)
            Map<String, Object> body = new HashMap<>();
            
            Map<String, Object> sender = new HashMap<>();
            sender.put("zipCode", cpOrigen);
            
            Map<String, Object> receiver = new HashMap<>();
            receiver.put("zipCode", cpDestino);
            
            Map<String, Object> paquete = new HashMap<>();
            // Paq.ar suele requerir el peso en gramos en algunas APIs, o en KG. Usamos KG por defecto.
            paquete.put("weight", pesoKg);
            // Volumen genérico mínimo si no se pide dimensiones
            paquete.put("volume", 0.01);

            body.put("sender", sender);
            body.put("receiver", receiver);
            body.put("package", paquete);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(PAQAR_API_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parseamos la respuesta (La estructura exacta dependerá del manual final)
                // Usualmente devuelve algo como { "rate": 8500.0, "deliveryTime": 3 }
                Map<String, Object> respBody = response.getBody();
                
                if (respBody.containsKey("rate")) {
                    return Double.valueOf(respBody.get("rate").toString());
                } else if (respBody.containsKey("price")) {
                    return Double.valueOf(respBody.get("price").toString());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error comunicándose con la API de Paq.ar: " + e.getMessage());
        }

        return null;
    }

    /**
     * Tabla de precios hardcodeada como Plan B por si la API se cae o no hay credenciales.
     */
    public Double cotizarContingencia(Double peso) {
        if (peso < 1) return 6800.0;
        if (peso < 5) return 8500.0;
        if (peso < 10) return 11500.0;
        if (peso < 15) return 14200.0;
        return 18000.0;
    }
}
