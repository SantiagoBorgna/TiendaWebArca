package com.tienda.web.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tienda.web.model.Articulo;
import com.tienda.web.repository.ArticuloRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class TiendaNubeService {

    @Autowired
    private ArticuloService articuloService;
    @Autowired
    private ArticuloRepository articuloRepository;

    private final String ACCESS_TOKEN = "794e9358306715511177c11653f3b47ed5a6a6f1";
    private final String API_URL = "https://api.tiendanube.com/v1/6374138/products";

    private final Object lock = new Object();
    private boolean sincronizando = false;

    public void enviarProductoATiendaNube(Articulo articulo) {
        RestTemplate restTemplate = new RestTemplate();

        List<Map<String, String>> imagenes = new ArrayList<>();
        if (articulo.getImg1() != null && !articulo.getImg1().isBlank())
            imagenes.add(Map.of("src", articulo.getImg1()));
        if (articulo.getImg2() != null && !articulo.getImg2().isBlank())
            imagenes.add(Map.of("src", articulo.getImg2()));
        if (articulo.getImg3() != null && !articulo.getImg3().isBlank())
            imagenes.add(Map.of("src", articulo.getImg3()));
        if (articulo.getImg4() != null && !articulo.getImg4().isBlank())
            imagenes.add(Map.of("src", articulo.getImg4()));

        String nombreCapitalizado = capitalize(articulo.getNombre());

        Map<String, Object> body = new HashMap<>();
        body.put("name", Map.of("es", nombreCapitalizado));
        body.put("description", Map.of("es", articulo.getDescripcion()));
        body.put("custom_product_type", articulo.getCategoria());
        body.put("variants", List.of(Map.of("price", articulo.getPrecioVenta(), "stock", articulo.getCant1())));

        if (!imagenes.isEmpty()) {
            body.put("images", imagenes);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authentication", "bearer " + ACCESS_TOKEN);
        headers.set("User-Agent", "Integrador El Arca Home (santiborgna5@gmail.com)");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        System.out.println("Enviando producto: " + body);
        ResponseEntity<String> response = restTemplate.postForEntity(API_URL, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                Map<String, Object> responseData = mapper.readValue(response.getBody(), Map.class);
                Long idTiendaNube = ((Number) responseData.get("id")).longValue();

                articulo.setIdTiendaNube(idTiendaNube);
                articuloRepository.save(articulo);

                System.out.println("Producto creado correctamente. ID Tienda Nube: " + idTiendaNube);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error al parsear la respuesta de Tienda Nube", e);
            }
        }
    }

    public List<Map<String, Object>> obtenerProductosTiendaNube() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authentication", "bearer " + ACCESS_TOKEN);
        headers.set("User-Agent", "Integrador El Arca Home (santiborgna5@gmail.com)");
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
                API_URL,
                HttpMethod.GET,
                request,
                List.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        } else {
            return Collections.emptyList();
        }
    }

    public void sincronizarArticulos(List<Articulo> articulosLocales) {
        synchronized (lock) {
            if (sincronizando) {
                System.out.println("Ya hay una sincronización en curso. Se ignora esta nueva solicitud.");
                return;
            }
            sincronizando = true;
        }

        try {
            List<Map<String, Object>> productosEnTienda = obtenerProductosTiendaNube();
            System.out.println("✅ Iniciando sincronización con Tienda Nube...");

            for (Articulo articulo : articulosLocales) {
                try {
                    if (articulo.getIdTiendaNube() != null) {
                        actualizarProductoEnTiendaNube(articulo.getIdTiendaNube(), articulo);
                    } else {
                        Map<String, Object> productoExistente = productosEnTienda.stream()
                                .filter(p -> {
                                    Map<String, String> nameMap = (Map<String, String>) p.get("name");
                                    return nameMap != null && normalizar(nameMap.get("es"))
                                            .equals(normalizar(articulo.getNombre()));
                                })
                                .findFirst()
                                .orElse(null);

                        if (productoExistente != null) {
                            Long idProductoTienda = ((Number) productoExistente.get("id")).longValue();
                            articulo.setIdTiendaNube(idProductoTienda);
                            articuloRepository.save(articulo);
                            actualizarProductoEnTiendaNube(idProductoTienda, articulo);
                        } else {
                            enviarProductoATiendaNube(articulo);
                        }
                    }

                    // Espera 4 segundos entre requests
                    Thread.sleep(4000);

                } catch (Exception e) {
                    System.err.println(
                            "Error en sincronización del artículo " + articulo.getNombre() + ": " + e.getMessage());
                }
            }

            System.out.println("Sincronización completada correctamente.");

        } catch (Exception e) {
            System.err.println("Error general en sincronización: " + e.getMessage());
        } finally {
            synchronized (lock) {
                sincronizando = false;
            }
        }
    }

    public void actualizarProductoEnTiendaNube(Long idTiendaNube, Articulo articulo) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authentication", "bearer " + ACCESS_TOKEN);
        headers.set("User-Agent", "Integrador El Arca Home (santiborgna5@gmail.com)");

        String nombreCapitalizado = capitalize(articulo.getNombre());
        String urlProducto = API_URL + "/" + idTiendaNube;

        // Actualizar datos del producto
        Map<String, Object> bodyProducto = new HashMap<>();
        bodyProducto.put("name", Map.of("es", nombreCapitalizado));
        bodyProducto.put("description", Map.of("es", articulo.getDescripcion()));
        bodyProducto.put("custom_product_type", articulo.getCategoria());

        HttpEntity<Map<String, Object>> requestProducto = new HttpEntity<>(bodyProducto, headers);
        restTemplate.exchange(urlProducto, HttpMethod.PUT, requestProducto, String.class);

        // Obtener variante
        HttpEntity<Void> requestGet = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(urlProducto, HttpMethod.GET, requestGet, Map.class);
        List<Map<String, Object>> variants = (List<Map<String, Object>>) response.getBody().get("variants");

        if (variants == null || variants.isEmpty()) {
            System.err.println("No se encontraron variantes para el producto: " + nombreCapitalizado);
            return;
        }

        Long variantId = ((Number) variants.get(0).get("id")).longValue();

        // Actualizar variante
        Map<String, Object> bodyVariant = new HashMap<>();
        bodyVariant.put("price", articulo.getPrecioVenta());
        bodyVariant.put("stock", articulo.getCant1());

        HttpEntity<Map<String, Object>> requestVariant = new HttpEntity<>(bodyVariant, headers);
        String urlVariant = urlProducto + "/variants/" + variantId;

        restTemplate.exchange(urlVariant, HttpMethod.PUT, requestVariant, String.class);
        System.out.println("Producto actualizado en Tienda Nube: " + nombreCapitalizado);
    }

    @Scheduled(cron = "0 0 */4 * * *") // Cada 4hs
    public void sincronizacionAutomatica() {
        System.out.println(">>> Iniciando sincronización automática con Tienda Nube...");

        // Este método deberías tenerlo en ArticuloService
        List<Articulo> articulos = articuloService.obtenerArticulosDeArca();

        sincronizarArticulos(articulos);

        System.out.println(">>> Sincronización automática finalizada.");
    }

    public void registrarWebhookOrdenCreada() {
        RestTemplate restTemplate = new RestTemplate();

        String url = "https://api.tiendanube.com/v1/6374138/webhooks";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authentication", "bearer " + ACCESS_TOKEN);
        headers.set("User-Agent", "Integrador El Arca Home (santiborgna5@gmail.com)");

        Map<String, Object> body = new HashMap<>();
        body.put("event", "order/created");
        body.put("url", "https://backend-tienda-9gtc.onrender.com/api/webhook/order");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("Webhook creado: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Error al registrar el webhook: " + e.getMessage());
        }
    }

    private String capitalize(String texto) {
        if (texto == null || texto.isBlank())
            return "";
        texto = texto.trim().toLowerCase();
        return Character.toUpperCase(texto.charAt(0)) + texto.substring(1);
    }

    private String normalizar(String texto) {
        if (texto == null)
            return "";
        texto = texto.toLowerCase().trim();
        texto = texto.replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[^a-z0-9 ]", "");
        return texto;
    }

}
