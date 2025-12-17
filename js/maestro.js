const params = new URLSearchParams(window.location.search);
let usuario = params.get("usuario");

// Obtener ID del maestro desde localStorage o sessionStorage
window.id_maestro = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');

function showSection(sectionId) {
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        if (sectionId === 'current-courses') {
            loadMyCourses();
        } else if (sectionId === 'horarios') {
            // cargar horarios del maestro si la función está disponible
            if (typeof window.cargarHorariosMaestro === 'function') {
                window.cargarHorariosMaestro();
            }
        } else if (sectionId === 'entregas') {
            // cargar entregas del maestro si la función está disponible
            if (typeof window.cargarEntregasMaestro === 'function') {
                window.cargarEntregasMaestro();
            }
        } else if (sectionId === 'reportes') {
            // cargar reportes del maestro si la función está disponible // nuevo
            if (typeof window.cargarReportesMaestro === 'function') {
                window.cargarReportesMaestro();
            }
        }
    }
}

async function loadMyCourses() { // 43 Mae: Mis Cursos de Maestro 0
    const loadingElement = document.getElementById('courses-loading');
    const coursesContainer = document.getElementById('courses-container');
    const errorElement = document.getElementById('courses-error');
    
    loadingElement.style.display = 'block';
    coursesContainer.innerHTML = '';
    errorElement.style.display = 'none';

    let idMaestro = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
    
    fetch("php/pcGetByMaestro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMaestro })
    })
    .then(res => res.json())
    .then(data => {
        loadingElement.style.display = 'none';
        if (data.success) {
            if(data.cursos.length > 0){
                displayCourses(data.cursos);
            } else {
                coursesContainer.innerHTML = `
                    <div class="no-courses-message">
                        <div class="placeholder-icon">📚</div>
                        <h3>No hay cursos disponibles</h3>
                        <p>No se le han asignado cursos por el momento.</p>
                    </div>
                `;
            }
        }
    })
    .catch(err => {
        console.error('Error al cargar cursos:', err);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    });
}

function displayCourses(cursos) {
    const coursesContainer = document.getElementById('courses-container');
    
    if (cursos.length === 0) {
        coursesContainer.innerHTML = `
            <div class="no-courses-message">
                <div class="placeholder-icon">📚</div>
                <h3>No hay cursos disponibles</h3>
                <p>No se encontraron cursos en la base de datos.</p>
            </div>
        `;
        return;
    }
    
    const coursesHTML = cursos.map(curso => {
        const isPendiente = curso.estado === 'Pendiente';
       
        return `
        <div class="course-card available-course">
            <h3 class="course-title">${escapeHTML(curso.titulo)}</h3>
            <div class="course-details">
                <p class="course-info"><strong>Duración:</strong> ${curso.duracion}</p>
                <p class="course-info"><strong>Modalidad:</strong> ${escapeHTML(curso.modalidad)}</p>
                <p class="course-info"><strong>Categoría:</strong> ${escapeHTML(curso.categoria)}</p>
                <p class="course-info"><strong>Área:</strong> ${escapeHTML(curso.area)}</p>
                <p class="course-info"><strong>Grado:</strong> ${escapeHTML(curso.grado)}</p>
                <p class="course-info"><strong>Periodo:</strong> ${escapeHTML(curso.periodo)}</p>
                ${!isPendiente ? `
                    <p class="course-info"><strong>Inscritos:</strong> ${escapeHTML(curso.inscritos)}</p>
                ` : ''
                }
                <p class="course-info"><strong>Estado:</strong> ${escapeHTML(curso.estado)}</p>
            </div>
            <div class="action-buttons">
                ${isPendiente ? `
                    <button class="shiny accept-course" data-course-id="${curso.id_periodo_curso}" data-course-title="${escapeHTML(curso.titulo)}">Agregar Curso</button>
                ` : ''}
                ${!isPendiente ? `
                    <button class="shiny view-details" data-course-id="${curso.id_periodo_curso}" data-course-title="${escapeHTML(curso.titulo)}" data-course-inscritos="${escapeHTML(curso.inscritos)}">Ver Detalles</button>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
    
    coursesContainer.innerHTML = coursesHTML;
    
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            const courseTitle = this.getAttribute('data-course-title');
            const courseInscritos = this.getAttribute('data-course-inscritos');
            showCourseDetails(courseId, courseTitle, courseInscritos);
        });
    });
    
    document.querySelectorAll('.accept-course').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            const courseTitle = this.getAttribute('data-course-title');
            acceptCourse(courseId, courseTitle);
        });
    });
}

function acceptCourse(courseId, courseTitle) {

    const confirmModalHTML = `
        <div id="confirm-accept-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar Aceptación</h3>
                    <button class="modal-close" id="close-confirm-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>¿Desea aceptar el curso "<strong>${escapeHTML(courseTitle)}</strong>"?</p>
                    <div class="form-actions">
                        <button type="button" class="back" id="reject-course">No</button>
                        <button type="button" class="shiny" id="confirm-accept">Sí</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
    
    const confirmModal = document.getElementById('confirm-accept-modal');
    
    document.getElementById('close-confirm-modal').addEventListener('click', () => {
        confirmModal.remove();
    });
    
    document.getElementById('reject-course').addEventListener('click', () => {
        confirmModal.remove();
        deleteCourse(courseId, courseTitle);
    });
    
    document.getElementById('confirm-accept').addEventListener('click', () => {
        confirmModal.remove();
        showCourseDetailsModal(courseId, courseTitle);
    });
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.remove();
        }
    });
}

function showCourseDetailsModal(courseId, courseTitle) {
    const today = new Date().toISOString().split('T')[0];
    
    const detailsModalHTML = `
        <div id="course-details-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configurar Curso: ${escapeHTML(courseTitle)}</h3>
                    <button class="modal-close" id="close-details-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="course-details-form">
                        <div class="form-group">
                            <label for="fecha-inicio">Fecha de Inicio:</label>
                            <input type="date" id="fecha-inicio" name="fecha_inicio" required min="${today}">
                            <small>La fecha de inicio no puede ser anterior a la fecha actual</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="fecha-fin">Fecha de Fin:</label>
                            <input type="date" id="fecha-fin" name="fecha_fin" required>
                            <small>La fecha de fin debe ser al menos 2 semanas después de la fecha de inicio</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="cupos">Número de Cupos:</label>
                            <input type="number" id="cupos" name="cupos" required min="1" max="500" placeholder="Máximo 500 cupos">
                            <small>El número máximo de cupos permitido es 500</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-details">Cancelar</button>
                            <button type="submit" class="shiny">Aceptar Curso</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', detailsModalHTML);
    
    const detailsModal = document.getElementById('course-details-modal');
    const form = document.getElementById('course-details-form');
    
    document.getElementById('close-details-modal').addEventListener('click', () => {
        detailsModal.remove();
    });
    
    document.getElementById('cancel-details').addEventListener('click', () => {
        detailsModal.remove();
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitCourseAcceptance(courseId, courseTitle);
    });
    
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            detailsModal.remove();
        }
    });
}

function submitCourseAcceptance(courseId, courseTitle) {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    const cupos = parseInt(document.getElementById('cupos').value);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!fechaInicio || !fechaFin || !cupos) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    if (fechaInicio < today) {
        alert('La fecha de inicio no puede ser anterior a la fecha actual');
        return;
    }
    
    if (fechaFin <= fechaInicio) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
    }
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaMs = fin - inicio;
    const diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24);
    const diferenciaSemanas = diferenciaDias / 7;
    
    if (diferenciaSemanas < 2) {
        alert('La fecha de fin debe ser al menos 2 semanas después de la fecha de inicio');
        return;
    }
    
    if (cupos < 1 || cupos > 500) {
        alert('El número de cupos debe estar entre 1 y 500');
        return;
    }
    
    console.log('Aceptando curso:', {
        courseId,
        courseTitle,
        fechaInicio,
        fechaFin,
        cupos,
        diferenciaSemanas: diferenciaSemanas.toFixed(1)
    });
        
    fetch("php/pcAceptarCurso.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_periodo_curso: courseId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            cupos: cupos
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Curso aceptado exitosamente');
            document.getElementById('course-details-modal').remove();
            loadMyCourses();
        } else {
            alert('Error al aceptar curso: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al aceptar curso. Por favor, intente nuevamente.');
    });
    
    alert(`Curso "${courseTitle}" aceptado exitosamente con:\n- Fecha inicio: ${fechaInicio}\n- Fecha fin: ${fechaFin}\n- Cupos: ${cupos}\n- Duración: ${diferenciaDias} días (${diferenciaSemanas.toFixed(1)} semanas)`);
    document.getElementById('course-details-modal').remove();
    loadMyCourses(); 
}

