package com.tienda.web.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhook")
public class WebhookPrivacidadController {

    @PostMapping("/store")
    public ResponseEntity<Void> handleStoreRedact() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customers")
    public ResponseEntity<Void> handleCustomerRedact() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customers/data-request")
    public ResponseEntity<Void> handleCustomerDataRequest() {
        return ResponseEntity.ok().build();
    }
}
