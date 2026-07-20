package com.tienda.web.controller;

import com.tienda.web.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*") // Permite que tu Frontend hable con este Backend
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<Map<String, String>> iniciarPago(@RequestBody Map<String, Object> payload) {

        // 1. Recibimos el monto del Frontend (aseguramos formato decimal correcto ej:
        // "1500.00")
        // Fiserv es muy estricto: no quiere símbolos de moneda, solo números y punto.
        Double montoNumerico = Double.valueOf(payload.get("monto").toString());
        String montoFormateado = String.format("%.2f", montoNumerico).replace(",", ".");

        // 2. Generamos la fecha/hora actual en el formato que exige Fiserv
        // (YYYY:MM:DD-hh:mm:ss)
        String fechaHora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy:MM:dd-HH:mm:ss"));

        // 3. Generamos el HASH usando nuestro servicio secreto
        String hash = paymentService.crearHash(montoFormateado, fechaHora);

        // 4. Preparamos la respuesta para la web
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("storename", paymentService.getStoreId());
        respuesta.put("currency", paymentService.getCurrency());
        respuesta.put("txndatetime", fechaHora);
        respuesta.put("chargetotal", montoFormateado);
        respuesta.put("hash", hash);
        // URL de Fiserv (IPG Connect) - Cambiaremos a producción cuando tengas
        // credenciales
        // URL PRODUCCIÓN: https://www5.ipg-online.com/connect/gateway/processing
        respuesta.put("urlFiserv", "https://www5.ipg-online.com/connect/gateway/processing");

        // ESPÍA SEGURO PARA LOS LOGS DE RAILWAY
        System.out.println("===== DEBUG PAGO =====");
        System.out.println("Store ID inyectado: " + paymentService.getStoreId());
        System.out.println("Largo del Shared Secret: " +
                (paymentService.getSharedSecret() != null ? paymentService.getSharedSecret().length() : "ES NULO!"));
        System.out.println("JSON a devolver al front: " + respuesta.toString());
        System.out.println("======================");

        return ResponseEntity.ok(respuesta);
    }
}