function deleteCourse(courseId, courseTitle) {
    console.log('Rechazando curso:', courseId, courseTitle);
        
    fetch("php/pcDelete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Curso rechazado exitosamente');
            loadMyCourses();
        } else {
            alert('Error al rechazar curso: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al rechazar curso. Por favor, intente nuevamente.');
    });
    
    loadMyCourses();
}

function showCourseDetails(courseId, courseTitle, courseInscritos) { // 44 Mae: Ver Detalles de un Curso 43
    const contentArea = document.querySelector('.content-area');
    
    // Guardar el ID del curso actual en localStorage
    localStorage.setItem('current_course_id', courseId);
    
    // Si ya existe un panel de detalles abierto, eliminarlo antes de crear uno nuevo
    const existingCourseDetails = document.getElementById('course-details');
    if (existingCourseDetails) {
        existingCourseDetails.remove();
    }
    
    const courseDetailsHTML = `
        <div id="course-details">
            <div class="course-header">
                <div class="course-title-section">
                    <h2>${courseTitle}</h2>
                </div>
                <div class="course-stats">
                    <div class="inscritos-badge">
                        <span class="inscritos-count">${courseInscritos}</span>
                        <span class="inscritos-label">Estudiantes Inscritos</span>
                    </div>
                    <button class="shiny config-horario-btn" id="config-horario">
                        Configurar Horario
                    </button>
                </div>
            </div>
            
            <div class="course-actions">
                <button class="shiny action-btn" data-action="crear-modulo">
                    <span class="btn-icon">📚</span>
                    Crear Módulo
                </button>
                <button class="shiny action-btn" data-action="crear-tema">
                    <span class="btn-icon">📖</span>
                    Crear Tema
                </button>
                <button class="shiny action-btn" data-action="crear-evaluacion">
                    <span class="btn-icon">📊</span>
                    Crear Evaluación
                </button>
                <button class="shiny action-btn" data-action="crear-tarea">
                    <span class="btn-icon">📝</span>
                    Crear Tarea
                </button>
            </div>
            
            <div class="course-content">
                <div id="modules-container">
                    <div class="loading-message" id="modules-loading">
                        <div class="loading-spinner"></div>
                        <p>Cargando módulos...</p>
                    </div>
                    <div id="modules-list" class="modules-grid" style="display: none;"></div>
                    <div id="modules-empty" class="no-modules-message" style="display: none;">
                        <div class="placeholder-icon">📚</div>
                        <h3>No hay módulos creados</h3>
                        <p>Comienza creando tu primer módulo para este curso.</p>
                    </div>
                    <div id="modules-error" class="error-message" style="display: none;">
                        <p>Error al cargar los módulos. Por favor, intente nuevamente.</p>
                        <button class="shiny" id="retry-load-modules">Reintentar</button>
                    </div>
                </div>
            </div>
            
            <div class="back-to-courses">
                <button class="back" id="back-to-courses-list">← Volver a Mis Cursos</button>
            </div>
        </div>
    `;
    
    // Ocultar todas las secciones y mostrar los detalles del curso
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });
    
    contentArea.insertAdjacentHTML('beforeend', courseDetailsHTML);
    
    // Inicializar el badge de inscritos con valor recibido, luego solicitar conteo real al servidor
    const inscritosBadge = document.querySelector('#course-details .inscritos-count');
    if (inscritosBadge) inscritosBadge.textContent = courseInscritos || '0';

    // Cargar módulos del curso
    loadCourseModules(courseId);

    // Solicitar conteo preciso de inscritos y actualizar badge (corrige valores inconsistentes)
    fetch('php/cursoInscritosCount.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.success) {
            if (inscritosBadge) inscritosBadge.textContent = data.inscritos;
        }
    }).catch(err => {
        console.error('Error al obtener conteo de inscritos:', err);
    });
    
    // Agregar event listeners para los botones de acción
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleCourseAction(action, courseId, courseTitle);
        });
    });
    
    // Event listener para volver a la lista de cursos
    document.getElementById('back-to-courses-list').addEventListener('click', function() {
        document.getElementById('course-details').remove();
        showSection('current-courses');
    });
    
    // Event listener para reintentar carga de módulos
    document.getElementById('retry-load-modules').addEventListener('click', function() {
        loadCourseModules(courseId);
    });

    document.getElementById('config-horario').addEventListener('click', function() {
        showConfigHorarioModal(courseId, courseTitle);
    });
}

function handleCourseAction(action, courseId, courseTitle) {
    switch(action) {
        case 'crear-modulo':
            showCreateModuleModal(courseId, courseTitle);
            break;
        case 'crear-tema':
            showCreateTemaModal(courseId, courseTitle);
            break;
        case 'crear-evaluacion':
            showCreateEvaluacionModal(courseId, courseTitle);
            break;
        case 'crear-tarea':
            showCreateTareaModal(courseId, courseTitle);
            break;
    }
}
function showCreateModuleModal(courseId, courseTitle) {  // 47 Mae: Crear Modulo 43
    const modalHTML = `
        <div id="create-module-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Crear Nuevo Módulo</h3>
                    <button class="modal-close" id="close-module-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-module-form">
                        <div class="form-group">
                            <label for="module-title">Título del Módulo:</label>
                            <input type="text" id="module-title" name="title" required maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="module-order">Orden del Módulo:</label>
                            <input type="number" id="module-order" name="order" required min="1">
                            <small>Define la posición del módulo (1 = primero, 2 = segundo, etc.)</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-module">Cancelar</button>
                            <button type="submit" class="shiny">Crear Módulo</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('create-module-modal');
    const form = document.getElementById('create-module-form');
    
    // Event listeners para cerrar modal
    document.getElementById('close-module-modal').addEventListener('click', closeModuleModal);
    document.getElementById('cancel-module').addEventListener('click', closeModuleModal);
    
    // Event listener para enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createModule(courseId);
    });
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModuleModal();
        }
    });
}

function showCreateTemaModal(courseId, courseTitle) { // 48 Mae: Crear Temas 43
    // Primero cargar los módulos disponibles
    fetch("php/moduloGetByPC.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.modulos.length > 0) {
            let modulosOptions = data.modulos.map(modulo => 
                `<option value="${modulo.id_modulo}">${escapeHTML(modulo.titulo)}</option>`
            ).join('');
            
            const modalHTML = `
                <div id="create-tema-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Crear Nuevo Tema</h3>
                            <button class="modal-close" id="close-tema-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="create-tema-form" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="tema-modulo">Módulo:</label>
                                    <select id="tema-modulo" name="id_modulo" required>
                                        <option value="">Selecciona un módulo</option>
                                        ${modulosOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="tema-title">Título del Tema:</label>
                                    <input type="text" id="tema-title" name="title" required maxlength="50">
                                </div>
                                <div class="form-group">
                                    <label for="tema-archivo">Archivo Adjunto:</label>
                                    <input type="file" id="tema-archivo" name="archivo" 
                                        accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.mp4,.avi,.mov,.zip,.rar">
                                    <small>Formatos permitidos: PDF, PPT, DOC, PNG, JPG, MP4, AVI, MOV, ZIP, RAR (Máx. 10MB)</small>
                                    <div id="tema-archivo-preview" style="display: none; margin-top: 10px;">
                                        <span id="tema-archivo-nombre"></span>
                                        <button type="button" id="tema-quitar-archivo" class="back small">×</button>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="back" id="cancel-tema">Cancelar</button>
                                    <button type="submit" class="shiny">Crear Tema</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            setupTemaModal();
        } else {
            alert('No hay módulos disponibles. Primero crea un módulo para este curso.');
        }
    })
    .catch(err => {
        console.error('Error al cargar módulos:', err);
        alert('Error al cargar los módulos. Por favor, intente nuevamente.');
    });
}

