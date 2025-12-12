package com.tienda.web.controller;

import com.tienda.web.model.Articulo;
import com.tienda.web.repository.ArticuloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/webhook")
public class PedidoController {

    @Autowired
    private ArticuloRepository articuloRepository;

    @PostMapping("/tiendanube")
    public ResponseEntity<Void> recibirWebhookTiendaNube(@RequestBody Map<String, Object> payload) {
        System.out.println("Webhook recibido: " + payload);

        try {
            List<Map<String, Object>> productos = (List<Map<String, Object>>) payload.get("products");

            for (Map<String, Object> producto : productos) {
                String nombre = (String) producto.get("name");
                Integer cantidadVendida = ((Number) producto.get("quantity")).intValue();

                Articulo articulo = articuloRepository.findByNombreArticulo(nombre);
                if (articulo != null) {
                    int stockTotal = articulo.getCant1();
                    int nuevoStock = Math.max(stockTotal - cantidadVendida, 0);

                    articulo.setCant1(nuevoStock);

                    articuloRepository.save(articulo);
                    System.out.println("Stock actualizado: " + nombre + " -> " + nuevoStock);
                } else {
                    System.out.println("Artículo no encontrado en BD: " + nombre);
                }
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.err.println("Error procesando webhook: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
