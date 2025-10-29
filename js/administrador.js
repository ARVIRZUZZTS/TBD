let botonesOriginal = "";
let contenidoOriginal = "";

const id_actual = sessionStorage.getItem("id_actual");
const usuario = sessionStorage.getItem("usuario");

if (!id_actual || !usuario) {
    alert("Sesión no iniciada");
    window.location = "inicio.html";
}

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

// ==================== FUNCIONES DE CURSOS ====================
function curso() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="nuevoCurso()">Nuevo Curso</button>
        <button class="shiny" onclick="verCursos()">Ver Cursos</button>
        <button class="shiny" onclick="area()">Áreas</button>
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

// ==================== FUNCIONES DE ÁREAS ====================
function area() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="nuevaArea()">Nueva Área</button>
        <button class="shiny" onclick="verAreas()">Ver Áreas</button>
        <button class="back" onclick="curso()">Atrás</button>
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
                       <button onclick="masOpciones(this, ${curso.id_curso}, '${curso.titulo.replace(/'/g, "\\'")}')">
                            <img src="img/masOpciones.png" alt="más" width="20">
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
            <input type="text" id="ci" placeholder="Cédula de Identidad" autocomplete="off">
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
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="estudiante()">Estudiante</button>
        <button class="shiny" onclick="becas()">Becas</button>
        <button class="shiny" onclick="ranking()">Ranking</button>
        <button class="back" onclick="back()">Atrás</button>
    `;

    fetch("php/estudianteGetAll.php?orden=nombre", {
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
        titleM.innerHTML = `<h3>Lista de Estudiantes</h3>`;
        dinamic.appendChild(titleM);

        const filtro = document.createElement("div");
        filtro.className = "selectBox";
        filtro.innerHTML = `
            <div>
                <h4>Ordenar estudiantes según:</h4>
                <select id="ordenSelect" onchange="cargarEstudiantes()">
                    <option value="nombre" selected>Nombre (A-Z)</option>
                    <option value="curso">Cursos Completados</option>
                    <option value="ranking">Ranking</option>
                    <option value="promedio">Promedio</option>
                </select>
            </div>
        `;
        dinamic.appendChild(filtro);
 
        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Usuario</th>
                        <th>Estado</th>
                        <th>Saldo</th>
                        <th>Ranking Points</th>
                        <th>Promedio</th>
                        <th>Informacion</th>
                    </tr>
                </thead>
                <tbody id="tabla-estudiantes"></tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);

        if (data.exito) {
            cargarTablaEstudiantes(data.estudiantes);
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.mensaje}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener estudiantes:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

function cargarEstudiantes() {
    const orden = document.getElementById("ordenSelect").value;
    fetch(`php/estudianteGetAll.php?orden=${orden}`)
        .then(res => res.json())
        .then(data => {
            if (data.exito) {
                cargarTablaEstudiantes(data.estudiantes);
            }
        })
        .catch(err => console.error("Error al recargar estudiantes:", err));
}

function cargarTablaEstudiantes(estudiantes) {
    const tbody = document.getElementById("tabla-estudiantes");
    tbody.innerHTML = "";

    estudiantes.forEach(est => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${est.nombre}</td>
            <td>${est.apellido}</td>
            <td>${est.username}</td>
            <td>${est.estado ?? "Activo"}</td>
            <td>${est.saldo_actual}</td>
            <td>${est.rankingPoints}</td>
            <td>${parseFloat(est.promedio).toFixed(2)}</td>
            <td>
                <button class="shiny" onclick="infoEst(${est.id_user})">
                    <img src="img/info.png" alt="info" width="20"> Info
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function ranking() {
    fetch("php/rankingGetAll.php", {
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
        titleM.innerHTML = `<h3>Lista de Rangos</h3>`;
        dinamic.appendChild(titleM);

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        dinamic.appendChild(tableContainer);

        if (!data.exito || !data.rankings || data.rankings.length === 0) {
            tableContainer.innerHTML = `
                <p style="padding: 20px; text-align: center; color: gray;">
                    No se encontraron rangos
                </p>
            `;
            return;
        }

        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Ranking</th>
                        <th>Límite Inferior</th>
                        <th>Límite Superior</th>
                        <th>N° de Estudiantes</th>
                        <th>Información</th>
                    </tr>
                </thead>
                <tbody id="tabla-ranking"></tbody>
            </table>
        `;

        const tbody = document.getElementById("tabla-ranking");
        tbody.innerHTML = "";

        data.rankings.forEach(r => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${r.ranking}</td>
                <td>${r.limite_inferior}</td>
                <td>${r.limite_superior}</td>
                <td>${r.total_estudiantes}</td>
                <td>
                    <button class="shiny" onclick="verEstudiantesRanking('${r.ranking}')">
                        <img src="img/info.png" alt="info" width="20"> Info
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    })
    .catch(err => {
        console.error("Error al obtener rankings:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `
            <p style="color: red; padding: 20px; text-align: center;">
                Error al cargar los datos
            </p>
        `;
    });
}


function verEstudiantesRanking(ranking) {
    fetch(`php/estudianteRanking.php?ranking=${encodeURIComponent(ranking)}`)
        .then(res => res.json())
        .then(data => {
            const dinamic = document.getElementById("dinamic");
            dinamic.innerHTML = "";

            const title = document.createElement("div");
            title.id = "titleM";
            title.innerHTML = `<h3>Estudiantes del rango: ${ranking}</h3>`;
            dinamic.appendChild(title);


            if (!data.exito) {
                const msg = document.createElement("p");
                msg.style.textAlign = "center";
                msg.style.padding = "20px";
                msg.style.color = "gray";
                msg.textContent = data.mensaje || "No hay estudiantes en este rango.";
                dinamic.appendChild(msg);

                dinamic.innerHTML += `
                    <button class="back" onclick="ranking()">← Volver</button>
                `;
                return;
            }

            const tableContainer = document.createElement("div");
            tableContainer.className = "table-container";
            tableContainer.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Usuario</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Ranking Points</th>
                            <th>Información</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-estudiantes-ranking"></tbody>
                </table>
            `;
            dinamic.appendChild(tableContainer);

            const tbody = document.getElementById("tabla-estudiantes-ranking");
            data.estudiantes.forEach(est => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${est.id_user}</td>
                    <td>${est.nombre}</td>
                    <td>${est.apellido}</td>
                    <td>${est.rankingPoints}</td>
                    <td>
                        <button class="shiny" onclick="infoEst(${est.id_user})">
                            <img src="img/info.png" alt="info" width="20"> Info
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
            dinamic.innerHTML += `
                <button class="back" onclick="ranking()">← Volver</button>
            `;
        })
        .catch(err => {
            console.error("Error al obtener estudiantes del ranking:", err);
            const dinamic = document.getElementById("dinamic");
            dinamic.innerHTML = `
                <p style="color:red; text-align:center; padding:20px;">
                    Error al cargar los estudiantes del ranking.
                </p>
            `;
        });
}




function becas() {
    fetch("php/becasGetAll.php", {
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
        titleM.innerHTML = `<h3>Lista de Becas</h3>`;
        dinamic.appendChild(titleM);

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID Estudiante</th>
                        <th>Nombre y Apellido</th>
                        <th>Área</th>
                        <th>Porcentaje</th>
                        <th>Estado</th>
                        <th>Información</th>
                    </tr>
                </thead>
                <tbody id="tabla-becas"></tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);

        if (data.exito) {
            const tbody = document.getElementById("tabla-becas");
            tbody.innerHTML = "";
            data.becas.forEach(b => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${b.id_estudiante}</td>
                    <td>${b.nombre} ${b.apellido}</td>
                    <td>${b.nombre_area}</td>
                    <td>${b.porcentaje}%</td>
                    <td>${b.estado_beca}</td>
                    <td>
                        <button class="shiny" onclick="infoEst(${b.id_estudiante})">
                            <img src="img/info.png" alt="info" width="20"> Info
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.mensaje}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener becas:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

function infoEst(id_user) {
    fetch(`php/estudianteGet.php?id_user=${id_user}`)
        .then(res => res.json())
        .then(data => {
            if (!data.exito) {
                alert(data.mensaje || "Error al obtener datos del estudiante");
                return;
            }

            const est = data.estudiante;
            const dinamic = document.getElementById("dinamic");
            dinamic.innerHTML = "";

            const datosHTML = `
                <div id="titleM">
                    <h3>Datos del estudiante ${id_user}</h3>
                </div>
                <div class="table-container">
                    <table class="data-table">
                    <thead>
                        <tr>
                            <th>IdEstudiante</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Usuario</th>
                            <th>CI</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Edad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                        <td>${est.id_user}</td>
                        <td>${est.nombre}</td>
                        <td>${est.apellido}</td>
                        <td>${est.username}</td>
                        <td>${est.ci ?? "-"}</td>
                        <td>${est.telefono ?? "-"}</td>
                        <td>${est.correo ?? "-"}</td>
                        <td>${est.edad ?? "-"}</td>
                        <td>${est.estado}</td>
                    </table>
                </div>
            `;

            const puntosHTML = `
                <div id="titleM">
                    <h3>Puntos del estudiante ${id_user}</h3>
                </div>
                <div class="table-container">                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Puntos Totales</th>
                                <th>Puntos Gastados</th>
                                <th>Saldo Actual</th>
                                <th>Ranking Points</th>
                                <th>Rango Actual</th>
                            </tr>
                        </thead>
                            <td>${est.puntos_totales}</td>
                            <td>${est.puntos_gastados}</td>
                            <td>${est.saldo_actual}</td>
                            <td>${est.rankingPoints}</td>
                            <td>${est.rango_actual}</td>
                    </table>
                </div>
            `;

            const accionesHTML = `
                <div id="estAcc" style="margin-top: 20px; text-align: center;">
                    <button class="shiny" onclick="becaEstudiante(${id_user}, &quot;${est.nombre}&quot;, &quot;${est.apellido}&quot;)">Dar Beca</button>
                    <button class="shiny" onclick="inscripciones(${id_user})">Ver Inscripciones</button>
                    <button class="back" onclick="darBaja(${id_user})">Dar de baja</button>
                    <button class="back" onclick="estudiante()">← Volver</button>
                </div>
            `;

            dinamic.innerHTML = datosHTML + puntosHTML + accionesHTML;
        })
        .catch(err => {
            console.error("Error al cargar info del estudiante:", err);
            alert("Error de conexión con el servidor");
        });
}

function becaEstudiante(id_user, nombre, apellido) {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = `
        <div>
            <div>
                <h3>Dar Beca al Estudiante ${nombre} ${apellido}</h3>
                
                <div class="form-full-width">
                    <label for="areaBeca">Área de la Beca:</label>
                    <select id="areaBeca"></select>
                </div>

                <div class="form-full-width">
                    <label for="porc">Porcentaje de la Beca:</label>
                    <input type="text" id="porc" placeholder="Porcentaje de la Beca" autocomplete="off">
                </div>

                <div class="form-full-width">
                    <label for="inicio_beca">Inicio de la Beca:</label>
                    <input type="date" id="inicio_beca" autocomplete="off">
                </div>

                <div class="form-full-width">
                    <label for="fin_beca">Fin de la Beca:</label>
                    <input type="date" id="fin_beca" autocomplete="off">
                </div>
            </div>

            <div style="margin-top:20px; text-align:center;">
                <button class="shiny" onclick="guardarBeca(${id_user})">Dar Beca</button>
                <button class="back" onclick="infoEst(${id_user})">← Volver</button>
            </div>
        </div>
    `;

    fetch("php/areaGetAll.php")
        .then(res => res.json())
        .then(areasData => {
            if (areasData.exito) {
                const select = document.getElementById("areaBeca");
                select.innerHTML = `<option value="">Seleccione un área</option>`;
                areasData.areas.forEach(a => {
                    select.innerHTML += `<option value="${a.id_area}">${a.nombre_area}</option>`;
                });
            } else {
                alert(areasData.mensaje || "Error al cargar las áreas");
            }
        })
        .catch(err => {
            console.error("Error al obtener áreas:", err);
            alert("Error al cargar las áreas");
        });
}

function guardarBeca(id_user) {
    const id_area = document.getElementById("areaBeca").value;
    const porcentaje = document.getElementById("porc").value.trim();
    const inicio = document.getElementById("inicio_beca").value;
    const fin = document.getElementById("fin_beca").value;

    if (!id_area || porcentaje === "" || inicio === "" || fin === "") {
        alert("Todos los campos son obligatorios.");
        return;
    }

    if (new Date(fin) <= new Date(inicio)) {
        alert("La fecha de fin debe ser posterior a la fecha de inicio.");
        return;
    }

    const datos = {
        id_estudiante: id_user,
        id_admin: id_actual,
        id_area: id_area,
        porcentaje: porcentaje,
        fecha_inicio: inicio,
        fecha_fin: fin
    };

    fetch("php/becaNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        if (data.exito) {
            infoEst(id_user);
        }
    })
    .catch(err => {
        console.error("Error al guardar beca:", err);
        alert("Error al guardar la beca");
    });
}


function inscripciones(id_user) {

}

function darBaja(id_user) {
    
}

function cerrarSesion() {
    window.location = "inicio.html";
}


function masOpciones(element, idCurso, tituloCurso) {
    const menuExistente = document.getElementById('opcionesMenu');
    
    if (menuExistente && menuExistente.classList.contains('mostrar')) {
        const rectExistente = menuExistente.getBoundingClientRect();
        const rectActual = element.getBoundingClientRect();
        
        if (Math.abs(rectExistente.top - rectActual.bottom) < 10 && 
            Math.abs(rectExistente.left - rectActual.left) < 10) {
            menuExistente.remove();
            return; 
        }
    }
    
    if (menuExistente) {
        menuExistente.remove();
    }
    
    const menu = document.createElement('div');
    menu.id = 'opcionesMenu';
    menu.className = 'menu-opciones';
    
    const opciones = [
        { texto: 'Editar', accion: 'editarCurso' },
        { texto: 'Eliminar', accion: 'eliminarCurso' },
        {texto: "añadir Maestro", accion: "añadirMaestro"}
    ];
    
    opciones.forEach(opcion => {
        const botonOpcion = document.createElement('button');
        botonOpcion.className = 'opcion-menu';
        botonOpcion.textContent = opcion.texto;
        botonOpcion.onclick = (e) => {
            e.stopPropagation();
            ejecutarAccion(opcion.accion, idCurso, tituloCurso);
        };
        menu.appendChild(botonOpcion);
    });
    
    document.body.appendChild(menu);
    
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    menu.style.top = (rect.bottom + scrollY) + 'px';
    menu.style.left = (rect.left + scrollX) + 'px';
    menu.classList.add('mostrar');

    const cerrarMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== element) {
            menu.remove();
            document.removeEventListener('click', cerrarMenu);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', cerrarMenu);
    }, 0);
}

