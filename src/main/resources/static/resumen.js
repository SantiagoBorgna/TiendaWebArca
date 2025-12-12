let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let indiceCarrusel = 0;
let recomendadosFiltrados = [];

window.addEventListener('resize', actualizarCarrusel);



document.addEventListener("DOMContentLoaded", () => {
    cargarDatosEnvio();
    mostrarRecomendados();
    mostrarCarritoResumen();
});

document.getElementById("btn-continuar").addEventListener("click", () => {
    iniciarCompra();
});

/* ACTUALIZAR TOTAL SEGUN ENVIO */
document.addEventListener("DOMContentLoaded", () => {
  actualizarTotal();

  const radiosEnvio = document.querySelectorAll('input[name="metodo-envio"]');
  radiosEnvio.forEach(radio => {
    radio.addEventListener("change", () => {
      const costoEnvio = radio.value === "envio-domicilio" ? 1000 : 0;
      const subtotalEnvio = document.getElementById("subtotal-envio");
      if (subtotalEnvio) {
        subtotalEnvio.textContent = `$${costoEnvio.toLocaleString('es-AR')}`;
      }
      actualizarTotal(); 

      const metodoSeleccionado = document.querySelector('input[name="metodo-envio"]:checked').value;
      localStorage.setItem("metodoEnvio", metodoSeleccionado);
    });
  });
});

function mostrarCarritoResumen() {
    const contenedor = document.getElementById("carrito-resumen");
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
      contenedor.innerHTML = "<p class='carrito-vacio'>El carrito está vacío</p>";
      return;
    }

    let subtotal = 0;

    carrito.forEach((articulo) => {
      subtotal += articulo.precioVenta * articulo.cantidad;

      contenedor.innerHTML += `
        <div class="fila-carrito">
          <div class="col producto">
            <img src="${articulo.img1}" alt="${mayus(articulo.nombre)}" class="img-resumen" />
            <p class="nombre">${mayus(articulo.nombre)}</p>
          </div>
          <div class="col precio-unitario">
            <p class="precio">$ ${(articulo.precioVenta).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          <div class="col cantidad">
            <div class="cantidad-control">
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad - 1})">−</button>
              <span>${articulo.cantidad}</span>
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad + 1})">+</button>
            </div>
          </div>
          <div class="col subtotal">
            <p>$ ${(articulo.precioVenta * articulo.cantidad).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          <div class="col eliminar">
            <a onclick="eliminarDelCarrito(${articulo.id})" class="btn-eliminar">
              <img src="./images/trash.png" alt="Eliminar" class="icono-trash" />
            </a>
          </div>
        </div>
      `;
    });

    const totalContainer = document.getElementById("total-resumen");
    totalContainer.innerHTML = `
      <h2>Total: $${subtotal.toLocaleString('es-AR', {minimumFractionDigits: 2})}</h2>
    `;
    actualizarTotal();
}

function mayus(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarTotal();
  mostrarCarritoResumen();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(articulo => articulo.id !== id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarTotal();
    mostrarCarritoResumen();
}

function mostrarRecomendados() {

  fetch("http://localhost:8080/api/articulos")
    .then(response => response.json())
    .then(articulos => {
      const idsCarrito = carrito.map(item => item.id);

      
      recomendadosFiltrados = articulos
        .filter(a => (a.cant1) > 0 && !idsCarrito.includes(a.id))
        .sort((a, b) => (b.cant1) - (a.cant1))
        .slice(0, 6); 
        
      renderCarrusel(); 
    })
    .catch(error => console.error("Error cargando recomendados:", error));
}

function renderCarrusel() {
  const contenedor = document.getElementById("recomendados-container");

  contenedor.innerHTML = "";

  recomendadosFiltrados.forEach(articulo => {
    const card = document.createElement("div");
    card.className = "card-recomendado";
    card.innerHTML = `
      <a href="detalle.html?id=${articulo.id}" class="link-producto">
        <img src="${articulo.img1}" alt="${articulo.nombre}">
        <p id="nombre"><strong>${mayus(articulo.nombre)}</strong></p>
        <p id="precio">$${articulo.precioVenta.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
      </a>
      <button class="añadir-carrito-btn" onclick="agregarAlCarrito(${articulo.id})">Agregar</button>
    `;
    contenedor.appendChild(card);
  });

  actualizarCarrusel();

  // Swipe táctil solo en móviles
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;

  contenedor.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX;
    scrollLeft = contenedor.scrollLeft;
  });

  contenedor.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX;
    const walk = (startX - x) * 1.5;
    contenedor.scrollLeft = scrollLeft + walk;
  });

  contenedor.addEventListener('touchend', () => {
    isDown = false;
  });
}

