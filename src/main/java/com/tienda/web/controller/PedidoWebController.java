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
import java.time.ZoneId;
import java.time.ZonedDateTime;
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

            // IMPORTANTE: NO DESCONTAMOS STOCK ACÁ. Se descuenta cuando Fiserv aprueba (o aprobación manual por transferencia).
            // Validamos stock pero no lo restamos de la DB todavía.
            for (ItemPedidoDto item : datos.items()) {
                var articulo = articuloRepository.findById(item.id())
                        .orElseThrow(() -> new RuntimeException("Artículo no encontrado: " + item.id()));

                int totalStock = articulo.getCant1() + articulo.getCant3();
                if (totalStock < item.cantidad()) {
                    throw new RuntimeException("Sin stock suficiente para: " + articulo.getNombre());
                }
            }

            if ("transferencia".equalsIgnoreCase(datos.medioPago())) {
                pedido.setEstado("PENDIENTE_TRANSFERENCIA");
            } else {
                pedido.setEstado("PENDIENTE_PAGO");
            }

            pedidoRepository.save(pedido);

            // PREPARAMOS LOS DATOS PARA FISERV
            String montoFormateado = String.format("%.2f", pedido.getTotalFinal()).replace(",", ".");
            String fechaHora = ZonedDateTime.now(ZoneId.of("America/Buenos_Aires")).format(DateTimeFormatter.ofPattern("yyyy:MM:dd-HH:mm:ss"));
            String hash = paymentService.crearHashExtendido(montoFormateado, fechaHora, datos.numberOfInstallments());

            // RESPONDEMOS AL FRONTEND CON EL JSON COMPLETO
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idPedido", pedido.getId());
            respuesta.put("storename", paymentService.getStoreId());
            respuesta.put("currency", paymentService.getCurrency());
            respuesta.put("txndatetime", fechaHora);
            respuesta.put("chargetotal", montoFormateado);
            respuesta.put("hashExtended", hash);
            respuesta.put("urlFiserv", "https://test.ipg-online.com/connect/gateway/processing");
            respuesta.put("responseSuccessURL", "https://elarcahome.com.ar/api/pedidos/retorno-exito");
            respuesta.put("responseFailURL", "https://elarcahome.com.ar/api/pedidos/retorno-fallo");
            respuesta.put("hash_algorithm", "HMACSHA256");
            respuesta.put("timezone", "America/Buenos_Aires");
            respuesta.put("checkoutoption", "combinedpage");
            if (datos.numberOfInstallments() != null && datos.numberOfInstallments() > 1) {
                respuesta.put("numberOfInstallments", datos.numberOfInstallments());
            }
            respuesta.put("txntype", "sale");

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

    // El frontend hará fetch a este endpoint cuando Fiserv retorne.
    // Aunque normalmente Fiserv hace un form POST directo al Controller que devuelve una vista,
    // nosotros lo vamos a interceptar.
    @PostMapping(value = "/retorno-exito", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Transactional
    public void pagoExitoso(@RequestParam Map<String, String> allParams, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        System.out.println("====== FISERV PAGO EXITOSO ======");
        allParams.forEach((k, v) -> System.out.println(k + ": " + v));
        // Aquí iría la lógica definitiva para buscar el Pedido y descontar el stock
        // Por el momento, simplemente evitamos el Error 404 redirigiendo a la pantalla final.
        response.sendRedirect("/exito.html");
    }

    @PostMapping(value = "/retorno-fallo", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public void pagoFallido(@RequestParam Map<String, String> allParams, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        System.out.println("====== FISERV PAGO FALLIDO ======");
        allParams.forEach((k, v) -> System.out.println(k + ": " + v));
        response.sendRedirect("/fallo.html");
    }
}