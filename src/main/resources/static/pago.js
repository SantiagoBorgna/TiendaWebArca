/* Lógica del Formulario y Envío */

document.addEventListener("DOMContentLoaded", () => {
    const metodo = localStorage.getItem("metodoEnvio");
    const formRetiro = document.getElementById("form-retiro");
    const formEnvio = document.getElementById("form-envio");
    const titulo = document.getElementById("title");

    if (metodo === "retiro-local") {
        formRetiro.style.display = "block";
        titulo.textContent = "Completá tus datos para el retiro";
        formEnvio.innerHTML = "";
        activarValidacionesEnTiempoReal("retiro");
    } else {
        titulo.textContent = "Completá tus datos para el envío";
        formEnvio.style.display = "block";
        formRetiro.innerHTML = "";
        
        const cpGuardado = localStorage.getItem("codigoPostal");
        if(cpGuardado) {
            const inputCP = document.getElementById("codigo-postal-envio");
            if(inputCP) inputCP.value = cpGuardado;
        }
        activarValidacionesEnTiempoReal("envio");
    }

    const btnPagar = document.getElementById("btn-pagar");
    if(btnPagar){
        btnPagar.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Valida Forms
            let esValido = false;
            if (metodo === "retiro-local") {
                esValido = validarFormularioRetiro();
            } else {
                esValido = validarFormularioEnvio();
            }

            if (!esValido) {
                alert("Por favor corregí los campos en rojo.");
                return;
            }

            await enviarPedidoAlBackend(metodo);
        });
    }
});

/* Validación */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
const REGEX_DNI = /^\d{7,8}$/;
const REGEX_TEL = /^\d{10,15}$/; 
const REGEX_TEXTO = /.+/; 

function validarCampo(idInput, idError, regex, mensajeError) {
    const input = document.getElementById(idInput);
    const errorDiv = document.getElementById(idError);
    
    if (!input) return true;

    const valor = input.value.trim();

    if (!regex.test(valor)) {
        if(errorDiv) errorDiv.textContent = mensajeError;
        input.style.borderColor = "red";
        input.style.backgroundColor = "#fff0f0";
        return false;
    } else {
        if(errorDiv) errorDiv.textContent = "";
        input.style.borderColor = "#ccc";
        input.style.backgroundColor = "#fff";
        return true;
    }
}

function validarFormularioRetiro() {
    let v = true;
    v &= validarCampo("nombre-retiro", "error-nombre-retiro", REGEX_TEXTO, "Ingresá nombre y apellido.");
    v &= validarCampo("dni-retiro", "error-dni-retiro", REGEX_DNI, "DNI inválido (solo números).");
    v &= validarCampo("email-retiro", "error-email-retiro", REGEX_EMAIL, "Ingresá un email válido.");
    v &= validarCampo("telefono-retiro", "error-telefono-retiro", REGEX_TEL, "Teléfono inválido (solo números).");
    return !!v;
}

function validarFormularioEnvio() {
    let v = true;
    v &= validarCampo("nombre-envio", "error-nombre-envio", REGEX_TEXTO, "Ingresá nombre y apellido.");
    v &= validarCampo("dni-envio", "error-dni-envio", REGEX_DNI, "DNI inválido (solo números).");
    v &= validarCampo("email-envio", "error-email-envio", REGEX_EMAIL, "Ingresá un email válido.");
    v &= validarCampo("telefono-envio", "error-telefono-envio", REGEX_TEL, "Teléfono inválido (solo números).");
    
    v &= validarCampo("calle", "error-calle", REGEX_TEXTO, "Falta la calle.");
    v &= validarCampo("localidad", "error-localidad", REGEX_TEXTO, "Falta la localidad.");
    v &= validarCampo("provincia", "error-provincia", REGEX_TEXTO, "Seleccioná una provincia.");
    v &= validarCampo("codigo-postal-envio", "error-cp", /^\d{4,5}$/, "CP inválido.");
    
    return !!v;
}

