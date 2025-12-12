package com.tienda.web.repository;

import com.tienda.web.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Integer> {
}
