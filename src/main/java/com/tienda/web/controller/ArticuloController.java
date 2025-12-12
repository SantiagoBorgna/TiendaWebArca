package com.tienda.web.controller;

import com.tienda.web.model.Articulo;
import com.tienda.web.model.ItemVenta;
import com.tienda.web.model.Venta;
import com.tienda.web.repository.ArticuloRepository;
import com.tienda.web.service.ArticuloService;
import com.tienda.web.service.TiendaNubeService;
import com.tienda.web.service.VentaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articulos")
@CrossOrigin(origins = "*")
public class ArticuloController {

    private final ArticuloRepository articuloRepository;
    private final VentaService ventaService;
    private final ArticuloService articuloService;

    public ArticuloController(ArticuloRepository articuloRepository, VentaService ventaService,
            ArticuloService articuloService) {
        this.articuloRepository = articuloRepository;
        this.ventaService = ventaService;
        this.articuloService = articuloService;
    }

    @GetMapping
    public List<Articulo> getArcaHomeArticulos() {
        return articuloRepository.findByCiudadArticulo("Oncativo");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Articulo> getArticuloById(@PathVariable Integer id) {
        return articuloRepository.findById(id)
                .map(articulo -> ResponseEntity.ok().body(articulo))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoriaArticulo}")
    public List<Articulo> getArticulosPorCategoria(@PathVariable String categoriaArticulo) {
        return articuloRepository.findByCategoriaArticulo(categoriaArticulo);
    }

    @PostMapping("/venta")
    public ResponseEntity<String> realizarVenta(@RequestBody Venta venta) {
        try {
            // Actualizar stock
            if (venta.getItems() != null) {
                for (ItemVenta item : venta.getItems()) {
                    articuloRepository.findById(item.getId()).ifPresent(articulo -> {
                        int stock1 = articulo.getCant1();
                        int stock3 = articulo.getCant3();
                        int total = stock1 + stock3;

                        if (item.getCantidad() > total) {
                            throw new RuntimeException("Stock insuficiente para el artículo: " + articulo.getNombre());
                        }

                        if (item.getCantidad() <= stock1) {
                            articulo.setCant1(stock1 - item.getCantidad());
                        } else {
                            articulo.setCant1(0);
                            articulo.setCant3(stock3 - (item.getCantidad() - stock1));
                        }

                        articuloRepository.save(articulo);
                    });
                }
            }

            // Registrar la venta
            ventaService.registrarVenta(
                    venta.getSucursalVenta(),
                    venta.getClienteVenta(),
                    venta.getMedioDePagoVenta(),
                    venta.getArticulosVenta(),
                    venta.getMontoVenta());

            return ResponseEntity.ok("Venta registrada y stock actualizado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar la venta: " + e.getMessage());
        }
    }

    @Autowired
    private TiendaNubeService tiendaNubeService;

    @GetMapping("/sincronizar")
    public ResponseEntity<String> sincronizarTienda() {
        List<Articulo> articulos = articuloService.obtenerArticulosDeArca();
        tiendaNubeService.sincronizarArticulos(articulos);
        return ResponseEntity.ok("Sincronización completada.");
    }

    @GetMapping("/productos")
    public ResponseEntity<Void> obtenerProductosTiendaNube() {
        tiendaNubeService.obtenerProductosTiendaNube();
        return ResponseEntity.ok().build();
    }

}
