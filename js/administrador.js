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
function trabajador() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="roles()">Roles</button>
        <button class="shiny" onclick="nuevoTra()">Nuevo Trabajador</button>
        <button class="back" onclick="back()">Atrás</button>
    `;
    fetch("php/getMaestros.php", {
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

}

function nuevoTra() {
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
    fetch("php/getRoles.php")
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

    fetch("php/nuevoMaestro.php", {
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