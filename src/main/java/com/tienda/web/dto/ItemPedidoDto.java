package com.tienda.web.dto;

public record ItemPedidoDto(
        Integer id,
        String nombre,
        Integer cantidad,
        Double precio) {
}
