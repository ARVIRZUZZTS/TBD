let botonesOriginal = "";
let contenidoOriginal = "";

const id_actual = localStorage.getItem("id_user");
const usuario = localStorage.getItem("usuario");

if (!id_actual || !usuario) {
    alert("Sesión no iniciada");
    window.location = "inicio.html";
}

document.addEventListener("DOMContentLoaded", function(){
    const botones = document.getElementById("botones");
    const dinamic = document.getElementById("dinamic");
    botonesOriginal = botones.innerHTML;
    contenidoOriginal = dinamic.innerHTML;
    
    // Registrar inicio de sesión si no se ha registrado aún
    registrarInicioSesion();
    setUs();
});

// Función para registrar el inicio de sesión en bitácora
function registrarInicioSesion() {
    if (!sessionStorage.getItem('bitacora_inicio_registrada')) {
        const data = {
            accion: "INICIO",
            id_user: parseInt(id_actual)
        };

        fetch("php/bitUsuario.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.exito) {
                console.log("Inicio de sesión registrado en bitácora");
                sessionStorage.setItem('bitacora_inicio_registrada', 'true');
            } else {
                console.error("Error al registrar inicio:", result.mensaje);
            }
        })
        .catch(error => {
            console.error("Error en la conexión:", error);
        });
    }
}

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
        <button class="shiny" onclick="curso()">Cursos</button>
        <button class="shiny" onclick="cursosActivos()">Cursos Activos</button>
        <button class="shiny" onclick="area()">Áreas</button>
        <button class="shiny" onclick="descuentos()">Descuentos</button>
        <button class="back" onclick="back()">Atrás</button>
    `;  
    
    fetch("php/cursoGetAll.php", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        const dinamic = document.getElementById("dinamic");
        dinamic.style.justifyContent = "flex-start";
        dinamic.innerHTML = "";

        
        const header = document.createElement("div");
        header.className = "cursosActTitle";
        header.innerHTML = `
            <h3>Lista de Cursos</h3>
            <button class="shiny" onclick="nuevoCurso()">Nuevo Curso</button>
        `;
        dinamic.appendChild(header);
        
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
                        <th>Periodo (Inicio-Fin)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-cursos">
                    <!-- Los datos se cargarán aquí -->
                </tbody>
            </table>
        `;
        dinamic.appendChild(tableContainer);
        
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
        dinamic.innerHTML = `<p style="color: red; padding: 20px; text-align: center;">Error al cargar los datos</p>`;
    });
}

