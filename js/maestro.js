// Bootstrapper: carga la implementación modular del portal de maestro
(async function(){
    try {
        await import('./maestro/main.js');
    } catch (e) {
        console.error('Error al inicializar el módulo maestro:', e);
    }
})();

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
                                    ${tema.archivo_url ? `
                                        <div class="archivo-adjunto">
                                            <a href="php/descargar.php?archivo=${tema.archivo_url.replace('uploads/', '')}" class="archivo-link" target="_blank">
                                                📎 ${tema.archivo_nombre || 'Archivo adjunto'}
                                            </a>
                                        </div>
                                    ` : ''}
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

function showConfigHorarioModal(courseId, courseTitle) {
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
});

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "inicio.html";
    }
}