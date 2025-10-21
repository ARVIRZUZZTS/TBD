const params = new URLSearchParams(window.location.search);
let usuario = params.get("usuario");
let botonesOriginal = "";
let contenidoOriginal = "";

document.addEventListener("DOMContentLoaded", function(){
    const botones = document.getElementById("botones");
    const dinamic = document.getElementById("dinamic");
    botonesOriginal = botones.innerHTML;
    contenidoOriginal = dinamic.innerHTML;
    setUs();
});
function setUs() {
    const usInp = document.getElementById("user");
    usInp.textContent = usuario;
    const dina = document.getElementById("dinamic");
    dina.style.justifyContent = "center";
}
function trabajador() { // agregar un boton trabajador que nos redireccione a este estado
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="roles()">Roles</button>
        <button class="shiny" onclick="nuevoTra()">Nuevo Trabajador</button>
        <button class="back" onclick="back()">Atrás</button>
    `;
    fetch("php/maestrosGet.php", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        const dinamic = document.getElementById("dinamic");
        dinamic.style.justifyContent = "flex-start";
        dinamic.innerHTML = "";
        const titleM = document.createElement("div");
        titleM.id = "titleM";
        titleM.innerHTML = `
            <h4>Nombre</h4>
            <h4>Apellido</h4>
            <h4>CI</h4>
            <h4>Teléfono</h4>
            <h4>Correo</h4>
            <h4>Edad</h4>
        `;
        dinamic.appendChild(titleM);
        const contenido = document.createElement("div");
        contenido.id = "contenido";
        dinamic.appendChild(contenido);
        if (data.exito) {
            data.maestros.forEach(m => {
                const fila = document.createElement("div");
                fila.classList.add("maestro");

                fila.innerHTML = `
                    <h5>${m.nombre}</h5>
                    <h5>${m.apellido}</h5>
                    <h5>${m.ci}</h5>
                    <h5>${m.telefono}</h5>
                    <h5>${m.correo}</h5>
                    <h5>${m.edad}</h5>
                `;
                contenido.appendChild(fila);
            });
        } else {
            contenido.innerHTML = `<h4>${data.mensaje}</h4>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener maestros:", err);
    });
}
function back() {
    const botones = document.getElementById("botones");
    const dinamic = document.getElementById("dinamic");

    botones.innerHTML = botonesOriginal;
    dinamic.innerHTML = contenidoOriginal;
    dinamic.style.justifyContent = "center";
}
function roles() {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Roles activos</h3>
        </div>
        <div id="rolesBoxi">
            <div id="listRoles"></div>
            <div id="newRole">
                <h3>Nuevo Rol</h3>
                <input type="text" id="rolNuevo" placeholder="Ingrese un Nuevo ROL" autocomplete="off">
                <button class="shiny" onclick="nuevoRol()">Guardar</button>
            </div>
        </div>
    `;

    fetch("php/rolGetAll.php")
        .then(res => res.json())
        .then(data => {
            const rolesList = document.getElementById("listRoles");
            rolesList.innerHTML = "";
            if (data.exito) {
                data.roles.forEach(r => {
                    const divRol = document.createElement("div");
                    divRol.classList.add("rolItem");
                    divRol.setAttribute("id", `rol-${r.id_rol}`); //img en editar y eliminar
                    divRol.innerHTML = `
                        <h4>${r.nombre_rol}</h4>
                        <button onclick="editarRol(${r.id_rol}, '${r.nombre_rol}')">
                            <img src="img/editar.png" alt="Editar" width="20">
                        </button>
                        <button onclick="eliminarRol(${r.id_rol}, '${r.nombre_rol}')">
                            <img src="img/eliminar.png" alt="Eliminar" width="20">
                        </button>
                    `;
                    rolesList.appendChild(divRol);
                });
            } else {
                rolesList.innerHTML = `<p>${data.mensaje}</p>`;
            }
        })
        .catch(err => console.error("Error al obtener roles:", err));
}

function nuevoRol() {
    const nombre = document.getElementById("rolNuevo").value.trim();
    if (nombre === "") {
        alert("Por favor, ingrese un nombre para el nuevo rol");
        return;
    }

    fetch("php/rolNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreRol: nombre })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            document.getElementById("rolNuevo").value = "";
            roles();
        } else {
            alert(data.mensaje);
        }
    })
    .catch(err => console.error("Error al guardar rol:", err));
}


// img guardar y cancelar
function editarRol(idRol, nombreActual) {
    const divRol = document.getElementById(`rol-${idRol}`);
    if (!divRol) return;

    divRol.innerHTML = `
        <div>
            <input type="text" id="input-${idRol}" placeholder="${nombreActual}" value="${nombreActual}" maxlenght="10" autocomplete="off">
            <button onclick="guardarEdicion(${idRol})">Guardar</button>
            <button onclick="roles()">Cancelar</button>
        </div>
    `;
}

function guardarEdicion(idRol) {
    const input = document.getElementById(`input-${idRol}`);
    const nombreNuevo = input.value.trim();

    if (nombreNuevo === "") {
        alert("El nombre no puede estar vacío");
        return;
    }

    fetch("php/rolEditar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRol, nombreNuevo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) roles();
    })
    .catch(err => console.error("Error al editar rol:", err));
}

function eliminarRol(idRol, nombreRol) {
    if (!confirm(`¿Está seguro que quiere eliminar el rol "${nombreRol}"?`)) return;

    fetch("php/rolEliminar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRol })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) roles();
    })
    .catch(err => console.error("Error al eliminar rol:", err));
}



function nuevoTra() { // maxlength segun el sql
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Registro de Nuevo Maestro</h3>
        </div>
        <div id="contenido">
            <input type="text" id="nombre" placeholder="Nombre" autocomplete="off">
            <input type="text" id="apellido" placeholder="Apellido" autocomplete="off">
            <input type="text" id="username" placeholder="Nombre de usuario" autocomplete="off">
            <input type="password" id="contrasenna" placeholder="Contraseña" autocomplete="off">
            <input type="text" id="ci" placeholder="Cédula de Identidad" autocomplete="off">
            <input type="text" id="telefono" placeholder="Teléfono" autocomplete="off">
            <input type="email" id="correo" placeholder="Correo" autocomplete="off">
            <input type="number" id="edad" placeholder="Edad" autocomplete="off">
            <input type="text" id="titulo" placeholder="Título profesional" autocomplete="off">
            <input type="number" id="sueldo" placeholder="Sueldo Porcentual" autocomplete="off">
            <input list="roles" id="rolInput" placeholder="Rol" autocomplete="off">
            <datalist id="roles"></datalist>
            <div class="botones">
                <button class="shiny" onclick="nuevoMaestro()">Guardar</button>
                <button class="back" onclick="trabajador()">Cancelar</button>
            </div>
        </div>
    `;
    fetch("php/rolGetFil.php")
        .then(res => res.json())
        .then(data => {
            const rolesList = document.getElementById("roles");
            if (data.exito) {
                data.roles.forEach(r => {
                    const option = document.createElement("option");
                    option.value = r.nombre_rol;
                    rolesList.appendChild(option);
                });
            } else {
                console.error(data.mensaje);
            }
        })
    .catch(err => console.error("Error al obtener roles:", err));
}
function nuevoMaestro() {
    const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        username: document.getElementById("username").value.trim(),
        contrasenna: document.getElementById("contrasenna").value.trim(),
        ci: document.getElementById("ci").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        edad: document.getElementById("edad").value.trim(),
        titulo: document.getElementById("titulo").value.trim(),
        sueldo: document.getElementById("sueldo").value.trim(),
        rol: document.getElementById("rolInput").value.trim()
    };
    for (let k in datos) {
        if (datos[k] === "") {
            alert("Todos los campos son obligatorios.");
            return;
        }
    }

    fetch("php/maestroNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        if (data.exito) {
            trabajador();
        }
    })
    .catch(err => console.error("Error al guardar maestro:", err));
}


function estudiante() {

}

function curso() {

}
function cerrarSesion() {
    window.location = "inicio.html";
}