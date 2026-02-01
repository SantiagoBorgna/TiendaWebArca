// VARIABLES GLOBALES PARA PAGINACIÓN
let productosGlobales = []; // Lista completa
let indiceActual = 0;
const POR_PAGINA = 20;

let articulosCargados = [];
let carrito = [];

/* CARGAR ARTICULOS DESDE DB CHEQUEANDO SI HAY QUE APLICAR ALGUN FILTRO */
document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL + "/articulos")
    .then((response) => response.json())
    .then((articulos) => {
      articulosCargados = articulos;

      // Obtener los parámetros de la URL
      const params = new URLSearchParams(window.location.search);
      const categoria = params.get('categoria');
      const busqueda = params.get('busqueda'); 

      if (busqueda) {
          // Si hay búsqueda pendiente, poner el texto en la cajita
          const input = document.querySelector(".search-input");
          if (input) input.value = busqueda;

          // Ejecutar la función de buscar automáticamente
          const filtrados = articulosCargados.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()));
          iniciarListado(filtrados); 
      } else if (categoria) { 
        // Si no es búsqueda, chequear categoría
        if (categoria === "INTERIOR") {
            mueblesInterior(); 
        } else {
            filtrarProductos(categoria);
        }
      } else {
        // Si no hay nada, mostrar todo
        iniciarListado(articulosCargados);
      }
  })
  .catch((error) => console.error("Error cargando artículos:", error));

  // Cargar el carrito desde localStorage si existe
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    renderizarCarrito();
  }
});

// Navbar se achica al hacer scroll
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }
});

// Resetea el orden a popularidad
document.addEventListener("click", function(e) {
  if (e.target.tagName === "A" || e.target.closest('#logo')) {
      const sortSelect = document.getElementById("sort");
      if (sortSelect) {
          sortSelect.value = "popular";
      }
  }
});

// Click en overlay cierra menus
document.querySelector('.overlay').addEventListener('click', () => {
  cerrarTodos(); 
});

// Mostrar imagenes en carrusel
contenedor.querySelectorAll(".carousel").forEach((carousel) => {
    const images = carousel.querySelectorAll(".carousel-img");
    let current = 0;
  
    const showImage = (index) => {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
    };
  
    carousel.querySelector(".prev").addEventListener("click", () => {
      current = (current - 1 + images.length) % images.length;
      showImage(current);
    });
  
    carousel.querySelector(".next").addEventListener("click", () => {
      current = (current + 1) % images.length;
      showImage(current);
    });
});

