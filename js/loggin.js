const params = new URLSearchParams(window.location.search);
let est = params.get("est");

document.addEventListener("DOMContentLoaded", function() {
    setTipo();
});

function setTipo() {
    const ini = document.getElementById("ini");
    const reg = document.getElementById("reg");
    const bots = document.getElementById("bots");

    if (est == "i") {
        ini.classList.add("shiny");
        ini.classList.remove("back");
        reg.classList.add("back");
        reg.classList.remove("shiny");
        bots.style.height = "6.5vh";
        bots.innerHTML = `
            <div>
                <input id="getUs" type="text" placeholder="Usuario" maxlength="30" autocomplete="off">
                <input id="getPass" type="password" placeholder="Contraseña" maxlength="30" autocomplete="off">
            </div>
        `;
    } else if (est == "r") {
        reg.classList.add("shiny");
        reg.classList.remove("back");
        ini.classList.add("back");
        ini.classList.remove("shiny");
        bots.style.height = "28.5vh";
        bots.innerHTML = `
            <div>
                <input id="setNm" type="text" placeholder="Nombres" maxlength="30" autocomplete="off">
                <input id="setAp" type="text" placeholder="Apellidos" maxlength="30" autocomplete="off">
            </div>
            <div>
                <input id="setUs" type="text" placeholder="Nombre de Usuario" maxlength="15" autocomplete="off">
                <input id="setCi" type="number" placeholder="Carnet de Identidad" maxlength="10" autocomplete="off">
            </div>
            <div>
                <input id="setTl" type="number" placeholder="Teléfono" maxlength="15" autocomplete="off">
                <input id="setCo" type="email" placeholder="Correo" maxlength="100" autocomplete="off">
            </div>
            <div>
                <input id="setEd" type="number" placeholder="Edad" maxlength="3" autocomplete="off">
                <select id="setGe">
                    <option value="">Seleccionar grado educativo</option>
                </select>
            </div>
            <div>
                <input id="setPass" type="password" placeholder="Contraseña" maxlength="30" autocomplete="off">
                <input id="setPass2" type="password" placeholder="Confirmar Contraseña" maxlength="30" autocomplete="off">
            </div>
        `;
        cargarAreas();
    } else {
        window.location = "inicio.html";
    }
}
function cargarAreas() {
    fetch("php/areaGetAll.php")
        .then(res => res.json())
        .then(data => {
            if (data.exito) {
                const select = document.getElementById("setGe");
                data.areas.forEach(area => {
                    const opt = document.createElement("option");
                    opt.value = area.id_area;
                    opt.textContent = area.nombre_area;
                    select.appendChild(opt);
                });
            } else {
                console.warn("No se encontraron áreas:", data.mensaje);
            }
        })
        .catch(err => console.error("Error al cargar áreas:", err));
}


function inics() {
    est = "i";
    setTipo();
}

function regcs() {
    est = "r";
    setTipo();
}

function estu() {
    if (est == "i") {
        iniciar();
    } else if (est == "r") {
        registrar();
    } else {
        window.location = "inicio.html";
    }
}

function iniciar() {
    const username = document.getElementById("getUs").value.trim();
    const password = document.getElementById("getPass").value.trim();

    if (!username || !password) {
        mostrarModal("Por favor, complete todos los campos.");
        return;
    }

    fetch("php/estudianteIngresar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            localStorage.setItem("id_user", data.id_user);
            window.location = "estudiante.html";
        }
    })
    .catch(err => console.error("Error al iniciar sesión:", err));
}

function registrar() {
    const nombre = document.getElementById("setNm").value.trim();
    const apellido = document.getElementById("setAp").value.trim();
    const username = document.getElementById("setUs").value.trim();
    const ci = document.getElementById("setCi").value.trim();
    const telefono = document.getElementById("setTl").value.trim();
    const correo = document.getElementById("setCo").value.trim();
    const edad = document.getElementById("setEd").value.trim();
    const grado = document.getElementById("setGe").value;
    const contrasenna = document.getElementById("setPass").value.trim();
    const contrasenna2 = document.getElementById("setPass2").value.trim();

    if (!nombre || !apellido || !username || !ci || !telefono || !correo || !edad || !grado || !contrasenna || !contrasenna2) {
        mostrarModal("Por favor, complete todos los campos.");
        return;
    }


    fetch("php/estudianteRegistrar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            nombre, apellido, username, ci, telefono, correo, edad, grado,
            contrasenna, contrasenna2
        })
    })
    .then(res => res.json())
    .then(data => {
    if (data.exito) {
        localStorage.setItem("id_user", data.id_user);
        window.location = "estudiante.html";
    } else {
        mostrarModal(data.mensaje || "Error al registrar el estudiante");
    }
    }) .catch(err => {
        console.error("Error al registrar estudiante:", err);
        mostrarModal("Error de conexión con el servidor.");
    });
}


function back() {
    window.location = "inicio.html";
}

const pressedKeys = new Set();
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.altKey) {
        pressedKeys.add(event.key.toLowerCase());
        if (pressedKeys.has("a") && pressedKeys.has("d") && pressedKeys.has("m")) {
            admin();
        }
    }
});

document.addEventListener("keyup", function(event) {
    pressedKeys.delete(event.key.toLowerCase());
});

function mostrarModal(mensaje) {
    const modal = document.getElementById("msgModal");
    const msgText = document.getElementById("msgText");
    msgText.textContent = mensaje;
    modal.classList.remove("hidden");
}

function cerrarModal() {
    const modal = document.getElementById("msgModal");
    modal.classList.add("hidden");
}

function admin() {
    window.location = "admin.html";
}

function home() {
    window.location = "inicio.html";
}

function mae() {
    window.location = "logginMaestro.html";
}

localStorage.setItem('id_estudiante', idDelEstudiante);
