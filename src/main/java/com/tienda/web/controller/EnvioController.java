package com.tienda.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("api/envios")
@CrossOrigin(origins = "*")
public class EnvioController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/calcular")
    public Map<String, Object> calcularEnvio(@RequestParam String cp, @RequestParam Double peso) {

        String cpLimpio = cp.replaceAll("[^0-9]", "");

        String sqlZona = "SELECT zona_tarifaria FROM cobertura_lancioni WHERE cp LIKE ? AND activo = 'SI' LIMIT 1";

        List<String> zonas = jdbcTemplate.query(sqlZona, new Object[] { cpLimpio + "%" },
                (rs, rowNum) -> rs.getString("zona_tarifaria"));

        if (!zonas.isEmpty() && zonas.get(0) != null) {
            String zona = zonas.get(0);

            String sqlPrecio = "SELECT precio FROM tarifas_lancioni WHERE zona_tarifaria = ? AND peso_maximo >= ? ORDER BY peso_maximo ASC LIMIT 1";

            List<Double> precios = jdbcTemplate.query(sqlPrecio, new Object[] { zona, peso },
                    (rs, rowNum) -> rs.getDouble("precio"));

            if (!precios.isEmpty()) {
                double precioFinal = precios.get(0);
                return Map.of(
                        "nombreTransportista", "Expreso Lancioni",
                        "costo", precioFinal,
                        "mensaje", "Envío Lancioni - 24/72hs",
                        "tipo", "lancioni");
            }
        }

        return calcularCorreoArgentino(peso);
    }

    private Map<String, Object> calcularCorreoArgentino(Double peso) {
        double precio;

        if (peso < 1)
            precio = 6800.0;
        else if (peso < 5)
            precio = 8500.0;
        else if (peso < 10)
            precio = 11500.0;
        else if (peso < 15)
            precio = 14200.0;
        else
            precio = 18000.0;

        return Map.of(
                "nombreTransportista", "Correo Argentino",
                "costo", precio,
                "mensaje", "📦 Envío Nacional (Correo Argentino)",
                "tipo", "correo");
    }
}