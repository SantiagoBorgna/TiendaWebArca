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

function mayus(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function irAInicio() {
  window.location.href = "/";
}

function isIndexPage() {
    return window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
}

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