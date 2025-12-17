package com.tienda.web.repository;

import com.tienda.web.model.Articulo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Integer> {

    // Solo artículos de Arca
    List<Articulo> findByCiudadArticulo(String ciudadArticulo);

    List<Articulo> findByCategoriaArticulo(String categoriaArticulo);

    List<Articulo> findByCategoriaArticuloAndCiudadArticulo(String categoriaArticulo, String ciudadArticulo);

    Articulo findByNombreArticulo(String nombre);
}