function showCreateTareaModal(courseId, courseTitle) { // 49 Mae: Crear Tarea 43
    // Primero cargar los módulos disponibles
    fetch("php/moduloGetByPC.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.modulos.length > 0) {
            let modulosOptions = data.modulos.map(modulo => 
                `<option value="${modulo.id_modulo}">${escapeHTML(modulo.titulo)}</option>`
            ).join('');
            
            const modalHTML = `
                <div id="create-tarea-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Crear Nueva Tarea</h3>
                            <button class="modal-close" id="close-tarea-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="create-tarea-form" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="tarea-modulo">Módulo:</label>
                                    <select id="tarea-modulo" name="id_modulo" required>
                                        <option value="">Selecciona un módulo</option>
                                        ${modulosOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-title">Título de la Tarea:</label>
                                    <input type="text" id="tarea-title" name="title" required maxlength="50">
                                </div>
                                <div class="form-group">
                                    <label for="tarea-descripcion">Descripción:</label>
                                    <textarea id="tarea-descripcion" name="descripcion" rows="4" maxlength="1000"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-archivo">Archivo Adjunto:</label>
                                    <input type="file" id="tarea-archivo" name="archivo" 
                                           accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg">
                                    <small>Formatos permitidos: PDF, PPT, DOC, PNG, JPG (Máx. 10MB)</small>
                                    <div id="archivo-preview" style="display: none; margin-top: 10px;">
                                        <span id="archivo-nombre"></span>
                                        <button type="button" id="quitar-archivo" class="back small">×</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-fecha-emision">Fecha de Emisión:</label>
                                    <input type="date" id="tarea-fecha-emision" name="fecha_emision" required>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-hora-emision">Hora de Emisión:</label>
                                    <input type="time" id="tarea-hora-emision" name="hora_emision" required>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-fecha-entrega">Fecha de Entrega:</label>
                                    <input type="date" id="tarea-fecha-entrega" name="fecha_entrega" required>
                                </div>
                                <div class="form-group">
                                    <label for="tarea-hora-entrega">Hora de Entrega:</label>
                                    <input type="time" id="tarea-hora-entrega" name="hora_entrega" required>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="back" id="cancel-tarea">Cancelar</button>
                                    <button type="submit" class="shiny">Crear Tarea</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            setupTareaModal();
        } else {
            alert('No hay módulos disponibles. Primero crea un módulo para este curso.');
        }
    })
    .catch(err => {
        console.error('Error al cargar módulos:', err);
        alert('Error al cargar los módulos. Por favor, intente nuevamente.');
    });
}

function showCreateEvaluacionModal(courseId, courseTitle) {  // 50 Mae: Crear Evaluacion 43
    // Primero cargar los módulos disponibles
    fetch("php/moduloGetByPC.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.modulos.length > 0) {
            let modulosOptions = data.modulos.map(modulo => 
                `<option value="${modulo.id_modulo}">${escapeHTML(modulo.titulo)}</option>`
            ).join('');
            
            const modalHTML = `
                <div id="create-evaluacion-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Crear Nueva Evaluación</h3>
                            <button class="modal-close" id="close-evaluacion-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="create-evaluacion-form" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="evaluacion-modulo">Módulo:</label>
                                    <select id="evaluacion-modulo" name="id_modulo" required>
                                        <option value="">Selecciona un módulo</option>
                                        ${modulosOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-title">Título de la Evaluación:</label>
                                    <input type="text" id="evaluacion-title" name="title" required maxlength="50">
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-descripcion">Descripción:</label>
                                    <textarea id="evaluacion-descripcion" name="descripcion" rows="4" maxlength="1000"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-archivo">Archivo Adjunto:</label>
                                    <input type="file" id="evaluacion-archivo" name="archivo" 
                                           accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar">
                                    <small>Formatos permitidos: PDF, PPT, DOC, PNG, JPG, ZIP, RAR (Máx. 10MB)</small>
                                    <div id="evaluacion-archivo-preview" style="display: none; margin-top: 10px;">
                                        <span id="evaluacion-archivo-nombre"></span>
                                        <button type="button" id="evaluacion-quitar-archivo" class="back small">×</button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-fecha-emision">Fecha de Emisión:</label>
                                    <input type="date" id="evaluacion-fecha-emision" name="fecha_emision" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-hora-emision">Hora de Emisión:</label>
                                    <input type="time" id="evaluacion-hora-emision" name="hora_emision" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-fecha-inicio">Fecha de Inicio:</label>
                                    <input type="date" id="evaluacion-fecha-inicio" name="fecha_inicio" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-hora-inicio">Hora de Inicio:</label>
                                    <input type="time" id="evaluacion-hora-inicio" name="hora_inicio" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-fecha-entrega">Fecha de Entrega:</label>
                                    <input type="date" id="evaluacion-fecha-entrega" name="fecha_entrega" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-hora-entrega">Hora de Entrega:</label>
                                    <input type="time" id="evaluacion-hora-entrega" name="hora_entrega" required>
                                </div>
                                <div class="form-group">
                                    <label for="evaluacion-deskpoints">Puntos:</label>
                                    <input type="number" id="evaluacion-deskpoints" name="deskpoints" required min="1">
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="back" id="cancel-evaluacion">Cancelar</button>
                                    <button type="submit" class="shiny">Crear Evaluación</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            setupEvaluacionModal();
        } else {
            alert('No hay módulos disponibles. Primero crea un módulo para este curso.');
        }
    })
    .catch(err => {
        console.error('Error al cargar módulos:', err);
        alert('Error al cargar los módulos. Por favor, intente nuevamente.');
    });
}

function setupTemaModal() {
    const modal = document.getElementById('create-tema-modal');
    const form = document.getElementById('create-tema-form');
    const archivoInput = document.getElementById('tema-archivo');
    const archivoPreview = document.getElementById('tema-archivo-preview');
    const archivoNombre = document.getElementById('tema-archivo-nombre');
    const quitarArchivoBtn = document.getElementById('tema-quitar-archivo');
    
    document.getElementById('close-tema-modal').addEventListener('click', closeTemaModal);
    document.getElementById('cancel-tema').addEventListener('click', closeTemaModal);
    
    // Manejar selección de archivo
    archivoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 10MB permitido.');
                archivoInput.value = '';
                return;
            }
            
            // Validar tipo de archivo
            const allowedTypes = [
                'application/pdf',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/png',
                'image/jpeg',
                'image/jpg',
                'video/mp4',
                'video/avi',
                'video/quicktime',
                'application/zip',
                'application/x-rar-compressed'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de archivo no permitido. Use PDF, PPT, DOC, PNG, JPG, MP4, AVI, MOV, ZIP o RAR.');
                archivoInput.value = '';
                return;
            }
            
            // Mostrar preview
            archivoNombre.textContent = file.name;
            archivoPreview.style.display = 'block';
        }
    });
    
    // Quitar archivo seleccionado
    quitarArchivoBtn.addEventListener('click', function() {
        archivoInput.value = '';
        archivoPreview.style.display = 'none';
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createTema();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTemaModal();
        }
    });
}

function setupTareaModal() {
    const modal = document.getElementById('create-tarea-modal');
    const form = document.getElementById('create-tarea-form');
    const archivoInput = document.getElementById('tarea-archivo');
    const archivoPreview = document.getElementById('archivo-preview');
    const archivoNombre = document.getElementById('archivo-nombre');
    const quitarArchivoBtn = document.getElementById('quitar-archivo');

    const now = new Date();
    const fechaActual = now.toISOString().split('T')[0];
    const horaActual = now.toTimeString().slice(0, 5);

    document.getElementById('tarea-fecha-emision').value = fechaActual;
    document.getElementById('tarea-hora-emision').value = horaActual;

    document.getElementById('tarea-fecha-emision').readOnly = true;
    document.getElementById('tarea-hora-emision').readOnly = true;

    document.getElementById('close-tarea-modal').addEventListener('click', closeTareaModal);
    document.getElementById('cancel-tarea').addEventListener('click', closeTareaModal);

    // Manejar selección de archivo
    archivoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 10MB permitido.');
                archivoInput.value = '';
                return;
            }
            
            // Validar tipo de archivo
            const allowedTypes = [
                'application/pdf',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/png',
                'image/jpeg',
                'image/jpg'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de archivo no permitido. Use PDF, PPT, DOC, PNG o JPG.');
                archivoInput.value = '';
                return;
            }
            
            // Mostrar preview
            archivoNombre.textContent = file.name;
            archivoPreview.style.display = 'block';
        }
    });
    
    // Quitar archivo seleccionado
    quitarArchivoBtn.addEventListener('click', function() {
        archivoInput.value = '';
        archivoPreview.style.display = 'none';
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createTarea();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTareaModal();
        }
    });
}