function cursosActivos() {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = "";
    dinamic.style.justifyContent = "flex-start";

    const header = document.createElement("div");
    header.className = "cursosActivosTitle";
    header.innerHTML = `
        <h3>Lista de Cursos Activos</h3>
        <select id="cursosFiltrados"></select>
    `;
    dinamic.appendChild(header);

    const tableContainer = document.createElement("div");
    tableContainer.className = "table-container";
    tableContainer.style.overflowY = "auto";
    tableContainer.style.maxHeight = "50vh";
    tableContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID Periodo</th>
                    <th>ID Maestro</th>
                    <th>Título</th>
                    <th>Cupos</th>
                    <th>Cupos Ocupados</th>
                    <th>Solicitudes Totales</th>
                    <th>Recaudado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-periodos"></tbody>
        </table>
    `;
    dinamic.appendChild(tableContainer);

    fetch("php/pcGetAll.php")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("cursosFiltrados");
            const tbody = document.getElementById("tabla-periodos");

            if (data.success && data.periodos.length > 0) {
                select.innerHTML = `<option value="">Todos los cursos</option>`;
                data.periodos.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p.id_periodo_curso;
                    option.textContent = `${p.titulo}`;
                    select.appendChild(option);
                });

                renderTablaPeriodos(data.periodos);

                select.addEventListener("change", () => {
                    const id = select.value;
                    const filtrados = id ? data.periodos.filter(p => p.id_periodo_curso == id) : data.periodos;
                    renderTablaPeriodos(filtrados);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No hay cursos activos</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
        });
}

function renderTablaPeriodos(periodos) {
    const tbody = document.getElementById("tabla-periodos");
    tbody.innerHTML = "";
    periodos.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id_periodo_curso}</td>
            <td>${p.id_maestro}</td>
            <td>${p.titulo}</td>
            <td>${p.cupos}</td>
            <td>${p.cupos_ocupados}</td>
            <td>${p.solicitudes_totales}</td>
            <td>${p.recaudado}</td>
            <td>${p.estado_periodo}</td>
            <td>
                <button onclick="masOpcionesPCurso(this, ${p.id_periodo_curso}, '${p.titulo.replace(/'/g, "\\'")}')">
                    <img src="img/masOpciones.png" alt="más" width="20">
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function masOpcionesPCurso(element, idPeriodoCurso, tituloCurso) {
    const menuExistente = document.getElementById('opcionesMenu');
    if (menuExistente) menuExistente.remove();

    const menu = document.createElement('div');
    menu.id = 'opcionesMenu';
    menu.className = 'menu-opciones';

    const opciones = [
        { texto: 'Dar de Baja', accion: 'darDeBaja' }
    ];

    fetch(`php/cursoCertificadoGet.php?idPeriodoCurso=${encodeURIComponent(idPeriodoCurso)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.exito === false) {
                console.warn('cursoCertificadoGet no devolvió info válida:', data);
            } else {
                const estado = (data.estado_periodo || '').toString().trim().toLowerCase();
                const esCertificado = !!data.esCertificado || ((data.categoria || '').toString().trim().toLowerCase() === 'curso certificado');

                if (estado === 'inscripciones') {
                    opciones.push({
                        texto: 'Descuento',
                        handler: () => {
                            menu.remove();
                            nuevoDescuento(idPeriodoCurso, data.fecha_fin || null);
                        }
                    });
                }

                if (esCertificado) {
                    opciones.push({
                        texto: 'Certificados',
                        accion: 'verCertificados'
                    });
                }
            }

            opciones.forEach(opcion => {
                const botonOpcion = document.createElement('button');
                botonOpcion.className = 'opcion-menu';
                botonOpcion.textContent = opcion.texto;

                botonOpcion.onclick = (e) => {
                    e.stopPropagation();
                    if (opcion.handler) {
                        opcion.handler();
                    } else {
                        ejecutarAccionPCurso(opcion.accion, idPeriodoCurso, tituloCurso);
                    }
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
            setTimeout(() => document.addEventListener('click', cerrarMenu), 0);

        })
        .catch(err => {
            console.error("Error al obtener información del curso:", err);

            const botonOpcion = document.createElement('button');
            botonOpcion.className = 'opcion-menu';
            botonOpcion.textContent = 'Dar de Baja';
            botonOpcion.onclick = (e) => {
                e.stopPropagation();
                ejecutarAccionPCurso('darDeBaja', idPeriodoCurso, tituloCurso);
            };
            menu.appendChild(botonOpcion);

            document.body.appendChild(menu);
            const rect = element.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;
            menu.style.top = (rect.bottom + scrollY) + 'px';
            menu.style.left = (rect.left + scrollX) + 'px';
            menu.classList.add('mostrar');

            setTimeout(() => {
                document.addEventListener('click', function cerrarMenu(e) {
                    if (!menu.contains(e.target) && e.target !== element) {
                        menu.remove();
                        document.removeEventListener('click', cerrarMenu);
                    }
                });
            }, 0);

            alert('No se pudo verificar el estado del periodo. Intenta de nuevo.');
        });
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
    
    if (datos.titulo === "" || datos.duracion === "" || datos.id_area === "" || 
        datos.id_grado === "" || datos.id_categoria === "" || datos.modalidad === "" ||
        datos.inicio_gestion === "" || datos.fin_gestion === "") {
        alert("Todos los campos son obligatorios.");
        return;
    }
    
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
        if (data.exito) {
            curso();
        }
    })
    .catch(err => {
        console.error("Error al guardar curso:", err);
        alert("Error al guardar el curso");
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
        alert(data.message);
        if (data.success) {
            curso();
        }
    })
    .catch(err => console.error("Error al eliminar curso:", err));
}

// ==================== FUNCIONES DE TRABAJADORES ========================================================================
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
        <button class="shiny" onclick="graficos()">Gráficos</button>
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
                <button class="back" onclick="darBaja(${id_user})">Dar de baja</button>
                    <button class="shiny" onclick="becaEstudiante(${id_user}, &quot;${est.nombre}&quot;, &quot;${est.apellido}&quot;)">Dar Beca</button>
                    <button class="shiny" onclick="inscripciones(${id_user})">Reporte de Incripciones</button>
                    <button class="shiny" onclick="recompensas(${id_user})">Reporte de Recompensas</button>
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

