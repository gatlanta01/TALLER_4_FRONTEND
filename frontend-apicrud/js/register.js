/**
 * register.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Registro de nuevos usuarios guardados en localStorage
 *              con intento previo de registro en la API backend.
 */

const d = document;

const nombreInput    = d.querySelector("#primerNombre");
const apellidoInput  = d.querySelector("#primerApellido");
const usuarioInput   = d.querySelector("#usuarioReg");
const correoInput    = d.querySelector("#correoElectronico");
const passInput      = d.querySelector("#contrasena");
const passInput2     = d.querySelector("#repetirContrasena");
const rolInput       = d.querySelector("#rolUsuario");
const btnRegistrar   = d.querySelector("#btnRegistrar");
const alerta         = d.querySelector("#alerta-registro");

// Mostrar mensaje en la alerta visible
const mostrarAlerta = (mensaje, tipo = "danger") => {
    alerta.className = `alert alert-${tipo}`;
    alerta.innerHTML = mensaje;
    alerta.classList.remove("d-none");
};

// Obtener la lista de usuarios registrados en localStorage
const getUsuariosRegistrados = () => {
    return JSON.parse(localStorage.getItem("usuariosRegistrados") || "[]");
};

// Guardar un nuevo usuario en localStorage
const guardarUsuarioLocal = (usuario) => {
    const usuarios = getUsuariosRegistrados();
    usuarios.push(usuario);
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));
};

// Intentar registrar en el backend y si falla, guardar local
const registrarUsuario = async (datos) => {
    const url = "http://localhost/Archivos/backend-apiCrud/index.php?url=registro";
    try {
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 3000);

        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!respuesta.ok) throw new Error("Error del servidor");
        const msg = await respuesta.json();
        mostrarAlerta(`<i class="fas fa-check-circle mr-2"></i>${msg.message}`, "success");

    } catch (err) {
        // Guardar en localStorage como modo local
        console.warn("Backend no disponible, registro local:", err.message);
        guardarUsuarioLocal({
            id:         Date.now(),
            usuario:    datos.usuario,
            contrasena: datos.contrasena,
            nombre:     datos.nombre,
            correo:     datos.correo,
            rol:        datos.rol
        });
        mostrarAlerta(
            `<i class="fas fa-check-circle mr-2"></i>
             ¡Usuario <strong>${datos.usuario}</strong> registrado correctamente (modo local).<br>
             <a href="login.html" class="alert-link">Haz clic aquí para iniciar sesión</a>.`,
            "success"
        );
    }
};

// Evento del botón Registrar
btnRegistrar.addEventListener("click", () => {
    // Validar campos vacíos
    if (!nombreInput.value || !apellidoInput.value || !usuarioInput.value ||
        !correoInput.value || !passInput.value || !passInput2.value) {
        mostrarAlerta("<i class='fas fa-exclamation-triangle mr-2'></i>Todos los campos son obligatorios.");
        return;
    }

    // Validar que las contraseñas coincidan
    if (passInput.value !== passInput2.value) {
        mostrarAlerta("<i class='fas fa-exclamation-triangle mr-2'></i>Las contraseñas no coinciden.");
        return;
    }

    // Validar longitud mínima de contraseña
    if (passInput.value.length < 4) {
        mostrarAlerta("<i class='fas fa-exclamation-triangle mr-2'></i>La contraseña debe tener al menos 4 caracteres.");
        return;
    }

    // Verificar que el usuario no exista ya (local)
    const usuariosExistentes = getUsuariosRegistrados();
    const yaExiste = usuariosExistentes.some(u => u.usuario === usuarioInput.value.trim());
    if (yaExiste) {
        mostrarAlerta(`<i class='fas fa-exclamation-triangle mr-2'></i>El usuario <strong>${usuarioInput.value}</strong> ya está registrado.`);
        return;
    }

    const datos = {
        nombre:     nombreInput.value.trim() + " " + apellidoInput.value.trim(),
        usuario:    usuarioInput.value.trim(),
        correo:     correoInput.value.trim(),
        contrasena: passInput.value,
        rol:        rolInput.value
    };

    // Limpiar campos
    nombreInput.value   = "";
    apellidoInput.value = "";
    usuarioInput.value  = "";
    correoInput.value   = "";
    passInput.value     = "";
    passInput2.value    = "";

    registrarUsuario(datos);
});

// Permitir Enter para registrar
[nombreInput, apellidoInput, usuarioInput, correoInput, passInput, passInput2].forEach(inp => {
    inp.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnRegistrar.click();
    });
});