function setupEvaluacionModal() {
    const modal = document.getElementById('create-evaluacion-modal');
    const form = document.getElementById('create-evaluacion-form');
    const archivoInput = document.getElementById('evaluacion-archivo');
    const archivoPreview = document.getElementById('evaluacion-archivo-preview');
    const archivoNombre = document.getElementById('evaluacion-archivo-nombre');
    const quitarArchivoBtn = document.getElementById('evaluacion-quitar-archivo');

    const now = new Date();
    const fechaActual = now.toISOString().split('T')[0];
    const horaActual = now.toTimeString().slice(0, 5);
    
    document.getElementById('evaluacion-fecha-emision').value = fechaActual;
    document.getElementById('evaluacion-hora-emision').value = horaActual;

    document.getElementById('evaluacion-fecha-emision').readOnly = true;
    document.getElementById('evaluacion-hora-emision').readOnly = true;

    document.getElementById('close-evaluacion-modal').addEventListener('click', closeEvaluacionModal);
    document.getElementById('cancel-evaluacion').addEventListener('click', closeEvaluacionModal);
    
    // Manejar selección de archivo
    archivoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 10MB permitido.');
                archivoInput.value = '';
                return;
            }
            
            // Validar tipo de archivo
            const allowedTypes = [
                'application/pdf',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/png',
                'image/jpeg',
                'image/jpg',
                'application/zip',
                'application/x-rar-compressed'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de archivo no permitido. Use PDF, PPT, DOC, PNG, JPG, ZIP o RAR.');
                archivoInput.value = '';
                return;
            }
            
            // Mostrar preview
            archivoNombre.textContent = file.name;
            archivoPreview.style.display = 'block';
        }
    });
    
    // Quitar archivo seleccionado
    quitarArchivoBtn.addEventListener('click', function() {
        archivoInput.value = '';
        archivoPreview.style.display = 'none';
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createEvaluacion();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEvaluacionModal();
        }
    });
}

function closeModuleModal() {
    const modal = document.getElementById('create-module-modal');
    if (modal) {
        modal.remove();
    }
}

function closeTemaModal() {
    const modal = document.getElementById('create-tema-modal');
    if (modal) {
        modal.remove();
    }
}

function closeTareaModal() {
    const modal = document.getElementById('create-tarea-modal');
    if (modal) {
        modal.remove();
    }
}

function closeEvaluacionModal() {
    const modal = document.getElementById('create-evaluacion-modal');
    if (modal) {
        modal.remove();
    }
}

function createModule(courseId) {
    const title = document.getElementById('module-title').value.trim();
    const order = parseInt(document.getElementById('module-order').value);
    
    if (!title) {
        alert('Por favor, ingresa un título para el módulo');
        return;
    }
    
    if (order <= 0) {
        alert('El orden debe ser un número positivo');
        return;
    }
    
    fetch("php/moduloNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_periodo_curso: courseId,
            titulo: title,
            orden: order
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Módulo creado exitosamente');
            closeModuleModal();
            loadCourseModules(courseId); // Recargar la lista de módulos
        } else {
            alert('Error al crear módulo: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al crear módulo. Por favor, intente nuevamente.');
    });
}

function createTema() {
    const id_modulo = document.getElementById('tema-modulo').value;
    const titulo = document.getElementById('tema-title').value.trim();
    const archivoInput = document.getElementById('tema-archivo');
    const archivo = archivoInput.files[0];
    
    if (!id_modulo) {
        alert('Por favor, selecciona un módulo');
        return;
    }
    
    if (!titulo) {
        alert('Por favor, ingresa un título para el tema');
        return;
    }
    
    const formData = new FormData();
    formData.append('id_modulo', id_modulo);
    formData.append('titulo', titulo);
    
    if (archivo) {
        formData.append('archivo', archivo);
    }
    
    fetch("php/temasNew.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Tema creado exitosamente' + (archivo ? ' con archivo adjunto' : ''));
            closeTemaModal();
            const courseId = localStorage.getItem('current_course_id');
            loadCourseModules(courseId); // Recargar la lista de módulos con temas
        } else {
            alert('Error al crear tema: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al crear tema. Por favor, intente nuevamente.');
    });
}

function createTarea() {
    const id_modulo = document.getElementById('tarea-modulo').value;
    const titulo = document.getElementById('tarea-title').value.trim();
    const descripcion = document.getElementById('tarea-descripcion').value.trim();
    const fecha_emision = document.getElementById('tarea-fecha-emision').value;
    const hora_emision = document.getElementById('tarea-hora-emision').value;
    const fecha_entrega = document.getElementById('tarea-fecha-entrega').value;
    const hora_entrega = document.getElementById('tarea-hora-entrega').value;
    const archivoInput = document.getElementById('tarea-archivo');
    const archivo = archivoInput.files[0];
    
    if (!id_modulo) {
        alert('Por favor, selecciona un módulo');
        return;
    }
    
    if (!titulo) {
        alert('Por favor, ingresa un título para la tarea');
        return;
    }
    
    if (!fecha_emision || !hora_emision || !fecha_entrega || !hora_entrega) {
        alert('Por favor, completa todas las fechas y horas');
        return;
    }

    // Validación: la fecha/hora de entrega debe ser mayor que la de emisión
    if (fecha_emision && hora_emision && fecha_entrega && hora_entrega) {
        const emission = new Date(fecha_emision + 'T' + hora_emision);
        const entrega = new Date(fecha_entrega + 'T' + hora_entrega);
        if (entrega <= emission) {
            alert('La fecha/hora de entrega debe ser mayor que la fecha/hora de emisión');
            return;
        }
    }
    
    const formData = new FormData();
    formData.append('id_modulo', id_modulo);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_emision', fecha_emision);
    formData.append('hora_emision', hora_emision);
    formData.append('fecha_entrega', fecha_entrega);
    formData.append('hora_entrega', hora_entrega);
    
    if (archivo) {
        formData.append('archivo', archivo);
    }
    
    fetch("php/tareaNew.php", {
        method: "POST",
        body: formData 
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Tarea creada exitosamente' + (archivo ? ' con archivo adjunto' : ''));
            closeTareaModal();
            const courseId = localStorage.getItem('current_course_id');
            loadCourseModules(courseId);
        } else {
            alert('Error al crear tarea: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al crear tarea. Por favor, intente nuevamente.');
    });
}

function createEvaluacion() {
    const id_modulo = document.getElementById('evaluacion-modulo').value;
    const titulo = document.getElementById('evaluacion-title').value.trim();
    const descripcion = document.getElementById('evaluacion-descripcion').value.trim();
    const fecha_emision = document.getElementById('evaluacion-fecha-emision').value;
    const hora_emision = document.getElementById('evaluacion-hora-emision').value;
    const fecha_inicio = document.getElementById('evaluacion-fecha-inicio').value;
    const hora_inicio = document.getElementById('evaluacion-hora-inicio').value;
    const fecha_entrega = document.getElementById('evaluacion-fecha-entrega').value;
    const hora_entrega = document.getElementById('evaluacion-hora-entrega').value;
    const deskpoints = document.getElementById('evaluacion-deskpoints').value;
    const archivoInput = document.getElementById('evaluacion-archivo');
    const archivo = archivoInput.files[0];
    
    if (!id_modulo) {
        alert('Por favor, selecciona un módulo');
        return;
    }
    
    if (!titulo) {
        alert('Por favor, ingresa un título para la evaluación');
        return;
    }
    
    if (!fecha_emision || !hora_emision || !fecha_inicio || !hora_inicio || !fecha_entrega || !hora_entrega) {
        alert('Por favor, completa todas las fechas y horas');
        return;
    }
    
    if (!deskpoints || deskpoints <= 0) {
        alert('Por favor, ingresa un valor válido para los puntos');
        return;
    }

    // Validación: la fecha/hora de fin debe ser mayor a la de inicio
    if (fecha_inicio && hora_inicio && fecha_entrega && hora_entrega) {
        const start = new Date(fecha_inicio + 'T' + hora_inicio);
        const end = new Date(fecha_entrega + 'T' + hora_entrega);
        if (end <= start) {
            alert('La fecha/hora de fin debe ser mayor a la de inicio');
            return;
        }
    }
    
    const formData = new FormData();
    formData.append('id_modulo', id_modulo);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_emision', fecha_emision);
    formData.append('hora_emision', hora_emision);
    formData.append('fecha_inicio', fecha_inicio);
    formData.append('hora_inicio', hora_inicio);
    formData.append('fecha_entrega', fecha_entrega);
    formData.append('hora_entrega', hora_entrega);
    formData.append('deskpoints', deskpoints);
    
    if (archivo) {
        formData.append('archivo', archivo);
    }
    
    fetch("php/evaluacionNew.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Evaluación creada exitosamente' + (archivo ? ' con archivo adjunto' : ''));
            closeEvaluacionModal();
            const courseId = localStorage.getItem('current_course_id');
            loadCourseModules(courseId); // Recargar la lista de módulos con evaluaciones
        } else {
            alert('Error al crear evaluación: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al crear evaluación. Por favor, intente nuevamente.');
    });
}

function loadCourseModules(courseId) {
    const loadingElement = document.getElementById('modules-loading');
    const modulesList = document.getElementById('modules-list');
    const emptyElement = document.getElementById('modules-empty');
    const errorElement = document.getElementById('modules-error');
    
    loadingElement.style.display = 'block';
    modulesList.style.display = 'none';
    emptyElement.style.display = 'none';
    errorElement.style.display = 'none';
    
    fetch("php/moduloGetByPC.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_periodo_curso: courseId })
    })
    .then(res => res.json())
    .then(data => {
        loadingElement.style.display = 'none';
        
        if (data.success) {
            if (data.modulos.length > 0) {
                // Para cada módulo, cargar sus temas, tareas y evaluaciones
                loadModuleContent(data.modulos).then(modulesWithContent => {
                    displayModulesWithContent(modulesWithContent);
                    modulesList.style.display = 'block';
                });
            } else {
                emptyElement.style.display = 'block';
            }
        } else {
            errorElement.style.display = 'block';
        }
    })
    .catch(err => {
        console.error('Error al cargar módulos:', err);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    });
}

