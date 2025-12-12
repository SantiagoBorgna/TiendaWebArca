package com.tienda.web.service;

import com.tienda.web.model.Venta;
import com.tienda.web.repository.VentaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;

    public VentaService(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    public void registrarVenta(String sucursal, String cliente, String medioPago, String articulos, double monto) {
        Venta venta = new Venta();
        venta.setSucursalVenta(sucursal);
        venta.setClienteVenta(cliente);
        venta.setMedioDePagoVenta(medioPago);
        venta.setArticulosVenta(articulos);
        venta.setMontoVenta(monto);

        // Fecha y hora actual formateada como String
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String fechaFormateada = ahora.format(formatter);

        venta.setFechaVenta(fechaFormateada);

        ventaRepository.save(venta);
    }
}
