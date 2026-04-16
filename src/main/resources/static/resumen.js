if (typeof carrito === 'undefined' || carrito.length === 0) {
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
}

let indiceCarrusel = 0;
let recomendadosFiltrados = [];

window.addEventListener('resize', actualizarCarrusel);

document.addEventListener("DOMContentLoaded", () => {
    mostrarCarritoResumen();
    mostrarRecomendados();
    cargarDatosEnvioPersistentes();

    const radiosEnvio = document.querySelectorAll('input[name="metodo-envio"]');
    radiosEnvio.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (e.target.value === "retiro-local") {
                actualizarTotales(0);
                localStorage.setItem("metodoEnvio", "retiro-local");
                localStorage.setItem("precioEnvio", 0); 
                
                const mensaje = document.getElementById("mensaje-envio");
                if(mensaje) mensaje.textContent = "";

            } else {
                const costoCalculado = parseFloat(localStorage.getItem("costoEnvioCalculado"));
                
                if (!isNaN(costoCalculado)) {
                    actualizarTotales(costoCalculado);
                    localStorage.setItem("metodoEnvio", "envio-domicilio");
                    localStorage.setItem("precioEnvio", costoCalculado);
                    
                    const nombreTransp = localStorage.getItem("nombreTransportista");
                    mostrarMensajeResumen(nombreTransp);
                } else {
                    calcularEnvioResumen();
                }
            }
        });
    });

    const btnContinuar = document.getElementById("btn-continuar");
    if (btnContinuar) {
        btnContinuar.addEventListener("click", () => {
            const errorMsg = document.getElementById("mensaje-error-resumen");
            if (errorMsg) errorMsg.textContent = "";

            if (carrito.length === 0) {
                if(errorMsg) errorMsg.textContent = "Tu carrito está vacío";
                else alert("Tu carrito está vacío");
                return;
            }

            const metodoEnvio = localStorage.getItem("metodoEnvio");
            if (!metodoEnvio) {
                if(errorMsg) errorMsg.textContent = "Por favor calculá el envío o seleccioná retiro";
                else alert("Seleccioná un método de envío");
                return;
            }

            window.location.href = "/pago";
        });
    }
});

/* Envios y costos */
function cargarDatosEnvioPersistentes() {
    const cpGuardado = localStorage.getItem("codigoPostal");
    const metodoEnvio = localStorage.getItem("metodoEnvio");
    const nombreTransportista = localStorage.getItem("nombreTransportista");
    const costoCalculado = parseFloat(localStorage.getItem("costoEnvioCalculado"));
    
    if (cpGuardado) {
        const inputCP = document.getElementById("codigo-postal");
        if (inputCP) inputCP.value = cpGuardado;
    }

    const radioEnvio = document.querySelector('input[value="envio-domicilio"]');
    if (radioEnvio && nombreTransportista && !isNaN(costoCalculado)) {
        const label = radioEnvio.closest("label");
        actualizarTextoLabel(label, nombreTransportista);
        const spanPrecio = document.getElementById("costo-envio");
        if(spanPrecio) spanPrecio.textContent = `$${costoCalculado.toLocaleString('es-AR')}`;
    }

    if (metodoEnvio === "retiro-local") {
        const radioRetiro = document.querySelector('input[value="retiro-local"]');
        if(radioRetiro) radioRetiro.checked = true;
        actualizarTotales(0);
    } else if (metodoEnvio === "envio-domicilio" && nombreTransportista) {
        if(radioEnvio) radioEnvio.checked = true;
        actualizarTotales(costoCalculado);
        mostrarMensajeResumen(nombreTransportista);
    } else {
        actualizarTotales(0);
    }
}

function calcularPesoTotal() {
    let peso = 0;
    carrito.forEach(item => {
        const p = item.peso || 1.0; 
        peso += p * item.cantidad;
    });
    return peso;
}