function graficos() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="estudiante()">Estudiante</button>
        <button class="shiny" onclick="becas()">Becas</button>
        <button class="shiny" onclick="ranking()">Ranking</button>
        <button class="shiny" onclick="graficos()">Gráficos</button>
        <button class="back" onclick="back()">Atrás</button>
    `;

    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = "";

    const titleM = document.createElement("div");
    titleM.id = "titleM";
    titleM.innerHTML = `<h3>Gráficos Estadísticos</h3>`;
    dinamic.appendChild(titleM);

    const filtro = document.createElement("div");
    filtro.className = "selectBox";
    filtro.innerHTML = `
        <div>
            <h4>Seleccionar tipo de gráfico:</h4>
            <select id="tipoGrafico" onchange="cargarGrafico()">
                <option value="estudiantes">Estudiantes por Estado</option>
                <option value="ranking">Estudiantes por Ranking</option>
                <option value="categorias">Cursos por Categoría</option>
                <option value="promedios">Estudiantes por Promedio</option>
            </select>
        </div>
    `;
    dinamic.appendChild(filtro);

    const chartContainer = document.createElement("div");
    chartContainer.id = "chart-container";
    chartContainer.style.width = "100%";
    chartContainer.style.maxWidth = "600px";
    chartContainer.style.margin = "20px auto";
    chartContainer.style.padding = "20px";
    chartContainer.style.height = "50vh";
    chartContainer.style.overflowY = "auto";
    chartContainer.style.overflowX = "hidden";
    chartContainer.style.backgroundColor = "white";
    chartContainer.style.borderRadius = "10px";
    chartContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    
    const canvas = document.createElement("canvas");
    canvas.id = "graficoChart";
    chartContainer.appendChild(canvas);
    
    const statsContainer = document.createElement("div");
    statsContainer.id = "stats-container";
    statsContainer.style.marginTop = "20px";
    statsContainer.style.padding = "15px";
    statsContainer.style.backgroundColor = "#f8f9fa";
    statsContainer.style.borderRadius = "8px";
    chartContainer.appendChild(statsContainer);

    dinamic.appendChild(chartContainer);

    cargarGrafico();
}

let graficoActual = null;

function cargarGrafico() {
    const tipo = document.getElementById("tipoGrafico").value;
    const statsContainer = document.getElementById("stats-container");
    
    statsContainer.innerHTML = '<p style="text-align: center;">Cargando datos...</p>';
    
    fetch(`php/graficosGet.php?tipo=${tipo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            crearGraficoTarta(data);
            mostrarEstadisticas(data);
        } else {
            statsContainer.innerHTML = `<p style="color: red; text-align: center;">${data.mensaje}</p>`;
            if (graficoActual) {
                graficoActual.destroy();
                graficoActual = null;
            }
        }
    })
    .catch(err => {
        console.error("Error al cargar gráfico:", err);
        statsContainer.innerHTML = '<p style="color: red; text-align: center;">Error al cargar los datos del gráfico</p>';
        if (graficoActual) {
            graficoActual.destroy();
            graficoActual = null;
        }
    });
}

