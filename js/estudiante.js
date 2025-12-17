document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        if (targetTab) {
            const detalleView = document.getElementById('curso-detalle');
            if (detalleView) {
                detalleView.remove(); 
            }
             
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetElement = document.getElementById(targetTab);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Agregar las llamadas a las funciones aquí:
            if (targetTab === 'cursos') {
                cargarCursosEstudiante();
            }
            if (targetTab === 'inscripcion') {
                cargarInscripciones();
            }
            if (targetTab === 'tienda') {
                cargarTienda();
            }
            document.addEventListener('click', function(e) {
               if (e.target.classList.contains('canjear-descuento-btn')) {
                    const idDescuento = e.target.getAttribute('data-descuento-id');
                    const costo = e.target.getAttribute('data-descuento-costo');
                    canjearDescuento(idDescuento, parseInt(costo)); // Pasar el string directamente
                }
                            
                // Botones de aceptar beca
                if (e.target.classList.contains('aceptar-beca-btn')) {
                    const idBeca = e.target.getAttribute('data-beca-id');
                    aceptarBeca(parseInt(idBeca));
                }
            });
        }
    });
});
    
    cargarDatosEstudiante();
});

async function cargarDatosEstudiante() {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            console.error('No se encontró ID de estudiante en el storage');
            document.getElementById('nombre-estudiante').textContent = 'Estudiante';
            document.getElementById('nombre-perfil').textContent = 'Estudiante';
            return;
        }
        
        const response = await fetch(`php/estudianteGet.php?id_user=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.exito && data.estudiante) {
            const estudiante = data.estudiante;
            
            document.getElementById('nombre-estudiante').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            
            document.getElementById('nombre-perfil').textContent = `${estudiante.nombre} ${estudiante.apellido}`;
            document.getElementById('correo-perfil').textContent = estudiante.correo || 'No disponible';
            document.getElementById('rango-perfil').textContent = `Rango: ${estudiante.rango_actual}`;
            
            document.getElementById('saldo-actual').textContent = estudiante.saldo_actual;
            document.getElementById('puntos-totales').textContent = estudiante.puntos_totales;
            document.getElementById('puntos-gastados').textContent = estudiante.puntos_gastados;
            
            const iniciales = (estudiante.nombre.charAt(0) + estudiante.apellido.charAt(0)).toUpperCase();
            document.getElementById('avatar-iniciales').textContent = iniciales;
            
        } else {
            document.getElementById('nombre-estudiante').textContent = 'Estudiante no encontrado';
            document.getElementById('nombre-perfil').textContent = 'Usuario no encontrado';
        }
    } catch (error) {
        document.getElementById('nombre-estudiante').textContent = 'Error de conexión';
        document.getElementById('nombre-perfil').textContent = 'Error al cargar datos';
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        const id_user = localStorage.getItem('id_user');
        inicioCierre("CIERRE", id_user);
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        window.location.href = "inicio.html";
    }
}
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

async function cargarCursosEstudiante() {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        console.log("ID Estudiante desde storage:", idEstudiante);
        
        if (!idEstudiante) {
            console.error('No se encontró ID de estudiante en storage');
            mostrarCursosVacios();
            return;
        }
        
        const response = await fetch(`php/cursoEstudianteGet.php?id_estudiante=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Datos recibidos:", data);
        
        if (data.exito && data.cursos && data.cursos.length > 0) {
            console.log("Cursos encontrados:", data.cursos);
            mostrarCursos(data.cursos);
        } else {
            console.log("No hay cursos o respuesta vacía");
            mostrarCursosVacios(data.mensaje || "No tienes cursos asignados");
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarCursosVacios("Error al cargar los cursos");
    }
}

