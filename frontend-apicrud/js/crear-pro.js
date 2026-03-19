/**
 * crear-pro.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Lógica para crear y actualizar productos electrónicos
 */

const d = document;
let nameInput      = d.querySelector("#productos-select");
let priceInput     = d.querySelector("#precio-pro");
let stockInput     = d.querySelector("#stock-pro");
let descripcionInput = d.querySelector("#des-pro");
let imagen         = d.querySelector("#imagen-pro");
let btnCreate      = d.querySelector(".btn-create");

// Verificar si hay un producto pendiente de edición
let productUpdate = JSON.parse(localStorage.getItem("productEdit"));
if (productUpdate) {
    updateDataProduct();
}

// ── Evento botón Crear ────────────────────────────────────────────────────────
btnCreate.addEventListener("click", () => {
    let dataProduct = getDataProducto();
    if (dataProduct) {
        sendDataProduct(dataProduct);
    }
});

// ── Validar formulario y obtener datos ───────────────────────────────────────
let getDataProducto = () => {
    if (!nameInput.value || !priceInput.value || !stockInput.value || !descripcionInput.value) {
        alert("Todos los campos son obligatorios.");
        return null;
    }

    let product = {
        nombre:      nameInput.value,
        descripcion: descripcionInput.value,
        precio:      priceInput.value,
        stock:       stockInput.value,
        imagen:      imagen.src
    };

    // Limpiar formulario
    nameInput.value       = "";
    priceInput.value      = "";
    descripcionInput.value = "";
    stockInput.value      = "";
    imagen.src = "https://via.placeholder.com/400x300?text=Selecciona+un+producto";

    return product;
};

// ── Enviar datos a la API (POST) ─────────────────────────────────────────────
let sendDataProduct = async (data) => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=productos";
    try {
        let respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!respuesta.ok) throw new Error("Error al guardar el producto");
        let mensaje = await respuesta.json();
        alert(mensaje.message);
        location.href = "../frontend-apicrud/listado-pro.html";
    } catch (error) {
        console.error("Error al crear producto:", error);
        alert("Error al conectar con el servidor. Verifica que la API esté activa.");
    }
};

// ── Cargar datos del producto a editar en el formulario ───────────────────────
let updateDataProduct = () => {
    nameInput.value       = productUpdate.nombre;
    priceInput.value      = productUpdate.precio;
    stockInput.value      = productUpdate.stock;
    descripcionInput.value = productUpdate.descripcion;
    imagen.src            = productUpdate.imagen;

    let btnEdit = d.querySelector('.btn-update');
    btnCreate.classList.add('d-none');
    btnEdit.classList.remove('d-none');

    btnEdit.addEventListener('click', () => {
        let product = {
            id:          productUpdate.id,
            nombre:      nameInput.value,
            descripcion: descripcionInput.value,
            precio:      priceInput.value,
            stock:       stockInput.value,
            imagen:      imagen.src
        };
        localStorage.removeItem("productEdit");
        sendUpdateProduct(product);
    });
};

// ── Enviar datos actualizados a la API (PUT) ─────────────────────────────────
let sendUpdateProduct = async (pro) => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=productos";
    try {
        let respuesta = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pro)
        });
        if (respuesta.status === 406) {
            alert("Los datos enviados no son admitidos.");
        } else {
            let mensaje = await respuesta.json();
            alert(mensaje.message);
            location.href = "../frontend-apicrud/listado-pro.html";
        }
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        alert("Error al conectar con el servidor. Verifica que la API esté activa.");
    }
};