function actualizarCarrusel() {
  const contenedor = document.getElementById("recomendados-container");

  
  const esMovil = window.innerWidth <= 768;

  if (!esMovil) {
    const desplazamiento = indiceCarrusel * 100; 
    contenedor.style.transform = `translateX(-${desplazamiento}%)`;

    document.getElementById("btn-prev").style.display = (indiceCarrusel === 0) ? "none" : "inline-block";
    document.getElementById("btn-next").style.display = (indiceCarrusel + 1 >= Math.ceil(recomendadosFiltrados.length / 3)) ? "none" : "inline-block";
  } else {
    contenedor.style.transform = "none";
    document.getElementById("btn-prev").style.display = "none";
    document.getElementById("btn-next").style.display = "none";
  }
}

function avanzarCarrusel() {
  const totalPaginas = Math.ceil(recomendadosFiltrados.length / 3);
  if (indiceCarrusel < totalPaginas - 1) {
    indiceCarrusel++;
    actualizarCarrusel();
  }
}

function retrocederCarrusel() {
  if (indiceCarrusel > 0) {
    indiceCarrusel--;
    actualizarCarrusel();
  }
}

function agregarAlCarrito(id) {
  const producto = recomendadosFiltrados.find(p => p.id === id);
  if (!producto) return;

  const stockDisponible = producto.cant1 + producto.cant3;

  const existente = carrito.find(item => item.id === id);

  if (existente) {
    if (existente.cantidad < stockDisponible) {
      existente.cantidad += 1;
    } else {
      alert("No hay más stock disponible para este producto.");
      return;
    }
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarTotal();
  mostrarCarritoResumen(); 
  
}

function calcularSubtotalCarrito() {
  return carrito.reduce((total, producto) => {
    return total + (producto.precioVenta * producto.cantidad);
  }, 0);
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

  actualizarTotal(); 
}

function actualizarTotal() {
  const subtotal = carrito.reduce((acc, item) => acc + item.precioVenta * item.cantidad, 0);

  
  let envio = 0;
  const envioElement = document.getElementById("subtotal-envio");
  if (envioElement) {
    const texto = envioElement.textContent.replace("$", "").replace(".", "").replace(",", ".");
    envio = parseFloat(texto) || 0;
  }

  const total = subtotal + envio;
  const totalTrans = total*0.8;

  
  document.getElementById("subtotal-compra").textContent = subtotal.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  document.getElementById("total-compra").textContent = total.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  document.getElementById("total-compra-trans").textContent = totalTrans.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function cargarDatosEnvio() {
  // Código postal
  const cpGuardado = localStorage.getItem("codigoPostal");
  if (cpGuardado) {
    const inputCP = document.getElementById("codigo-postal");
    if (inputCP) inputCP.value = cpGuardado;
  }

  // Método de envío
  const metodoGuardado = localStorage.getItem("metodoEnvio");
  if (metodoGuardado) {
    const radio = document.querySelector(`input[name="metodo-envio"][value="${metodoGuardado}"]`);
    if (radio) radio.checked = true;
  }

  // Precio de envío
  const precioGuardado = localStorage.getItem("precioEnvio");
  if (precioGuardado) {
    const label = document.querySelector('input[value="envio-domicilio"]')?.closest("label");
    const spanPrecio = label?.querySelector(".envio-costo");
    if (spanPrecio) {
      spanPrecio.textContent = precioGuardado === "No disponible" ? "No disponible" : `$${precioGuardado}`;
    }
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
  const montoTotal = calcularSubtotalCarrito();
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