async function loadModuleContent(modules) {
    const modulesWithContent = [];
    
    for (const modulo of modules) {
        const [temas, tareas, evaluaciones] = await Promise.all([
            loadTemasByModulo(modulo.id_modulo),
            loadTareasByModulo(modulo.id_modulo),
            loadEvaluacionesByModulo(modulo.id_modulo)
        ]);
        
        modulesWithContent.push({
            ...modulo,
            temas: temas,
            tareas: tareas,
            evaluaciones: evaluaciones
        });
    }
    
    return modulesWithContent;
}

function loadTemasByModulo(id_modulo) {
    return fetch("php/temasGetByModulo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modulo: id_modulo })
    })
    .then(res => res.json())
    .then(data => data.success ? data.temas : [])
    .catch(err => {
        console.error('Error al cargar temas:', err);
        return [];
    });
}

function loadTareasByModulo(id_modulo) {
    return fetch("php/tareaGetByModulo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modulo: id_modulo })
    })
    .then(res => res.json())
    .then(data => data.success ? data.tareas : [])
    .catch(err => {
        console.error('Error al cargar tareas:', err);
        return [];
    });
}

function loadEvaluacionesByModulo(id_modulo) {
    return fetch("php/evaluacionGetByModulo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modulo: id_modulo })
    })
    .then(res => res.json())
    .then(data => data.success ? data.evaluaciones : [])
    .catch(err => {
        console.error('Error al cargar evaluaciones:', err);
        return [];
    });
}

function displayModulesWithContent(modules) {
    const modulesList = document.getElementById('modules-list');
    
    const modulesHTML = modules.map(modulo => `
        <div class="module-card">
            <div class="module-content">
                <div class="module-info">
                    <h4 class="module-title">${escapeHTML(modulo.titulo)}</h4>
                    <span class="module-order">Orden: ${modulo.orden}</span>
                </div>
                <div class="module-actions">
                    <button class="shiny small edit-module-btn" data-module-id="${modulo.id_modulo}" data-module-title="${escapeHTML(modulo.titulo)}" data-module-orden="${modulo.orden}">Editar</button>
                    <button class="back small delete-module-btn" data-module-id="${modulo.id_modulo}">Eliminar</button>
                </div>
            </div>
            
            <!-- Temas del módulo -->
            ${modulo.temas.length > 0 ? `
                <div class="temas-container">
                    ${modulo.temas.map(tema => `
                        <div class="tema-card">
                            <div class="tema-content">
                                <div class="tema-info">
                                    <h5 class="tema-title">📖 ${escapeHTML(tema.titulo)}</h5>
                                    ${tema.archivo_url ? `
                                        <div class="archivo-adjunto">
                                            <a href="php/descargar.php?archivo=${tema.archivo_url.replace('uploads/', '')}" class="archivo-link" target="_blank">
                                                📎 ${tema.archivo_nombre || 'Archivo adjunto'}
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small edit-tema-btn" data-tema-id="${tema.id_tema}" data-tema-title="${escapeHTML(tema.titulo)}">Editar</button>
                                    <button class="back small delete-tema-btn" data-tema-id="${tema.id_tema}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Tareas del módulo -->
            ${modulo.tareas.length > 0 ? `
                <div class="temas-container">
                    ${modulo.tareas.map(tarea => `
                        <div class="tema-card">
                            <div class="tema-content">
                                <div class="tema-info">
                                    <h5 class="tema-title">📝 ${escapeHTML(tarea.titulo)}</h5>
                                    <p class="tema-desc">${escapeHTML(tarea.descripcion || 'Sin descripción')}</p>
                                    ${tarea.archivo_url ? `
                                        <div class="archivo-adjunto">
                                            <a href="php/descargar.php?archivo=${tarea.archivo_url.replace('uploads/', '')}" class="archivo-link" target="_blank">
                                                📎 ${tarea.archivo_nombre || 'Archivo adjunto'}
                                            </a>
                                        </div>
                                    ` : ''}
                                    <small>Entrega: ${formatDate(tarea.fecha_entrega)} ${tarea.hora_entrega}</small>
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small edit-tarea-btn" data-tarea-id="${tarea.id_tarea}" data-tarea-title="${escapeHTML(tarea.titulo)}" data-tarea-descripcion="${escapeHTML(tarea.descripcion||'')}" data-tarea-fecha-entrega="${tarea.fecha_entrega}" data-tarea-hora-entrega="${tarea.hora_entrega}" data-tarea-fecha-emision="${tarea.fecha_emision}" data-tarea-hora-emision="${tarea.hora_emision}">Editar</button>
                                    <button class="back small delete-tarea-btn" data-tarea-id="${tarea.id_tarea}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Evaluaciones del módulo -->
            ${modulo.evaluaciones.length > 0 ? `
                <div class="temas-container">
                    ${modulo.evaluaciones.map(evaluacion => `
                        <div class="tema-card">
                            <div class="tema-content">
                                <div class="tema-info">
                                    <h5 class="tema-title">📊 ${escapeHTML(evaluacion.titulo)}</h5>
                                    <p class="tema-desc">${escapeHTML(evaluacion.descripcion || 'Sin descripción')}</p>
                                    ${evaluacion.archivo_url ? `
                                        <div class="archivo-adjunto">
                                            <a href="php/descargar.php?archivo=${evaluacion.archivo_url.replace('uploads/', '')}" class="archivo-link" target="_blank">
                                                📎 ${evaluacion.archivo_nombre || 'Archivo adjunto'}
                                            </a>
                                        </div>
                                    ` : ''}
                                    <small>Inicio: ${formatDate(evaluacion.fecha_inicio)} ${evaluacion.hora_inicio}</small>
                                    <small>Entrega: ${formatDate(evaluacion.fecha_entrega)} ${evaluacion.hora_entrega}</small>
                                    <small>Puntos: ${evaluacion.deskpoints}</small>
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small edit-eval-btn" data-eval-id="${evaluacion.id_evaluacion}" data-eval-title="${escapeHTML(evaluacion.titulo)}" data-eval-descripcion="${escapeHTML(evaluacion.descripcion||'')}" data-eval-fecha-inicio="${evaluacion.fecha_inicio}" data-eval-hora-inicio="${evaluacion.hora_inicio}" data-eval-fecha-entrega="${evaluacion.fecha_entrega}" data-eval-hora-entrega="${evaluacion.hora_entrega}">Editar</button>
                                    <button class="back small delete-eval-btn" data-eval-id="${evaluacion.id_evaluacion}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${modulo.temas.length === 0 && modulo.tareas.length === 0 && modulo.evaluaciones.length === 0 ? `
                <div class="no-content-message">
                    <p>No hay contenido en este módulo</p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    modulesList.innerHTML = modulesHTML;

    // Attach edit listeners for modules, temas, tareas and evaluaciones
    // Módulos
    modulesList.querySelectorAll('.edit-module-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-module-id');
            const titulo = this.getAttribute('data-module-title');
            const orden = this.getAttribute('data-module-orden');
            showEditModuleModal(id, titulo, orden);
        });
    });

    // Temas
    modulesList.querySelectorAll('.edit-tema-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-tema-id');
            const titulo = this.getAttribute('data-tema-title');
            showEditTemaModal(id, titulo);
        });
    });

    // Tareas
    modulesList.querySelectorAll('.edit-tarea-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-tarea-id');
            const titulo = this.getAttribute('data-tarea-title');
            const descripcion = this.getAttribute('data-tarea-descripcion');
            const fecha_entrega = this.getAttribute('data-tarea-fecha-entrega');
            const hora_entrega = this.getAttribute('data-tarea-hora-entrega');
            const fecha_emision = this.getAttribute('data-tarea-fecha-emision');
            const hora_emision = this.getAttribute('data-tarea-hora-emision');
            showEditTareaModal(id, titulo, descripcion, fecha_entrega, hora_entrega, fecha_emision, hora_emision);
        });
    });

    // Evaluaciones
    modulesList.querySelectorAll('.edit-eval-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-eval-id');
            const titulo = this.getAttribute('data-eval-title');
            const descripcion = this.getAttribute('data-eval-descripcion');
            const fecha_inicio = this.getAttribute('data-eval-fecha-inicio');
            const hora_inicio = this.getAttribute('data-eval-hora-inicio');
            const fecha_entrega = this.getAttribute('data-eval-fecha-entrega');
            const hora_entrega = this.getAttribute('data-eval-hora-entrega');
            showEditEvaluacionModal(id, titulo, descripcion, fecha_inicio, hora_inicio, fecha_entrega, hora_entrega);
        });
    });

    // Delete handlers for módulo, tema, tarea, evaluación
    modulesList.querySelectorAll('.delete-module-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-module-id');
            if (!confirm('¿Desea eliminar este módulo y todo su contenido? Esta acción no se puede deshacer.')) return;
            fetch('php/moduloDelete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_modulo: id })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Módulo eliminado');
                    loadCourseModules(localStorage.getItem('current_course_id'));
                } else {
                    alert('Error: ' + (data.message || data.mensaje || ''));
                }
            }).catch(err => { console.error(err); alert('Error al eliminar módulo'); });
        });
    });

    modulesList.querySelectorAll('.delete-tema-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-tema-id');
            if (!confirm('¿Desea eliminar este tema?')) return;
            fetch('php/temasDelete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_tema: id })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Tema eliminado');
                    loadCourseModules(localStorage.getItem('current_course_id'));
                } else {
                    alert('Error: ' + (data.message || data.mensaje || ''));
                }
            }).catch(err => { console.error(err); alert('Error al eliminar tema'); });
        });
    });

    modulesList.querySelectorAll('.delete-tarea-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-tarea-id');
            if (!confirm('¿Desea eliminar esta tarea?')) return;
            fetch('php/tareaDelete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_tarea: id })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Tarea eliminada');
                    loadCourseModules(localStorage.getItem('current_course_id'));
                } else {
                    alert('Error: ' + (data.message || data.mensaje || ''));
                }
            }).catch(err => { console.error(err); alert('Error al eliminar tarea'); });
        });
    });

    modulesList.querySelectorAll('.delete-eval-btn').forEach(btn => {
        btn.addEventListener('click', function(){
            const id = this.getAttribute('data-eval-id');
            if (!confirm('¿Desea eliminar esta evaluación?')) return;
            fetch('php/evaluacionDelete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_evaluacion: id })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Evaluación eliminada');
                    loadCourseModules(localStorage.getItem('current_course_id'));
                } else {
                    alert('Error: ' + (data.message || data.mensaje || ''));
                }
            }).catch(err => { console.error(err); alert('Error al eliminar evaluación'); });
        });
    });
}

