package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Formatter;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class PaymentService {
    @Value("${STORE_ID}")
    private String storeId;

    @Value("${SHARED_SECRET}")
    private String sharedSecret;

    // Moneda: 032 es el código numérico para Pesos Argentinos (ARS)
    private final String CURRENCY = "032";

    public String crearHash(String montoTotal, String fechaHora) {
        try {
            String cadenaAEnciptar = storeId + "|" + fechaHora + "|" + montoTotal + "|" + CURRENCY;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hashBytes = sha256_HMAC.doFinal(cadenaAEnciptar.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error HMAC", e);
        }
    }

    public String crearHashExtendido(String montoTotal, String fechaHora) {
        try {
            // Documentación Fiserv: Hash Extendido HMAC-SHA256. 
            // Se deben ordenar los NOMBRES de los parámetros a enviar alfabéticamente:
            // chargetotal, currency, hash_algorithm, responseFailURL, responseSuccessURL, storename, txndatetime
            
            String responseFailURL = "https://elarcahome.com.ar/fallo";
            String responseSuccessURL = "https://elarcahome.com.ar/exito";
            String hashAlgorithm = "HMACSHA256";
            
            // Se concatenan sus VALORES separados por | (Hemos removido el OID opcional)
            String cadenaAEnciptar = montoTotal + "|" + CURRENCY + "|" + hashAlgorithm + "|" + responseFailURL + "|" + responseSuccessURL + "|" + storeId + "|" + fechaHora;

            System.out.println("🔒 Generando HMAC Hash Extendido para: " + cadenaAEnciptar);

            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            
            byte[] hashBytes = sha256_HMAC.doFinal(cadenaAEnciptar.getBytes(StandardCharsets.UTF_8));

            // Para Hash Extendido, Fiserv exige la firma en Base64
            return Base64.getEncoder().encodeToString(hashBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el hash extendido de pago HMAC", e);
        }
    }

    // Función auxiliar para convertir bytes a Hexadecimal
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    public String getStoreId() {
        return storeId;
    }

    public String getCurrency() {
        return CURRENCY;
    }

    public String getSharedSecret() {
        return sharedSecret;
    }
}
