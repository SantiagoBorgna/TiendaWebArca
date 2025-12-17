// Detecta si estamos en tu compu (Localhost) o en internet (Render)
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Define la URL del backend automáticamente
const API_URL = IS_LOCAL 
    ? 'http://localhost:8080/api' 
    : 'https://backend-tienda-9gtc.onrender.com/api';

console.log("🌍 Sistema conectado a:", API_URL);

// Bloquear click derecho solo en imágenes
document.addEventListener("contextmenu", function (e) {
    if (e.target.tagName === "IMG") {
        e.preventDefault(); // Esto frena el menú
    }
}, false);

// Evitar que arrastren la imagen para guardarla
document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});