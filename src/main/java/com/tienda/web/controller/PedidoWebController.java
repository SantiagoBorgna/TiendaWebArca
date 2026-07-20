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

    @Autowired
    private com.tienda.web.service.MailService mailService;

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

            // Resumen de Artículos (incluimos id para descontar stock post-pago)
            String resumen = datos.items().stream()
                    .map(i -> i.nombre() + " x" + i.cantidad() + " (id:" + i.id() + ")")
                    .collect(Collectors.joining(" | "));
            pedido.setResumenArticulos(resumen);

            // IMPORTANTE: DESCONTAMOS STOCK ACÁ al momento de crear el pedido (Reserva de stock).
            for (ItemPedidoDto item : datos.items()) {
                var articulo = articuloRepository.findById(item.id())
                        .orElseThrow(() -> new RuntimeException("Artículo no encontrado: " + item.id()));

                int cant1 = articulo.getCant1();
                int cant3 = articulo.getCant3();
                int totalStock = cant1 + cant3;

                if (totalStock < item.cantidad()) {
                    throw new RuntimeException("Sin stock suficiente para: " + articulo.getNombre());
                }

                if (cant1 >= item.cantidad()) {
                    articulo.setCant1(cant1 - item.cantidad());
                } else {
                    int restante = item.cantidad() - cant1;
                    articulo.setCant1(0);
                    articulo.setCant3(cant3 - restante);
                }
                articuloRepository.save(articulo);
            }

            if ("transferencia".equalsIgnoreCase(datos.medioPago())) {
                pedido.setEstado("PENDIENTE_TRANSFERENCIA");
                pedidoRepository.save(pedido);
                mailService.enviarMailNuevaVentaDuenaAsync(pedido);
            } else {
                pedido.setEstado("PENDIENTE_PAGO");
                pedidoRepository.save(pedido);
            }

            // URLs con ID inyectado en el path (El Caballo de Troya que ya probamos que Fiserv no rechaza y devuelve exitosamente)
            String urlExito = "https://elarcahome.com.ar/api/pedidos/retorno-exito/" + pedido.getId();
            String urlFallo = "https://elarcahome.com.ar/api/pedidos/retorno-fallo/" + pedido.getId();
            String urlWebhook = "https://elarcahome.com.ar/api/pedidos/webhook-fiserv/" + pedido.getId();

            String montoFormateado = String.format("%.2f", pedido.getTotalFinal()).replace(",", ".");
            String fechaHora = ZonedDateTime.now(ZoneId.of("America/Buenos_Aires")).format(DateTimeFormatter.ofPattern("yyyy:MM:dd-HH:mm:ss"));
            String hash = paymentService.crearHashExtendido(montoFormateado, fechaHora, datos.numberOfInstallments(), urlExito, urlFallo, urlWebhook);

            // RESPONDEMOS AL FRONTEND CON EL JSON COMPLETO
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idPedido", pedido.getId());
            respuesta.put("storename", paymentService.getStoreId());
            respuesta.put("currency", paymentService.getCurrency());
            respuesta.put("txndatetime", fechaHora);
            respuesta.put("chargetotal", montoFormateado);
            respuesta.put("hashExtended", hash);
            respuesta.put("urlFiserv", "https://www.ipg-online.com/connect/gateway/processing");
            respuesta.put("responseSuccessURL", urlExito);
            respuesta.put("responseFailURL", urlFallo);
            respuesta.put("hash_algorithm", "HMACSHA256");
            respuesta.put("timezone", "America/Buenos_Aires");
            respuesta.put("checkoutoption", "combinedpage");
            respuesta.put("authenticateTransaction", "true");
            respuesta.put("threeDSRequestorChallengeIndicator", "01");
            respuesta.put("transactionNotificationURL", urlWebhook);
            respuesta.put("numberOfInstallments", (datos.numberOfInstallments() != null && datos.numberOfInstallments() >= 1) ? datos.numberOfInstallments() : 1);
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
    @PostMapping(value = "/retorno-exito/{idPedido}", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Transactional
    public void pagoExitoso(@RequestParam Map<String, String> allParams, @PathVariable(value = "idPedido", required = false) Long idPedido, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        System.out.println("====== FISERV PAGO EXITOSO ======");
        allParams.forEach((k, v) -> System.out.println(k + ": " + v));
        
        if (idPedido != null) {
            pedidoRepository.findById(idPedido).ifPresent(pedido -> {
                if (!"PAGADO".equals(pedido.getEstado())) {
                    pedido.setEstado("PAGADO");
                    
                    String ipgTxnId = allParams.get("ipgTransactionId");
                    if (ipgTxnId != null) {
                        pedido.setIdTransaccionFiserv(ipgTxnId);
                    }
                    
                    pedidoRepository.save(pedido);
                    mailService.enviarMailConfirmacionAsync(pedido, false);
                    System.out.println("Pedido " + idPedido + " PAGADO. (Stock ya fue reservado en checkout). Correo enviado.");
                }
            });
        }
        
        response.sendRedirect("/exito");
    }

    @PostMapping(value = "/retorno-fallo/{idPedido}", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Transactional
    public void pagoFallido(@RequestParam Map<String, String> allParams, @PathVariable(value = "idPedido", required = false) Long idPedido, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        System.out.println("====== FISERV PAGO FALLIDO ======");
        allParams.forEach((k, v) -> System.out.println(k + ": " + v));
        
        if (idPedido != null) {
            pedidoRepository.findById(idPedido).ifPresent(pedido -> {
                if ("PENDIENTE_PAGO".equals(pedido.getEstado())) {
                    pedido.setEstado("FALLIDO");
                    reponerStockDeResumen(pedido);
                    pedidoRepository.save(pedido);
                    System.out.println("Pedido " + idPedido + " FALLIDO. Stock devuelto a inventario.");
                }
            });
        }
        
        response.sendRedirect("/fallo");
    }

    @PostMapping(value = "/webhook-fiserv/{idPedido}", consumes = org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Transactional
    public void webhookFiserv(@RequestParam Map<String, String> allParams, @PathVariable(value = "idPedido", required = false) Long idPedido) {
        System.out.println("====== FISERV WEBHOOK NOTIFICATION ======");
        allParams.forEach((k, v) -> System.out.println(k + ": " + v));
        
        String txntype = allParams.get("txntype");
        String status = allParams.get("status"); // IPG Connect a veces manda status=APPROVED
        String processorResponse = allParams.get("processor_response_code");
        
        boolean isApproved = "APPROVED".equalsIgnoreCase(status) || "APROBADO".equalsIgnoreCase(status) || "00".equals(processorResponse);
        boolean isDeclined = "DECLINED".equalsIgnoreCase(status) || "RECHAZADO".equalsIgnoreCase(status) || (!"00".equals(processorResponse) && processorResponse != null);
        
        if (idPedido != null) {
            pedidoRepository.findById(idPedido).ifPresent(pedido -> {
                    if (isApproved && !"PAGADO".equals(pedido.getEstado())) {
                        pedido.setEstado("PAGADO");
                        
                        String ipgTxnId = allParams.get("ipgTransactionId") != null ? allParams.get("ipgTransactionId") : allParams.get("endpointTransactionId");
                        if (ipgTxnId != null) {
                            pedido.setIdTransaccionFiserv(ipgTxnId);
                        }
                        
                        pedidoRepository.save(pedido);
                        mailService.enviarMailConfirmacionAsync(pedido, false);
                        System.out.println("Pedido " + idPedido + " PAGADO via WEBHOOK. Correo enviado.");
                    } else if (isDeclined && "PENDIENTE_PAGO".equals(pedido.getEstado())) {
                        pedido.setEstado("FALLIDO");
                        reponerStockDeResumen(pedido);
                        pedidoRepository.save(pedido);
                        System.out.println("Pedido " + idPedido + " FALLIDO via WEBHOOK. Stock devuelto a inventario.");
                    } else {
                        System.out.println("Webhook ignorado para pedido " + idPedido + ". Estado actual: " + pedido.getEstado() + ". isApproved: " + isApproved);
                    }
                });
        }
    }

    public void reponerStockDeResumen(PedidoWeb pedido) {
        String resumen = pedido.getResumenArticulos();
        if (resumen != null) {
            String[] items = resumen.split("\\|");
            for (String item : items) {
                try {
                    int xIndex = item.lastIndexOf("x");
                    int parenIndex = item.lastIndexOf("(id:");
                    int closeIndex = item.lastIndexOf(")");
                    
                    if (xIndex != -1 && parenIndex != -1 && closeIndex != -1) {
                        String cantStr = item.substring(xIndex + 1, parenIndex).trim();
                        String idStr = item.substring(parenIndex + 4, closeIndex).trim();
                        
                        int cantidad = Integer.parseInt(cantStr);
                        Integer idArt = Integer.parseInt(idStr);
                        
                        articuloRepository.findById(idArt).ifPresent(articulo -> {
                            int cant1Actual = articulo.getCant1();
                            articulo.setCant1(cant1Actual + cantidad);
                            articuloRepository.save(articulo);
                        });
                    }
                } catch (Exception ignored) { }
            }
        }
    }


}