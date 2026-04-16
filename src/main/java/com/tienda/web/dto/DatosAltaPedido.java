package com.tienda.web.dto;

import java.util.List;

public record DatosAltaPedido(
                // Cliente
                String nombre,
                String apellido,
                String dni,
                String telefono,
                String email,

                // Dirección
                String calle,
                String numero,
                String pisoDepto,
                String ciudad,
                String provincia,
                String cp,

                // Envío y Pago
                String metodoEnvio,
                Double costoEnvio,
                String medioPago,
                Double totalProductos,
                Double totalFinal,

                // Items (Para descontar stock y generar resumen)
                List<ItemPedidoDto> items) {
}