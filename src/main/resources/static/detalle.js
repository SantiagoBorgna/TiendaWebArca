window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }
});

let articuloCargado;

document.addEventListener("DOMContentLoaded", () => {
    
    let id = null;
    
    // Intenta leer la ruta
    const pathParts = window.location.pathname.split('/'); 
    
    if (pathParts.length >= 3 && pathParts[1] === 'p') {
        id = parseInt(pathParts[2]);
    } else {
        const params = new URLSearchParams(window.location.search);
        id = parseInt(params.get("id"));
    }

    if (!id) {
        document.getElementById("detalle-articulo").innerHTML = "<div style='text-align:center; padding:50px;'><h2>ID de producto no válido.</h2><a href='/' class='añadir-carrito-btn' style='display:inline-block; width:auto; padding: 10px 20px;'>Volver al inicio</a></div>";
        return;
    }

    fetch(API_URL + "/articulos/" + id)
        .then(res => {
            if (!res.ok) throw new Error("Producto no encontrado");
            return res.json();
        })
        .then(articulo => {
            articuloCargado = articulo;

            const slug = articulo.nombre.toLowerCase().trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            if (!window.location.pathname.includes(slug)) {
                const nuevaURL = `/p/${id}/${slug}`;
                window.history.replaceState({ path: nuevaURL }, '', nuevaURL);
            }

            const titulo = mayus(articulo.nombre) + " - El Arca Home";
            document.title = titulo;
            const contenedor = document.getElementById("detalle-articulo");

            const imagenes = [articulo.img1, articulo.img2, articulo.img3, articulo.img4].filter(src => src && src.trim() !== "");

            const esMobile = window.innerWidth <= 768;

            const miniaturasHTML = imagenes.map((src, idx) => `
                <img src="${src}" alt="Miniatura ${idx + 1}" class="miniatura" style="cursor: pointer;">
            `).join("");

            // Categorías especiales
            const categoriasEspeciales = [
                "MUEBLES EXTERIOR", "SILLONES", "BANQUETAS", "SILLAS", 
                "MESAS", "OFICINA", "MESAS RATONAS", "MUEBLES INTERIOR"
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
                            ? `<button disabled>−</button><span id="cantidad">0</span><button disabled>+</button>`
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

            contenedor.innerHTML = esMobile ? `
                <div class="swiper-container">
                    <div class="swiper-wrapper">
                        ${imagenes.map(src => `<div class="swiper-slide"><img src="${src}" /></div>`).join("")}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
                <div class="detalle-info">
                    <h1 class="nombre-producto">${mayus(articulo.nombre)}</h1>
                    <div class="descripcion-producto"><p>${mayus(articulo.descripcion)}</p></div>
                    <p class="precio-producto">$${articulo.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p class="precio-transferencia">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                    
                    <div class="info-pagos">
                        <div class="info-pagos-linea"><img src="/images/credit-card.png" alt="tarjeta"><p>6 cuotas sin interés de $${(articulo.precioVenta / 6).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                        <div class="info-pagos-linea"><img src="/images/transfer-money.png" alt="transferencia"><p>20% de descuento pagando con Transferencia</p></div>
                        <div class="info-pagos-linea"><img src="/images/delivery-truck.png" alt="envios"><p>Envíos a todo el país</p></div>
                    </div>

                    <div class="poco-stock">
                        ${stockTotal <= 5 && stockTotal > 0 ? `<h5 class="aviso-poco-stock">¡Quedan ${stockTotal} en stock, no te lo pierdas!</h5>` : ``}
                    </div>
                    <div class="opciones-compra">${opcionesCompraHTML}</div>
                </div>
            ` : `
                <div class="detalle-imagenes">
                    <div class="miniaturas">${miniaturasHTML}</div>
                    <div class="imagen-principal">
                        <img src="${imagenes[0]}" alt="${articulo.nombre}" id="imagen-principal" style="max-width: 100%;">
                    </div>
                </div>
                <div class="detalle-info">
                    <h1 class="nombre-producto">${mayus(articulo.nombre)}</h1>
                    <div class="descripcion-producto"><p>${mayus(articulo.descripcion)}</p></div>
                    <p class="precio-producto">$${articulo.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p class="precio-transferencia">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                    
                    <div class="info-pagos">
                        <div class="info-pagos-linea"><img src="/images/credit-card.png" alt="tarjeta"><p>6 cuotas sin interés de $${(articulo.precioVenta / 6).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                        <div class="info-pagos-linea"><img src="/images/transfer-money.png" alt="transferencia"><p>20% de descuento pagando con Transferencia</p></div>
                        <div class="info-pagos-linea"><img src="/images/delivery-truck.png" alt="envios"><p>Envíos a todo el país</p></div>
                    </div>

                    <div class="poco-stock">
                        ${stockTotal <= 5 && stockTotal > 0 ? `<h5 class="aviso-poco-stock">¡Quedan ${stockTotal} en stock, no te lo pierdas!</h5>` : ``}
                    </div>
                    <div class="opciones-compra">${opcionesCompraHTML}</div>
                </div>
            `;

            if (esMobile) {
                new Swiper(".swiper-container", {
                    loop: true,
                    pagination: { el: ".swiper-pagination", clickable: true },
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
                    if(typeof agregarAlCarrito2 === "function") {
                        agregarAlCarrito2(articulo, cantidad);
                        if(typeof openCarrito === "function") openCarrito();
                        cantidadSpan.textContent = 1;
                    } else if (typeof agregarAlCarrito === "function") {
                        agregarAlCarrito({...articulo, cantidad: cantidad}); 
                        if(typeof openCarrito === "function") openCarrito();
                    }
                });
            }

             // Logica para cambiar la imagen principal cuando tocas una miniatura:
            const miniaturas = contenedor.querySelectorAll(".miniatura");
            const imagenPrincipal = contenedor.querySelector("#imagen-principal");

            console.log("Miniaturas encontradas:", miniaturas.length);
            console.log("Imagen Principal encontrada:", imagenPrincipal);

            if(miniaturas.length > 0 && imagenPrincipal) {
                miniaturas.forEach(miniatura => {
                    const actualizarImagen = () => {
                        console.log("Cambiando imagen a:", miniatura.src); 
                        imagenPrincipal.src = miniatura.src;
                    };

                    // Evento Hover (PC)
                    miniatura.addEventListener('mouseover', actualizarImagen);
                    // Evento Click (Táctil)
                    miniatura.addEventListener('click', actualizarImagen);
                });
            }

            /* --- PRODUCTOS RELACIONADOS --- */
            cargarRelacionados(articulo);
        })
        .catch((e) => {
            console.error(e);
            document.getElementById("detalle-articulo").innerHTML = "<p>Error: Producto no encontrado.</p>";
        });

    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        if(typeof renderizarCarrito === "function") renderizarCarrito();
    }
});

