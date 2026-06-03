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

    // Inicializar lógica de medios de pago
    inicializarMediosDePago();
});

let interesAplicado = 0;
let descuentoAplicado = 0;
let cuotasSeleccionadas = 1;
let medioPagoSeleccionado = "fiserv";

function inicializarMediosDePago() {
    const radiosPago = document.querySelectorAll('input[name="metodo_pago"]');
    const panelTarjeta = document.getElementById("panel-tarjeta");
    const panelTransf = document.getElementById("panel-transferencia");
    const selectCuotas = document.getElementById("selector-cuotas");

    radiosPago.forEach(radio => {
        radio.addEventListener("change", (e) => {
            medioPagoSeleccionado = e.target.value;
            if (medioPagoSeleccionado === "fiserv") {
                panelTarjeta.style.display = "block";
                panelTransf.style.display = "none";
            } else {
                panelTarjeta.style.display = "none";
                panelTransf.style.display = "block";
            }
            actualizarPrecioPantalla();
        });
    });

    if(selectCuotas) {
        selectCuotas.addEventListener("change", (e) => {
            cuotasSeleccionadas = parseInt(e.target.value);
            actualizarPrecioPantalla();
        });
    }

    actualizarPrecioPantalla();
}

function actualizarPrecioPantalla() {
    try {
        let totalBase = 0;
        const carritoStr = localStorage.getItem("carrito");
        if (carritoStr) {
            const arr = JSON.parse(carritoStr);
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    const cant = parseInt(item.cantidad) || 0;
                    const precio = parseFloat(item.precioVenta) || parseFloat(item.precio) || 0;
                    totalBase += precio * cant;
                });
            }
        }

        const envioStr = localStorage.getItem("precioEnvio");
        const costoEnvio = envioStr ? parseFloat(envioStr) || 0 : 0;
        
        let total = totalBase;
        interesAplicado = 0;
        descuentoAplicado = 0;

        const selectCuotas = document.getElementById("selector-cuotas");
        const panelCuotas = document.getElementById("panel-tarjeta");

        if (medioPagoSeleccionado === "transferencia") {
            descuentoAplicado = totalBase * 0.20;
            total = (totalBase - descuentoAplicado) + costoEnvio;
            
            // Ocultar selector si es transferencia (por bug visual que detectó el usuario)
            if (panelCuotas) panelCuotas.style.display = "none";
        } else {
            // Asegurar que el selector esté visible
            if (panelCuotas) panelCuotas.style.display = "block";
            
            if (cuotasSeleccionadas === 3) {
                interesAplicado = totalBase * 0.15;
            } else if (cuotasSeleccionadas === 6) {
                interesAplicado = totalBase * 0.30;
            }
            total = (totalBase + interesAplicado) + costoEnvio;
        }

        const divTotal = document.getElementById("total-final-pantalla");
        if(divTotal) {
            divTotal.textContent = "$ " + total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    } catch (e) {
        console.error("Error calculando total:", e);
    }
}

/* Validación */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
const REGEX_DNI = /^\d{7,8}$/;
const REGEX_TEL = /^\d{10,13}$/; 
const REGEX_TEXTO = /.+/; 
const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;

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
    v &= validarCampo("nombre-retiro", "error-nombre-retiro", REGEX_NOMBRE, "Mínimo 2 letras, sin números.");
    v &= validarCampo("dni-retiro", "error-dni-retiro", REGEX_DNI, "Debe tener entre 7 y 8 números.");
    v &= validarCampo("email-retiro", "error-email-retiro", REGEX_EMAIL, "Ingresá un email válido.");
    v &= validarCampo("telefono-retiro", "error-telefono-retiro", REGEX_TEL, "Debe tener entre 10 y 13 números.");
    return !!v;
}

