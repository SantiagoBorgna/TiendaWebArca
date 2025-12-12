window.addEventListener("DOMContentLoaded", () => {
  const metodo = localStorage.getItem("metodoEnvio");

  const formRetiro = document.getElementById("form-retiro");
  const formEnvio = document.getElementById("form-envio");

  const titulo = document.getElementById("title");

  if (metodo === "retiro-local") {
    formRetiro.style.display = "block";
    titulo.textContent = "Por favor completá con tus datos para el retiro";
  } else {
    titulo.textContent = "Por favor completá con tus datos para que podamos realizar el envío";
    formEnvio.style.display = "block";
  }

  document.getElementById("btn-pagar").addEventListener("click", (e) => {
    e.preventDefault();

    if (metodo === "retiro-local") {
      if (validarRetiro()) {
        window.location.href = "checkout.html"; // o tu URL de pago
      }
    } else {
      if (validarEnvio()) {
        window.location.href = "checkout.html"; // o tu URL de pago
      }
    }
  });
});

// Función para validar email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Función para validar teléfono (solo números)
function validarTelefono(telefono) {
  return /^[0-9]+$/.test(telefono);
}

// Función genérica para mostrar u ocultar errores
function mostrarError(inputId, mensaje) {
  const errorDiv = document.getElementById('error-' + inputId);
  errorDiv.textContent = mensaje;
}

// === Validación para Email ===
document.getElementById('email-retiro').addEventListener('blur', function () {
  const valor = this.value.trim();
  if (!validarEmail(valor)) {
    mostrarError('email-retiro', 'Por favor, ingresá un email válido.');
  } else {
    mostrarError('email-retiro', '');
  }
});

document.getElementById('email-envio').addEventListener('blur', function () {
  const valor = this.value.trim();
  if (!validarEmail(valor)) {
    mostrarError('email-envio', 'Por favor, ingresá un email válido.');
  } else {
    mostrarError('email-envio', '');
  }
});

// === Validación para Teléfono ===
document.getElementById('telefono-retiro').addEventListener('blur', function () {
  const valor = this.value.trim();
  if (!validarTelefono(valor)) {
    mostrarError('telefono-retiro', 'Ingresa un número válido.');
  } else {
    mostrarError('telefono-retiro', '');
  }
});

document.getElementById('telefono-envio').addEventListener('blur', function () {
  const valor = this.value.trim();
  if (!validarTelefono(valor)) {
    mostrarError('telefono-envio', 'Ingresa un número válido.');
  } else {
    mostrarError('telefono-envio', '');
  }
});

// Funciones de validación
function validarRetiro() {
  let valido = true;

  valido &= validarCampo("nombre-retiro", "error-nombre-retiro", "Ingresá tu nombre y apellido");
  valido &= validarCampo("dni-retiro", "error-dni-retiro", "Ingresá un DNI válido", /^\d{7,8}$/);
  valido &= validarCampo("email-retiro", "error-email-retiro", "Ingresá un email válido", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  valido &= validarCampo("telefono-retiro", "error-telefono-retiro", "Ingresá un teléfono válido", /^\d{6,15}$/);

  return !!valido;
}

function validarEnvio() {
  let valido = true;

  valido &= validarCampo("nombre-envio", "error-nombre-envio", "Ingresá tu nombre y apellido");
  valido &= validarCampo("email-envio", "error-email-envio", "Ingresá un email válido", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  valido &= validarCampo("telefono-envio", "error-telefono-envio", "Ingresá un teléfono válido", /^\d{6,15}$/);
  valido &= validarCampo("calle", "error-calle", "Ingresá el nombre de la calle");
  valido &= validarCampo("entreCalles", "error-entreCalles", "Ingresá las calles entre las que estás");
  valido &= validarCampo("localidad", "error-localidad", "Ingresá tu localidad");
  valido &= validarCampo("provincia", "error-provincia", "Seleccioná una provincia");
  valido &= validarCampo("codigo-postal-envio", "error-cp", "Ingresá un código postal válido", /^\d{4}$/);

  return !!valido;
}

function validarCampo(idCampo, idError, mensaje, regex = /.+/) {
  const campo = document.getElementById(idCampo);
  const error = document.getElementById(idError);

  if (!campo || !regex.test(campo.value.trim())) {
    error.textContent = mensaje;
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

// Guardar datos del formulario
document.getElementById("btn-pagar").addEventListener("click", function () {
    let datos = {};

    const metodoEnvio = localStorage.getItem("metodoEnvio"); // 

    if (metodoEnvio === "retiro") {
        datos = {
            tipo: "Retiro en local",
            nombre: document.getElementById("nombre-retiro").value,
            dni: document.getElementById("dni-retiro").value,
            email: document.getElementById("email-retiro").value,
            telefono: document.getElementById("telefono-retiro").value
        };
    } else if (metodoEnvio === "envio") {
        datos = {
            tipo: "Envío a domicilio",
            nombre: document.getElementById("nombre-envio").value,
            email: document.getElementById("email-envio").value,
            telefono: document.getElementById("telefono-envio").value,
            direccion: {
                calle: document.getElementById("calle").value,
                altura: document.getElementById("altura").value,
                piso: document.getElementById("piso").value,
                dpto: document.getElementById("dpto").value,
                entreCalles: document.getElementById("entreCalles").value,
                localidad: document.getElementById("localidad").value,
                provincia: document.getElementById("provincia").value,
                codigoPostal: document.getElementById("codigo-postal-envio").value
            }
        };
    }

    localStorage.setItem("datosCliente", JSON.stringify(datos));
    
    // Luego redirige a la página de pago o confirma con MercadoPago
    //window.location.href = "mercado_pago.html"; // o como se llame tu página de confirmación
});