function mostrarCursos(cursos) {
    const cursosContainer = document.querySelector('#cursos .content-grid');
    cursosContainer.innerHTML = '';
    
    cursos.forEach(curso => {
        const porcentajeProgreso = calcularProgresoCurso(curso.fecha_inicio, curso.fecha_fin);
        const diasRestantes = calcularDiasRestantes(curso.fecha_fin);
        
        const cursoCard = document.createElement('div');
        cursoCard.className = 'course-card';
        cursoCard.innerHTML = `
            <div class="course-header">
                <h3 class="course-title">${curso.nombre_curso}</h3>
                <div class="course-stats">
                    <div class="course-stat">
                        <span class="course-stat-number">${curso.total_tareas || 0}</span>
                        <span class="course-stat-label">Tareas</span>
                    </div>
                    <div class="course-stat">
                        <span class="course-stat-number">${curso.total_evaluaciones || 0}</span>
                        <span class="course-stat-label">Evaluaciones</span>
                    </div>
                </div>
            </div>
            
            <div class="course-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${porcentajeProgreso}%"></div>
                </div>
                <div class="progress-percentage">${porcentajeProgreso}% completado</div>
            </div>
            
            <div class="course-info-grid">
                <div class="info-group">
                    <span class="info-label">Profesor:</span>
                    <span class="info-value">${curso.nombre_profesor} ${curso.apellido_profesor}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Asistencia:</span>
                    <span class="info-value">${curso.asistencia || 0}%</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Nota:</span>
                    <span class="info-value">${curso.nota || 'N/A'}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Días restantes:</span>
                    <span class="info-value">${diasRestantes}</span>
                </div>
            </div>
            
            <div class="course-points">
                <div class="point-item">
                    <span class="point-value">${curso.deskPoints || 0}</span>
                    <span class="point-label">Desk Points</span>
                </div>
                <div class="point-item">
                    <span class="point-value">${curso.rankingPoints || 0}</span>
                    <span class="point-label">Ranking Points</span>
                </div>
            </div>
            
            <button class="shiny course-button" onclick="abrirDetalleCurso(${curso.id_periodo_curso})">Acceder al Curso</button>
        `;
        cursosContainer.appendChild(cursoCard);
    });
}

