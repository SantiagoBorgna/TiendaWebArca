package com.tienda.web.service;

import com.tienda.web.model.PedidoWeb;
import com.tienda.web.repository.PedidoWebRepository;
import com.tienda.web.controller.PedidoWebController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class StockSchedulerService {

    @Autowired
    private PedidoWebRepository pedidoRepository;

    @Autowired
    private PedidoWebController pedidoWebController;

    // Ejecuta cada 5 minutos (300000 ms)
    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void limpiarPedidosExpirados() {
        List<PedidoWeb> pedidos = pedidoRepository.findAll();
        LocalDateTime ahora = LocalDateTime.now(ZoneId.of("America/Buenos_Aires"));

        for (PedidoWeb p : pedidos) {
            if ("PENDIENTE_PAGO".equals(p.getEstado()) && p.getCreatedAt() != null) {
                // Si pasaron más de 30 minutos desde la creación
                if (p.getCreatedAt().plusMinutes(30).isBefore(ahora)) {
                    System.out.println("CronJob: Pedido " + p.getId() + " expirado (más de 30 min). Cancelando y devolviendo stock...");
                    p.setEstado("CANCELADO_POR_EXPIRACION");
                    
                    // Reponer stock usando el método del controller
                    pedidoWebController.reponerStockDeResumen(p);
                    
                    pedidoRepository.save(p);
                }
            }
        }
    }
}