function crearGraficoTarta(data) {
    const ctx = document.getElementById('graficoChart').getContext('2d');
    
    if (graficoActual) {
        graficoActual.destroy();
    }
    
    const colores = generarColores(data.labels.length);
    
    let titulo = '';
    let opcionesPersonalizadas = {};
    
    switch(data.tipo) {
        case 'estudiantes':
            titulo = 'Distribución de Estudiantes por Estado';
            break;
        case 'ranking':
            titulo = 'Distribución de Estudiantes por Ranking';
            // Opciones especiales para ranking
            opcionesPersonalizadas = {
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 10  // Tamaño más pequeño para ranking
                            },
                            padding: 10,
                            boxWidth: 12,  // Caja más pequeña
                            boxHeight: 12,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function(label, i) {
                                        const meta = chart.getDatasetMeta(0);
                                        const style = meta.controller.getStyle(i);
                                        
                                        return {
                                            text: label,
                                            fillStyle: style.backgroundColor,
                                            strokeStyle: style.borderColor,
                                            lineWidth: style.borderWidth,
                                            hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            };
            break;
        case 'categorias':
            titulo = 'Distribución de Cursos por Categoría';
            break;
        case 'promedios':
            titulo = 'Distribución de Estudiantes por Rango de Promedio';
            break;
    }
    
    // Configuración base
    const opcionesBase = {
        responsive: true,
        maintainAspectRatio: false,  // Cambiado a false para mejor control
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20,
                    boxWidth: 15,
                    boxHeight: 15
                }
            },
            title: {
                display: true,
                text: titulo,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        // Agregar interactividad
        onClick: function(evt, elements) {
            if (elements.length > 0) {
                const index = elements[0].index;
                console.log('Clic en:', data.labels[index]);
                // Aquí puedes agregar funcionalidad adicional si quieres
            }
        }
    };
    
    // Fusionar opciones base con personalizadas
    const opcionesFinales = deepMerge(opcionesBase, opcionesPersonalizadas);
    
    graficoActual = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.valores,
                backgroundColor: colores,
                borderColor: 'white',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 10  // Efecto hover
            }]
        },
        options: opcionesFinales
    });
    
    // Ajustar altura del contenedor basado en el tipo
    const chartContainer = document.getElementById('chart-container');
    if (data.tipo === 'ranking' && data.labels.length > 15) {
        chartContainer.style.height = '70vh';  // Más alto para ranking
        chartContainer.style.overflowY = 'scroll';
    } else {
        chartContainer.style.height = '50vh';
    }
}

// Función auxiliar para fusionar objetos profundamente
function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function generarColores(cantidad, tipo = '') {
    const paleta = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
        '#6A4C93', '#F15BB5', '#00BBF9', '#00F5D4',
        '#FF97B7', '#9B5DE5', '#FEE440', '#00F5D4'
    ];
    
    // Paleta especial para ranking (colores por nivel)
    if (tipo === 'ranking') {
        const rankingPalette = {
            'Hierro': ['#A19D94', '#8B8680', '#76726D', '#615D59'],
            'Bronce': ['#CD7F32', '#B87333', '#A3672B', '#8E5C24'],
            'Plata': ['#C0C0C0', '#A9A9A9', '#939393', '#7D7D7D'],
            'Oro': ['#FFD700', '#E6C200', '#CCAD00', '#B39800'],
            'Platino': ['#E5E4E2', '#CFCECB', '#B9B8B5', '#A3A29E'],
            'Esmeralda': ['#50C878', '#46B46A', '#3DA05C', '#348C4E'],
            'Diamante': ['#B9F2FF', '#A5D9E6', '#91C0CC', '#7DA7B3'],
            'Maestro': ['#8A2BE2', '#7B26CB', '#6C22B4', '#5D1E9D'],
            'Gran Maestro': ['#FF6B6B', '#E65F5F', '#CC5454', '#B34949'],
            'Challenger': ['#FF4500', '#E63D00', '#CC3600', '#B32F00']
        };
        
        const colores = [];
        for (let i = 0; i < cantidad; i++) {
            colores.push(paleta[i % paleta.length]);
        }
        return colores;
    }
    
    const colores = [...paleta];
    while (colores.length < cantidad) {
        colores.push(`#${Math.floor(Math.random()*16777215).toString(16)}`);
    }
    
    return colores.slice(0, cantidad);
}

function mostrarEstadisticas(data) {
    const statsContainer = document.getElementById("stats-container");
    const total = data.valores.reduce((a, b) => a + b, 0);
    
    let html = `<h4 style="margin-bottom: 15px; color: #333;">Estadísticas:</h4>`;
    html += `<p><strong>Total registros:</strong> ${total}</p>`;
    
    const maxValor = Math.max(...data.valores);
    const minValor = Math.min(...data.valores.filter(v => v > 0));
    const maxIndex = data.valores.indexOf(maxValor);
    const minIndex = data.valores.indexOf(minValor);
    
    html += `<p><strong>Mayor cantidad:</strong> ${data.labels[maxIndex]} (${maxValor} - ${Math.round((maxValor/total)*100)}%)</p>`;
    html += `<p><strong>Menor cantidad:</strong> ${data.labels[minIndex]} (${minValor} - ${Math.round((minValor/total)*100)}%)</p>`;
    
    statsContainer.innerHTML = html;
}

