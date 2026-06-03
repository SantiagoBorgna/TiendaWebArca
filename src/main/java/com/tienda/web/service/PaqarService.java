package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaqarService {

    private final String micorreoUser = "MBrocheroOttaAPI";
    private final String micorreoPass = "Ropero03+";

    @Value("${paqar.cp.origen:5986}")
    private String cpOrigen;

    private static final String TOKEN_URL = "https://api.correoargentino.com.ar/micorreo/v1/token";
    private static final String RATES_URL = "https://api.correoargentino.com.ar/micorreo/v1/rates";
    
    private String tokenJwt = null;
    private long tokenExpiracion = 0;

    private synchronized String obtenerToken() {
        if (tokenJwt != null && System.currentTimeMillis() < tokenExpiracion) {
            return tokenJwt;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            
            String auth = micorreoUser + ":" + micorreoPass;
            byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
            String authHeader = "Basic " + new String(encodedAuth);
            headers.set("Authorization", authHeader);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>("", headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                if (respBody.containsKey("token")) {
                    tokenJwt = respBody.get("token").toString();
                    tokenExpiracion = System.currentTimeMillis() + 3600000; // 1 hora
                    System.out.println("✅ Autenticado en MiCorreo exitosamente.");
                    return tokenJwt;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error al autenticar en MiCorreo: " + e.getMessage());
        }
        return null;
    }

    public Double cotizarEnvio(String cpDestino, Double pesoKg) {
        
        String token = obtenerToken();
        
        if (token == null) {
            return null;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> body = new HashMap<>();
            body.put("postalCodeOrigin", cpOrigen);
            body.put("postalCodeDestination", cpDestino);
            body.put("deliveredType", "D"); // Domicilio
            
            Map<String, Object> dimensions = new HashMap<>();
            dimensions.put("weight", (int)(pesoKg * 1000)); // En gramos
            dimensions.put("height", 10);
            dimensions.put("width", 20);
            dimensions.put("length", 30);
            
            body.put("dimensions", dimensions);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(RATES_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                if (respBody.containsKey("rates")) {
                    List<Map<String, Object>> rates = (List<Map<String, Object>>) respBody.get("rates");
                    if (!rates.isEmpty()) {
                        Map<String, Object> rateInfo = rates.get(0);
                        if (rateInfo.containsKey("price")) {
                            return Double.valueOf(rateInfo.get("price").toString());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error cotizando en MiCorreo: " + e.getMessage());
        }

        return null; 
    }
}
