// VARIABLES GLOBALES PARA PAGINACIÓN
let productosGlobales = []; // Lista completa
let indiceActual = 0;
const POR_PAGINA = 20;

let articulosCargados = [];
let carrito = [];

/* CARGAR ARTICULOS DESDE DB CHEQUEANDO SI HAY QUE APLICAR ALGUN FILTRO */
document.addEventListener("DOMContentLoaded", () => {
    
    const sortSelect = document.getElementById("sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", ordenarArticulos);
    }

    fetch(API_URL + "/articulos")
        .then((response) => response.json())
        .then((articulos) => {
            articulosCargados = articulos;

            // Orden inicial por defecto: Stock (Popularidad)
            articulosCargados.sort((a, b) => (b.cant1 + b.cant3) - (a.cant1 + a.cant3));

            // LÓGICA DE RUTAS 
            const path = window.location.pathname.replace(/^\/|\/$/g, ''); 
            const params = new URLSearchParams(window.location.search);
            const busqueda = params.get('busqueda');

            if (path && path !== "index.html") {
                // Categoria limpia
                // Normaliza el slug a categoría
                let categoria = path.replace(/-/g, " ").toUpperCase();

                if (categoria === "INTERIOR" || categoria === "MUEBLES INTERIOR") {
                    mueblesInterior();
                } else {
                    filtrarProductos(categoria);
                }

            } else if (busqueda) {
                const input = document.querySelector(".search-input");
                if (input) input.value = busqueda;

                ejecutarBusqueda(busqueda);

            } else {
                iniciarListado(articulosCargados);
            }
        })
        .catch((error) => console.error("Error cargando artículos:", error));

    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado && typeof renderizarCarrito === "function") {
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
    const texto = input.value.trim();
  
    if (texto === "") return;

    ejecutarBusqueda(texto);

    // Actualiza la URL 
    const nuevaURL = window.location.protocol + "//" + window.location.host + "/?busqueda=" + encodeURIComponent(texto);
    window.history.pushState({path: nuevaURL}, '', nuevaURL);

    input.value = "";
    cerrarTodos(); 
    window.scrollTo(0, 0);
}

function ejecutarBusqueda(texto) {
    
    const filtrados = articulosCargados.filter(articulo =>
        articulo.nombre.toLowerCase().includes(texto.toLowerCase())
    );

    const mensaje = document.getElementById("mensaje-vacio");
    const grid = document.getElementById("products-grid");

    if (filtrados.length === 0) {
        if(mensaje) mensaje.style.display = "block";
        if(grid) grid.innerHTML = "";            
    } else {
        if(mensaje) mensaje.style.display = "none";  
        iniciarListado(filtrados);
    }

    const titulo = document.getElementById('mainTitle');
    if (titulo) {
        titulo.innerHTML = `<h1>Resultados para: "${mayus(texto)}"</h1>`;
        titulo.style.display = 'block';
    }
}

function renderizarArticulos(articulos, limpiar = true) {
    const contenedor = document.getElementById("products-grid");

    if (limpiar) {
        contenedor.innerHTML = "";
    }

    //const articulosOrdenados = [...articulos].sort((a, b) => (b.cant1 + b.cant3) - (a.cant1 + a.cant3));

    //articulosOrdenados.forEach((articulo) => {
    articulos.forEach((articulo) => {
        const tarjeta = document.createElement("a");
        tarjeta.className = "product card";

        const slug = articulo.nombre.toLowerCase()
            .trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Usamos el formato /p/ID/SLUG
        tarjeta.href = `/p/${articulo.id}/${slug}`;
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

  switch (sortValue) {
    case "price-asc":
      // Menor precio a mayor
      productosGlobales.sort((a, b) => a.precioVenta - b.precioVenta);
      break;

    case "price-desc":
      // Mayor precio a menor
      productosGlobales.sort((a, b) => b.precioVenta - a.precioVenta);
      break;

    case "alpha-asc":
      // A - Z
      productosGlobales.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;

    case "alpha-desc":
      // Z - A
      productosGlobales.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;

    default:
      // "Más populares": por Stock Total
      productosGlobales.sort((a, b) => (b.cant1 + b.cant3) - (a.cant1 + a.cant3));
      break;
  }

  iniciarListado(productosGlobales);
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

  actualizarURL(categoria);
  window.scrollTo(0, 0);
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

  actualizarURL("muebles-interior");
  window.scrollTo(0, 0);
}

function mostrarTodos() {
  const mensaje = document.getElementById("mensaje-vacio");
  mensaje.style.display = "none";
  renderizarArticulos(articulosCargados);
  cerrarTodos();
  const titulo = document.getElementById('mainTitle');
  titulo.innerHTML = `<h1>PRODUCTOS DESTACADOS</h1>`;
  titulo.style.display = 'block';

  window.scrollTo(0, 0);
}