package com.tienda.web.model;

import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "libro_diario")
public class Venta {

    @Transient // Esto indica que no se guarda en la base de datos
    private List<ItemVenta> items;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idVenta;

    private String fechaVenta;
    private String sucursalVenta;
    private String clienteVenta;
    private String articulosVenta;
    private double montoVenta;
    private String medioDePagoVenta;

    // Getters y Setters

    public int getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(int idVenta) {
        this.idVenta = idVenta;
    }

    public String getFechaVenta() {
        return fechaVenta;
    }

    public void setFechaVenta(String fechaVenta) {
        this.fechaVenta = fechaVenta;
    }

    public String getSucursalVenta() {
        return sucursalVenta;
    }

    public void setSucursalVenta(String sucursalVenta) {
        this.sucursalVenta = sucursalVenta;
    }

    public String getClienteVenta() {
        return clienteVenta;
    }

    public void setClienteVenta(String clienteVenta) {
        this.clienteVenta = clienteVenta;
    }

    public String getArticulosVenta() {
        return articulosVenta;
    }

    public void setArticulosVenta(String articulosVenta) {
        this.articulosVenta = articulosVenta;
    }

    public double getMontoVenta() {
        return montoVenta;
    }

    public void setMontoVenta(double montoVenta) {
        this.montoVenta = montoVenta;
    }

    public String getMedioDePagoVenta() {
        return medioDePagoVenta;
    }

    public void setMedioDePagoVenta(String medioDePagoVenta) {
        this.medioDePagoVenta = medioDePagoVenta;
    }

    public List<ItemVenta> getItems() {
        return items;
    }

    public void setItems(List<ItemVenta> items) {
        this.items = items;
    }
}