function validarFormularioEnvio() {
    let v = true;
    v &= validarCampo("nombre-envio", "error-nombre-envio", REGEX_NOMBRE, "Mínimo 2 letras, sin números.");
    v &= validarCampo("dni-envio", "error-dni-envio", REGEX_DNI, "Debe tener entre 7 y 8 números.");
    v &= validarCampo("email-envio", "error-email-envio", REGEX_EMAIL, "Ingresá un email válido.");
    v &= validarCampo("telefono-envio", "error-telefono-envio", REGEX_TEL, "Debe tener entre 10 y 13 números.");
    
    v &= validarCampo("calle", "error-calle", REGEX_TEXTO, "Falta la calle.");
    v &= validarCampo("localidad", "error-localidad", REGEX_TEXTO, "Falta la localidad.");
    v &= validarCampo("provincia", "error-provincia", REGEX_TEXTO, "Seleccioná una provincia.");
    v &= validarCampo("codigo-postal-envio", "error-cp", /^\d{4,5}$/, "CP inválido.");
    
    return !!v;
}

function activarValidacionesEnTiempoReal(tipo) {
    if (tipo === "retiro") {
        document.getElementById("nombre-retiro")?.addEventListener("blur", () => validarCampo("nombre-retiro", "error-nombre-retiro", REGEX_NOMBRE, "Mínimo 2 letras, sin números."));
        document.getElementById("dni-retiro")?.addEventListener("blur", () => validarCampo("dni-retiro", "error-dni-retiro", REGEX_DNI, "Debe tener 7 u 8 números."));
        document.getElementById("email-retiro")?.addEventListener("blur", () => validarCampo("email-retiro", "error-email-retiro", REGEX_EMAIL, "Email inválido."));
        document.getElementById("telefono-retiro")?.addEventListener("blur", () => validarCampo("telefono-retiro", "error-telefono-retiro", REGEX_TEL, "Entre 10 y 13 números."));
    } else {
        document.getElementById("nombre-envio")?.addEventListener("blur", () => validarCampo("nombre-envio", "error-nombre-envio", REGEX_NOMBRE, "Mínimo 2 letras, sin números."));
        document.getElementById("dni-envio")?.addEventListener("blur", () => validarCampo("dni-envio", "error-dni-envio", REGEX_DNI, "Debe tener 7 u 8 números."));
        document.getElementById("email-envio")?.addEventListener("blur", () => validarCampo("email-envio", "error-email-envio", REGEX_EMAIL, "Email inválido."));
        document.getElementById("telefono-envio")?.addEventListener("blur", () => validarCampo("telefono-envio", "error-telefono-envio", REGEX_TEL, "Entre 10 y 13 números."));
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
        //let totalRecalculado = totalProductos + costoEnvio;
        let totalRecalculado = totalProductos;
        if (medioPagoSeleccionado === "transferencia") {
            totalRecalculado = (totalRecalculado - descuentoAplicado) + costoEnvio;
        } else {
            totalRecalculado = (totalRecalculado + interesAplicado) + costoEnvio;
        }

        const pedidoData = {
            ...datosForm,
            metodoEnvio: nombreMetodoEnvio,
            costoEnvio: costoEnvio,
            totalProductos: totalProductos,
            totalFinal: totalRecalculado,
            medioPago: medioPagoSeleccionado,
            numberOfInstallments: cuotasSeleccionadas,
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

        const data = await response.json(); 

        // Guardamos información para la vista de éxito
        localStorage.setItem("ultimoPedidoId", data.idPedido);
        localStorage.setItem("ultimoPedidoTotal", data.chargetotal);
        localStorage.setItem("ultimoPedidoItems", JSON.stringify(itemsDto));

        if (medioPagoSeleccionado === "transferencia") {
            window.location.href = "/transferencia";
            return;
        }

        // CREAMOS EL FORMULARIO OCULTO PARA FISERV
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.urlFiserv;

        // Estos son los campos obligatorios que Fiserv necesita para identificar la compra
        const params = {
            storename: data.storename,
            timezone: data.timezone,
            chargetotal: data.chargetotal,
            currency: data.currency,
            txntype: data.txntype,
            txndatetime: data.txndatetime,
            hash_algorithm: data.hash_algorithm,
            hashExtended: data.hashExtended,
            checkoutoption: data.checkoutoption,
            responseSuccessURL: data.responseSuccessURL,
            responseFailURL: data.responseFailURL,
            authenticateTransaction: data.authenticateTransaction,
            threeDSRequestorChallengeIndicator: data.threeDSRequestorChallengeIndicator,
            transactionNotificationURL: data.transactionNotificationURL,
            numberOfInstallments: data.numberOfInstallments
        };

        console.log("Creando formulario con estos datos:", params);

        for (const key in params) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit(); 

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