function mostrarCursosVacios(mensaje = "No tienes cursos asignados") {
    const cursosContainer = document.querySelector('#cursos .content-grid');
    cursosContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>Contacta con administración para más información.</p>
        </div>
    `;
}

function calcularProgresoCurso(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    if (isNaN(inicio) || isNaN(fin)) return 0;
    
    const duracionTotal = fin - inicio;
    const tiempoTranscurrido = hoy - inicio;
    
    if (duracionTotal <= 0) return 100;
    
    let porcentaje = (tiempoTranscurrido / duracionTotal) * 100;
    
    return Math.min(100, Math.max(0, Math.round(porcentaje)));
}

function calcularDiasRestantes(fechaFin) {
    if (!fechaFin) return 'N/A';
    
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    if (isNaN(fin)) return 'N/A';
    
    const diferencia = fin - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'Finalizado';
    if (diasRestantes === 0) return 'Hoy';
    if (diasRestantes === 1) return '1 día';
    
    return `${diasRestantes} días`;
}

function abrirDetalleCurso(idPeriodoCurso) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    let detalleView = document.getElementById('curso-detalle');
    if (!detalleView) {
        detalleView = document.createElement('div');
        detalleView.id = 'curso-detalle';
        detalleView.className = 'tab-content active';
        document.getElementById('dinamic').appendChild(detalleView);
    } else {
        detalleView.classList.add('active');
        detalleView.innerHTML = '';
    }
    
    cargarDetalleCurso(idPeriodoCurso);
}

async function cargarDetalleCurso(idPeriodoCurso) {
    try {
        const detalleView = document.getElementById('curso-detalle');
        detalleView.innerHTML = `
            <div class="curso-detalle-header">
                <button class="back-button" onclick="volverACursos()">← Volver a Mis Cursos</button>
                <h1 id="curso-detalle-titulo">Cargando...</h1>
                <div class="filtros-curso">
                    <button class="filtro-btn active" data-filtro="todos">Todos</button>
                    <button class="filtro-btn" data-filtro="tareas">Tareas</button>
                    <button class="filtro-btn" data-filtro="evaluaciones">Evaluaciones</button>
                </div>
            </div>
            <div class="contenido-curso">
                <div class="lista-actividades" id="lista-actividades">
                    <div class="loading">Cargando actividades...</div>
                </div>
            </div>
        `;

        const [cursoData, evaluacionesData] = await Promise.all([
            fetch(`php/cursoDetalleGet.php?id_periodo_curso=${idPeriodoCurso}`).then(r => r.json()),
            fetch(`php/evaluacionesGetByCurso.php?id_periodo_curso=${idPeriodoCurso}`).then(r => r.json())
        ]);

        let tareasData = { exito: false, tareas: [] };
        try {
            const tareasResponse = await fetch(`php/tareasGetByCurso.php?id_periodo_curso=${idPeriodoCurso}`);
            const responseText = await tareasResponse.text();
            
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                tareasData = JSON.parse(responseText);
            } else {
                tareasData = { exito: false, tareas: [], mensaje: 'Error en el servidor' };
            }
        } catch (tareasError) {
            tareasData = { exito: false, tareas: [] };
        }

        if (cursoData.exito) {
            document.getElementById('curso-detalle-titulo').textContent = cursoData.curso.nombre_curso;
        }

        mostrarActividadesCurso(tareasData.tareas || [], evaluacionesData.evaluaciones || []);
        configurarFiltros();

    } catch (error) {
        console.error('Error al cargar detalle del curso:', error);
        document.getElementById('lista-actividades').innerHTML = `
            <div class="error">Error al cargar el curso: ${error.message}</div>
        `;
    }
}

function mostrarActividadesCurso(tareas, evaluaciones) {
    const listaActividades = document.getElementById('lista-actividades');
    
    const todasActividades = [
        ...tareas.map(t => ({ ...t, tipo: 'tarea' })),
        ...evaluaciones.map(e => ({ ...e, tipo: 'evaluacion' }))
    ].sort((a, b) => {
        const fechaA = a.fecha_entrega || a.fecha_inicio;
        const fechaB = b.fecha_entrega || b.fecha_inicio;
        return new Date(fechaA) - new Date(fechaB);
    });

    if (todasActividades.length === 0) {
        listaActividades.innerHTML = `
            <div class="sin-actividades">
                <h3>No hay actividades disponibles</h3>
                <p>El profesor aún no ha publicado tareas o evaluaciones.</p>
            </div>
        `;
        return;
    }

    listaActividades.innerHTML = todasActividades.map(actividad => {
        if (actividad.tipo === 'tarea') {
            return crearCardTarea(actividad);
        } else {
            return crearCardEvaluacion(actividad);
        }
    }).join('');
    
    configurarDescargas();
}

function crearCardTarea(tarea) {
    const fechaEntrega = formatearFecha(tarea.fecha_entrega, tarea.hora_entrega);
    const tieneArchivo = tarea.archivo_url && tarea.archivo_url !== '';
    
    return `
        <div class="actividad-card tarea" data-tipo="tarea">
            <div class="actividad-header">
                <h3>${tarea.titulo}</h3>
                <span class="actividad-badge tarea-badge">Tarea</span>
            </div>
            <div class="actividad-info">
                <p class="actividad-descripcion">${tarea.descripcion || 'Sin descripción'}</p>
                <div class="actividad-meta">
                    <div class="fecha-info">
                        <strong>Entrega:</strong> ${fechaEntrega}
                    </div>
                    <div class="modulo-info">
                        <strong>Módulo:</strong> ${tarea.modulo_titulo || 'General'}
                    </div>
                    ${tieneArchivo ? `
                        <div class="archivo-info">
                            <strong>Archivo adjunto:</strong> 
                            <span class="archivo-nombre">${tarea.archivo_nombre || 'Material de apoyo'}</span>
                            <small>Tamaño: ${formatFileSize(tarea.archivo_tamanio)}</small>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="actividad-actions">
                <button class="shiny small">Ver Detalles</button>
                ${tieneArchivo ? `
                    <button class="back small descargar-archivo" 
                            data-archivo="${tarea.archivo_url.replace('uploads/', '')}"
                            data-nombre="${tarea.archivo_nombre || 'archivo_descargado'}">
                        Descargar Material
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function crearCardEvaluacion(evaluacion) {
    const fechaInicio = formatearFecha(evaluacion.fecha_inicio, evaluacion.hora_inicio);
    const fechaEntrega = formatearFecha(evaluacion.fecha_entrega, evaluacion.hora_entrega);
    const tieneArchivo = evaluacion.archivo_url && evaluacion.archivo_url !== '';
    
    return `
        <div class="actividad-card evaluacion" data-tipo="evaluacion">
            <div class="actividad-header">
                <h3>${evaluacion.titulo}</h3>
                <span class="actividad-badge evaluacion-badge">Evaluación</span>
            </div>
            <div class="actividad-info">
                <p class="actividad-descripcion">${evaluacion.descripcion || 'Sin descripción'}</p>
                <div class="actividad-meta">
                    <div class="fecha-info">
                        <strong>Inicio:</strong> ${fechaInicio}
                    </div>
                    <div class="fecha-info">
                        <strong>Entrega:</strong> ${fechaEntrega}
                    </div>
                    <div class="puntos-info">
                        <strong>Desk Points:</strong> ${evaluacion.deskpoints || 0}
                    </div>
                    <div class="modulo-info">
                        <strong>Módulo:</strong> ${evaluacion.modulo_titulo || 'General'}
                    </div>
                    ${tieneArchivo ? `
                        <div class="archivo-info">
                            <strong>Archivo adjunto:</strong> 
                            <span class="archivo-nombre">${evaluacion.archivo_nombre || 'Material de evaluación'}</span>
                            <small>Tamaño: ${formatFileSize(evaluacion.archivo_tamanio)}</small>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="actividad-actions">
                <button class="shiny small">Comenzar Evaluación</button>
                ${tieneArchivo ? `
                    <button class="back small descargar-archivo" 
                            data-archivo="${evaluacion.archivo_url.replace('uploads/', '')}"
                            data-nombre="${evaluacion.archivo_nombre || 'archivo_evaluacion'}">
                        Descargar Material
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function formatearFecha(fecha, hora) {
    if (!fecha) return 'No especificada';
    
    const fechaObj = new Date(fecha + 'T00:00:00');
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
    
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}

function configurarFiltros() {
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filtroBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filtro = this.getAttribute('data-filtro');
            filtrarActividades(filtro);
        });
    });
}

function filtrarActividades(filtro) {
    const actividades = document.querySelectorAll('.actividad-card');
    
    actividades.forEach(actividad => {
        switch (filtro) {
            case 'todos':
                actividad.style.display = 'block';
                break;
            case 'tareas':
                actividad.style.display = actividad.dataset.tipo === 'tarea' ? 'block' : 'none';
                break;
            case 'evaluaciones':
                actividad.style.display = actividad.dataset.tipo === 'evaluacion' ? 'block' : 'none';
                break;
        }
    });
}

function volverACursos() {
    const detalleView = document.getElementById('curso-detalle');
    if (detalleView) {
        detalleView.classList.remove('active');
        detalleView.innerHTML = ''; 
    }
    
    document.getElementById('cursos').classList.add('active');
    cargarCursosEstudiante();
}

function configurarDescargas() {
    document.querySelectorAll('.descargar-archivo').forEach(button => {
        button.addEventListener('click', function() {
            const archivoUrl = this.getAttribute('data-archivo');
            const nombreArchivo = this.getAttribute('data-nombre');
            manejarDescargaArchivo(archivoUrl, nombreArchivo);
        });
    });
}

function manejarDescargaArchivo(archivoUrl, nombreArchivo) {
    if (!archivoUrl) {
        alert('No hay archivo disponible para descargar');
        return;
    }
    
    const urlDescarga = `php/descargar.php?archivo=${encodeURIComponent(archivoUrl)}`;

    const link = document.createElement('a');
    link.href = urlDescarga;
    link.download = nombreArchivo || 'archivo_descargado';
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function cargarInscripciones() {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            mostrarInscripcionesVacios("Debes iniciar sesión");
            return;
        }
        
        const response = await fetch(`php/inscripcionesGet.php?id_estudiante=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.exito && data.cursos && data.cursos.length > 0) {
            mostrarCursosInscripciones(data.cursos, data.grado_estudiante);
        } else {
            mostrarInscripcionesVacios(data.mensaje || "No hay cursos disponibles para tu grado");
        }
    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        mostrarInscripcionesVacios("Error al cargar los cursos disponibles");
    }
}

function mostrarCursosInscripciones(cursos, gradoEstudiante) {
    const inscripcionesContainer = document.querySelector('#inscripcion .content-grid');
    inscripcionesContainer.innerHTML = `
        <div class="content-card">
            <h3>Cursos Disponibles - Grado: ${gradoEstudiante}</h3>
            <p>Encuentra aquí los cursos disponibles para tu grado académico.</p>
        </div>
    `;
    
    cursos.forEach(curso => {
        const cuposDisponibles = curso.cupos - curso.cupos_ocupados;
        const fechaInicio = formatearFecha(curso.fecha_inicio);
        const fechaFin = formatearFecha(curso.fecha_fin);
        
        const cursoCard = document.createElement('div');
        cursoCard.className = 'course-card';
        cursoCard.innerHTML = `
            <div class="course-header">
                <h3 class="course-title">${curso.nombre_curso}</h3>
                <div class="course-stats">
                    <div class="course-stat">
                        <span class="course-stat-number">${cuposDisponibles}</span>
                        <span class="course-stat-label">Cupos</span>
                    </div>
                    <div class="course-stat">
                        <span class="course-stat-number">${curso.duracion}h</span>
                        <span class="course-stat-label">Duración</span>
                    </div>
                </div>
            </div>
            
            <div class="course-info-grid">
                <div class="info-group">
                    <span class="info-label">Profesor:</span>
                    <span class="info-value">${curso.nombre_profesor} ${curso.apellido_profesor}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Modalidad:</span>
                    <span class="info-value">${curso.modalidad === 'P' ? 'Presencial' : 'Virtual'}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Categoría:</span>
                    <span class="info-value">${curso.nombre_categoria}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Grado:</span>
                    <span class="info-value">${curso.nombre_grado}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Inicio:</span>
                    <span class="info-value">${fechaInicio}</span>
                </div>
                <div class="info-group">
                    <span class="info-label">Fin:</span>
                    <span class="info-value">${fechaFin}</span>
                </div>
            </div>
            
            <div class="course-points">
                <div class="point-item">
                    <span class="point-value">${curso.costo || 0} Bs</span>
                    <span class="point-label">Costo</span>
                </div>
                <div class="point-item">
                    <span class="point-value">${cuposDisponibles}</span>
                    <span class="point-label">Cupos Disponibles</span>
                </div>
            </div>
            
            <button class="shiny course-button" onclick="inscribirEnCurso(${curso.id_periodo_curso})">
                Inscribirse
            </button>
        `;
        inscripcionesContainer.appendChild(cursoCard);
    });
}

function mostrarInscripcionesVacios(mensaje) {
    const inscripcionesContainer = document.querySelector('#inscripcion .content-grid');
    inscripcionesContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>No hay cursos disponibles para inscripción en este momento.</p>
        </div>
    `;
}

let cursoSeleccionadoParaInscripcion = null;

function mostrarModalPago(curso) {
    cursoSeleccionadoParaInscripcion = curso;
    
    let modal = document.getElementById('modal-pago');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-pago';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmar Inscripción y Pago</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="info-curso-modal">
                        <h3 id="modal-curso-nombre">${curso.nombre_curso}</h3>
                        <p><strong>Profesor:</strong> ${curso.nombre_profesor} ${curso.apellido_profesor}</p>
                        <p><strong>Duración:</strong> ${curso.duracion} horas</p>
                        <p><strong>Modalidad:</strong> ${curso.modalidad === 'P' ? 'Presencial' : 'Virtual'}</p>
                        <div class="costo-info">
                            <h4>Costo: <span id="modal-curso-costo">${curso.costo || 0}</span> Bs</h4>
                        </div>
                    </div>
                    <div class="metodo-pago">
                        <h4>Método de Pago (Simulado)</h4>
                        <div class="opciones-pago">
                            <label>
                                <input type="radio" name="metodo-pago" value="tarjeta" checked>
                                Tarjeta de Crédito/Débito
                            </label>
                            <label>
                                <input type="radio" name="metodo-pago" value="transferencia">
                                Transferencia Bancaria
                            </label>
                            <label>
                                <input type="radio" name="metodo-pago" value="efectivo">
                                Pago en Efectivo
                            </label>
                        </div>
                        <div class="info-pago-simulado">
                            <p><em>Este es un pago simulado. No se realizará ningún cargo real.</em></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="back" id="cancelar-pago">Cancelar</button>
                    <button class="shiny" id="confirmar-pago">Confirmar Pago e Inscripción</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', cerrarModalPago);
        modal.querySelector('#cancelar-pago').addEventListener('click', cerrarModalPago);
        modal.querySelector('#confirmar-pago').addEventListener('click', confirmarPago);
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalPago();
            }
        });
    } else {
        document.getElementById('modal-curso-nombre').textContent = curso.nombre_curso;
        document.getElementById('modal-curso-costo').textContent = curso.costo || 0;
    }
    
    modal.style.display = 'block';
}

function cerrarModalPago() {
    const modal = document.getElementById('modal-pago');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function confirmarPago() {
    try {
        const confirmarBtn = document.getElementById('confirmar-pago');
        const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
        
        confirmarBtn.textContent = 'Procesando pago...';
        confirmarBtn.disabled = true;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const formData = new FormData();
        formData.append('id_estudiante', localStorage.getItem('id_user') || sessionStorage.getItem('id_user'));
        formData.append('id_periodo_curso', cursoSeleccionadoParaInscripcion.id_periodo_curso);
        
        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        cerrarModalPago();
        
        if (data.exito) {
            alert('Inscripción exitosa. Pago procesado correctamente.');
            cargarInscripciones();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error en pago:', error);
        alert('Error al procesar el pago');
    } finally {
        const confirmarBtn = document.getElementById('confirmar-pago');
        if (confirmarBtn) {
            confirmarBtn.textContent = 'Confirmar Pago e Inscripción';
            confirmarBtn.disabled = false;
        }
    }
}

async function inscribirEnCurso(idPeriodoCurso) {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            alert('Debes iniciar sesión para inscribirte');
            return;
        }
        
        const response = await fetch(`php/inscripcionesGet.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();
        
        if (data.exito && data.cursos) {
            const curso = data.cursos.find(c => c.id_periodo_curso === idPeriodoCurso);
            if (curso) {
                mostrarModalPago(curso);
                return;
            }
        }
        
        alert('Curso no encontrado');
        
    } catch (error) {
        console.error('Error al preparar inscripción:', error);
        alert('Error al cargar información del curso');
    }
}
async function cargarTienda() {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            mostrarTiendaVacia("Debes iniciar sesión");
            return;
        }

        console.log("Cargando tienda para estudiante:", idEstudiante);

        // Cargar todo en paralelo
        const [descuentosResponse, becasResponse, puntosResponse] = await Promise.all([
            fetch(`php/tiendaGetDescuentos.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetBecas.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetPuntos.php?id_estudiante=${idEstudiante}`)
        ]);

        // Obtener el texto de las respuestas primero para debuggear
        const descuentosText = await descuentosResponse.text();
        const becasText = await becasResponse.text();
        const puntosText = await puntosResponse.text();

        console.log("Respuesta descuentos:", descuentosText);
        console.log("Respuesta becas:", becasText);
        console.log("Respuesta puntos:", puntosText);

        // Parsear JSON
        let descuentosData, becasData, puntosData;

        try {
            descuentosData = JSON.parse(descuentosText);
        } catch (e) {
            console.error("Error parseando descuentos:", e);
            descuentosData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        try {
            becasData = JSON.parse(becasText);
        } catch (e) {
            console.error("Error parseando becas:", e);
            becasData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        try {
            puntosData = JSON.parse(puntosText);
        } catch (e) {
            console.error("Error parseando puntos:", e);
            puntosData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        // Verificar si todas las respuestas fueron exitosas
        if (descuentosData.exito && becasData.exito && puntosData.exito) {
            mostrarTienda(
                descuentosData.descuentos || [],
                becasData.becas || [],
                puntosData.puntos_estudiante || 0
            );
        } else {
            const errores = [];
            if (!descuentosData.exito) errores.push("Descuentos: " + (descuentosData.mensaje || "Error desconocido"));
            if (!becasData.exito) errores.push("Becas: " + (becasData.mensaje || "Error desconocido"));
            if (!puntosData.exito) errores.push("Puntos: " + (puntosData.mensaje || "Error desconocido"));
            
            throw new Error(errores.join("; "));
        }

    } catch (error) {
        console.error('Error completo al cargar tienda:', error);
        mostrarTiendaVacia("Error al cargar la tienda: " + error.message);
    }
}
function mostrarTienda(descuentos, becas, puntosEstudiante) {
    const tiendaContainer = document.querySelector('#tienda .content-grid');
    
    tiendaContainer.innerHTML = `
        <div class="content-card">
            <h3>Tus Puntos Disponibles</h3>
            <div class="puntos-disponibles">
                <span class="puntos-totales">${puntosEstudiante}</span>
                <span class="puntos-label">Desk Points</span>
            </div>
        </div>
    `;

    // Mostrar descuentos
    if (descuentos.length > 0) {
        const descuentosCard = document.createElement('div');
        descuentosCard.className = 'content-card';
        
        let descuentosHTML = `
            <h3>Descuentos Disponibles</h3>
            <div class="descuentos-lista">
        `;
        
        descuentos.forEach(descuento => {
            descuentosHTML += `
                <div class="descuento-item">
                    <div class="descuento-info">
                        <h4>${descuento.nombre_curso}</h4>
                        <p><strong>Descuento:</strong> ${descuento.porcentaje_descuento}%</p>
                        <p><strong>Profesor:</strong> ${descuento.nombre_profesor}</p>
                        <p><strong>Categoría:</strong> ${descuento.nombre_categoria}</p>
                        <p><strong>Área:</strong> ${descuento.nombre_area}</p>
                        <p><strong>Válido hasta:</strong> ${formatearFecha(descuento.fecha_fin)}</p>
                    </div>
                    <div class="descuento-precio">
                        <span class="costo-puntos">${descuento.costo_canje} Points</span>
                        <button class="shiny small canjear-descuento-btn" 
                                data-descuento-id="${descuento.id_descuento}" 
                                data-descuento-costo="${descuento.costo_canje}">
                            Canjear
                        </button>
                    </div>
                </div>
            `;
        });
        
        descuentosHTML += '</div>';
        descuentosCard.innerHTML = descuentosHTML;
        tiendaContainer.appendChild(descuentosCard);
    }

    // Mostrar becas
    if (becas.length > 0) {
        const becasCard = document.createElement('div');
        becasCard.className = 'content-card';
        
        let becasHTML = `
            <h3>Tus Becas</h3>
            <div class="becas-lista">
        `;
        
        becas.forEach(beca => {
            becasHTML += `
                <div class="beca-item">
                    <div class="beca-info">
                        <h4>Beca para ${beca.nombre_area}</h4>
                        <p><strong>Porcentaje:</strong> ${beca.porcentaje}%</p>
                        <p><strong>Estado:</strong> ${beca.estado_beca}</p>
                        <p><strong>Asignada por:</strong> ${beca.admin_nombre || 'Admin'} ${beca.admin_apellido || ''}</p>
                        <p><strong>Válida hasta:</strong> ${formatearFecha(beca.fecha_fin)}</p>
                    </div>
                    ${beca.estado_beca === 'Pendiente' ? `
                        <button class="shiny small aceptar-beca-btn" data-beca-id="${beca.id_beca}">
                            Aceptar Beca
                        </button>
                    ` : '<span class="estado-aceptada">✓ Aceptada</span>'}
                </div>
            `;
        });
        
        becasHTML += '</div>';
        becasCard.innerHTML = becasHTML;
        tiendaContainer.appendChild(becasCard);
    }

    // Mensaje si no hay nada
    if (descuentos.length === 0 && becas.length === 0) {
        const vacioCard = document.createElement('div');
        vacioCard.className = 'content-card';
        vacioCard.innerHTML = `
            <h3>No hay descuentos o becas disponibles</h3>
            <p>Vuelve más tarde para ver nuevas ofertas.</p>
        `;
        tiendaContainer.appendChild(vacioCard);
    }
}

// Función para mostrar tienda vacía
function mostrarTiendaVacia(mensaje) {
    const tiendaContainer = document.querySelector('#tienda .content-grid');
    tiendaContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>No se pudieron cargar los descuentos y becas.</p>
        </div>
    `;
}

// Función para canjear descuento - VERSIÓN CORREGIDA PARA STRINGS
async function canjearDescuento(idDescuento, costo) {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!confirm(`¿Canjear este descuento por ${costo} puntos?`)) {
            return;
        }


        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_descuento', idDescuento); // Enviar como string

        const response = await fetch('php/canjearDescuento.php', {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text();
        console.log("Respuesta del servidor:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Error parseando JSON:", e);
            alert('Error en la respuesta del servidor');
            return;
        }

        if (data.exito) {
            alert('Descuento canjeado exitosamente');
            cargarTienda();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al canjear descuento:', error);
        alert('Error de conexión');
    }
}
// Función para aceptar beca
async function aceptarBeca(idBeca) {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!confirm('¿Aceptar esta beca?')) {
            return;
        }

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_beca', idBeca);

        const response = await fetch('php/aceptarBeca.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.exito) {
            alert('Beca aceptada exitosamente');
            cargarTienda(); // Recargar la vista
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al aceptar beca:', error);
        alert('Error al aceptar la beca');
    }
}

