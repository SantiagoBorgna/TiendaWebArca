let articulosCargados = [];
let carrito = [];

/* CARGAR ARTICULOS DESDE DB CHEQUEANDO SI HAY QUE APLICAR ALGUN FILTRO */
document.addEventListener("DOMContentLoaded", () => {
  fetch("https://backend-tienda-9gtc.onrender.com/api/articulos")
    .then((response) => response.json())
    .then((articulos) => {
      articulosCargados = articulos;

      // Chequea si hay un parámetro de categoría
      const params = new URLSearchParams(window.location.search);
      const categoria = params.get('categoria');

      if (categoria) {
        if (categoria === "INTERIOR") {
            mueblesInterior(); 
        } else {
            filtrarProductos(categoria);
        }
      } else {
        renderizarArticulos(articulosCargados);
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

  const filtrados = articulosCargados.filter(articulo =>
    articulo.nombre.toLowerCase().includes(texto)
  );

  renderizarArticulos(filtrados);
  input.value = "";
  cerrarTodos();
  document.getElementById('mainTitle').style.display = 'none';
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

function renderizarArticulos(articulos) {
    const contenedor = document.getElementById("products-grid");
    contenedor.innerHTML = "";

    const articulosOrdenados = [...articulos].sort((a, b) => (b.cant1 + b.cant3) - (a.cant1 + a.cant3));

    articulosOrdenados.forEach((articulo) => {
        const categoria = articulo.categoria;
        const tarjeta = document.createElement("div");
        tarjeta.className = "product";

        const imagenes = [articulo.img1, articulo.img2, articulo.img3, articulo.img4]
          .filter(src => src && src.trim() !== "");
          
        const imagenesHTML = imagenes.map((src, index) => `
            <img src="${src}" class="carousel-img ${index === 0 ? 'active' : ''}" />
        `).join("");

        const cartelSinStock = (articulo.cant1 + articulo.cant3) === 0
            ? `<div class="stock-banner">SIN STOCK</div>`
            : "";
          
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
                  <p class="precioTrans">$${(articulo.precioVenta * 0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Trasferencia</p>
                </div>
            </div>
              ${(articulo.cant1 + articulo.cant3) === 0
                ? `<button class="añadir-carrito-btn" disabled style="opacity: 0.6; cursor: not-allowed;">Sin stock</button>`
                : `<button class="añadir-carrito-btn">Añadir al carrito</button>`
            }
        `;

        tarjeta.setAttribute("data-id", articulo.id);

        // Lógica de carrusel
        const carousel = tarjeta.querySelector(".carousel");
        const images = carousel.querySelectorAll(".carousel-img");
        let currentIndex = 0;

        const showImage = (index) => {
            images.forEach((img, i) => {
                    img.classList.toggle("active", i === index);
            });
        };

        const prevBtn = carousel.querySelector(".prev");
        const nextBtn = carousel.querySelector(".next");

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener("click", function(event) {
                event.stopPropagation(); 
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            });

            nextBtn.addEventListener("click", function(event) {
                event.stopPropagation(); 
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            });
        }

        tarjeta.addEventListener("click", function() {
          window.location.href = `detalle.html?id=${articulo.id}`;
        });

        const btnCarrito = tarjeta.querySelector('.añadir-carrito-btn');
        if ((articulo.cant1 + articulo.cant3) > 0) {
            btnCarrito.addEventListener("click", function (event) {
                event.stopPropagation();
                agregarAlCarrito(articulo);
                openCarrito();
            });
        }

        contenedor.appendChild(tarjeta);
    });
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

  renderizarArticulos(filtrados);
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

  renderizarArticulos(filtrados);
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
  window.location.href = "index.html";
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
    window.location.href = "/resumen.html"; 
  });

  localStorage.setItem("carrito", JSON.stringify(carrito));
}