function showConfigHorarioModal(courseId, courseTitle) { // 46 Mae: Configurar Horario 43
    const modalHTML = `
        <div id="config-horario-modal" class="modal-overlay">
            <div class="modal-content" style="max-width: 750px;">
                <div class="modal-header">
                    <h3>Configurar Horario - ${escapeHTML(courseTitle)}</h3>
                    <button class="modal-close" id="close-horario-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="config-horario-form">
                        <!-- Sección de Modalidad -->
                        <div class="form-group">
                            <label>Modalidad de Clase:</label>
                            <div class="modalidad-selector">
                                <label class="modalidad-radio">
                                    <input type="radio" name="modalidad" value="presencial" checked>
                                    <span class="radio-custom"></span>
                                    <span class="modalidad-text">Presencial</span>
                                </label>
                                <label class="modalidad-radio">
                                    <input type="radio" name="modalidad" value="virtual">
                                    <span class="radio-custom"></span>
                                    <span class="modalidad-text">Virtual</span>
                                </label>
                            </div>
                        </div>

                        <!-- Sección de Aula (solo visible para presencial) -->
                        <div class="form-group" id="aula-container">
                            <label for="aula-clase">Aula:</label>
                            <input type="text" id="aula-clase" name="aula" placeholder="Ej: Aula 101, Laboratorio B, etc." maxlength="50">
                            <small>Especifica el aula o sala donde se impartirá la clase</small>
                        </div>

                        <!-- Sección de Horarios por Día -->
                        <div class="form-group">
                            <label>Configurar Horarios por Día:</label>
                            <div class="dias-horarios-container">
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="1" data-dia="Lunes">
                                        <span>Lunes</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="1" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="1" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="2" data-dia="Martes">
                                        <span>Martes</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="2" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="2" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="3" data-dia="Miércoles">
                                        <span>Miércoles</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="3" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="3" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="4" data-dia="Jueves">
                                        <span>Jueves</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="4" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="4" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="5" data-dia="Viernes">
                                        <span>Viernes</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="5" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="5" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="6" data-dia="Sábado">
                                        <span>Sábado</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="6" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="6" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                                
                                <div class="dia-horario-item">
                                    <label class="dia-checkbox">
                                        <input type="checkbox" name="dias[]" value="0" data-dia="Domingo">
                                        <span>Domingo</span>
                                    </label>
                                    <div class="horario-inputs">
                                        <input type="text" class="time-picker hora-inicio-dia" data-dia="0" placeholder="Hora inicio" disabled>
                                        <span class="horario-separador">-</span>
                                        <input type="text" class="time-picker hora-fin-dia" data-dia="0" placeholder="Hora fin" disabled>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="horario-preview" id="horario-preview">
                            <h4>Vista Previa del Horario:</h4>
                            <div id="preview-content" class="preview-content">
                                <p class="preview-placeholder">Selecciona los días y configura sus horarios</p>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="back" id="close-horario-btn">Cancelar</button>
                            <button type="submit" class="shiny">Guardar Horario</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Inicializar flatpickr
    initializeFlatpickr();
    
    // Configurar event listeners
    setupHorarioModal(courseId, courseTitle);
}

function initializeFlatpickr() {
    // Configurar selector de tiempo
    flatpickr(".time-picker", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        locale: "es",
        minuteIncrement: 30,
        defaultHour: 8,
        defaultMinute: 0
    });

    // Configurar selector de fecha
    flatpickr(".date-picker", {
        dateFormat: "Y-m-d",
        locale: "es",
        minDate: "today"
    });
}

function setupHorarioModal(courseId, courseTitle) {
    const modal = document.getElementById('config-horario-modal');
    const form = document.getElementById('config-horario-form');
    const aulaContainer = document.getElementById('aula-container');
    const aulaInput = document.getElementById('aula-clase');
    
    // Event listener para cambio de modalidad
    document.querySelectorAll('input[name="modalidad"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'presencial') {
                aulaContainer.style.display = 'block';
                aulaInput.required = true;
            } else {
                aulaContainer.style.display = 'none';
                aulaInput.required = false;
                aulaInput.value = '';
            }
            updateHorarioPreview();
        });
    });
    
    // Event listeners para checkboxes de días
    document.querySelectorAll('input[name="dias[]"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const dia = this.value;
            const horaInicio = document.querySelector(`.hora-inicio-dia[data-dia="${dia}"]`);
            const horaFin = document.querySelector(`.hora-fin-dia[data-dia="${dia}"]`);
            
            if (this.checked) {
                horaInicio.disabled = false;
                horaFin.disabled = false;
                horaInicio.required = true;
                horaFin.required = true;
            } else {
                horaInicio.disabled = true;
                horaFin.disabled = true;
                horaInicio.required = false;
                horaFin.required = false;
                horaInicio.value = '';
                horaFin.value = '';
            }
            updateHorarioPreview();
        });
    });
    
    // Event listeners para cambios en los horarios y aula
    document.querySelectorAll('.hora-inicio-dia, .hora-fin-dia, #aula-clase').forEach(input => {
        input.addEventListener('change', updateHorarioPreview);
        input.addEventListener('input', updateHorarioPreview);
    });

    // Event listeners para cerrar modal
    document.getElementById('close-horario-modal').addEventListener('click', closeHorarioModal);
    document.getElementById('close-horario-btn').addEventListener('click', closeHorarioModal);
    
    // Event listener para enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        guardarHorario(courseId, courseTitle);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeHorarioModal();
        }
    });
    
    // Inicializar estado de modalidad
    const modalidadPresencial = document.querySelector('input[name="modalidad"][value="presencial"]');
    if (modalidadPresencial.checked) {
        aulaContainer.style.display = 'block';
        aulaInput.required = true;
    } else {
        aulaContainer.style.display = 'none';
        aulaInput.required = false;
    }
}

function updateHorarioPreview() {
    const diasSeleccionados = Array.from(document.querySelectorAll('input[name="dias[]"]:checked'));
    const modalidad = document.querySelector('input[name="modalidad"]:checked').value;
    const aula = document.getElementById('aula-clase').value;
    
    const previewContent = document.getElementById('preview-content');
    
    if (diasSeleccionados.length === 0) {
        previewContent.innerHTML = '<p class="preview-placeholder">Selecciona los días y configura sus horarios</p>';
        return;
    }
    
    const diasMap = {
        '0': 'Domingo',
        '1': 'Lunes',
        '2': 'Martes',
        '3': 'Miércoles',
        '4': 'Jueves',
        '5': 'Viernes',
        '6': 'Sábado'
    };
    
    let previewHTML = '<div class="preview-list">';
    
    // Información de modalidad y aula
    previewHTML += `
        <div class="preview-info">
            <strong>Modalidad:</strong> ${modalidad === 'presencial' ? '🏫 Presencial' : '💻 Virtual'}
            ${modalidad === 'presencial' && aula ? ` | <strong>Aula:</strong> ${escapeHTML(aula)}` : ''}
        </div>
    `;
    
    let tieneHorariosCompletos = false;
    
    diasSeleccionados.forEach(checkbox => {
        const dia = checkbox.value;
        const diaNombre = checkbox.getAttribute('data-dia');
        const horaInicio = document.querySelector(`.hora-inicio-dia[data-dia="${dia}"]`).value;
        const horaFin = document.querySelector(`.hora-fin-dia[data-dia="${dia}"]`).value;
        
        if (horaInicio && horaFin) {
            tieneHorariosCompletos = true;
            previewHTML += `
                <div class="preview-item">
                    <span class="preview-dia">${diaNombre}</span>
                    <span class="preview-horario">${horaInicio} - ${horaFin}</span>
                    ${modalidad === 'presencial' && aula ? `<span class="preview-aula">🏫 ${escapeHTML(aula)}</span>` : '<span class="preview-virtual">💻 Virtual</span>'}
                </div>
            `;
        } else {
            previewHTML += `
                <div class="preview-item preview-incompleto">
                    <span class="preview-dia">${diaNombre}: </span>
                    <span class="preview-horario">Horario no configurado</span>
                </div>
            `;
        }
    });
    
    previewHTML += '</div>';
    
    if (!tieneHorariosCompletos && diasSeleccionados.length > 0) {
        previewHTML += '<p class="preview-warning">⚠️ Configura los horarios para los días seleccionados</p>';
    }
    
    if (modalidad === 'presencial' && !aula) {
        previewHTML += '<p class="preview-warning">⚠️ Especifica el aula para las clases presenciales</p>';
    }
    
    previewContent.innerHTML = previewHTML;
}

function guardarHorario(courseId, courseTitle) {
    const diasSeleccionados = Array.from(document.querySelectorAll('input[name="dias[]"]:checked'));
    const modalidad = document.querySelector('input[name="modalidad"]:checked').value;
    const aula = document.getElementById('aula-clase').value;
    
    const horarios = [];
    let errores = [];
    
    // Validaciones de modalidad y aula
    if (modalidad === 'presencial' && !aula.trim()) {
        errores.push('Especifica el aula para las clases presenciales');
    }
    
    diasSeleccionados.forEach(checkbox => {
        const dia = parseInt(checkbox.value);
        const diaNombre = checkbox.getAttribute('data-dia');
        const horaInicio = document.querySelector(`.hora-inicio-dia[data-dia="${dia}"]`).value;
        const horaFin = document.querySelector(`.hora-fin-dia[data-dia="${dia}"]`).value;
        
        if (!horaInicio || !horaFin) {
            errores.push(`${diaNombre}: Horario incompleto`);
            return;
        }
        
        horarios.push({
            dia: dia,
            diaNombre: diaNombre,
            horaInicio: horaInicio,
            horaFin: horaFin
        });
    });
    
    if (errores.length > 0) {
        alert('Por favor, corrige los siguientes errores:\n' + errores.join('\n'));
        return;
    }
    
    if (horarios.length === 0) {
        alert('Por favor, selecciona al menos un día con horario completo');
        return;
    }
    
    const horarioData = {
        courseId: courseId,
        courseTitle: courseTitle,
        modalidad: modalidad,
        aula: modalidad === 'presencial' ? aula.trim() : null,
        horarios: horarios
    };
    
    console.log('Guardando horario:', horarioData);
    
    // Enviar datos al servidor
    fetch("php/guardarHorario.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horarioData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Horario guardado exitosamente para el curso: ' + courseTitle);
            closeHorarioModal();
        } else {
            alert('Error al guardar horario: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error al guardar horario. Por favor, intente nuevamente.');
    });
}

function closeHorarioModal() {
    const modal = document.getElementById('config-horario-modal');
    if (modal) {
        modal.remove();
    }
}

function formatFileSize(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    showSection('current-courses');
    // Inicializar botones del sidebar
    document.querySelectorAll('.menu-button[data-section]').forEach(btn => {
        btn.addEventListener('click', function() {
            const sec = this.getAttribute('data-section');
            showSection(sec);
        });
    });
    // Botones regresar en placeholders
    const backBtn = document.getElementById('back-to-courses');
    if (backBtn) backBtn.addEventListener('click', () => showSection('current-courses'));

    // Botón Configurar Perfil
    const perfilBtn = document.getElementById('btn-configurar-perfil');
    if (perfilBtn) perfilBtn.addEventListener('click', () => {
        showConfigurarPerfilModal();
    });
});

/* Perfil: modal para editar nombre, título y correo */
function showConfigurarPerfilModal() {
    const modalHTML = `
        <div id="config-perfil-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configurar Perfil</h3>
                    <button class="modal-close" id="close-perfil-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="config-perfil-form">
                        <div class="form-group">
                            <label for="perfil-nombre">Nombre:</label>
                            <input type="text" id="perfil-nombre" name="nombre" required maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="perfil-titulo">Título:</label>
                            <input type="text" id="perfil-titulo" name="titulo" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="perfil-correo">Correo:</label>
                            <input type="email" id="perfil-correo" name="correo" required maxlength="150">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-perfil">Cancelar</button>
                            <button type="submit" class="shiny">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-perfil-modal').addEventListener('click', closePerfilModal);
    document.getElementById('cancel-perfil').addEventListener('click', closePerfilModal);

    // Cargar datos actuales
    const id_user = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
    if (id_user) {
        fetch('php/perfilGet.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                document.getElementById('perfil-nombre').value = data.usuario.nombre || '';
                document.getElementById('perfil-correo').value = data.usuario.email || data.usuario.correo || '';
                document.getElementById('perfil-titulo').value = (data.datos_maestro && data.datos_maestro.titulo) ? data.datos_maestro.titulo : '';
            }
        }).catch(err => console.error('Error cargando perfil:', err));
    }

    document.getElementById('config-perfil-form').addEventListener('submit', function(e){
        e.preventDefault();
        submitPerfilForm();
    });

    const modal = document.getElementById('config-perfil-modal');
    modal.addEventListener('click', function(e){ if (e.target === modal) closePerfilModal(); });
}

