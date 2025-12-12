package com.tienda.web.controller;

import com.tienda.web.model.Articulo;
import com.tienda.web.repository.ArticuloRepository;
import com.tienda.web.service.LibroDiarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookOrdenController {

    @Autowired
    private ArticuloRepository articuloRepository;
    @Autowired
    private LibroDiarioService libroDiarioService;

    @PostMapping("/order")
    public ResponseEntity<Void> recibirOrdenTiendaNube(@RequestBody Map<String, Object> payload) {
        System.out.println("📦 Pedido recibido desde Tienda Nube:");
        System.out.println(payload);

        try {
            List<Map<String, Object>> productos = (List<Map<String, Object>>) payload.get("products");
            Map<String, Object> customer = (Map<String, Object>) payload.get("customer");

            String nombreCliente = customer != null ? (String) customer.get("name") : "Cliente Tienda Nube";
            StringBuilder detalleArticulos = new StringBuilder();
            double total = 0;
            double ganancia = 0;

            for (Map<String, Object> producto : productos) {
                Long variantId = ((Number) producto.get("variant_id")).longValue();
                int cantidadVendida = ((Number) producto.get("quantity")).intValue();
                double precioUnitario = Double.parseDouble(producto.get("price").toString());

                Articulo articulo = articuloRepository.findAll().stream()
                        .filter(a -> a.getIdTiendaNube() != null && a.getIdTiendaNube().equals(variantId))
                        .findFirst()
                        .orElse(null);

                if (articulo == null) {
                    System.out.println("❗ No se encontró el artículo con variant_id: " + variantId);
                    continue;
                }

                int stockActual = articulo.getCant1();
                int nuevoStock = Math.max(0, stockActual - cantidadVendida);
                articulo.setCant1(nuevoStock);
                articuloRepository.save(articulo);

                System.out.println(
                        "✅ Stock actualizado de " + articulo.getNombre() + ": " + stockActual + " → " + nuevoStock);

                // Calcular total y ganancia
                detalleArticulos.append(articulo.getNombre()).append(" x").append(cantidadVendida).append(" / ");
                total += precioUnitario * cantidadVendida;
                ganancia += (precioUnitario - articulo.getPrecioCompra()) * cantidadVendida;
            }

            if (detalleArticulos.length() > 3) {
                detalleArticulos.setLength(detalleArticulos.length() - 3); // quitar última barra
            }

            libroDiarioService.registrarVentaTiendaNube(nombreCliente, detalleArticulos.toString(), total, ganancia);
            System.out.println("📝 Venta registrada en el libro diario.");

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.err.println("❌ Error al procesar el webhook de orden: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
