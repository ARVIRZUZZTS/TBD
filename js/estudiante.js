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
            
            if (targetTab === 'cursos') {
                cargarCursosEstudiante();
            }
            if (targetTab === 'inscripcion') {
                cargarInscripciones();
            }
        }
    });
});
    
    cargarDatosEstudiante();
});
async function cargarDatosEstudiante() {
    
    try {
        
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            console.error(' No se encontró ID de estudiante en el storage');
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
            
            document.getElementById('nombre-perfil').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            document.getElementById('correo-perfil').textContent = estudiante.correo || 'No disponible';
            document.getElementById('rango-perfil').textContent = 
                `Rango: ${estudiante.rango_actual}`;
            
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
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        window.location.href = "inicio.html";
    }
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
        
        //console.log("manden ayuda xd"+"Respuesta del servidor:", response);
        
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
        cursoCard.className = 'course-card'; // Cambiamos a course-card
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
            
            <button class="shiny course-button">Acceder al Curso</button>
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
    
    // Asegurarnos de que las fechas sean válidas
    if (isNaN(inicio) || isNaN(fin)) return 0;
    
    const duracionTotal = fin - inicio;
    const tiempoTranscurrido = hoy - inicio;
    
    if (duracionTotal <= 0) return 100; // Si ya terminó
    
    let porcentaje = (tiempoTranscurrido / duracionTotal) * 100;
    
    // Limitar entre 0% y 100%
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

//  ================================= Detalle del Curso ============================ (lo ultimo que toque xd)

// Función para abrir la vista detallada del curso
function abrirDetalleCurso(idPeriodoCurso) {
    // Ocultar todas las vistas primero
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Crear o mostrar la vista detallada
    let detalleView = document.getElementById('curso-detalle');
    if (!detalleView) {
        detalleView = document.createElement('div');
        detalleView.id = 'curso-detalle';
        detalleView.className = 'tab-content active';
        document.getElementById('dinamic').appendChild(detalleView);
    } else {
        detalleView.classList.add('active');
        // Limpiar contenido anterior
        detalleView.innerHTML = '';
    }
    
    cargarDetalleCurso(idPeriodoCurso);
}

// Función para cargar los datos del curso detallado
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

        // Cargar datos del curso, tareas y evaluaciones
        const [cursoData, tareasData, evaluacionesData] = await Promise.all([
            fetch(`php/cursoDetalleGet.php?id_periodo_curso=${idPeriodoCurso}`).then(r => r.json()),
            fetch(`php/tareasGetByCurso.php?id_periodo_curso=${idPeriodoCurso}`).then(r => r.json()),
            fetch(`php/evaluacionesGetByCurso.php?id_periodo_curso=${idPeriodoCurso}`).then(r => r.json())
        ]);

        if (cursoData.exito) {
            document.getElementById('curso-detalle-titulo').textContent = cursoData.curso.nombre_curso;
        }

        // Combinar y mostrar todas las actividades
        mostrarActividadesCurso(tareasData.tareas || [], evaluacionesData.evaluaciones || []);

        // Configurar filtros
        configurarFiltros();

    } catch (error) {
        console.error('Error al cargar detalle del curso:', error);
        document.getElementById('lista-actividades').innerHTML = `
            <div class="error">Error al cargar el curso</div>
        `;
    }
}

// Función para mostrar actividades combinadas
function mostrarActividadesCurso(tareas, evaluaciones) {
    const listaActividades = document.getElementById('lista-actividades');
    
    // Combinar y ordenar por fecha
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
}

// Función para crear card de tarea
function crearCardTarea(tarea) {
    const fechaEntrega = formatearFecha(tarea.fecha_entrega, tarea.hora_entrega);
    
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
                </div>
            </div>
            <div class="actividad-actions">
                <button class="shiny small">Ver Detalles</button>
                <button class="back small">Descargar Material</button>
            </div>
        </div>
    `;
}

// Función para crear card de evaluación
function crearCardEvaluacion(evaluacion) {
    const fechaInicio = formatearFecha(evaluacion.fecha_inicio, evaluacion.hora_inicio);
    const fechaEntrega = formatearFecha(evaluacion.fecha_entrega, evaluacion.hora_entrega);
    
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
                </div>
            </div>
            <div class="actividad-actions">
                <button class="shiny small">Comenzar Evaluación</button>
                <button class="back small">Instrucciones</button>
            </div>
        </div>
    `;
}

// Función para formatear fechas
function formatearFecha(fecha, hora) {
    if (!fecha) return 'No especificada';
    
    const fechaObj = new Date(fecha + 'T00:00:00');
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
    
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}

// Configurar filtros
function configurarFiltros() {
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los botones
            filtroBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            const filtro = this.getAttribute('data-filtro');
            filtrarActividades(filtro);
        });
    });
}

// Función para filtrar actividades
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

// Función para volver a la vista de cursos
function volverACursos() {
    const detalleView = document.getElementById('curso-detalle');
    if (detalleView) {
        detalleView.classList.remove('active');
        detalleView.innerHTML = ''; 
    }
    
    document.getElementById('cursos').classList.add('active');
    
    cargarCursosEstudiante();
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

async function inscribirEnCurso(idPeriodoCurso) {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            alert('Debes iniciar sesión para inscribirte');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres inscribirte en este curso?')) {
            return;
        }
        
        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_periodo_curso', idPeriodoCurso);
        
        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.exito) {
            alert('¡Inscripción exitosa!');
            cargarInscripciones();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al inscribirse:', error);
        alert('Error al realizar la inscripción');
    }
}