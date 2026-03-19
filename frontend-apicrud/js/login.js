/**
 * login.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Manejo del formulario de inicio de sesión
 */

const d = document;

let userInput = d.querySelector("#usuarioForm");
let passInput  = d.querySelector("#contraForm");
let btnLogin   = d.querySelector(".btnLogin");

// Evento al botón de login
btnLogin.addEventListener("click", () => {
    let dataForm = getData();
    if (dataForm) {
        sendData(dataForm);
    }
});

// Validar y obtener datos del formulario
let getData = () => {
    let user;
    if (userInput.value && passInput.value) {
        user = {
            usuario: userInput.value,
            contrasena: passInput.value
        };
        userInput.value = "";
        passInput.value  = "";
    } else {
        alert("El usuario y la contraseña son obligatorios.");
    }
    return user;
};

// Enviar datos a la API de autenticación
let sendData = async (data) => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=login";
    try {
        let respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!respuesta.ok) throw new Error("No se pudo enviar los datos");

        let userLogin = await respuesta.json();
        alert(`¡Bienvenido, ${userLogin.rol}!`);
        // Guardar datos del usuario en localStorage
        localStorage.setItem("userLogin", JSON.stringify(userLogin));
        location.href = "../frontend-apicrud/index.html";

    } catch (error) {
        console.error("Error en login:", error);
        alert("Error al conectar con el servidor. Verifica que la API esté activa.");
    }
};