async function calcularEnvioResumen() {
    const cpInput = document.getElementById("codigo-postal");
    const spanPrecio = document.getElementById("costo-envio"); 
    const radioDomicilio = document.querySelector('input[value="envio-domicilio"]');
    
    // 1. Limpieza y validación inicial
    const cp = cpInput.value.trim();

    if (!cp || cp.length < 4 || isNaN(cp)) {
        // Si el CP es inválido, limpiamos mensajes y totales
        const msgDiv = document.getElementById("mensaje-envio");
        if(msgDiv) msgDiv.textContent = "Ingresá un CP válido";
        
        if(spanPrecio) spanPrecio.textContent = "$0";
        
        // Reseteamos total
        if (typeof actualizarTotales === 'function') actualizarTotales(0);
        
        // Limpiamos storage
        localStorage.removeItem("precioEnvio");
        localStorage.removeItem("costoEnvioCalculado");
        return;
    }

    // Feedback visual (Importante porque es asíncrono)
    if(spanPrecio) spanPrecio.textContent = "Calculando...";

    // 2. Preparamos datos para enviar
    // Usamos tu función existente para pesar el carrito
    const peso = (typeof calcularPesoTotal === 'function') ? calcularPesoTotal() : 5; 
    const baseUrl = (typeof API_URL !== 'undefined') ? API_URL : "http://localhost:8080";

    try {
        // 3. Consulta al Backend
        const response = await fetch(`${baseUrl}/envios/calcular?cp=${cp}&peso=${peso}`);

        if (!response.ok) throw new Error("Error de conexión");

        const data = await response.json();
        
        // data trae: { nombreTransportista, costo, mensaje, tipo }
        const precioFinal = data.costo;
        const nombreTransporte = data.nombreTransportista;

        // 4. Actualización Visual (UI)
        
        // Precio del envío
        if(spanPrecio) {
            spanPrecio.textContent = `$${precioFinal.toLocaleString('es-AR')}`;
        }

        // Seleccionar radio button
        if(radioDomicilio) {
            radioDomicilio.checked = true;
            const label = radioDomicilio.closest("label");
            // Usamos tu función auxiliar para actualizar el texto del label
            if (typeof actualizarTextoLabel === 'function') {
                actualizarTextoLabel(label, nombreTransporte);
            }
        }

        // Mostrar mensaje (Podés adaptar mostrarMensajeResumen para que use data.mensaje si querés más detalle)
        if (typeof mostrarMensajeResumen === 'function') {
            mostrarMensajeResumen(nombreTransporte); 
        } else {
            // Fallback si no existe la función
            const msgDiv = document.getElementById("mensaje-envio");
            if(msgDiv) {
                msgDiv.innerHTML = data.mensaje;
                msgDiv.style.color = data.tipo === "lancioni" ? "green" : "#004b8d";
            }
        }

        // 5. Persistencia
        localStorage.setItem("codigoPostal", cp);
        localStorage.setItem("nombreTransportista", nombreTransporte);
        localStorage.setItem("costoEnvioCalculado", precioFinal);
        localStorage.setItem("metodoEnvio", "envio-domicilio");
        localStorage.setItem("precioEnvio", precioFinal);

        // 6. Actualizar el Total Final (Suma productos + envío)
        if (typeof actualizarTotales === 'function') {
            actualizarTotales(precioFinal);
        }

    } catch (error) {
        console.error("Error:", error);
        if(spanPrecio) spanPrecio.textContent = "Error";
        
        const msgDiv = document.getElementById("mensaje-envio");
        if(msgDiv) {
            msgDiv.textContent = "Error al cotizar. Intentá de nuevo.";
            msgDiv.style.color = "red";
        }
        
        // En caso de error, el envío es 0 para no bloquear
        if (typeof actualizarTotales === 'function') actualizarTotales(0);
    }
}

function actualizarTotales(costoEnvio = 0) {
    let subtotal = 0;
    carrito.forEach((item) => {
        subtotal += item.precioVenta * item.cantidad;
    });

    const total = subtotal + costoEnvio;
    const totalTrans = (subtotal * 0.8) + costoEnvio;

    const subtotalEl = document.getElementById("subtotal-compra");
    const envioEl = document.getElementById("subtotal-envio");
    const totalEl = document.getElementById("total-compra");
    const totalTransEl = document.getElementById("total-compra-trans");

    if(subtotalEl) subtotalEl.textContent = formatearMoneda(subtotal);
    
    if(envioEl) {
        if(costoEnvio === 0) envioEl.textContent = "Gratis";
        else envioEl.textContent = formatearMoneda(costoEnvio);
    }

    if(totalEl) totalEl.textContent = formatearMoneda(total);
    if(totalTransEl) totalTransEl.textContent = formatearMoneda(totalTrans);
}