function descuentos() {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="curso()">Cursos</button>
        <button class="shiny" onclick="cursosActivos()">Cursos Activos</button>
        <button class="shiny" onclick="area()">Áreas</button>
        <button class="shiny" onclick="descuentos()">Descuentos</button>
        <button class="back" onclick="back()">Atrás</button>
    `;

    const dinamic = document.getElementById("dinamic");
    dinamic.style.justifyContent = "flex-start";
    dinamic.innerHTML = "";

    const titleM = document.createElement("div");
    titleM.id = "titleM";
    titleM.innerHTML = `
        <h3>Gestión de Descuentos</h3>
        <div class="selectBox">
            <div>
                <h4>Ordenar por:</h4>
                <select id="ordSel" onchange="cargarDescuentos()">
                    <option value="activas" selected>Activas</option>
                    <option value="expiradas">Expiradas</option>
                    <option value="mayor">Mayor Descuento</option>
                    <option value="menor">Menor Descuento</option>
                </select>
                <button class="shiny" onclick="nuevoDescuento()">Nuevo Descuento</button>
            </div>
        </div>
    `;
    dinamic.appendChild(titleM);

    const tableContainer = document.createElement("div");
    tableContainer.className = "table-container";
    tableContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID Descuento</th>
                    <th>Curso</th>
                    <th>Costo DeskPoints</th>
                    <th>Expira el</th>
                    <th>Descuento %</th>
                    <th>Costo $</th>
                    <th>Total $</th>
                </tr>
            </thead>
            <tbody id="tabla-descuentos"></tbody>
        </table>
    `;
    dinamic.appendChild(tableContainer);

    cargarDescuentos();
}

