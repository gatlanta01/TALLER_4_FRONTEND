/**
 * login.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Manejo del formulario de inicio de sesión
 *
 * Credenciales de prueba (modo local):
 *   admin    / admin123    → rol: administrador
 *   vendedor / vendedor123 → rol: vendedor
 */

const d = document;

let userInput = d.querySelector("#usuarioForm");
let passInput  = d.querySelector("#contraForm");
let btnLogin   = d.querySelector(".btnLogin");

// Usuarios demo para cuando no hay backend disponible
const usuariosDemo = [
    { usuario: "admin",    contrasena: "admin123",    rol: "administrador", id: 1 },
    { usuario: "vendedor", contrasena: "vendedor123", rol: "vendedor",       id: 2 },
    { usuario: "felipe",   contrasena: "felipe123",   rol: "administrador", id: 3 }
];

// Evento al botón de login
btnLogin.addEventListener("click", () => {
    let dataForm = getData();
    if (dataForm) {
        sendData(dataForm);
    }
});

// Permitir Enter en los campos
[userInput, passInput].forEach(input => {
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnLogin.click();
    });
});

// Validar y obtener datos del formulario
let getData = () => {
    let user;
    if (userInput.value && passInput.value) {
        user = {
            usuario: userInput.value.trim(),
            contrasena: passInput.value
        };
    } else {
        alert("El usuario y la contraseña son obligatorios.");
    }
    return user;
};

// Autenticación local (sin backend)
// Revisa usuarios demo + usuarios registrados desde register.html
let loginLocal = (data) => {
    // 1. Buscar en usuarios demo predefinidos
    let encontrado = usuariosDemo.find(
        u => u.usuario === data.usuario && u.contrasena === data.contrasena
    );

    // 2. Si no está en demo, buscar en usuarios registrados (localStorage)
    if (!encontrado) {
        const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
        encontrado = usuariosRegistrados.find(
            u => u.usuario === data.usuario && u.contrasena === data.contrasena
        );
    }

    if (encontrado) {
        let userLogin = {
            id:      encontrado.id,
            usuario: encontrado.usuario,
            rol:     encontrado.rol,
            nombre:  encontrado.nombre || encontrado.usuario
        };
        localStorage.setItem("userLogin", JSON.stringify(userLogin));
        alert(`¡Bienvenido, ${userLogin.nombre || userLogin.rol}!`);
        location.href = "index.html";
    } else {
        alert("Usuario o contraseña incorrectos.\n\nCredenciales de prueba:\n• admin / admin123\n• vendedor / vendedor123\n\nO usa las credenciales con las que te registraste.");
    }
    userInput.value = "";
    passInput.value  = "";
};

// Enviar datos a la API de autenticación (con fallback local)
let sendData = async (data) => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=login";
    try {
        let controller = new AbortController();
        let timeoutId  = setTimeout(() => controller.abort(), 3000); // timeout 3s

        let respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        let userLogin = await respuesta.json();
        alert(`¡Bienvenido, ${userLogin.rol}!`);
        localStorage.setItem("userLogin", JSON.stringify(userLogin));
        location.href = "index.html";

    } catch (error) {
        // Si el backend no está disponible, usar autenticación local
        console.warn("Backend no disponible, usando modo local:", error.message);
        loginLocal(data);
    }
};
