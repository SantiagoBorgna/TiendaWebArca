package com.tienda.web.controller;

import com.tienda.web.dto.DatosAltaPedido;
import com.tienda.web.dto.ItemPedidoDto;
import com.tienda.web.model.Articulo;
import com.tienda.web.model.PedidoWeb;
import com.tienda.web.repository.ArticuloRepository;
import com.tienda.web.repository.PedidoWebRepository;
import com.tienda.web.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoWebController {

    @Autowired
    private PedidoWebRepository pedidoRepository;

    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<?> crearPedido(@RequestBody DatosAltaPedido datos) {
        try {
            PedidoWeb pedido = new PedidoWeb();

            // Datos Cliente
            pedido.setNombreCliente(datos.nombre());
            pedido.setApellidoCliente(datos.apellido());
            pedido.setDni(datos.dni());
            pedido.setTelefono(datos.telefono());
            pedido.setEmail(datos.email());

            // Datos Envío
            pedido.setCalle(datos.calle());
            pedido.setNumero(datos.numero());
            pedido.setPisoDepto(datos.pisoDepto());
            pedido.setCiudad(datos.ciudad());
            pedido.setProvincia(datos.provincia());
            pedido.setCodigoPostal(datos.cp());

            // Logística y Pago
            pedido.setMetodoEnvio(datos.metodoEnvio());
            pedido.setCostoEnvio(datos.costoEnvio());
            pedido.setMedioPago(datos.medioPago());

            // Totales
            pedido.setTotalProductos(datos.totalProductos());
            pedido.setTotalFinal(datos.totalFinal());

            // Resumen de Artículos
            String resumen = datos.items().stream()
                    .map(i -> i.nombre() + " x" + i.cantidad())
                    .collect(Collectors.joining(", "));
            pedido.setResumenArticulos(resumen);

            // Descontar Stock
            for (ItemPedidoDto item : datos.items()) {
                var articulo = articuloRepository.findById(item.id())
                        .orElseThrow(() -> new RuntimeException("Artículo no encontrado: " + item.id()));

                int totalStock = articulo.getCant1() + articulo.getCant3();

                if (totalStock < item.cantidad()) {
                    throw new RuntimeException("Sin stock suficiente para: " + articulo.getNombre());
                }

                if (articulo.getCant1() >= item.cantidad()) {
                    articulo.setCant1(articulo.getCant1() - item.cantidad());
                } else {
                    int restante = item.cantidad() - articulo.getCant1();
                    articulo.setCant1(0);
                    articulo.setCant3(articulo.getCant3() - restante);
                }

                articuloRepository.save(articulo);
            }

            pedidoRepository.save(pedido);

            // PREPARAMOS LOS DATOS PARA FISERV
            String montoFormateado = String.format("%.2f", pedido.getTotalFinal()).replace(",", ".");
            String fechaHora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy:MM:dd-HH:mm:ss"));
            String hash = paymentService.crearHash(montoFormateado, fechaHora);

            // RESPONDEMOS AL FRONTEND CON EL JSON COMPLETO
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idPedido", pedido.getId());
            respuesta.put("storename", paymentService.getStoreId());
            respuesta.put("currency", paymentService.getCurrency());
            respuesta.put("txndatetime", fechaHora);
            respuesta.put("chargetotal", montoFormateado);
            respuesta.put("hash", hash);
            respuesta.put("urlFiserv", "https://test.ipg-online.com/connect/gateway/processing");

            // ESPÍA SEGURO PARA LOS LOGS DE RAILWAY
            System.out.println("===== DEBUG PAGO =====");
            System.out.println("Store ID inyectado: " + paymentService.getStoreId());
            System.out.println("Largo del Shared Secret: " +
                    (paymentService.getSharedSecret() != null ? paymentService.getSharedSecret().length()
                            : "ES NULO!"));
            System.out.println("JSON a devolver al front: " + respuesta.toString());
            System.out.println("======================");

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al procesar pedido: " + e.getMessage());
        }
    }
}