function searchProducts() {
    const input = document.querySelector(".search-input");
    const texto = input.value.trim().toLowerCase();
  
    if (texto === "") return;
  
    // Filtrar los artículos
    const filtrados = articulosCargados.filter(articulo =>
      articulo.nombre.toLowerCase().includes(texto)
    );
  
    // Lógica del Cartel "No se encontraron resultados"
    const mensaje = document.getElementById("mensaje-vacio");
    const grid = document.getElementById("products-grid");

    if (filtrados.length === 0) {
        mensaje.style.display = "block"; 
        grid.innerHTML = "";             
    } else {
        mensaje.style.display = "none";  
        iniciarListado(filtrados);
    }

    const titulo = document.getElementById('mainTitle');
    if (titulo) {
        titulo.innerHTML = `<h1>Resultados para: "${mayus(texto)}"</h1>`;
        titulo.style.display = 'block';
    }

    // Actualizar la URL
    const nuevaURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "?busqueda=" + encodeURIComponent(texto);
    window.history.pushState({path: nuevaURL}, '', nuevaURL);

    input.value = "";
    cerrarTodos(); 
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

function toggleMenu() {
  document.getElementById("menuLateral").classList.add("abierto");
  document.getElementById("overlay").classList.add("visible");
}

function closeMenu() {
  document.getElementById("menuLateral").classList.remove("abierto");
  checkOverlay();
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

function toggleSubmenu() {
  const submenu = document.getElementById("submenuProductos");
  submenu.classList.toggle("visible");
}

function toggleSubmenu2() {
  const submenu = document.getElementById("submenuMuebles");
  submenu.classList.toggle("visible");
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

function renderizarArticulos(articulos, limpiar = true) {
    const contenedor = document.getElementById("products-grid");

    if (limpiar) {
        contenedor.innerHTML = "";
    }

    const articulosOrdenados = [...articulos].sort((a, b) => (b.cant1 + b.cant3) - (a.cant1 + a.cant3));

    articulosOrdenados.forEach((articulo) => {
        const tarjeta = document.createElement("a");
        tarjeta.className = "product card";
        tarjeta.href = `detalle.html?id=${articulo.id}`;
        tarjeta.setAttribute("data-id", articulo.id);

        // Categorias especiales (Muebles)
        const categoriasEspeciales = [
            "MUEBLES EXTERIOR", 
            "SILLONES", 
            "BANQUETAS", 
            "SILLAS", 
            "MESAS", 
            "OFICINA", 
            "MESAS RATONAS"
        ];

        const esCategoriaEspecial = categoriasEspeciales.includes(articulo.categoria.toUpperCase());
        const stockTotal = articulo.cant1 + articulo.cant3;
        const sinStock = stockTotal === 0;

        const imagenes = [articulo.img1, articulo.img2, articulo.img3, articulo.img4]
          .filter(src => src && src.trim() !== "");
          
        // Lazy loading  
        const imagenesHTML = imagenes.map((src, index) => {
            if (index === 0) {
                // La primera imagen se carga normal
                return `<img src="${src}" class="carousel-img active" alt="${articulo.nombre}" />`;
            } else {
                // Las demás se cargan ocultas para no lentificar
                return `<img data-src="${src}" class="carousel-img lazy-img" alt="${articulo.nombre}" />`;
            }
        }).join("");

        let cartelSinStock = "";
        if (sinStock && !esCategoriaEspecial) {
            cartelSinStock = `<div class="stock-banner">SIN STOCK</div>`;
        }

        let botonHTML = "";

        if (!sinStock) {
            botonHTML = `<button class="añadir-carrito-btn">Añadir al carrito</button>`;
        } else {
            if (esCategoriaEspecial) {
                botonHTML = `<button class="añadir-carrito-btn btn-ver-mas">Ver más</button>`;
            } else {
                botonHTML = `<button class="añadir-carrito-btn" disabled style="opacity: 0.6; cursor: not-allowed;">Sin stock</button>`;
            }
        }
          
        tarjeta.innerHTML = `
            <div class="carousel">
              ${imagenesHTML}
              ${cartelSinStock}
              ${imagenes.length > 1 ? `
                <button class="carousel-btn prev">‹</button>
                <button class="carousel-btn next">›</button>
            ` : ""}
            </div>
            <div class="contenido-producto">
                <h3 id="nombre-art" class="nombreArt">${mayus(articulo.nombre)}</h3>
                <div class="precio-container">
                  <p id="precio-art" class="precioArt">$${articulo.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p class="precioTrans">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
                </div>
            </div>
            ${botonHTML}
        `;

        // Activador del Lazy Loading 
        tarjeta.addEventListener("mouseenter", function() {
            const imagenesDormidas = this.querySelectorAll("img.lazy-img");
            imagenesDormidas.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src; // Pasa el link al src real
                    img.removeAttribute("data-src");
                    img.classList.remove("lazy-img"); // Ya no es lazy
                }
            });
        });

        // Lógica de carrusel
        const carousel = tarjeta.querySelector(".carousel");
        const imagesElements = carousel.querySelectorAll(".carousel-img");
        let currentIndex = 0;

        const showImage = (index) => {
            imagesElements.forEach((img, i) => {
                img.classList.toggle("active", i === index);
            });
        };

        const prevBtn = carousel.querySelector(".prev");
        const nextBtn = carousel.querySelector(".next");

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation(); 
                currentIndex = (currentIndex - 1 + imagesElements.length) % imagesElements.length;
                showImage(currentIndex);
            });

            nextBtn.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation(); 
                currentIndex = (currentIndex + 1) % imagesElements.length;
                showImage(currentIndex);
            });
        }

        const btnAccion = tarjeta.querySelector('.añadir-carrito-btn');
        
        if (!sinStock) {
            btnAccion.addEventListener("click", function (event) {
                event.preventDefault(); 
                event.stopPropagation();
                agregarAlCarrito(articulo);
                openCarrito();
            });
        }

        contenedor.appendChild(tarjeta);
    });
}

function iniciarListado(listaDeProductos) {
    
    productosGlobales = listaDeProductos;
    
    indiceActual = 0;
    
    cargarSiguienteTanda(true);
}