function ejecutarAccion(accion, idCurso, tituloCurso) {
    console.log('Ejecutando:', accion, 'para:', tituloCurso);
    
    //aqui falta poner que acciones realiza que
    switch(accion) {
        case 'editarCurso':
            alert(`Editando: ${tituloCurso}`);
            break;
        case 'eliminarCurso':
            if (confirm(`¿Eliminar ${tituloCurso}?`)) {
                eliminarCurso( idCurso, tituloCurso);
            }
            break;
        case 'añadirMaestro':
            añadirMaestro(idCurso, tituloCurso);
            break;
        default:
            break;
    }
    
    const menu = document.getElementById('opcionesMenu');
    if (menu) menu.classList.remove('mostrar');
}

function añadirMaestro(idCurso, tituloCurso) {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="guardarMaestroCurso(${idCurso})">Guardar Maestro</button>
        <button class="back" onclick="verCursos()">Cancelar</button>
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
        titleM.innerHTML = `<h3>Seleccionar Maestro para: ${tituloCurso}</h3>`;
        dinamic.appendChild(titleM);

        const infoText = document.createElement("p");
        infoText.innerHTML = `<strong>Selecciona UN maestro para impartir este curso</strong>`;
        dinamic.appendChild(infoText);

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        tableContainer.style.overflowY = "auto";
        tableContainer.style.maxHeight = "50vh";
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Seleccionar</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Usuario</th>
                        <th>CI</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody id="tabla-maestros">
                    <!-- Los datos se cargarán aquí -->
                </tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);

        if (data.exito && data.maestros) {
            const tbody = document.getElementById("tabla-maestros");
            tbody.innerHTML = "";

            data.maestros.forEach(maestro => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>
                        <input type="radio" name="maestroSeleccionado" value="${maestro.id_maestro}" 
                               class="radio-maestro" onchange="seleccionarMaestro(${maestro.id_maestro})">
                    </td>
                    <td>${maestro.nombre || '-'}</td>
                    <td>${maestro.apellido || '-'}</td>
                    <td>${maestro.username || '-'}</td>
                    <td>${maestro.ci || '-'}</td>
                    <td>${maestro.correo || '-'}</td>
                    <td>${maestro.telefono || '-'}</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tableContainer.innerHTML += `<p style="padding: 20px; text-align: center;">${data.mensaje || 'No se encontraron maestros'}</p>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener maestros:", err);
        const dinamic = document.getElementById("dinamic");
        dinamic.innerHTML += `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

let maestroSeleccionadoId = null;

function seleccionarMaestro(idMaestro) {
    maestroSeleccionadoId = idMaestro;
    console.log("Maestro seleccionado:", idMaestro);
}

function guardarMaestroCurso(idCurso) {
    if (!maestroSeleccionadoId) {
        alert("Por favor, selecciona un maestro para este curso");
        return;
    }

    if (!confirm(`¿Estás seguro de asignar este maestro al curso?`)) {
        return;
    }

    const datos = {
        idCurso: idCurso,
        idMaestro: maestroSeleccionadoId
    };

    fetch("", { // aqui falta el php
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje || data.message);
        if (data.exito || data.success) {
            maestroSeleccionadoId = null; 
            verCursos();
        }
    })
    .catch(err => {
        console.error("Error al asignar maestro:", err);
        alert("Error al asignar el maestro al curso");
    });
}