function closePerfilModal() {
    const modal = document.getElementById('config-perfil-modal');
    if (modal) modal.remove();
}

function submitPerfilForm() {
    const id_user = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
    const nombre = document.getElementById('perfil-nombre').value.trim();
    const titulo = document.getElementById('perfil-titulo').value.trim();
    const correo = document.getElementById('perfil-correo').value.trim();

    if (!nombre || !correo) return alert('Nombre y correo son requeridos');

    fetch('php/perfilUpdate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user, nombre, titulo, correo })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Perfil actualizado');
            closePerfilModal();
        } else {
            alert('Error actualizando perfil: ' + (data.message || data.mensaje || ''));
        }
    }).catch(err => {
        console.error(err);
        alert('Error actualizando perfil');
    });
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        inicioCierre("CIERRE", id_maestro);
        localStorage.clear();
        sessionStorage.clear();
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
// ---------- Edit modals and submitters ----------
function showEditModuleModal(id_modulo, titulo, orden) {
    const modalHTML = `
        <div id="edit-module-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Módulo</h3>
                    <button class="modal-close" id="close-edit-module">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-module-form">
                        <div class="form-group">
                            <label for="edit-module-title">Título:</label>
                            <input type="text" id="edit-module-title" value="${escapeHTML(titulo)}" required maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="edit-module-order">Orden:</label>
                            <input type="number" id="edit-module-order" value="${orden}" required min="1">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-edit-module">Cancelar</button>
                            <button type="submit" class="shiny">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('close-edit-module').addEventListener('click', () => document.getElementById('edit-module-modal').remove());
    document.getElementById('cancel-edit-module').addEventListener('click', () => document.getElementById('edit-module-modal').remove());
    document.getElementById('edit-module-form').addEventListener('submit', function(e){
        e.preventDefault();
        submitEditModule(id_modulo);
    });
}

function submitEditModule(id_modulo) {
    const titulo = document.getElementById('edit-module-title').value.trim();
    const orden = parseInt(document.getElementById('edit-module-order').value);
    const courseId = localStorage.getItem('current_course_id');
    if (!titulo) return alert('Título requerido');
    if (!orden || orden <= 0) return alert('Orden debe ser mayor que 0');

    fetch('php/moduloEdit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_modulo, titulo, orden, id_periodo_curso: courseId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Módulo actualizado');
            document.getElementById('edit-module-modal').remove();
            loadCourseModules(localStorage.getItem('current_course_id'));
        } else {
            alert('Error: ' + (data.message || data.mensaje || '')); 
        }
    }).catch(err => { console.error(err); alert('Error editando módulo'); });
}

function showEditTemaModal(id_tema, titulo) {
    // Note: temas table only stores title in current schema. Editing description not supported unless DB changed.
    const modalHTML = `
        <div id="edit-tema-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Tema</h3>
                    <button class="modal-close" id="close-edit-tema">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-tema-form">
                        <div class="form-group">
                            <label for="edit-tema-title">Título:</label>
                            <input type="text" id="edit-tema-title" value="${escapeHTML(titulo)}" required maxlength="150">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-edit-tema">Cancelar</button>
                            <button type="submit" class="shiny">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('close-edit-tema').addEventListener('click', () => document.getElementById('edit-tema-modal').remove());
    document.getElementById('cancel-edit-tema').addEventListener('click', () => document.getElementById('edit-tema-modal').remove());
    document.getElementById('edit-tema-form').addEventListener('submit', function(e){
        e.preventDefault();
        submitEditTema(id_tema);
    });
}

