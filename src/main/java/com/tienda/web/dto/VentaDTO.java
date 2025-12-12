package com.tienda.web.dto;

public class VentaDTO {
    private String sucursalVenta;
    private String clienteVenta;
    private String medioDePagoVenta;
    private String articulosVenta;
    private double montoTotal;

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

    public String getMedioDePagoVenta() {
        return medioDePagoVenta;
    }

    public void setMedioDePagoVenta(String medioDePagoVenta) {
        this.medioDePagoVenta = medioDePagoVenta;
    }

    public String getArticulos() {
        return articulosVenta;
    }

    public void setArticulos(String articulosVenta) {
        this.articulosVenta = articulosVenta;
    }

    public double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(double montoTotal) {
        this.montoTotal = montoTotal;
    }
}
