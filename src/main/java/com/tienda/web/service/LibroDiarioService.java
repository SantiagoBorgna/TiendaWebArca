package com.tienda.web.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LibroDiarioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void registrarVentaTiendaNube(String cliente, String detalleArticulos, double total, double ganancia) {
        String sql = "INSERT INTO libro_diario (fecha_venta, sucursal_venta, cliente_venta, articulos_venta, monto_venta, medio_de_pago_venta, ganancia_venta) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        // Fecha en formato "dd-MM-yyyy"
        String fechaFormateada = LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));

        jdbcTemplate.update(sql,
                fechaFormateada,
                "Oncativo",
                cliente,
                detalleArticulos,
                total,
                "Pago Nube",
                ganancia);
    }
}
