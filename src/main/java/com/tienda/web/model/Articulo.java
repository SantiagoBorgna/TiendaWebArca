package com.tienda.web.model;

import jakarta.persistence.*;

@Entity
@Table(name = "articulos")
public class Articulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idArticulo")
    private Integer idArticulo;

    @Column(name = "nombreArticulo")
    private String nombreArticulo;

    @Column(name = "descripcionArticulo")
    private String descripcionArticulo;

    @Column(name = "cant1Articulo")
    private Integer cant1Articulo;

    @Column(name = "cant2Articulo")
    private Integer cant2Articulo;

    @Column(name = "cant3Articulo")
    private Integer cant3Articulo;

    @Column(name = "negocioArticulo")
    private String negocioArticulo;

    @Column(name = "categoriaArticulo")
    private String categoriaArticulo;

    @Column(name = "precioCompraArticulo")
    private Double precioCompraArticulo;

    @Column(name = "precioVentaArticulo")
    private Double precioVentaArticulo;

    @Column(name = "proveedorArticulo")
    private String proveedorArticulo;

    @Column(name = "imagen1")
    private String imagen1;

    @Column(name = "imagen2")
    private String imagen2;

    @Column(name = "imagen3")
    private String imagen3;

    @Column(name = "imagen4")
    private String imagen4;

    @Column(name = "ciudad_articulo")
    private String ciudadArticulo;

    @Column(name = "peso_articulo")
    private Double pesoArticulo;

    @Column(name = "alto_articulo")
    private Double altoArticulo;

    @Column(name = "ancho_articulo")
    private Double anchoArticulo;

    @Column(name = "profundidad_articulo")
    private Double profundidadArticulo;

    // Getters y Setters
    public int getId() {
        return idArticulo != null ? idArticulo : 0;
    }

    public void setId(Integer idArticulo) {
        this.idArticulo = idArticulo;
    }

    public String getNombre() {
        return nombreArticulo;
    }

    public void setNombre(String nombreArticulo) {
        this.nombreArticulo = nombreArticulo;
    }

    public String getDescripcion() {
        return descripcionArticulo;
    }

    public void setDescripcion(String descripcionArticulo) {
        this.descripcionArticulo = descripcionArticulo;
    }

    public int getCant1() {
        return cant1Articulo != null ? cant1Articulo : 0;
    }

    public void setCant1(Integer cant1Articulo) {
        this.cant1Articulo = cant1Articulo;
    }

    public int getCant2() {
        return cant2Articulo != null ? cant2Articulo : 0;
    }

    public void setCant2(Integer cant2Articulo) {
        this.cant2Articulo = cant2Articulo;
    }

    public int getCant3() {
        return cant3Articulo != null ? cant3Articulo : 0;
    }

    public void setCant3(Integer cant3Articulo) {
        this.cant3Articulo = cant3Articulo;
    }

    public String getNegocio() {
        return negocioArticulo;
    }

    public void setNegocio(String negocioArticulo) {
        this.negocioArticulo = negocioArticulo;
    }

    public String getCategoria() {
        return categoriaArticulo;
    }

    public void setCategoria(String categoriaArticulo) {
        this.categoriaArticulo = categoriaArticulo;
    }

    public double getPrecioCompra() {
        return precioCompraArticulo != null ? precioCompraArticulo : 0.0;
    }

    public void setPrecioCompra(Double precioCompraArticulo) {
        this.precioCompraArticulo = precioCompraArticulo;
    }

    public double getPrecioVenta() {
        return precioVentaArticulo != null ? precioVentaArticulo : 0.0;
    }

    public void setPrecioVenta(Double precioVentaArticulo) {
        this.precioVentaArticulo = precioVentaArticulo;
    }

    public String getProveedor() {
        return proveedorArticulo;
    }

    public void setProveedor(String proveedorArticulo) {
        this.proveedorArticulo = proveedorArticulo;
    }

    public String getImg1() {
        return imagen1;
    }

    public void setImg1(String imagen1) {
        this.imagen1 = imagen1;
    }

    public String getImg2() {
        return imagen2;
    }

    public void setImg2(String imagen2) {
        this.imagen2 = imagen2;
    }

    public String getImg3() {
        return imagen3;
    }

    public void setImg3(String imagen3) {
        this.imagen3 = imagen3;
    }

    public String getImg4() {
        return imagen4;
    }

    public void setImg4(String imagen4) {
        this.imagen4 = imagen4;
    }

    public String getCiudad() {
        return ciudadArticulo;
    }

    public void setCiudad(String ciudadArticulo) {
        this.ciudadArticulo = ciudadArticulo;
    }

    public double getPeso() {
        return pesoArticulo != null ? pesoArticulo : 0.0;
    }

    public void setPeso(Double pesoArticulo) {
        this.pesoArticulo = pesoArticulo;
    }

    public double getAlto() {
        return altoArticulo != null ? altoArticulo : 0.0;
    }

    public void setAlto(Double altoArticulo) {
        this.altoArticulo = altoArticulo;
    }

    public double getAncho() {
        return anchoArticulo != null ? anchoArticulo : 0.0;
    }

    public void setAncho(Double anchoArticulo) {
        this.anchoArticulo = anchoArticulo;
    }

    public double getProfundidad() {
        return profundidadArticulo != null ? profundidadArticulo : 0.0;
    }

    public void setProfundidad(Double profundidadArticulo) {
        this.profundidadArticulo = profundidadArticulo;
    }
}
