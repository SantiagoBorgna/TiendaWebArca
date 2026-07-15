package com.tienda.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class FrontendController {

    // Redirigen a index.html
    @GetMapping({
            "/",
            "/todos",
            "/bazar",
            "/bano",
            "/decoracion",
            "/textil",
            "/muebles-interior",
            "/muebles-exterior",
            "/sillones",
            "/banquetas",
            "/sillas",
            "/mesas",
            "/oficina",
            "/mesas-ratonas"
    })
    public String index() {
        return "forward:/index.html";
    }

    // Redirigen a detalle.html
    @GetMapping("/p/{id}/{nombre}")
    public String detalleProducto(@PathVariable String id, @PathVariable String nombre) {
        return "forward:/detalle.html";
    }

    @GetMapping("/resumen")
    public String resumenCompra() {
        return "forward:/resumen.html";
    }

    @GetMapping("/pago")
    public String pagoCompra() {
        return "forward:/pago.html";
    }

    @GetMapping("/exito")
    public String exito() {
        return "forward:/exito.html";
    }

    @GetMapping("/fallo")
    public String fallo() {
        return "forward:/fallo.html";
    }

    @GetMapping("/transferencia")
    public String transferencia() {
        return "forward:/transferencia_exitosa.html";
    }

    @GetMapping("/terminos")
    public String terminos() {
        return "forward:/terminos.html";
    }
}