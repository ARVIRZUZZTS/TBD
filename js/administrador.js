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

// ==================== FUNCIONES DE ÁREAS ====================
function area() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="nuevaArea()">Nueva Área</button>
        <button class="shiny" onclick="verAreas()">Ver Áreas</button>
        <button class="back" onclick="back()">Atrás</button>
    `;  
    
    const dinamic = document.getElementById("dinamic");
    dinamic.style.justifyContent = "flex-start";
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Gestión de Áreas</h3>
        </div>
        <p>Seleccione una opción para gestionar las áreas</p>
    `;
}

function nuevaArea() {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Crear Nueva Área</h3>
        </div>
        <div class="form-container" style="grid-template-columns: 1fr;">
            <input type="text" id="nombreArea" placeholder="Nombre del Área" autocomplete="off">
            <div class="botones-form">
                <button class="shiny" onclick="guardarArea()">Guardar Área</button>
                <button class="back" onclick="area()">Cancelar</button>
            </div>
        </div>
    `;
}

function guardarArea() {
    const nombreArea = document.getElementById("nombreArea").value.trim();
    
    if (nombreArea === "") {
        alert("Por favor, ingrese un nombre para el área");
        return;
    }

    fetch("php/areaNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreArea: nombreArea })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        if (data.exito) {
            area();
        }
    })
    .catch(err => {
        console.error("Error al guardar área:", err);
        alert("Error al guardar el área");
    });
}

function verAreas() {
    fetch("php/areaGetAll.php", {
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
        titleM.innerHTML = `<h3>Lista de Áreas</h3>`;
        dinamic.appendChild(titleM);
        
        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.style.overflowY = "auto";
        tableContainer.style.maxHeight = "50vh";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Área</th>
                    </tr>
                </thead>
                <tbody id="tabla-areas">
                    <!-- Los datos se cargarán aquí -->
                </tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);
        
        if (data.exito) {
            const tbody = document.getElementById("tabla-areas");
            data.areas.forEach(area => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${area.id_area}</td>
                    <td>${area.nombre_area}</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.mensaje}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener áreas:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

// ==================== FUNCIONES DE CURSOS ====================
function curso() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="nuevoCurso()">Nuevo Curso</button>
        <button class="shiny" onclick="verCursos()">Ver Cursos</button>
        <button class="back" onclick="back()">Atrás</button>
    `;  
    
    const dinamic = document.getElementById("dinamic");
    dinamic.style.justifyContent = "flex-start";
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Gestión de Cursos</h3>
        </div>
        <p>Seleccione una opción para gestionar los cursos</p>
    `;
}

function nuevoCurso() {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Registro de Nuevo Curso</h3>
        </div>
        <div class="form-container">
            <input type="text" id="titulo" placeholder="Título del Curso" autocomplete="off">
            <input type="number" id="duracion" placeholder="Duración (horas)" autocomplete="off">
            
            <select id="area" class="form-full-width">
                <option value="">Seleccione un Área</option>
            </select>
            
            <select id="grado" class="form-full-width">
                <option value="">Seleccione un Grado</option>
            </select>
            
            <select id="categoria" class="form-full-width">
                <option value="">Seleccione una Categoría</option>
            </select>
            
            <select id="modalidad" class="form-full-width">
                <option value="">Seleccione Modalidad</option>
                <option value="P">Presencial</option>
                <option value="V">Virtual</option>
            </select>
            
            <div class="form-full-width">
                <label for="inicio_gestion">Inicio de Gestión:</label>
                <input type="date" id="inicio_gestion" autocomplete="off">
            </div>
            
            <div class="form-full-width">
                <label for="fin_gestion">Fin de Gestión:</label>
                <input type="date" id="fin_gestion" autocomplete="off">
            </div>
            
            <div class="botones-form">
                <button class="shiny" onclick="guardarCurso()">Guardar Curso</button>
                <button class="back" onclick="curso()">Cancelar</button>
            </div>
        </div>
    `;
    
    // Cargar datos para los combobox
    cargarComboboxAreas();
    cargarComboboxGrados();
    cargarComboboxCategorias();
}

function cargarComboboxAreas() {
    fetch("php/areaGetAll.php")
        .then(res => res.json())
        .then(data => {
            const selectArea = document.getElementById("area");
            if (data.exito) {
                data.areas.forEach(area => {
                    const option = document.createElement("option");
                    option.value = area.id_area;
                    option.textContent = area.nombre_area;
                    selectArea.appendChild(option);
                });
            } else {
                console.error("Error al cargar áreas:", data.mensaje);
            }
        })
        .catch(err => console.error("Error al obtener áreas:", err));
}

function cargarComboboxGrados() {
    fetch("php/gradoGetAll.php")
        .then(res => res.json())
        .then(data => {
            const selectGrado = document.getElementById("grado");
            if (data.exito) {
                data.grados.forEach(grado => {
                    const option = document.createElement("option");
                    option.value = grado.id_grado;
                    option.textContent = grado.nombre_grado;
                    selectGrado.appendChild(option);
                });
            } else {
                console.error("Error al cargar grados:", data.mensaje);
            }
        })
        .catch(err => console.error("Error al obtener grados:", err));
}

function cargarComboboxCategorias() {
    fetch("php/categoriaGetAll.php")
        .then(res => res.json())
        .then(data => {
            const selectCategoria = document.getElementById("categoria");
            if (data.exito) {
                data.categorias.forEach(categoria => {
                    const option = document.createElement("option");
                    option.value = categoria.id_categoria;
                    option.textContent = categoria.nombre_categoria;
                    selectCategoria.appendChild(option);
                });
            } else {
                console.error("Error al cargar categorías:", data.mensaje);
            }
        })
        .catch(err => console.error("Error al obtener categorías:", err));
}