function cargarDescuentos() {
    const orden = document.getElementById("ordSel").value;

    fetch(`php/descuentosGetAll.php?orden=${encodeURIComponent(orden)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("tabla-descuentos");
        tbody.innerHTML = "";

        if (data.exito && data.descuentos.length > 0) {
            data.descuentos.forEach(d => {
                const fila = document.createElement("tr");
                const totalConDescuento = (d.costo * (1 - d.porcentaje_descuento / 100)).toFixed(2);

                fila.innerHTML = `
                    <td>${d.id_descuento}</td>
                    <td>${d.id_periodo_curso}: ${d.titulo}</td>
                    <td>${d.costo_canje}</td>
                    <td>${d.fecha_fin}</td>
                    <td>${d.porcentaje_descuento}%</td>
                    <td>${d.costo}$</td>
                    <td>${totalConDescuento}$</td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px;">${data.mensaje || 'No hay descuentos disponibles.'}</td></tr>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener descuentos:", err);
        const tbody = document.getElementById("tabla-descuentos");
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error al cargar los descuentos</td></tr>`;
    });
}

function nuevoDescuento(preSeleccionId = null, preSeleccionFechaFin = null) {
    const dinamic = document.getElementById("dinamic");
    dinamic.innerHTML = "";
    dinamic.style.justifyContent = "flex-start";

    const titleM = document.createElement("div");
    titleM.id = "titleM";
    titleM.innerHTML = `<h3>Registrar Nuevo Descuento</h3>`;
    dinamic.appendChild(titleM);

    const form = document.createElement("div");
    form.className = "descBoxi";
    form.innerHTML = `
        <select id="idPeriodo">
            <option value="">Cargando cursos disponibles...</option>
        </select>

        <input type="number" id="costoCanje" placeholder="Costo DeskPoints" min="0">

        <input type="date" id="fechaFin" disabled>

        <input type="number" id="porcentaje" placeholder="Descuento %" min="1" max="100">

        <div id="descButBoxi">
            <button class="shiny" onclick="registrarDescuento()">Registrar</button>
            <button class="back" onclick="descuentos()">Cancelar</button>
        </div>
    `;
    dinamic.appendChild(form);

    fetch("php/descuentoCursosF.php")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("idPeriodo");
            select.innerHTML = "";

            if (data.exito && data.periodos.length > 0) {
                select.innerHTML = `<option value="">Seleccione un curso...</option>`;

                data.periodos.forEach(p => {
                    const option = document.createElement("option");
                    const cuposLibres = p.cupos_libres;
                    option.value = p.id_periodo_curso;
                    option.textContent = `${p.id_periodo_curso}: ${p.titulo} - Cupos Libres: ${cuposLibres}`;
                    option.dataset.fechaInicio = p.fecha_inicio;
                    option.dataset.fechaFin = p.fecha_fin;

                    select.appendChild(option);
                });

                // 🔹 Si se pasó un curso para preseleccionar
                if (preSeleccionId) {
                    const opcion = Array.from(select.options).find(o => o.value == preSeleccionId);
                    if (opcion) {
                        opcion.selected = true;
                        const fechaFinInput = document.getElementById("fechaFin");
                        fechaFinInput.value = preSeleccionFechaFin || opcion.dataset.fechaFin || "";
                        fechaFinInput.disabled = false;
                    }
                }

                // 🔹 Evento cuando el usuario cambia el select
                select.addEventListener("change", () => {
                    const fechaFinInput = document.getElementById("fechaFin");
                    const optionSel = select.options[select.selectedIndex];

                    if (optionSel.value !== "") {
                        const fechaFinCurso = optionSel.dataset.fechaFin;
                        if (fechaFinCurso) {
                            fechaFinInput.value = fechaFinCurso;
                            fechaFinInput.disabled = false;
                        } else {
                            fechaFinInput.value = "";
                            fechaFinInput.disabled = true;
                        }
                    } else {
                        fechaFinInput.value = "";
                        fechaFinInput.disabled = true;
                    }
                });

            } else {
                select.innerHTML = `<option value="">No hay cursos disponibles</option>`;
            }
        })
        .catch(err => {
            console.error("Error al obtener cursos:", err);
            document.getElementById("idPeriodo").innerHTML =
                `<option value="">Error al cargar cursos</option>`;
        });
}

function registrarDescuento() {
    const idPeriodo = document.getElementById("idPeriodo").value.trim();
    const costoCanje = document.getElementById("costoCanje").value.trim();
    const fechaFin = document.getElementById("fechaFin").value.trim();
    const porcentaje = document.getElementById("porcentaje").value.trim();

    if (!idPeriodo || !costoCanje || !fechaFin || !porcentaje) {
        alert("Todos los campos son obligatorios.");
        return;
    }
    if (porcentaje < 1 || porcentaje > 100) {
        alert("El porcentaje de descuento debe estar entre 1 y 100.");
        return;
    }

    fetch("php/descuentoNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_periodo_curso: idPeriodo,
            costo_canje: costoCanje,
            fecha_fin: fechaFin,
            porcentaje_descuento: porcentaje
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            alert("Descuento registrado con éxito.", true);
            setTimeout(() => descuentos(), 1500);
        } else {
            alert(`Error: ${data.mensaje || "No se pudo registrar el descuento."}`);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Error en la conexión con el servidor.");
    });
}

function inscripciones(id_user) {
    fetch(`php/reporteAcademicoGet.php?id_user=${id_user}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert(data.message || "Error al obtener inscripciones del estudiante");
                return;
            }

            const ins = data.inscripciones;
            const dinamic = document.getElementById("dinamic");
            dinamic.innerHTML = "";

            let tablaHTML = `
                <div id="titleM">
                    <h3>Reporte académico del estudiante ${id_user}</h3>
                </div>

                <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>CURSO-PC</th>
                            <th>TÍTULO</th>
                            <th>MAESTRO</th>
                            <th>PROGRESO</th>
                            <th>ESTADO</th>
                            <th>DESKPOINTS</th>
                            <th>RANKINGPOINTS</th>
                            <th>NOTA</th>
                            <th>ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            const fechaActual = new Date();

            ins.forEach(row => {
                let progreso = 0;

                const inicio = new Date(row.fecha_inicio);
                const fin = new Date(row.fecha_fin);

                if (fechaActual < inicio) {
                    progreso = 0;
                } else if (fechaActual >= fin) {
                    progreso = 100;
                } else {
                    let total = fin - inicio;
                    let actual = fechaActual - inicio;
                    progreso = Math.round((actual / total) * 100);
                }

                const maestro = `${row.id_maestro}:${row.maestro_nombre} ${row.maestro_apellido}`;

                const cursoPC = `${row.id_curso}-${row.id_periodo_curso}`;

                let btnCert = "-";
                if (row.id_categoria == "4" && row.estado_periodo === "Finalizado" && row.estado_estudiante === "Aprobado") {
                    btnCert = `<button class="shiny" onclick="showCertificado(this, ${row.id_estudiante}, ${row.id_periodo_curso})">CERTIFICADO</button>`;
                }

                tablaHTML += `
                    <tr>
                        <td>${cursoPC}</td>
                        <td>${row.titulo}</td>
                        <td>${maestro}</td>
                        <td>${progreso}%</td>
                        <td>${row.estado_periodo}</td>
                        <td>${row.deskPoints}</td>
                        <td>${row.rankingPoints}</td>
                        <td>${row.nota ?? "-"}</td>
                        <td>${btnCert}</td>
                    </tr>
                `;
            });

            tablaHTML += `
                    </tbody>
                </table>
                </div>

                <div style="text-align:center; margin-top:20px;">
                    <button class="back" onclick="infoEst(${id_user})">← Volver</button>
                </div>
            `;

            dinamic.innerHTML = tablaHTML;
        })
        .catch(err => {
            console.error("Error en inscripciones:", err);
            alert("Error de conexión con el servidor");
        });
}

function showCertificado(element, id_estudiante, id_periodo_curso) {
    const menuExistente = document.getElementById('certMenu');
    if (menuExistente) menuExistente.remove();

    const menu = document.createElement('div');
    menu.id = 'certMenu';
    menu.className = 'menu-opciones';

    const opciones = [
        { texto: 'Imprimir', accion: 'print' },
        { texto: 'Descargar PDF', accion: 'pdf' }
    ];

    opciones.forEach(op => {
        const btn = document.createElement('button');
        btn.className = 'opcion-menu';
        btn.textContent = op.texto;

        btn.onclick = (e) => {
            e.stopPropagation();
            certificado(id_estudiante, id_periodo_curso, op.accion);
        };

        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    const rect = element.getBoundingClientRect();
    menu.style.top = (rect.bottom + window.scrollY) + 'px';
    menu.style.left = (rect.left + window.scrollX) + 'px';
    menu.classList.add('mostrar');

    setTimeout(() => {
        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target)) menu.remove();
        });
    }, 0);
}

function certificado(id_estudiante, id_periodo_curso, accion) {
    fetch(`php/getCertificadoData.php?id_estudiante=${id_estudiante}&id_periodo_curso=${id_periodo_curso}`)
    .then(r => r.json())
    .then(data => {
        if (!data.success) {
            alert("No se pudo generar el certificado");
            return;
        }

        const d = data.data;
        const div = document.getElementById("printy");

        div.innerHTML = `
            <div>
                <img src="img/logo.png" id="certLogo">
                <h1>CERTIFICADO DE FINALIZACIÓN<br>${d.titulo}</h1>
            </div>

            <div style="margin-top:40px;">
                <h3>Verificado por Administración: Nombre Apellido Admin</h3>
                <h3>Aprobado por el Maestro: ${d.mae_nombre} ${d.mae_apellido}</h3>
            </div>

            <p style="margin-top:30px; font-size:20px; width:90%; margin:auto; line-height:1.5;">
                Se certifica que <b>${d.est_nombre} ${d.est_apellido}</b> ha completado 
                satisfactoriamente el curso <b>${d.titulo}</b> obteniendo la nota de 
                <b>${d.nota}</b>. En reconocimiento a su esfuerzo se le otorga este certificado.
                <br><br>¡Felicidades!
            </p>
        `;

        const imgs = div.querySelectorAll("img");
        let cargas = 0;

        imgs.forEach(img => {
            const loader = new Image();
            loader.onload = () => {
                cargas++;
                if (cargas === imgs.length) {
                    if (accion === "print") {
                        setTimeout(() => window.print(), 200);
                    }
                    if (accion === "pdf") {
                        descargarPDFCert(div.innerHTML);
                    }
                }
            };
            loader.onerror = () => {
                cargas++;
                if (cargas === imgs.length) {
                    if (accion === "print") {
                        setTimeout(() => window.print(), 200);
                    }
                    if (accion === "pdf") {
                        descargarPDFCert(div.innerHTML);
                    }
                }
            };
            loader.src = img.src;
        });
    })
    .catch(e => console.error(e));
}

function descargarPDFCert(html) {
    const w = window.open("", "_blank");
    w.document.write(`
        <html>
            <head><title>Certificado</title></head>
            <body>${html}</body>
        </html>
    `);
    w.document.close();
    w.print();
}

function recompensas(id_user) {
    // Implementar función de recompensas si es necesario
}

function darBaja(id_user) {
    // Implementar función de dar de baja si es necesario
}

// ==================== FUNCIÓN PARA CERRAR SESIÓN ====================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Obtener el ID del estudiante
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (idEstudiante) {
            // ✅ Registrar CIERRE - ESPERAR a que se complete
            fetch("php/bitUsuario.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "CIERRE",
                    id_user: idEstudiante
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log("Cierre registrado:", result);
            })
            .catch(error => {
                console.error("Error en bitácora:", error);
            })
            .finally(() => {
                // ✅ Esto se ejecuta DESPUÉS de intentar registrar bitácora
                localStorage.removeItem('id_user');
                sessionStorage.removeItem('id_user');
                window.location.href = "inicio.html";
            });
        } else {
            // Si no hay ID, simplemente redirigir
            localStorage.removeItem('id_user');
            sessionStorage.removeItem('id_user');
            window.location.href = "inicio.html";
        }
    }
}
// Esta función ya existe y está bien
function inicioCierre(accion, id_user) {
    const data = {
        accion: accion.toUpperCase(),
        id_user: id_user
    };

    fetch("php/bitUsuario.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.exito) {
            console.log("Bitácora registrada:", result.mensaje);
        } else {
            console.error("Error al registrar bitácora:", result.mensaje);
        }
    })
    .catch(error => {
        console.error("Error en la conexión con el servidor:", error);
    });
}
// ==================== FUNCIONES DEL MENÚ DE OPCIONES ====================
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
        {texto: "Asignar Maestro", accion: "asignarMaestro"}
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
    
    switch(accion) {
        case 'editarCurso':
            alert(`Editando: ${tituloCurso}`);
            break;
        case 'eliminarCurso':
            if (confirm(`¿Eliminar ${tituloCurso}?`)) {
                eliminarCurso( idCurso, tituloCurso);
            }
            break;
        case 'asignarMaestro':
            asignarMaestro(idCurso, tituloCurso);
            break;
        default:
            break;
    }
    
    const menu = document.getElementById('opcionesMenu');
    if (menu) menu.classList.remove('mostrar');
}

function asignarMaestro(idCurso, tituloCurso) {
    const botones = document.getElementById("botones");
    botones.innerHTML = `
        <button class="shiny" onclick="guardarMaestroCurso(${idCurso})">Guardar Maestro</button>
        <button class="back" onclick="back()">Cancelar</button>
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
                <tbody id="tabla-maestros"></tbody>
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
                        <input type="radio" name="maestroSeleccionado" value="${maestro.id_user}" class="radio-maestro">
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

