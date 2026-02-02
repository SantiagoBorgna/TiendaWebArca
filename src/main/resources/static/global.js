const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = IS_LOCAL 
    ? 'http://localhost:8080/api' 
    : '/api';

console.log("Sistema conectado a:", API_URL);

// Bloquear click derecho solo en imágenes
document.addEventListener("contextmenu", function (e) {
    if (e.target.tagName === "IMG") {
        e.preventDefault(); 
    }
}, false);

// Evitar que arrastren la imagen para guardarla
document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

// Cambiar la URL visualmente
function actualizarURL(ruta) {
    const nuevaURL = window.location.protocol + "//" + window.location.host + "/" + ruta.toLowerCase().replace(/\s/g, '-');
    window.history.pushState({path: nuevaURL}, '', nuevaURL);
}