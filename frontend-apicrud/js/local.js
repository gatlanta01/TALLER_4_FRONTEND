/**
 * local.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Lógica compartida de autenticación para páginas del panel admin
 */

const d = document;
let nameUser = d.querySelector("#nombre-usuario");
let btnLogout = d.querySelector("#btnLogout");

d.addEventListener("DOMContentLoaded", () => {
    getUser();
});

// Mostrar el nombre/rol del usuario autenticado en el topbar
let getUser = () => {
    let user = JSON.parse(localStorage.getItem("userLogin"));
    if (user && nameUser) {
        nameUser.textContent = user.rol;
    } else if (nameUser) {
        // Si no hay sesión, mostrar nombre genérico (no bloquear en modo demo)
        nameUser.textContent = "Invitado";
    }
};

// Evento para el botón de cerrar sesión
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("userLogin");
        location.href = "login.html";
    });
}