function guardarMaestroCurso(idCurso) {
    const radioSeleccionado = document.querySelector('input[name="maestroSeleccionado"]:checked');
    
    if (!radioSeleccionado) {
        alert("Por favor, selecciona un maestro para este curso");
        return;
    }

    const idMaestro = Number(radioSeleccionado.value);
    console.log(idMaestro, idCurso);
    if (!confirm("¿Estás seguro de asignar este maestro al curso?")) {
        return;
    }

    const datos = { idCurso, idMaestro };

    fetch("php/pcAsignarMaestro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje || data.message);
        if (data.exito || data.success) curso();
    })
    .catch(err => {
        console.error("Error al asignar maestro:", err);
        alert("Error al asignar el maestro al curso");
    });
}

// Función para ejecutar acciones en cursos de periodo
function ejecutarAccionPCurso(accion, idPeriodoCurso, tituloCurso) {
    console.log('Ejecutando:', accion, 'para:', tituloCurso);
    
    switch(accion) {
        case 'darDeBaja':
            if (confirm(`¿Dar de baja el curso "${tituloCurso}"?`)) {
                // Implementar lógica para dar de baja
                alert(`Curso "${tituloCurso}" dado de baja`);
            }
            break;
        case 'verCertificados':
            alert(`Mostrando certificados para: ${tituloCurso}`);
            break;
        default:
            break;
    }
    
    const menu = document.getElementById('opcionesMenu');
    if (menu) menu.classList.remove('mostrar');
}