package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaqarService {

    // Credenciales de MiCorreo
    private final String micorreoUser = "MBrocheroOttaAPI";
    private final String micorreoPass = "Ropero03+";

    @Value("${paqar.cp.origen:5986}")
    private String cpOrigen;

    private static final String LOGIN_URL = "https://micorreo.correoargentino.com.ar/api/login"; // URL estimativa
    private static final String RATES_URL = "https://micorreo.correoargentino.com.ar/api/rates"; // URL estimativa
    
    private String tokenJwt = null;
    private long tokenExpiracion = 0;

    /**
     * Obtiene el token de autenticación de MiCorreo y lo almacena en caché temporalmente
     */
    private synchronized String obtenerToken() {
        if (tokenJwt != null && System.currentTimeMillis() < tokenExpiracion) {
            return tokenJwt;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("username", micorreoUser);
            body.put("password", micorreoPass);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(LOGIN_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                if (respBody.containsKey("token")) {
                    tokenJwt = respBody.get("token").toString();
                    // Expiración por defecto 2 horas (7200000 ms)
                    tokenExpiracion = System.currentTimeMillis() + 7200000;
                    System.out.println("✅ Autenticado en MiCorreo exitosamente.");
                    return tokenJwt;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error al autenticar en MiCorreo (Puede que la URL sea distinta): " + e.getMessage());
        }
        return null;
    }

    /**
     * Intenta cotizar con la API de Correo Argentino usando JWT Token.
     */
    public Double cotizarEnvio(String cpDestino, Double pesoKg) {
        
        String token = obtenerToken();
        
        if (token == null) {
            System.out.println("⚠️ No se pudo obtener Token. Usando tabla de contingencia de Correo Argentino.");
            return null;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> body = new HashMap<>();
            
            Map<String, Object> sender = new HashMap<>();
            sender.put("zipCode", cpOrigen);
            
            Map<String, Object> receiver = new HashMap<>();
            receiver.put("zipCode", cpDestino);
            
            Map<String, Object> paquete = new HashMap<>();
            paquete.put("weight", pesoKg);
            paquete.put("volume", 0.01); // Volumen estimado obligatorio en algunas APIs

            body.put("sender", sender);
            body.put("receiver", receiver);
            body.put("package", paquete);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(RATES_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                
                if (respBody.containsKey("rate")) {
                    return Double.valueOf(respBody.get("rate").toString());
                } else if (respBody.containsKey("price")) {
                    return Double.valueOf(respBody.get("price").toString());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error cotizando en MiCorreo: " + e.getMessage());
        }

        return null; // Fallback
    }

    /**
     * Tabla de precios hardcodeada como Plan B por si la API se cae.
     */
    public Double cotizarContingencia(Double peso) {
        if (peso < 1) return 6800.0;
        if (peso < 5) return 8500.0;
        if (peso < 10) return 11500.0;
        if (peso < 15) return 14200.0;
        return 18000.0;
    }
}