function guardarCurso() {
    const datos = {
        titulo: document.getElementById("titulo").value.trim(),
        duracion: document.getElementById("duracion").value.trim(),
        id_area: document.getElementById("area").value,
        id_grado: document.getElementById("grado").value,
        id_categoria: document.getElementById("categoria").value,
        modalidad: document.getElementById("modalidad").value,
        inicio_gestion: document.getElementById("inicio_gestion").value,
        fin_gestion: document.getElementById("fin_gestion").value
    };
    
    // Validar campos obligatorios
    if (datos.titulo === "" || datos.duracion === "" || datos.id_area === "" || 
        datos.id_grado === "" || datos.id_categoria === "" || datos.modalidad === "" ||
        datos.inicio_gestion === "" || datos.fin_gestion === "") {
        alert("Todos los campos son obligatorios.");
        return;
    }
    
    // Validar que la fecha de fin sea mayor a la de inicio
    if (new Date(datos.fin_gestion) <= new Date(datos.inicio_gestion)) {
        alert("La fecha de fin debe ser posterior a la fecha de inicio.");
        return;
    }

    fetch("php/cursoNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        if (data.exito) {
            curso();
        }
    })
    .catch(err => {
        console.error("Error al guardar curso:", err);
        alert("Error al guardar el curso");
    });
}

function verCursos() {
    fetch("php/cursoGetAll.php", {
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
        titleM.innerHTML = `<h3>Lista de Cursos</h3>`;
        dinamic.appendChild(titleM);
        
        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.style.overflowY = "auto";
        tableContainer.style.maxHeight = "50vh";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Duración</th>
                        <th>Modalidad</th>
                        <th>Categoría</th>
                        <th>Área</th>
                        <th>Grado</th>
                        <th>Periodo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-cursos">
                    <!-- Los datos se cargarán aquí -->
                </tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);
        
        // CORRECCIÓN: Usar 'success' en lugar de 'exito'
        if (data.success && data.cursos && data.cursos.length > 0) {
            const tbody = document.getElementById("tabla-cursos");
            data.cursos.forEach(curso => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${curso.id_curso}</td>
                    <td>${curso.titulo}</td>
                    <td>${curso.duracion}</td>
                    <td>${curso.modalidad}</td>
                    <td>${curso.categoria}</td>
                    <td>${curso.area}</td>
                    <td>${curso.grado}</td>
                    <td>${curso.periodo}</td>
                    <td>
                        <button onclick="eliminarCurso(${curso.id_curso}, '${curso.titulo}')">
                            <img src="img/eliminar.png" alt="Eliminar" width="20">
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.message || 'No se encontraron cursos'}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener cursos:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

function eliminarCurso(idCurso, titulo) {
    if (!confirm(`¿Está seguro que quiere eliminar el curso "${titulo}"?`)) return;

    fetch("php/cursoDelete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCurso })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message); // Cambiado a 'message'
        if (data.success) { // Cambiado a 'success'
            verCursos();
        }
    })
    .catch(err => console.error("Error al eliminar curso:", err));
}

// ==================== FUNCIONES DE TRABAJADORES ====================
function trabajador() {
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
        titleM.innerHTML = `<h3>Lista de trabajadores</h3>`;
        dinamic.appendChild(titleM);
        
        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>CI</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Edad</th>
                    </tr>
                </thead>
                <tbody id="tabla-maestros">
                    <!-- Los datos se cargarán aquí -->
                </tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);
        
        if (data.exito) {
            const tbody = document.getElementById("tabla-maestros");
            data.maestros.forEach(m => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${m.nombre}</td>
                    <td>${m.apellido}</td>
                    <td>${m.ci}</td>
                    <td>${m.telefono}</td>
                    <td>${m.correo}</td>
                    <td>${m.edad}</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.mensaje}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener maestros:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
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

function nuevoTra() {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div id="titleM">
            <h3>Registro de Nuevo Maestro</h3>
        </div>
        <div class="form-container">
            <input type="text" id="nombre" placeholder="Nombre" autocomplete="off">
            <input type="text" id="apellido" placeholder="Apellido" autocomplete="off">
            <input type="text" id="username" placeholder="Nombre de usuario" autocomplete="off">
            <input type="password" id="contrasenna" placeholder="Contraseña" autocomplete="off">
            <input type="text" id="ci" placeholder="Cédula de Identity" autocomplete="off">
            <input type="text" id="telefono" placeholder="Teléfono" autocomplete="off">
            <input type="email" id="correo" placeholder="Correo" autocomplete="off" class="form-full-width">
            <input type="number" id="edad" placeholder="Edad" autocomplete="off">
            <input type="text" id="titulo" placeholder="Título profesional" autocomplete="off">
            <input type="number" id="sueldo" placeholder="Sueldo Porcentual" autocomplete="off">
            <input list="roles" id="rolInput" placeholder="Rol" autocomplete="off">
            <datalist id="roles"></datalist>
            <div class="botones-form">
                <button class="shiny" onclick="nuevoMaestro()">Guardar</button>
                <button class="back" onclick="trabajador()">Cancelar</button>
            </div>
        </div>
    `;
    
    // El resto del código para cargar roles se mantiene igual...
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

// ==================== FUNCIONES GENERALES ====================
function back() {
    const botones = document.getElementById("botones");
    const dinamic = document.getElementById("dinamic");

    botones.innerHTML = botonesOriginal;
    dinamic.innerHTML = contenidoOriginal;
    dinamic.style.justifyContent = "center";
}

function estudiante() {
    // Función pendiente de implementación
}

function cerrarSesion() {
    window.location = "inicio.html";
}