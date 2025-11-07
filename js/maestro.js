const params = new URLSearchParams(window.location.search);
let usuario = params.get("usuario");

function showSection(sectionId) {
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        if (sectionId === 'current-courses') {
            loadMyCourses();
        }
    }
}

async function loadMyCourses() {
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

function showCourseDetails(courseId, courseTitle, courseInscritos) {
    const contentArea = document.querySelector('.content-area');
    
    // Guardar el ID del curso actual en localStorage
    localStorage.setItem('current_course_id', courseId);
    
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
    
    // Cargar módulos del curso
    loadCourseModules(courseId);
    
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

function showCreateModuleModal(courseId, courseTitle) {
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

function showCreateTemaModal(courseId, courseTitle) {
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
                            <form id="create-tema-form">
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

function showCreateTareaModal(courseId, courseTitle) {
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
                            <form id="create-tarea-form">
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

function showCreateEvaluacionModal(courseId, courseTitle) {
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
                            <form id="create-evaluacion-form">
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
    
    document.getElementById('close-tema-modal').addEventListener('click', closeTemaModal);
    document.getElementById('cancel-tema').addEventListener('click', closeTemaModal);
    
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
    
    document.getElementById('close-tarea-modal').addEventListener('click', closeTareaModal);
    document.getElementById('cancel-tarea').addEventListener('click', closeTareaModal);
    
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
    
    document.getElementById('close-evaluacion-modal').addEventListener('click', closeEvaluacionModal);
    document.getElementById('cancel-evaluacion').addEventListener('click', closeEvaluacionModal);
    
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
    
    if (!id_modulo) {
        alert('Por favor, selecciona un módulo');
        return;
    }
    
    if (!titulo) {
        alert('Por favor, ingresa un título para el tema');
        return;
    }
    
    fetch("php/temasNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_modulo: id_modulo,
            titulo: titulo
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Tema creado exitosamente');
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
    
    fetch("php/tareaNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_modulo: id_modulo,
            titulo: titulo,
            descripcion: descripcion,
            fecha_emision: fecha_emision,
            hora_emision: hora_emision,
            fecha_entrega: fecha_entrega,
            hora_entrega: hora_entrega
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Tarea creada exitosamente');
            closeTareaModal();
            const courseId = localStorage.getItem('current_course_id');
            loadCourseModules(courseId); // Recargar la lista de módulos con tareas
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
    
    fetch("php/evaluacionNew.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_modulo: id_modulo,
            titulo: titulo,
            descripcion: descripcion,
            fecha_emision: fecha_emision,
            hora_emision: hora_emision,
            fecha_inicio: fecha_inicio,
            hora_inicio: hora_inicio,
            fecha_entrega: fecha_entrega,
            hora_entrega: hora_entrega,
            deskpoints: deskpoints
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Evaluación creada exitosamente');
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
                    <button class="shiny small">Editar</button>
                    <button class="back small">Eliminar</button>
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
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small">Editar</button>
                                    <button class="back small">Eliminar</button>
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
                                    <small>Entrega: ${formatDate(tarea.fecha_entrega)} ${tarea.hora_entrega}</small>
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small">Editar</button>
                                    <button class="back small">Eliminar</button>
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
                                    <small>Inicio: ${formatDate(evaluacion.fecha_inicio)} ${evaluacion.hora_inicio}</small>
                                    <small>Entrega: ${formatDate(evaluacion.fecha_entrega)} ${evaluacion.hora_entrega}</small>
                                    <small>Puntos: ${evaluacion.deskpoints}</small>
                                </div>
                                <div class="tema-actions">
                                    <button class="shiny small">Editar</button>
                                    <button class="back small">Eliminar</button>
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
});