function activarValidacionesEnTiempoReal(tipo) {
    if (tipo === "retiro") {
        document.getElementById("nombre-retiro")?.addEventListener("blur", () => validarCampo("nombre-retiro", "error-nombre-retiro", REGEX_TEXTO, "Ingresá nombre."));
        document.getElementById("dni-retiro")?.addEventListener("blur", () => validarCampo("dni-retiro", "error-dni-retiro", REGEX_DNI, "DNI solo números."));
        document.getElementById("email-retiro")?.addEventListener("blur", () => validarCampo("email-retiro", "error-email-retiro", REGEX_EMAIL, "Email inválido."));
        document.getElementById("telefono-retiro")?.addEventListener("blur", () => validarCampo("telefono-retiro", "error-telefono-retiro", REGEX_TEL, "Solo números."));
    } else {
        document.getElementById("nombre-envio")?.addEventListener("blur", () => validarCampo("nombre-envio", "error-nombre-envio", REGEX_TEXTO, "Ingresá nombre."));
        document.getElementById("dni-envio")?.addEventListener("blur", () => validarCampo("dni-envio", "error-dni-envio", REGEX_DNI, "DNI solo números."));
        document.getElementById("email-envio")?.addEventListener("blur", () => validarCampo("email-envio", "error-email-envio", REGEX_EMAIL, "Email inválido."));
        document.getElementById("telefono-envio")?.addEventListener("blur", () => validarCampo("telefono-envio", "error-telefono-envio", REGEX_TEL, "Solo números."));
        document.getElementById("codigo-postal-envio")?.addEventListener("blur", () => validarCampo("codigo-postal-envio", "error-cp", /^\d{4,5}$/, "CP incorrecto."));
    }
}

/* ENVÍO AL BACKEND */
async function enviarPedidoAlBackend(metodo) {
    const btn = document.getElementById("btn-pagar");
    const textoOriginal = btn.textContent;
    btn.textContent = "Procesando...";
    btn.disabled = true;
    let nombreMetodoEnvio = "";

    try {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const costoEnvio = parseFloat(localStorage.getItem("precioEnvio")) || 0;
        
        // Calcula Totales
        let totalProductos = 0;
        const itemsDto = carrito.map(item => {
            totalProductos += item.precioVenta * item.cantidad;
            return {
                id: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precioVenta
            };
        });

        let datosForm = {};

        if (metodo === "retiro-local") {
            const nombreCompleto = document.getElementById("nombre-retiro").value;
            const partesNombre = separarNombre(nombreCompleto);
            nombreMetodoEnvio = "Retiro en local";

            datosForm = {
                nombre: partesNombre.nombre,
                apellido: partesNombre.apellido,
                dni: document.getElementById("dni-retiro").value,
                email: document.getElementById("email-retiro").value,
                telefono: document.getElementById("telefono-retiro").value,

                pisoDepto: "-",
                calle: "Retiro en Local", 
                numero: "-", 
                ciudad: "Oncativo", 
                provincia: "Córdoba", 
                cp: "5986"
            };
        } else {
            const nombreCompleto = document.getElementById("nombre-envio").value;
            const partesNombre = separarNombre(nombreCompleto);
            
            const transportistaGuardado = localStorage.getItem("nombreTransportista");
            nombreMetodoEnvio = transportistaGuardado || "Envío a domicilio";

            const calleVal = document.getElementById("calle").value;
            const alturaVal = document.getElementById("altura").value || "S/N";
            const pisoVal = document.getElementById("piso").value;
            const dptoVal = document.getElementById("dpto").value;
            
            const pisoDeptoStr = (pisoVal + " " + dptoVal).trim();

            datosForm = {
                nombre: partesNombre.nombre,
                apellido: partesNombre.apellido,
                dni: document.getElementById("dni-envio").value,
                email: document.getElementById("email-envio").value,
                telefono: document.getElementById("telefono-envio").value,
                
                calle: calleVal,
                numero: alturaVal,
                pisoDepto: pisoDeptoStr, 
                ciudad: document.getElementById("localidad").value,
                provincia: document.getElementById("provincia").value,
                cp: document.getElementById("codigo-postal-envio").value
            };
        }

        // Armar el objeto final
        const pedidoData = {
            ...datosForm,
            metodoEnvio: nombreMetodoEnvio,
            costoEnvio: costoEnvio,
            totalProductos: totalProductos,
            totalFinal: totalProductos + costoEnvio,
            items: itemsDto
        };

        // FETCH AL BACKEND
        const url = (typeof API_URL !== 'undefined' ? API_URL : "http://localhost:8080/api") + "/pedidos/crear";
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedidoData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        console.log("Éxito:", await response.text());

        // ÉXITO
        alert("¡Pedido realizado con éxito!");
        localStorage.setItem("carrito", "[]");
        localStorage.removeItem("precioEnvio");
        localStorage.removeItem("metodoEnvio");
        localStorage.removeItem("nombreTransportista");
        localStorage.removeItem("costoEnvioCalculado");
        
        window.location.href = "/"; 

    } catch (error) {
        // ERROR
        console.error("Error:", error);
        alert("Hubo un error al procesar el pedido: " + error.message);
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
}

function separarNombre(nombreCompleto) {
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length === 1) return { nombre: partes[0], apellido: "" };
    
    const apellido = partes.pop(); 
    const nombre = partes.join(" "); 
    return { nombre, apellido };
}