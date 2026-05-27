package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Formatter;
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
            // Generación de HASH avanzado utilizando HMAC-SHA256 que requiere Fiserv Connect
            // Separador es Pipe (|) y NO se incluye el SharedSecret al final del string.
            String cadenaAEnciptar = storeId + "|" + fechaHora + "|" + montoTotal + "|" + CURRENCY;

            System.out.println("🔒 Generando HMAC Hash para: " + cadenaAEnciptar);

            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            
            byte[] hashBytes = sha256_HMAC.doFinal(cadenaAEnciptar.getBytes(StandardCharsets.UTF_8));

            // Convertir a base64 o hex? Fiserv Connect usa Hex para HMAC.
            return bytesToHex(hashBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el hash de pago HMAC", e);
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
