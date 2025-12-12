package com.tienda.web.service;

import com.tienda.web.model.Articulo;
import com.tienda.web.repository.ArticuloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ArticuloService {

    @Autowired
    private final ArticuloRepository articuloRepository;

    public ArticuloService(ArticuloRepository articuloRepository) {
        this.articuloRepository = articuloRepository;
    }

    public List<Articulo> obtenerArticulosDeArca() {
        return articuloRepository.findByCiudadArticulo("Oncativo");
    }

}