function formatearMoneda(valor) {
    return valor.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function actualizarTextoLabel(label, nuevoTexto) {
    label.childNodes.forEach(node => {
        if (node.nodeType === 3 && node.textContent.trim().length > 0) {
            node.textContent = ` ${nuevoTexto} `;
        }
    });
}

function mostrarMensajeResumen(nombreTransporte) {
    const mensaje = document.getElementById("mensaje-envio");
    if(!mensaje) return;
    
    if (nombreTransporte.includes("Lancioni")) {
        mensaje.innerHTML = `Envío a cargo de <b>${nombreTransporte}</b>`;
        mensaje.style.color = "green";
    } else {
        mensaje.innerHTML = `Envío a cargo de <b>${nombreTransporte}</b>`;
        mensaje.style.color = "#004b8d";
    }
}

/* Carrito */
function mostrarCarritoResumen() {
    const contenedor = document.getElementById("carrito-resumen");
    
    if (!contenedor) return; 

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p class='carrito-vacio'>El carrito está vacío</p>";
        return;
    }

    carrito.forEach((articulo) => {
        contenedor.innerHTML += `
        <div class="fila-carrito">
          <div class="col producto">
            <img src="${articulo.img1}" alt="${mayus(articulo.nombre)}" class="img-resumen" />
            <p class="nombre">${mayus(articulo.nombre)}</p>
          </div>
          <div class="col precio-unitario">
            <p class="precio">$${(articulo.precioVenta).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          
          <div class="col cantidad">
            <div class="cantidad-control">
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad - 1})">−</button>
              <span>${articulo.cantidad}</span>
              <button onclick="cambiarCantidad(${articulo.id}, ${articulo.cantidad + 1})">+</button>
            </div>
            ${articulo.aviso ? `<p class="aviso-stock" style="color: red; font-size: 12px; margin-top: 5px; text-align: center;">${articulo.aviso}</p>` : ""}
          </div>
          <div class="col subtotal">
            <p>$${(articulo.precioVenta * articulo.cantidad).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          <div class="col eliminar">
            <a onclick="eliminarDelCarrito(${articulo.id})" class="btn-eliminar">
              <img src="./images/trash.png" alt="Eliminar" class="icono-trash" />
            </a>
          </div>
        </div>
    `;
  });
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
        articulo.aviso = "Stock máximo alcanzado";
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarritoResumen();

    // Recalcular con el envío actual
    const metodoActual = localStorage.getItem("metodoEnvio");
    if (metodoActual === "retiro-local") {
        actualizarTotales(0);
    } else {
        const cp = document.getElementById("codigo-postal").value;
        if(cp) calcularEnvioResumen();
        else actualizarTotales(0);
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(articulo => articulo.id !== id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarritoResumen();
    
    const metodoActual = localStorage.getItem("metodoEnvio");
    if (metodoActual === "retiro-local") {
        actualizarTotales(0);
    } else {
        const cp = document.getElementById("codigo-postal").value;
        if(cp) calcularEnvioResumen();
        else actualizarTotales(0);
    }
}

function agregarAlCarrito(id) {
    const producto = recomendadosFiltrados.find(p => p.id === id);
    if (!producto) return;

    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarritoResumen();
    
    // Recalcular peso y envio
    const metodoActual = localStorage.getItem("metodoEnvio");
    if (metodoActual === "retiro-local") {
        actualizarTotales(0);
    } else {
        const cp = document.getElementById("codigo-postal").value;
        if(cp) calcularEnvioResumen();
        else actualizarTotales(0);
    }
}

/* Recomendados */
function mostrarRecomendados() {
    if(typeof API_URL === 'undefined') return;

    fetch(API_URL + "/articulos")
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
    if(!contenedor) return;

    contenedor.innerHTML = "";

    recomendadosFiltrados.forEach(articulo => {
        const card = document.createElement("div");
        card.className = "card-recomendado";
        
        // Slug para link limpio
        const slug = articulo.nombre.toLowerCase().trim().replace(/\s+/g, '-');
        
        card.innerHTML = `
          <a href="/p/${articulo.id}/${slug}" class="link-producto">
            <img src="${articulo.img1}" alt="${articulo.nombre}">
            <p id="nombre"><strong>${mayus(articulo.nombre)}</strong></p>
            <p id="precio">$${articulo.precioVenta.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </a>
          <button class="añadir-carrito-btn" onclick="agregarAlCarrito(${articulo.id})">Agregar</button>
        `;
        contenedor.appendChild(card);
    });

    actualizarCarrusel();
    
    // Swipe táctil
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
    contenedor.addEventListener('touchend', () => { isDown = false; });
}

function actualizarCarrusel() {
    const contenedor = document.getElementById("recomendados-container");
    if(!contenedor) return;
    
    const esMovil = window.innerWidth <= 768;
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    if (!esMovil) {
        const desplazamiento = indiceCarrusel * 100;
        contenedor.style.transform = `translateX(-${desplazamiento}%)`;

        if(btnPrev) btnPrev.style.display = (indiceCarrusel === 0) ? "none" : "inline-block";
        if(btnNext) btnNext.style.display = (indiceCarrusel + 1 >= Math.ceil(recomendadosFiltrados.length / 3)) ? "none" : "inline-block";
    } else {
        contenedor.style.transform = "none";
        if(btnPrev) btnPrev.style.display = "none";
        if(btnNext) btnNext.style.display = "none";
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