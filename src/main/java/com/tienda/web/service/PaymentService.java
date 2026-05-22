package com.tienda.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Formatter;

@Service
public class PaymentService {
    @Value("${STORE_ID}")
    private String storeId;

    @Value("${SHARED_SECRET}")
    private String sharedSecret;

    // Moneda: 032 es el código numérico para Pesos Argentinos (ARS)
    private final String CURRENCY = "032";

    /**
     * Genera el HASH de seguridad que exige Fiserv.
     * Algoritmo estándar: SHA-256(storeId + txndatetime + chargetotal + currency +
     * sharedSecret)
     */
    public String crearHash(String montoTotal, String fechaHora) {
        try {
            // 1. Armamos la cadena de texto exacta que pide Fiserv
            String cadenaAEnciptar = storeId + fechaHora + montoTotal + CURRENCY + sharedSecret;

            System.out.println("🔒 Generando Hash para: " + cadenaAEnciptar); // Para depurar

            // 2. Aplicamos el algoritmo matemático SHA-256 (Hash extendido)
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(cadenaAEnciptar.getBytes(StandardCharsets.UTF_8));

            // 3. Convertimos los bytes raros a texto hexadecimal legible (Ej: a3f5...)
            return bytesToHex(hashBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el hash de pago", e);
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
}