function cargarRelacionados(articulo) {
    const categoriaActual = articulo.categoria;

    fetch(`${API_URL}/articulos/categoria/${encodeURIComponent(categoriaActual)}`)
        .then(res => {
            if (!res.ok) throw new Error("Error relacionados");
            return res.json();
        })
        .then(relacionados => {
            const track = document.querySelector('.carousel-track');
            if(!track) return; // Si no existe el elemento en el HTML, sale

            const btnLeft = document.querySelector('.carousel2-btn.left');
            const btnRight = document.querySelector('.carousel2-btn.right');
            let currentPosition = 0;
            
            function getCardWidth() {
                const card = document.querySelector('.producto-card');
                return card ? card.offsetWidth + 20 : 235; 
            }

            if(btnLeft) btnLeft.addEventListener('click', () => {
                const cardWidth = getCardWidth();
                currentPosition += cardWidth;
                if (currentPosition > 0) currentPosition = 0;
                track.style.transform = `translateX(${currentPosition}px)`;
            });

            if(btnRight) btnRight.addEventListener('click', () => {
                const cardWidth = getCardWidth();
                const maxScroll = -(track.scrollWidth - track.clientWidth);
                currentPosition -= cardWidth;
                if (currentPosition < maxScroll) currentPosition = maxScroll;
                track.style.transform = `translateX(${currentPosition}px)`;
            });
            
            relacionados.filter(a => a.id !== articulo.id).forEach(a => {
                const card = document.createElement('a');
                card.className = 'producto-card';
                
                const slugRel = a.nombre.toLowerCase().trim()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                card.href = `/p/${a.id}/${slugRel}`;

                card.innerHTML = `
                    <img src="${a.img1}" alt="${a.nombre}">
                    <h3 class="nombreArt">${mayus(a.nombre)}</h3>
                    <p class="precioArt">$${a.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p class="precioTrans">$${(a.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                    <div class="añadir-carrito-btn ver-mas-btn" style="display:block; width:fit-content; margin: 10px auto; padding: 10px 20px;">Ver más</div>
                `;
                track.appendChild(card);
            });
            
            if (relacionados.length <= 5) {
                if(btnLeft) btnLeft.style.display = 'none';
                if(btnRight) btnRight.style.display = 'none';
            } else {
                if(btnLeft) btnLeft.style.display = 'block';
                if(btnRight) btnRight.style.display = 'block';
            }
        })
        .catch(err => console.error(err));
}

// Click en overlay cierra menus
const overlay = document.querySelector('.overlay');
if(overlay) {
    overlay.addEventListener('click', () => {
        if(typeof cerrarTodos === "function") cerrarTodos(); 
    });
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
    if(typeof renderizarCarrito === "function") renderizarCarrito();
    localStorage.setItem("carrito", JSON.stringify(carrito));
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