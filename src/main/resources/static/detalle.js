window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }
});

let articuloCargado;

/* CARGAR DATOS DESDE DB */ 
document.addEventListener("DOMContentLoaded", () => {
    
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    if (!id) {
        document.getElementById("detalle-articulo").innerHTML = "<p>ID de producto no válido.</p>";
        return;
    }

    fetch(API_URL + "/articulos/" + id)
        .then(res => {
            if (!res.ok) throw new Error("Producto no encontrado");
            return res.json();
        })
        .then(articulo => {
            articuloCargado = articulo;
            const titulo = mayus(articulo.nombre) + " - El Arca Home";
            document.title = titulo;
            const contenedor = document.getElementById("detalle-articulo");

            const imagenes = [articulo.img1, articulo.img2, articulo.img3, articulo.img4].filter(src => src && src.trim() !== "");

            const esMobile = window.innerWidth <= 768;

            const miniaturasHTML = imagenes.map((src, idx) => `
                <img src="${src}" alt="Miniatura ${idx + 1}" class="miniatura" style="cursor: pointer;">
            `).join("");

            // CATEGORÍAS ESPECIALES
            const categoriasEspeciales = [
                "MUEBLES EXTERIOR", 
                "SILLONES", 
                "BANQUETAS", 
                "SILLAS", 
                "MESAS", 
                "OFICINA", 
                "MESAS RATONAS",
                "MUEBLES INTERIOR"
            ];

            const esCategoriaEspecial = categoriasEspeciales.includes(articulo.categoria.toUpperCase());
            const stockTotal = articulo.cant1 + articulo.cant3;
            const sinStock = stockTotal === 0;

            // Opciones de compra
            let opcionesCompraHTML = "";

            if (sinStock && esCategoriaEspecial) {
                const mensaje = `Hola El Arca Home, vengo desde la web, estoy interesado en ${mayus(articulo.nombre)}`;
                const linkWhatsapp = `https://wa.me/5493572439160?text=${encodeURIComponent(mensaje)}`;
                
                opcionesCompraHTML = `
                    <div class="consulta-container">
                        <p class="texto-consulta">¿Querés saber más?</p>
                        <a href="${linkWhatsapp}" target="_blank" class="btn-whatsapp-contacto">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" /> CONTACTANOS
                        </a>
                    </div>
                `;
            } else {
                opcionesCompraHTML = `
                    <div class="cantidad-control">
                        ${stockTotal === 0
                            ? `<button disabled>−</button>
                               <span id="cantidad">0</span>
                               <button disabled>+</button>`
                            : `<button onclick="cambiarCantidad2(obtenerCantidad() - 1)">−</button>
                               <span id="cantidad">1</span>
                               <button onclick="cambiarCantidad2(obtenerCantidad() + 1)">+</button>`
                        }
                    </div>
                    ${stockTotal === 0
                        ? `<button class="añadir-carrito-btn" disabled style="opacity: 0.6; cursor: not-allowed;">Sin stock</button>`
                        : `<button class="añadir-carrito-btn">Añadir al carrito</button>`
                    }
                `;
            }

            // Si es móvil, usa swiper, si no, usa miniaturas
            contenedor.innerHTML = esMobile ? `
                <div class="swiper-container">
                    <div class="swiper-wrapper">
                        ${imagenes.map(src => `
                            <div class="swiper-slide">
                                <img src="${src}" />
                            </div>
                        `).join("")}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
                <div class="detalle-info">
                    <h1 class="nombre-producto">${mayus(articulo.nombre)}</h1>
                    <div class="descripcion-producto">
                        <p>${mayus(articulo.descripcion)}</p>
                    </div>
                    <p class="precio-producto">$${articulo.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p class="precio-transferencia">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                    <div class="info-pagos">
                        <div class="info-pagos-linea">
                            <img src="./images/credit-card.png" alt="tarjeta">
                            <p>6 cuotas sin interés de $${(articulo.precioVenta / 6).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div class="info-pagos-linea">
                            <img src="./images/transfer-money.png" alt="transferencia">
                            <p>20% de descuento pagando con Transferencia</p>
                        </div>
                        <div class="info-pagos-linea">
                            <img src="./images/delivery-truck.png" alt="envios">
                            <p>Envíos a todo el país</p>
                        </div>
                    </div>
                    <div class="poco-stock">
                        ${stockTotal <= 5 && stockTotal > 0
                            ? `<h5 class="aviso-poco-stock">¡Quedan ${stockTotal} en stock, no te lo pierdas!</h5>`
                            : ``
                        }
                    </div>
                    <div class="opciones-compra">
                        ${opcionesCompraHTML}
                    </div>
                </div>
              ` : `
                <div class="detalle-imagenes">
                        <div class="miniaturas">
                            ${miniaturasHTML}
                        </div>
                        <div class="imagen-principal">
                            <img src="${imagenes[0]}" alt="${articulo.nombre}" id="imagen-principal" style="max-width: 100%;">
                        </div>
                    </div>
                    <div class="detalle-info">
                        <h1 class="nombre-producto">${mayus(articulo.nombre)}</h1>
                        <div class="descripcion-producto">
                            <p>${mayus(articulo.descripcion)}</p>
                        </div>
                        <p class="precio-producto">$${articulo.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p class="precio-transferencia">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                        <div class="info-pagos">
                            <div class="info-pagos-linea">
                                <img src="./images/credit-card.png" alt="tarjeta">
                                <p>6 cuotas sin interés de $${(articulo.precioVenta / 6).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div class="info-pagos-linea">
                                <img src="./images/transfer-money.png" alt="transferencia">
                                <p>20% de descuento pagando con Transferencia</p>
                            </div>
                            <div class="info-pagos-linea">
                                <img src="./images/delivery-truck.png" alt="envios">
                                <p>Envíos a todo el país</p>
                            </div>
                        </div>
                        <div class="poco-stock">
                            ${stockTotal <= 5 && stockTotal > 0
                                ? `<h5 class="aviso-poco-stock">¡Quedan ${stockTotal} en stock, no te lo pierdas!</h5>`
                                : ``
                            }
                        </div>
                        <div class="opciones-compra">
                            ${opcionesCompraHTML}
                        </div>
                    </div>
                  `;

              if (esMobile) {
                  const swiper = new Swiper(".swiper-container", {
                    loop: true,
                    pagination: {
                      el: ".swiper-pagination",
                      clickable: true,
                    },
                    slidesPerView: 1,
                    spaceBetween: 0
                  });
              }

            const btnCarrito = contenedor.querySelector('.añadir-carrito-btn');
            if (btnCarrito && stockTotal > 0) {
                btnCarrito.addEventListener("click", function(event) {
                    event.stopPropagation();
                    const cantidadSpan = document.getElementById("cantidad");
                    const cantidad = parseInt(cantidadSpan.textContent) || 1;
                    agregarAlCarrito2(articulo, cantidad);
                    openCarrito();
                    cantidadSpan.textContent = 1;
                });
            }

            // Logica para cambiar la imagen principal cuando tocas una miniatura:
            const miniaturas = contenedor.querySelectorAll(".miniatura");
            const imagenPrincipal = contenedor.querySelector("#imagen-principal");

            if(miniaturas.length > 0 && imagenPrincipal) {
                miniaturas.forEach(miniatura => {
                    miniatura.addEventListener('mouseover', () => {
                        imagenPrincipal.src = miniatura.src;
                    });
                });
            }


            /* ARMAR TARJETAS DE RELACIONADOS */
            const categoriaActual = articulo.categoria;

            fetch(`${API_URL}/articulos/categoria/${encodeURIComponent(categoriaActual)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Error al traer productos relacionados");
                    return res.json();
                })
                .then(relacionados => {
                    /* LOGICA PARA CARRUSEL DE PRODUCTOS RELACIONADOS */
                    const track = document.querySelector('.carousel-track');
                    const btnLeft = document.querySelector('.carousel2-btn.left');
                    const btnRight = document.querySelector('.carousel2-btn.right');

                    let currentPosition = 0;
                    
                    function getCardWidth() {
                        const card = document.querySelector('.producto-card');
                        return card ? card.offsetWidth + 20 : 235; 
                    }

                    btnLeft.addEventListener('click', () => {
                        const cardWidth = getCardWidth();
                        currentPosition += cardWidth;
                        if (currentPosition > 0) currentPosition = 0;
                        track.style.transform = `translateX(${currentPosition}px)`;
                    });

                    btnRight.addEventListener('click', () => {
                        const cardWidth = getCardWidth();
                        const maxScroll = -(track.scrollWidth - track.clientWidth);
                        currentPosition -= cardWidth;
                        if (currentPosition < maxScroll) currentPosition = maxScroll;
                        track.style.transform = `translateX(${currentPosition}px)`;
                    });
                    
                    // Filtrar para no mostrar el mismo artículo que estás viendo ahora
                    relacionados
                        .filter(a => a.id !== articulo.id)
                        .forEach(a => {
                            const card = document.createElement('a');
                            card.className = 'producto-card';
                            card.href = `detalle.html?id=${a.id}`;
                            card.innerHTML = `
                                <img src="${a.img1}" alt="${a.nombre}">
                                <h3 id="nombre-art" class="nombreArt">${mayus(a.nombre)}</h3>
                                <p id="precio-art" class="precioArt">$${a.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <p class="precioTrans">$${(a.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                                
                                <div class="añadir-carrito-btn ver-mas-btn" style="display:block; width:fit-content; margin: 10px auto; padding: 10px 20px;">Ver más</div>
                            `;
                            /*card.innerHTML = `
                                <img src="${a.img1}" alt="${a.nombre}">
                                <h3 id="nombre-art" class="nombreArt">${mayus(a.nombre)}</h3>
                                <p id="precio-art" class="precioArt">$${a.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <p class="precioTrans">$${(a.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Trasferencia</p>
                                <button class="añadir-carrito-btn ver-mas-btn">Ver más</button>
                            `;
                            const btnMas = card.querySelector('.ver-mas-btn');
                            btnMas.addEventListener('click', () => {
                                window.location.href = `detalle.html?id=${a.id}`;
                            });*/

                            track.appendChild(card);
                        });
                    
                    // Lógica para mostrar/ocultar las flechas
                    if (relacionados.length <= 5) {
                        btnLeft.style.display = 'none';
                        btnRight.style.display = 'none';
                    } else {
                        btnLeft.style.display = 'block';
                        btnRight.style.display = 'block';
                    }
                })
                .catch(err => {
                    console.error("Error cargando productos relacionados:", err);
                });
        })
        .catch(() => {
            document.getElementById("detalle-articulo").innerHTML = "<p>Error: Producto no encontrado o falló la carga.</p>";
        });

    // Cargar el carrito desde localStorage si existe
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        renderizarCarrito();
    }
});

document.querySelector('.overlay').addEventListener('click', () => {
    cerrarTodos(); 
});

function toggleMenu() {
    document.getElementById("menuLateral").classList.add("abierto");
    document.getElementById("overlay").classList.add("visible");
}
  
function closeMenu() {
    document.getElementById("menuLateral").classList.remove("abierto");
    checkOverlay();
}
  
function toggleSubmenu() {
    const submenu = document.getElementById("submenuProductos");
    submenu.classList.toggle("visible");
}
  
function toggleSubmenu2() {
    const submenu = document.getElementById("submenuMuebles");
    submenu.classList.toggle("visible");
}

function openMenuInstrucciones() {
    closeMenuInfo();
    closeMenuPreguntas();  
    closeCarrito();
    document.getElementById('menuInstrucciones').classList.add('abierto');
    document.getElementById("overlay").classList.add("visible");
}
  
function closeMenuInstrucciones() {
    document.getElementById('menuInstrucciones').classList.remove('abierto');
    checkOverlay();
}
  
function openMenuInfo() {
    closeMenuInstrucciones();
    closeMenuPreguntas();  
    closeCarrito();
    document.getElementById('menuInfo').classList.add('abierto');
    document.getElementById("overlay").classList.add("visible");
}
  
function closeMenuInfo() {
    document.getElementById('menuInfo').classList.remove('abierto');
    checkOverlay();
}
  
function openMenuPreguntas() {
    closeMenuInfo();
    closeMenuInstrucciones();  
    closeCarrito();
    document.getElementById('menuPreguntas').classList.add('abierto');
    document.getElementById("overlay").classList.add("visible");
}
  
function closeMenuPreguntas() {
    document.getElementById('menuPreguntas').classList.remove('abierto');
    checkOverlay();
}

function openCarrito() {
    closeMenuInfo();
    closeMenuInstrucciones();
    closeMenuPreguntas();
    document.getElementById("menuCarrito").classList.add("abierto");
    document.getElementById("overlay").classList.add("visible");
}
  
function closeCarrito() {
    document.getElementById("menuCarrito").classList.remove("abierto");
    checkOverlay();
}

function cerrarTodos(){
    closeMenu();
    closeMenuInfo();
    closeMenuInstrucciones();
    closeMenuPreguntas();
    closeCarrito();
}

function searchProducts() {
    const input = document.querySelector(".search-input");
    const texto = input.value.trim(); 

    if (texto !== "") {
        window.location.href = `index.html?busqueda=${encodeURIComponent(texto)}`;
    }
}

function checkOverlay() {
    const menuIzquierdoAbierto = document.getElementById('menuLateral').classList.contains('abierto');
    const menuInstruccionesAbierto = document.getElementById('menuInstrucciones').classList.contains('abierto');
    const menuInfoAbierto = document.getElementById('menuInfo').classList.contains('abierto');
    const menuPreguntasAbierto = document.getElementById('menuPreguntas').classList.contains('abierto');
    const menuCarritoAbierto = document.getElementById('menuCarrito').classList.contains('abierto');
  
    if (!menuIzquierdoAbierto && !menuInstruccionesAbierto && !menuInfoAbierto && !menuPreguntasAbierto && !menuCarritoAbierto) {
        document.querySelector('.overlay').classList.remove('visible');
    }
}

function mayus(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function irAInicio() {
    window.location.href = "/";
}
  
async function iniciarCompra() {
  const metodoEnvio = document.querySelector('input[name="metodo-envio"]:checked');
  const cp = document.getElementById("codigo-postal").value;

  if (!metodoEnvio) {
    alert("Por favor, seleccioná un método de envío.");
    return;
  }

  const medioDePago = "Online";
  const cliente = "Santiago desde web";
  const sucursal = "Oncativo";
  const montoTotal = calcularTotalCarrito();
  const articulosCarrito = carrito.map(articulo => `${articulo.nombre} x${articulo.cantidad}`).join(" / ");

  const venta = {
  sucursalVenta: sucursal,
  clienteVenta: cliente,
  medioDePagoVenta: medioDePago,
  articulosVenta: articulosCarrito,
  montoVenta: montoTotal,
  items: carrito.map(item => ({
    id: item.id,
    cantidad: item.cantidad
  }))
};

  let response;
  try {
    response = await fetch("http://localhost:8080/api/articulos/venta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(venta)
    });

    if (!response.ok) {
      const errorText = await response.text();  // Mostrar el texto de error devuelto por el backend
      throw new Error("Error al registrar la venta: " + errorText);
    }

    alert("¡Compra realizada con éxito!");
    alert(`Compraste ${venta.articulosVenta}`);
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
  } catch (error) {
    alert("Hubo un error al procesar la compra: " + error.message);
  }
}

function calcularTotalCarrito() {
  let subtotal = carrito.reduce((total, articulo) => total + (articulo.precioVenta * articulo.cantidad), 0);
  const precioEnvio = parseFloat(localStorage.getItem("precioEnvio"));

  if (!isNaN(precioEnvio)) {
    subtotal += precioEnvio;
  }

  return subtotal;
}
  
function agregarAlCarrito2(articulo, cantidad) {
    const existente = carrito.find(item => item.id === articulo.id);
    
    if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad <= (articulo.cant1 + articulo.cant3)) {
            existente.cantidad = nuevaCantidad;
        } else {
            existente.cantidad = (articulo.cant1 + articulo.cant3);
            existente.aviso = "Se agregó el máximo disponible";
        }
    } else {
        const cantidadFinal = Math.min(cantidad, (articulo.cant1 + articulo.cant3));
        carrito.push({ ...articulo, cantidad: cantidadFinal });
    }
    renderizarCarrito();
}
  
function eliminarDelCarrito(id) {
  carrito = carrito.filter(articulo => articulo.id !== id);
  renderizarCarrito();
}

function cambiarCantidad(id, nuevaCantidad) {
  const articulo = carrito.find(p => p.id === id);

  if (nuevaCantidad < 1) return;

  if (nuevaCantidad <= (articulo.cant1 + articulo.cant3)) {
    articulo.cantidad = nuevaCantidad;
    articulo.aviso = "";
  } else {
    articulo.aviso = "No hay más stock disponible";
  }
  renderizarCarrito();
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const footer = document.getElementById("carrito-footer");
  const envio = document.getElementById("envio-section");
  contenedor.innerHTML = "";

  let subtotal = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = `<p class="carrito-vacio">El carrito está vacío</p>`;
    document.getElementById("carrito-subtotal").innerHTML = "";
    footer.style.display = "none"; 
    envio.style.display = "none"; 
    localStorage.setItem("carrito", JSON.stringify(carrito));
    return;
  }

  footer.style.display = "flex";
  envio.style.display = "block"; 

  carrito.forEach(articulo => {
    subtotal += articulo.precioVenta * articulo.cantidad;

    contenedor.innerHTML += `
      <div class="item">
        <a href="detalle.html?id=${articulo.id}">
          <img src="${articulo.img1}" alt="${articulo.nombre}" class="carrito-img" />
        </a>
        <div class="item-detalles">
          <div class="item-top">
            <a href="detalle.html?id=${articulo.id}" class="nombre-articulo">${mayus(articulo.nombre)}</a>
            <a onclick="eliminarDelCarrito(${articulo.id})" class="btn-eliminar">
              <img src="./images/trash.png" alt="Eliminar">
            </a>
          </div>
          <div class="item-bottom">
            <div class="cantidad-control">
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad - 1})">−</button>
              <span>${articulo.cantidad}</span>
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad + 1})">+</button>
            </div>
            <p class="precio-articulo">$${(articulo.precioVenta * articulo.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          ${articulo.aviso ? `<p class="aviso-stock">${articulo.aviso}</p>` : ""}
        </div>
      </div>
    `;
  });

  let total = subtotal;
  const metodoEnvio = localStorage.getItem("metodoEnvio");
  const precioEnvio = localStorage.getItem("precioEnvio");

  // Si el método seleccionado es envío a domicilio y hay precio válido, se suma
  if (metodoEnvio === "envio-domicilio" && !isNaN(precioEnvio)) {
    total += parseFloat(precioEnvio);
  }

  document.getElementById("carrito-subtotal").innerHTML = `
    <h3>Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
    <p>O $${(total*0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
  `;

  const cpGuardado = localStorage.getItem("codigoPostal");
    if (cpGuardado) {
      document.getElementById("codigo-postal").value = cpGuardado;
    }

  const metodoGuardado = localStorage.getItem("metodoEnvio");
    if (metodoGuardado) {
      const radio = document.querySelector(`input[name="metodo-envio"][value="${metodoGuardado}"]`);
      if (radio) radio.checked = true;
    }

  const precioGuardado = localStorage.getItem("precioEnvio");
    if (precioGuardado) {
      const spanPrecio = document.querySelector('input[value="envio-domicilio"]').closest("label").querySelector(".envio-costo");
      if (spanPrecio) spanPrecio.textContent = precioGuardado === "No disponible" ? "No disponible" : `$${precioGuardado}`;
    }

  const radiosEnvio = document.getElementsByName("metodo-envio");
  radiosEnvio.forEach(radio => {
    radio.addEventListener("change", () => {
      const metodoSeleccionado = document.querySelector('input[name="metodo-envio"]:checked').value;
      localStorage.setItem("metodoEnvio", metodoSeleccionado);
      renderizarCarrito(); // Vuelve a calcular el total con el nuevo método
    });
  });

  document.getElementById("iniciarCompraBtn").addEventListener("click", () => {
    window.location.href = "/resumen.html"; 
  });

  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function calcularEnvio() {
  const cp = document.getElementById("codigo-postal").value;
  const mensaje = document.getElementById("mensaje-envio");
  const spanPrecio = document.querySelector('input[value="envio-domicilio"]').closest("label").querySelector(".envio-costo");

  if (!cp || isNaN(cp)) {
    mensaje.textContent = "Por favor, ingresá un código postal válido.";
    mensaje.style.color = "red";
    if (spanPrecio) spanPrecio.textContent = "Precio";
    localStorage.removeItem("precioEnvio");
    return;
  }

  localStorage.setItem("codigoPostal", cp);

  if (cp.startsWith("5")) {
    const precio = 1000;
    if (spanPrecio) spanPrecio.textContent = `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    localStorage.setItem("precioEnvio", precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  } else {
    mensaje.textContent = "Envío no disponible en esta zona.";
    if (spanPrecio) spanPrecio.textContent = "No disponible";
    localStorage.setItem("precioEnvio", "No disponible");
  }

  mensaje.style.color = "black";
}

function obtenerCantidad() {
  const span = document.getElementById(`cantidad`);
  return parseInt(span.textContent) || 1;
}

function cambiarCantidad2(nuevaCantidad) {
  const cantidadSpan = document.getElementById(`cantidad`);

  if (nuevaCantidad < 1) return;

  if (nuevaCantidad <= (articuloCargado.cant1 + articuloCargado.cant3)) {
    articuloCargado.cantidad = nuevaCantidad;
    cantidadSpan.textContent = nuevaCantidad;
  }
  
}




