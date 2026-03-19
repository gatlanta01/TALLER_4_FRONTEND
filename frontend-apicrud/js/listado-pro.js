/**
 * listado-pro.js
 * GestiónPro - Sistema de Gestión de Productos Electrónicos
 * Autor: Felipe Andres Cardenas Restrepo
 * Descripcion: Manejo del listado, búsqueda, edición y eliminación de productos
 */

// Variables globales
let tablePro    = document.querySelector("#table-pro > tbody");
let searchInput = document.querySelector("#search-input");
let nameUser    = document.querySelector("#nombre-usuario");
let btnLogout   = document.querySelector("#btnLogout");

// Mostrar nombre del usuario autenticado
let getUser = () => {
    let user = JSON.parse(localStorage.getItem("userLogin"));
    if (user && nameUser) {
        nameUser.textContent = user.rol;
    }
};

// Evento para cerrar sesión
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("userLogin");
        location.href = "login.html";
    });
}

// Evento de búsqueda en tiempo real
searchInput.addEventListener("keyup", () => {
    searchProductTable();
});

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    getTableData();
    getUser();
});

// ── Traer datos de la API y poblar la tabla ──────────────────────────────────
let getTableData = async () => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=productos";
    try {
        let respuesta = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (respuesta.status === 204) {
            console.log("No hay productos registrados en la base de datos.");
            tablePro.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-box-open fa-2x mb-2 d-block"></i>
                        No hay productos registrados. 
                        <a href="crear-pro.html">Agrega el primero</a>.
                    </td>
                </tr>`;
            return;
        }

        let tableData = await respuesta.json();
        localStorage.setItem("datosTabla", JSON.stringify(tableData));
        renderTable(tableData);

    } catch (error) {
        console.error("Error al cargar productos:", error);
        tablePro.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                    Error al conectar con el servidor. Verifica que la API esté activa.
                </td>
            </tr>`;
    }
};

// ── Renderizar datos en la tabla ─────────────────────────────────────────────
let renderTable = (datos) => {
    tablePro.innerHTML = "";
    let user = JSON.parse(localStorage.getItem("userLogin"));
    let esVendedor = user && user.rol === "vendedor";

    datos.forEach((dato, i) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td><span class="badge badge-primary">${i + 1}</span></td>
            <td><strong>${dato.nombre}</strong></td>
            <td class="text-muted">${dato.descripcion}</td>
            <td><span class="text-success font-weight-bold">$${parseInt(dato.precio).toLocaleString('es-CO')}</span></td>
            <td>
                <span class="badge ${parseInt(dato.stock) > 0 ? 'badge-success' : 'badge-danger'}">
                    ${dato.stock} uds.
                </span>
            </td>
            <td>
                <img src="${dato.imagen}" 
                     width="80px" 
                     class="rounded shadow-sm"
                     onerror="this.src='https://via.placeholder.com/80?text=No+img'"
                     alt="${dato.nombre}">
            </td>
            <td>
                <button onclick="editDataTable(${i})" type="button" class="btn btn-warning btn-sm mr-1" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                ${!esVendedor ? `
                <button onclick="deleteDataTable(${i})" type="button" class="btn btn-danger btn-sm" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        `;
        tablePro.appendChild(row);
    });
};

// ── Editar producto ──────────────────────────────────────────────────────────
let editDataTable = (pos) => {
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (!productsSave) return;
    let singleProduct = productsSave[pos];
    localStorage.setItem("productEdit", JSON.stringify(singleProduct));
    localStorage.removeItem("datosTabla");
    location.href = "crear-pro.html";
};

// ── Eliminar producto ────────────────────────────────────────────────────────
let deleteDataTable = (pos) => {
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (!productsSave) return;
    let singleProduct = productsSave[pos];
    let confirmar = confirm(`¿Deseas eliminar "${singleProduct.nombre}"?`);
    if (confirmar) {
        sendDeleteProduct({ id: singleProduct.id });
    }
};

let sendDeleteProduct = async (id) => {
    let url = "http://localhost/Archivos/backend-apiCrud/index.php?url=productos";
    try {
        let respuesta = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(id)
        });
        if (!respuesta.ok) throw new Error("El id enviado no fue admitido");
        let mensaje = await respuesta.json();
        alert(mensaje.message);
        location.reload();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
};

// ── Limpiar tabla ────────────────────────────────────────────────────────────
let clearDataTable = () => {
    document.querySelectorAll("#table-pro > tbody > tr").forEach(row => row.remove());
};

// ── Buscar producto en la tabla ──────────────────────────────────────────────
let searchProductTable = () => {
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (!productsSave) return;

    let textSearch = searchInput.value.toLowerCase();
    clearDataTable();

    let user = JSON.parse(localStorage.getItem("userLogin"));
    let esVendedor = user && user.rol === "vendedor";
    let i = 0;

    for (let pro of productsSave) {
        if (pro.nombre.toLowerCase().indexOf(textSearch) !== -1) {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="badge badge-primary">${i + 1}</span></td>
                <td><strong>${pro.nombre}</strong></td>
                <td class="text-muted">${pro.descripcion}</td>
                <td><span class="text-success font-weight-bold">$${parseInt(pro.precio).toLocaleString('es-CO')}</span></td>
                <td>
                    <span class="badge ${parseInt(pro.stock) > 0 ? 'badge-success' : 'badge-danger'}">
                        ${pro.stock} uds.
                    </span>
                </td>
                <td>
                    <img src="${pro.imagen}" 
                         width="80px" 
                         class="rounded shadow-sm"
                         onerror="this.src='https://via.placeholder.com/80?text=No+img'"
                         alt="${pro.nombre}">
                </td>
                <td>
                    <button onclick="editDataTable(${i})" type="button" class="btn btn-warning btn-sm mr-1" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!esVendedor ? `
                    <button onclick="deleteDataTable(${i})" type="button" class="btn btn-danger btn-sm" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </td>
            `;
            tablePro.appendChild(row);
            i++;
        }
    }
};
