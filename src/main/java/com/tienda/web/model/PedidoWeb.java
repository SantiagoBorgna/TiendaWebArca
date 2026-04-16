package com.tienda.web.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "pedidos_web")
public class PedidoWeb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fechaPedido;

    // DATOS DEL CLIENTE
    private String nombreCliente;
    private String apellidoCliente;
    private String dni;
    private String telefono;
    private String email;

    // DATOS DE ENVÍO
    private String calle;
    private String numero;
    private String pisoDepto;
    private String ciudad;
    private String provincia;
    private String codigoPostal;

    // LOGÍSTICA
    private String metodoEnvio;
    private Double costoEnvio;

    // TOTALES
    private Double totalProductos;
    private Double totalFinal; // Productos + Envío

    // DETALLE
    @Column(columnDefinition = "TEXT")
    private String resumenArticulos;

    // ESTADO Y PAGO
    private String estado;
    private String idTransaccionFiserv;
    private String medioPago;

    @PrePersist
    protected void onCreate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        this.fechaPedido = LocalDate.now().format(formatter);

        if (this.estado == null)
            this.estado = "PENDIENTE_PAGO";
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(String fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getApellidoCliente() {
        return apellidoCliente;
    }

    public void setApellidoCliente(String apellidoCliente) {
        this.apellidoCliente = apellidoCliente;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCalle() {
        return calle;
    }

    public void setCalle(String calle) {
        this.calle = calle;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getPisoDepto() {
        return pisoDepto;
    }

    public void setPisoDepto(String pisoDepto) {
        this.pisoDepto = pisoDepto;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getMetodoEnvio() {
        return metodoEnvio;
    }

    public void setMetodoEnvio(String metodoEnvio) {
        this.metodoEnvio = metodoEnvio;
    }

    public Double getCostoEnvio() {
        return costoEnvio;
    }

    public void setCostoEnvio(Double costoEnvio) {
        this.costoEnvio = costoEnvio;
    }

    public Double getTotalProductos() {
        return totalProductos;
    }

    public void setTotalProductos(Double totalProductos) {
        this.totalProductos = totalProductos;
    }

    public Double getTotalFinal() {
        return totalFinal;
    }

    public void setTotalFinal(Double totalFinal) {
        this.totalFinal = totalFinal;
    }

    public String getResumenArticulos() {
        return resumenArticulos;
    }

    public void setResumenArticulos(String resumenArticulos) {
        this.resumenArticulos = resumenArticulos;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getIdTransaccionFiserv() {
        return idTransaccionFiserv;
    }

    public void setIdTransaccionFiserv(String idTransaccionFiserv) {
        this.idTransaccionFiserv = idTransaccionFiserv;
    }

    public String getMedioPago() {
        return medioPago;
    }

    public void setMedioPago(String medioPago) {
        this.medioPago = medioPago;
    }
}