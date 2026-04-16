let carrito = [];

/* Menus */
function toggleMenu() {
  document.getElementById("menuLateral").classList.add("abierto");
  document.getElementById("overlay").classList.add("visible");
}

function closeMenu() {
  document.getElementById("menuLateral").classList.remove("abierto");
  checkOverlay();
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

/* Utilidades */
function mayus(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function irAInicio() {
  window.location.href = "/";
}

function isIndexPage() {
    return window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
}

/*Filtros */
function filtrarProductos(categoria) {
    if (isIndexPage()) {
        if (typeof articulosCargados !== 'undefined') {
            const filtrados = articulosCargados.filter(articulo => articulo.categoria === categoria);
            
            if (typeof checkMensajeVacio === 'function') checkMensajeVacio(filtrados);
            if (typeof iniciarListado === 'function') iniciarListado(filtrados);
            if (typeof cerrarTodos === 'function') cerrarTodos();
            if (typeof actualizarTitulo === 'function') actualizarTitulo(categoria);
            if (typeof actualizarURL === 'function') actualizarURL(categoria); // Maquilla la URL
            window.scrollTo(0, 0);
        }
    } else {
        let slug = categoria.toLowerCase().trim().replace(/\s+/g, '-');
        if (slug === "baño") slug = "bano";
        window.location.href = `/${slug}`;
    }
}

function mueblesInterior() {
    if (isIndexPage()) {
        const categoriasInterior = ["SILLONES", "BANQUETAS", "SILLAS", "MESAS", "OFICINA", "MESAS RATONAS"];
        if (typeof articulosCargados !== 'undefined') {
            const filtrados = articulosCargados.filter(articulo => categoriasInterior.includes(articulo.categoria));
            
            if (typeof checkMensajeVacio === 'function') checkMensajeVacio(filtrados);
            if (typeof iniciarListado === 'function') iniciarListado(filtrados);
            if (typeof cerrarTodos === 'function') cerrarTodos();
            if (typeof actualizarTitulo === 'function') actualizarTitulo("MUEBLES INTERIOR");
            if (typeof actualizarURL === 'function') actualizarURL("muebles-interior");
            window.scrollTo(0, 0);
        }
    } else {
        window.location.href = `/muebles-interior`;
    }
}

function searchProducts() {
    const input = document.querySelector(".search-input");
    const texto = input.value.trim();
    
    if (texto === "") return;

    if (isIndexPage()) {
        if (typeof ejecutarBusqueda === 'function') ejecutarBusqueda(texto);
        
        const nuevaURL = window.location.protocol + "//" + window.location.host + "/?busqueda=" + encodeURIComponent(texto);
        window.history.pushState({path: nuevaURL}, '', nuevaURL);
        
        input.value = "";
        if (typeof cerrarTodos === 'function') cerrarTodos();
        window.scrollTo(0, 0);
    } else {
        window.location.href = `/?busqueda=${encodeURIComponent(texto)}`;
    }
}

function mostrarTodos(titulo) {
    if (isIndexPage()) {
        if (typeof window.mostrarTodosScript === 'function') {
             window.history.pushState({path: '/todos'}, '', '/todos');
             window.mostrarTodosScript(titulo || 'TODOS LOS PRODUCTOS');
        } else {
             window.location.href = "/todos";
        }
    } else {
        window.location.href = "/todos";
    }
}

/* Carrito */
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
  intentarRecalcularEnvio();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(articulo => articulo.id !== id);
  renderizarCarrito();
  intentarRecalcularEnvio();
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
  intentarRecalcularEnvio();
}

function renderizarCarrito() {
    const contenedor = document.getElementById("carrito-items");
    const footer = document.getElementById("carrito-footer");
    const envioSection = document.getElementById("envio-section");
    
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `<p class="carrito-vacio">El carrito está vacío</p>`;
        if(document.getElementById("carrito-subtotal")) document.getElementById("carrito-subtotal").innerHTML = "";
        footer.style.display = "none"; 
        envioSection.style.display = "none"; 
        localStorage.setItem("carrito", JSON.stringify(carrito));
        return;
    }

    footer.style.display = "flex";
    envioSection.style.display = "block"; 

    let subtotal = 0;
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
                        <p class="precio-articulo">$${(articulo.precioVenta * articulo.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    ${articulo.aviso ? `<p class="aviso-stock">${articulo.aviso}</p>` : ""}
                </div>
            </div>
        `;
    });

    const metodoEnvio = localStorage.getItem("metodoEnvio"); 
    const nombreTransportista = localStorage.getItem("nombreTransportista"); 
    const costoEnvioCalculado = parseFloat(localStorage.getItem("costoEnvioCalculado")); 
    const precioCobrado = parseFloat(localStorage.getItem("precioEnvio")) || 0;

    let total = subtotal + precioCobrado;

    document.getElementById("carrito-subtotal").innerHTML = `
        <h3>Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        <p>O $${(total*0.8).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} con Transferencia</p>
    `;

    const cpGuardado = localStorage.getItem("codigoPostal");
    if (cpGuardado) {
        const inputCP = document.getElementById("codigo-postal");
        if(inputCP) inputCP.value = cpGuardado;
    }

    const radioDomicilio = document.querySelector('input[value="envio-domicilio"]');
    if (radioDomicilio) {
        const label = radioDomicilio.closest("label");
        const spanPrecio = label.querySelector(".envio-costo");

        if (nombreTransportista) {
            actualizarNombreTransporte(label, nombreTransportista);
            if (!isNaN(costoEnvioCalculado)) {
                spanPrecio.textContent = `$${costoEnvioCalculado.toLocaleString('es-AR')}`;
            }
        } else {
            actualizarNombreTransporte(label, "Envío a domicilio");
            spanPrecio.textContent = "A determinar";
        }
    }

    if (metodoEnvio) {
        const radio = document.querySelector(`input[name="metodo-envio"][value="${metodoEnvio}"]`);
        if (radio) radio.checked = true;
    }

    const mensajeEnvio = document.getElementById("mensaje-envio");
    if (mensajeEnvio) {
        if (metodoEnvio === "envio-domicilio" && nombreTransportista) {
            mostrarMensajeTransporte(nombreTransportista);
        } else {
            mensajeEnvio.textContent = ""; 
        }
    }

    const radiosEnvio = document.getElementsByName("metodo-envio");
    radiosEnvio.forEach(radio => {
        radio.onclick = () => {
            const nuevoMetodo = document.querySelector('input[name="metodo-envio"]:checked').value;
            localStorage.setItem("metodoEnvio", nuevoMetodo);
            
            if (nuevoMetodo === "retiro-local") {
                localStorage.setItem("precioEnvio", 0);
            } else {
                const costo = localStorage.getItem("costoEnvioCalculado");
                localStorage.setItem("precioEnvio", costo ? parseFloat(costo) : 0);
            }
            renderizarCarrito(); 
        };
    });

    const btnIniciar = document.getElementById("iniciarCompraBtn");
    if(btnIniciar) {
        btnIniciar.onclick = () => window.location.href = "/resumen";
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
}

/* Envios */
// Precios base
const PRECIO_BASE_LANCIONI = 4500; 
const PRECIO_BASE_CORREO = 6800;

function calcularPesoTotalCarrito() {
    let pesoTotal = 0;
    
    carrito.forEach(item => {
        const pesoUnitario = item.peso || 1.0; 
        pesoTotal += pesoUnitario * item.cantidad;
    });

    console.log(pesoTotal);
    return pesoTotal;
}

async function calcularEnvio() {
    const cpInput = document.getElementById("codigo-postal");
    const mensaje = document.getElementById("mensaje-envio");
    
    const radioDomicilio = document.querySelector('input[value="envio-domicilio"]');
    const labelDomicilio = radioDomicilio ? radioDomicilio.closest("label") : null;
    const spanPrecio = labelDomicilio ? labelDomicilio.querySelector(".envio-costo") : null;

    const cp = cpInput.value.trim();

    if (!cp || cp.length < 4 || isNaN(cp)) {
        mensaje.textContent = "Ingresá un código postal válido.";
        mensaje.style.color = "red";
        
        if(spanPrecio) spanPrecio.textContent = "A determinar";
        
        if (typeof restaurarNombreTransporte === "function" && labelDomicilio) {
            restaurarNombreTransporte(labelDomicilio, "Envío a domicilio");
        }
        
        localStorage.removeItem("precioEnvio");
        localStorage.removeItem("costoEnvioCalculado");
        localStorage.removeItem("nombreTransportista");
        return;
    }

    // Feedback de carga
    mensaje.textContent = "Cotizando...";
    mensaje.style.color = "gray";

    const peso = (typeof calcularPesoTotalCarrito === 'function') ? calcularPesoTotalCarrito() : 5; // 5kg por defecto, cambiar

    // Definimos la URL
    const baseUrl = (typeof API_URL !== 'undefined') ? API_URL : "http://localhost:8080";

    try {
        const response = await fetch(`${baseUrl}/envios/calcular?cp=${cp}&peso=${peso}`);

        if (!response.ok) throw new Error("Error al calcular envío");

        const data = await response.json(); 

        const precioFinal = data.costo;
        const nombreTransporte = data.nombreTransportista;

        if(spanPrecio) {
            spanPrecio.textContent = `$${precioFinal.toLocaleString('es-AR')}`;
            spanPrecio.style.fontWeight = "bold";
        }

        if (typeof actualizarNombreTransporte === "function" && labelDomicilio) {
            actualizarNombreTransporte(labelDomicilio, nombreTransporte);
        }

        if(radioDomicilio) radioDomicilio.checked = true;

        mensaje.innerHTML = `<b>${nombreTransporte}</b>: ${data.mensaje}`;
        mensaje.style.color = data.tipo === "lancioni" ? "#28a745" : "#004b8d";

        // Persistencia
        localStorage.setItem("codigoPostal", cp);
        localStorage.setItem("nombreTransportista", nombreTransporte); 
        localStorage.setItem("costoEnvioCalculado", precioFinal);  
        localStorage.setItem("metodoEnvio", "envio-domicilio"); 
        localStorage.setItem("precioEnvio", precioFinal); 
        
        if (typeof renderizarCarrito === "function") renderizarCarrito();

    } catch (error) {
        console.error("Error:", error);
        mensaje.textContent = "No pudimos calcular el costo. Intentá de nuevo.";
        mensaje.style.color = "red";
        
        localStorage.removeItem("precioEnvio");
    }
}

function intentarRecalcularEnvio() {
    const inputCP = document.getElementById("codigo-postal");
    if (inputCP && inputCP.value.length > 0) {
        calcularEnvio();
    }
}

function mostrarMensajeTransporte(nombreTransporte) {
    const mensaje = document.getElementById("mensaje-envio");
    if(!mensaje) return;

    if (nombreTransporte.includes("Lancioni")) {
        mensaje.innerHTML = `Envío a cargo de <b>${nombreTransporte}</b>.`;
        mensaje.style.color = "green";
    } else {
        mensaje.innerHTML = `Envío a cargo de <b>${nombreTransporte}</b>.`;
        mensaje.style.color = "#004b8d";
    }
}

function actualizarNombreTransporte(label, nuevoTexto) {
    label.childNodes.forEach(node => {
        if (node.nodeType === 3 && node.textContent.trim().length > 0) {
            node.textContent = ` ${nuevoTexto} `;
        }
    });
}

function restaurarNombreTransporte(label, textoOriginal) {
    label.childNodes.forEach(node => {
        if (node.nodeType === 3 && node.textContent.trim().length > 0) {
            node.textContent = ` ${textoOriginal} `;
        }
    });
}