function cargarSiguienteTanda(esInicio = false) {
    const contenedorBoton = document.getElementById("cargar-mas-container");

    // Corta 20 productos
    const productosParaMostrar = productosGlobales.slice(indiceActual, indiceActual + POR_PAGINA);
    
    renderizarArticulos(productosParaMostrar, esInicio);
    
    indiceActual += POR_PAGINA;

    if (indiceActual >= productosGlobales.length) {
        contenedorBoton.style.display = "none"; // Ya no hay más productos
    } else {
        contenedorBoton.style.display = "block"; // Todavía quedan
    }
}

function ordenarArticulos() {
  const sortValue = document.getElementById("sort").value;
  const contenedor = document.getElementById("products-grid");

  const tarjetas = Array.from(contenedor.querySelectorAll(".product"));

  let articulosVisibles = tarjetas.map(tarjeta => {
    const nombreElem = tarjeta.querySelector(".nombreArt");
    const precioElem = tarjeta.querySelector(".precioArt");

    const precioTexto = precioElem ? precioElem.textContent.trim().replace("$", "").replace(/\./g, "").replace(",", ".") : "0";
    const precio = parseFloat(precioTexto);

    return {
      elemento: tarjeta,
      nombre: nombreElem ? nombreElem.textContent.trim() : "",
      precio: isNaN(precio) ? 0 : precio
    };
  });

  switch (sortValue) {
    case "price-asc":
      articulosVisibles.sort((a, b) => a.precio - b.precio);
      break;
    case "price-desc":
      articulosVisibles.sort((a, b) => b.precio - a.precio);
      break;
    case "alpha-asc":
      articulosVisibles.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case "alpha-desc":
      articulosVisibles.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    default:
      articulosVisibles.sort((a, b) => {
        const idA = parseInt(a.elemento.getAttribute("data-id"));
        const idB = parseInt(b.elemento.getAttribute("data-id"));
        return idB - idA;
      });
  }

  contenedor.innerHTML = "";
  articulosVisibles.forEach(a => contenedor.appendChild(a.elemento));
}

function filtrarProductos(categoria) {
  const filtrados = articulosCargados.filter(articulo => articulo.categoria === categoria);
  
  const mensaje = document.getElementById("mensaje-vacio");
  if (filtrados.length === 0) {
    mensaje.style.display = "block";
  } else {
    mensaje.style.display = "none";
  }

  iniciarListado(filtrados);
  cerrarTodos();
  const titulo = document.getElementById('mainTitle');
  titulo.innerHTML = `<h1>${categoria}</h1>`;
  titulo.style.display = 'block';
}

function mueblesInterior(){
  const filtrados = articulosCargados.filter(articulo => articulo.categoria === "SILLONES" || articulo.categoria === "BANQUETAS" || articulo.categoria === "SILLAS" || articulo.categoria === "MESAS" || articulo.categoria === "OFICINA" || articulo.categoria === "MESAS RATONAS");

  const mensaje = document.getElementById("mensaje-vacio");
  if (filtrados.length === 0) {
    mensaje.style.display = "block";
  } else {
    mensaje.style.display = "none";
  }

  iniciarListado(filtrados);
  cerrarTodos();
  const titulo = document.getElementById('mainTitle');
  titulo.innerHTML = `<h1>MUEBLES INTERIOR</h1>`;
  titulo.style.display = 'block';
}

function mostrarTodos() {
  const mensaje = document.getElementById("mensaje-vacio");
  mensaje.style.display = "none";
  renderizarArticulos(articulosCargados);
  cerrarTodos();
  const titulo = document.getElementById('mainTitle');
  titulo.innerHTML = `<h1>PRODUCTOS DESTACADOS</h1>`;
  titulo.style.display = 'block';
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
    response = await fetch(API_URL + "/articulos/venta", {
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

function agregarAlCarrito(articulo) {
  const existente = carrito.find(item => item.id === articulo.id);
  if (existente) {
    if (existente.cantidad < (articulo.cant1 + articulo.cant3)) {
      existente.cantidad++;
    } else {
      existente.aviso = "No hay más stock disponible";
    }
  } else {
    carrito.push({ ...articulo, cantidad: 1 });
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
    window.location.href = "resumen.html"; 
  });

  localStorage.setItem("carrito", JSON.stringify(carrito));
}