function submitEditTema(id_tema) {
    const titulo = document.getElementById('edit-tema-title').value.trim();
    if (!titulo) return alert('Título requerido');
    fetch('php/temasEdit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_tema, titulo })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Tema actualizado');
            document.getElementById('edit-tema-modal').remove();
            loadCourseModules(localStorage.getItem('current_course_id'));
        } else {
            alert('Error: ' + (data.message || data.mensaje || ''));
        }
    }).catch(err => { console.error(err); alert('Error editando tema'); });
}

function showEditTareaModal(id_tarea, titulo, descripcion, fecha_entrega, hora_entrega, fecha_emision, hora_emision) {
    const modalHTML = `
        <div id="edit-tarea-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Tarea</h3>
                    <button class="modal-close" id="close-edit-tarea">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-tarea-form" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="edit-tarea-title">Título:</label>
                            <input type="text" id="edit-tarea-title" value="${escapeHTML(titulo)}" required maxlength="150">
                        </div>
                        <div class="form-group">
                            <label for="edit-tarea-desc">Descripción:</label>
                            <textarea id="edit-tarea-desc" rows="4">${escapeHTML(descripcion||'')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-tarea-fecha-entrega">Fecha de Entrega:</label>
                            <input type="date" id="edit-tarea-fecha-entrega" value="${fecha_entrega}">
                        </div>
                        <div class="form-group">
                            <label for="edit-tarea-hora-entrega">Hora de Entrega:</label>
                            <input type="time" id="edit-tarea-hora-entrega" value="${hora_entrega}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-edit-tarea">Cancelar</button>
                            <button type="submit" class="shiny">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const editModal = document.getElementById('edit-tarea-modal');
    // Store emisión values in dataset for validation on submit
    if (fecha_emision) editModal.dataset.fechaEmision = fecha_emision;
    if (hora_emision) editModal.dataset.horaEmision = hora_emision;

    document.getElementById('close-edit-tarea').addEventListener('click', () => editModal.remove());
    document.getElementById('cancel-edit-tarea').addEventListener('click', () => editModal.remove());
    document.getElementById('edit-tarea-form').addEventListener('submit', function(e){
        e.preventDefault();
        submitEditTarea(id_tarea);
    });
}

function submitEditTarea(id_tarea) {
    const titulo = document.getElementById('edit-tarea-title').value.trim();
    const descripcion = document.getElementById('edit-tarea-desc').value.trim();
    const fecha_entrega = document.getElementById('edit-tarea-fecha-entrega').value;
    const hora_entrega = document.getElementById('edit-tarea-hora-entrega').value;
    if (!titulo) return alert('Título requerido');
    // validate date/time if provided: ensure entrega > emisión if emission data available
    const editModal = document.getElementById('edit-tarea-modal');
    const fecha_emision = editModal ? editModal.dataset.fechaEmision : null;
    const hora_emision = editModal ? editModal.dataset.horaEmision : null;
    if (fecha_entrega && hora_entrega && fecha_emision && hora_emision) {
        const emission = new Date(fecha_emision + 'T' + hora_emision);
        const entrega = new Date(fecha_entrega + 'T' + hora_entrega);
        if (entrega <= emission) {
            alert('La fecha/hora de entrega no puede ser menor o igual a la fecha/hora de emisión');
            return;
        }
    }

    const formData = new FormData();
    formData.append('id_tarea', id_tarea);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_entrega', fecha_entrega);
    formData.append('hora_entrega', hora_entrega);

    fetch('php/tareaEdit.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Tarea actualizada');
            document.getElementById('edit-tarea-modal').remove();
            loadCourseModules(localStorage.getItem('current_course_id'));
        } else {
            alert('Error: ' + (data.message || data.mensaje || ''));
        }
    }).catch(err => { console.error(err); alert('Error editando tarea'); });
}

function showEditEvaluacionModal(id_eval, titulo, descripcion, fecha_inicio, hora_inicio, fecha_entrega, hora_entrega) {
    const modalHTML = `
        <div id="edit-eval-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Evaluación</h3>
                    <button class="modal-close" id="close-edit-eval">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-eval-form">
                        <div class="form-group">
                            <label for="edit-eval-title">Título:</label>
                            <input type="text" id="edit-eval-title" value="${escapeHTML(titulo)}" required maxlength="150">
                        </div>
                        <div class="form-group">
                            <label for="edit-eval-desc">Descripción:</label>
                            <textarea id="edit-eval-desc" rows="4">${escapeHTML(descripcion||'')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-eval-fecha-inicio">Fecha Inicio:</label>
                            <input type="date" id="edit-eval-fecha-inicio" value="${fecha_inicio}">
                        </div>
                        <div class="form-group">
                            <label for="edit-eval-hora-inicio">Hora Inicio:</label>
                            <input type="time" id="edit-eval-hora-inicio" value="${hora_inicio}">
                        </div>
                        <div class="form-group">
                            <label for="edit-eval-fecha-entrega">Fecha Fin:</label>
                            <input type="date" id="edit-eval-fecha-entrega" value="${fecha_entrega}">
                        </div>
                        <div class="form-group">
                            <label for="edit-eval-hora-entrega">Hora Fin:</label>
                            <input type="time" id="edit-eval-hora-entrega" value="${hora_entrega}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="back" id="cancel-edit-eval">Cancelar</button>
                            <button type="submit" class="shiny">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('close-edit-eval').addEventListener('click', () => document.getElementById('edit-eval-modal').remove());
    document.getElementById('cancel-edit-eval').addEventListener('click', () => document.getElementById('edit-eval-modal').remove());
    document.getElementById('edit-eval-form').addEventListener('submit', function(e){
        e.preventDefault();
        submitEditEvaluacion(id_eval);
    });
}

function submitEditEvaluacion(id_eval) {
    const titulo = document.getElementById('edit-eval-title').value.trim();
    const descripcion = document.getElementById('edit-eval-desc').value.trim();
    const fecha_inicio = document.getElementById('edit-eval-fecha-inicio').value;
    const hora_inicio = document.getElementById('edit-eval-hora-inicio').value;
    const fecha_entrega = document.getElementById('edit-eval-fecha-entrega').value;
    const hora_entrega = document.getElementById('edit-eval-hora-entrega').value;

    if (!titulo) return alert('Título requerido');
    // Validate end > start if both provided
    if (fecha_inicio && hora_inicio && fecha_entrega && hora_entrega) {
        const start = new Date(fecha_inicio + 'T' + hora_inicio);
        const end = new Date(fecha_entrega + 'T' + hora_entrega);
        if (end <= start) return alert('La fecha/hora de fin debe ser mayor a la de inicio');
    }

    const formData = new FormData();
    formData.append('id_evaluacion', id_eval);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fecha_inicio', fecha_inicio);
    formData.append('hora_inicio', hora_inicio);
    formData.append('fecha_entrega', fecha_entrega);
    formData.append('hora_entrega', hora_entrega);

    fetch('php/evaluacionEdit.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Evaluación actualizada');
            document.getElementById('edit-eval-modal').remove();
            loadCourseModules(localStorage.getItem('current_course_id'));
        } else {
            alert('Error: ' + (data.message || data.mensaje || ''));
        }
    }).catch(err => { console.error(err); alert('Error editando evaluación'); });
}