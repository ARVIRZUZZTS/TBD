//mas especifico para cada curso
import { formatearFecha, formatFileSize, manejarDescargaArchivo } from './utils.js';

export async function cargarDetalleCurso(idPeriodoCurso) {
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
            <!-- Contenedor para el botón de asistencia -->
            <div class="asistencia-section" id="asistencia-section">
                <button class="asistencia-btn" onclick="marcarAsistencia(${idPeriodoCurso})">
                    <span class="icon">✓</span>
                    Marcar Asistencia
                </button>
                <p class="asistencia-info">Marca tu asistencia diaria para este curso</p>
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
    setTimeout(() => {
        configurarEntregas();
        verificarEstadosEntregas();
    }, 100);
}

function crearCardTarea(tarea) {
    const fechaEntrega = formatearFecha(tarea.fecha_entrega, tarea.hora_entrega);
    const tieneArchivo = tarea.archivo_url && tarea.archivo_url !== '';
    
    return `
        <div class="actividad-card tarea" data-tipo="tarea" data-id="${tarea.id_tarea}">
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
                    <div class="estado-info">
                        <strong>Estado:</strong> <span class="estado-actividad estado-pendiente" id="estado-tarea-${tarea.id_tarea}">Pendiente</span>
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
                <button class="shiny small entregar-actividad-btn" 
                        data-id="${tarea.id_tarea}" 
                        data-tipo="tarea">
                    Entregar Tarea
                </button>
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
        <div class="actividad-card evaluacion" data-tipo="evaluacion" data-id="${evaluacion.id_evaluacion}">
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
                    <div class="estado-info">
                        <strong>Estado:</strong> <span class="estado-actividad estado-pendiente" id="estado-evaluacion-${evaluacion.id_evaluacion}">Pendiente</span>
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
                <button class="shiny small entregar-actividad-btn" 
                        data-id="${evaluacion.id_evaluacion}" 
                        data-tipo="evaluacion">
                    Comenzar Evaluación
                </button>
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

function configurarDescargas() {
    document.querySelectorAll('.descargar-archivo').forEach(button => {
        button.addEventListener('click', function() {
            const archivoUrl = this.getAttribute('data-archivo');
            const nombreArchivo = this.getAttribute('data-nombre');
            manejarDescargaArchivo(archivoUrl, nombreArchivo);
        });
    });
}

function configurarEntregas() {

    
    const botones = document.querySelectorAll('.entregar-actividad-btn');

    
    botones.forEach((button, index) => {
        button.addEventListener('click', function() {
            const idActividad = this.getAttribute('data-id');
            const tipoActividad = this.getAttribute('data-tipo');
            
            entregarActividad(idActividad, tipoActividad);
        });
    });
}

async function entregarActividad(idActividad, tipoActividad) {
    try {

        const idEstudiante = localStorage.getItem('id_user');
        
        if (!idEstudiante) {
            alert('Debes iniciar sesión para entregar actividades');
            return;
        }

        // Formatear id_publicacion según el tipo
        const idPublicacion = tipoActividad === 'tarea' 
            ? `TA-${idActividad}` 
            : `EV-${idActividad}`;
        
        const mensaje = tipoActividad === 'tarea' 
            ? '¿Entregar esta tarea?' 
            : '¿Comenzar esta evaluación?';
            
        if (!confirm(mensaje)) return;

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_publicacion', idPublicacion); // ← ENVIAR FORMATEADO
        formData.append('tipo_actividad', tipoActividad);

        const response = await fetch('php/entregarActividad.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.exito) {
            alert( data.mensaje);
            actualizarUIEntrega(idActividad, tipoActividad);
        } else {
            alert( data.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function actualizarUIEntrega(idActividad, tipoActividad) {
    const estadoElement = document.getElementById(`estado-${tipoActividad}-${idActividad}`);
    if (estadoElement) {
        estadoElement.textContent = 'Entregado';
        estadoElement.className = 'estado-actividad estado-entregado';
    }

    // Deshabilitar botón
    const boton = document.querySelector(`[data-id="${idActividad}"][data-tipo="${tipoActividad}"]`);
    if (boton) {
        boton.disabled = true;
        boton.textContent = tipoActividad === 'tarea' ? '✓ Tarea Entregada' : '✓ Evaluación Entregada';
        boton.style.background = 'var(--butt)';
        boton.style.cursor = 'not-allowed';
    }
}

async function verificarEstadosEntregas() {
    try {
        const idEstudiante = localStorage.getItem('id_user');
        
        if (!idEstudiante) return;

        const response = await fetch(`php/obtenerEntregas.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();

        if (data.exito && data.entregas) {
            
            // Marcar como entregadas todas las actividades que están en la lista
            data.entregas.forEach(idPublicacion => {
                
                // Extraer tipo e ID del formato TA-123 o EV-456
                const [prefijo, idActividad] = idPublicacion.split('-');
                const tipoActividad = prefijo === 'TA' ? 'tarea' : 'evaluacion';
                
                // Buscar si existe una actividad con este ID en el DOM
                const actividadElement = document.querySelector(`[data-id="${idActividad}"]`);
                if (actividadElement) {
                    actualizarUIEntrega(idActividad, tipoActividad);
                }
            });
        }
    } catch (error) {
        console.error('Error al verificar entregas:', error);
    }
}
async function marcarAsistencia(idPeriodoCurso) {
    try {
        const idEstudiante = localStorage.getItem('id_user');
        if (!idEstudiante) {
            alert('Debes iniciar sesión para marcar asistencia');
            return;
        }
        if(!idPeriodoCurso){
            alert('ID de periodo curso no válido');
            return;
        }
        // intentar identificar el botón que llamó a la función para prevenir dobles clicks
        const posibleBtn = document.activeElement;
        let originalDisabled = false;
        if (posibleBtn && posibleBtn.tagName === 'BUTTON') {
            originalDisabled = posibleBtn.disabled;
            posibleBtn.disabled = true;
        }

        const form = new FormData();
        form.append('id_estudiante', idEstudiante);
        form.append('id_periodo_curso', idPeriodoCurso);

        const response = await fetch('php/marcarAsistencia.php', {
            method: 'POST',
            body: form,
            credentials: 'same-origin'
        });

        const data = await response.json();

        // restaurar botón (pequeña protección local: se deja deshabilitado unos segundos)
        if (posibleBtn && posibleBtn.tagName === 'BUTTON') {
            // Si la marca fue exitosa, dejarlo deshabilitado; si no, reactivar en 2s
            if (data.exito) {
                // mantener deshabilitado para evitar doble envío accidental
                // (la protección definitiva está en el servidor por 2 horas)
                posibleBtn.textContent = 'Asistencia registrada';
                posibleBtn.style.cursor = 'not-allowed';
            } else {
                setTimeout(() => { posibleBtn.disabled = originalDisabled; }, 2000);
            }
        }

        if (data.exito) {
            alert(data.mensaje || 'Asistencia registrada');
            // Si el backend devuelve la nueva cantidad, mostrarla en algún lugar si existe
            if (data.asistencia !== undefined) {
                console.log('Nueva asistencia:', data.asistencia);
            }
        } else {
            // Mostrar mensaje de error y tiempo restante si viene
            let msg = data.mensaje || 'No se pudo registrar la asistencia';
            if (data.segundos_restantes) {
                const hrs = Math.floor(data.segundos_restantes / 3600);
                const mins = Math.floor((data.segundos_restantes % 3600) / 60);
                const secs = data.segundos_restantes % 60;
                msg += `\nTiempo restante: ${hrs}h ${mins}m ${secs}s`;
            }
            alert(msg);
        }

    }catch(error) { 
        console.error('Error marcarAsistencia:', error);
        alert('Error de conexión al marcar asistencia');
    }
}

// Exportar para uso global desde HTML
window.volverACursos = () => {
    const detalleView = document.getElementById('curso-detalle');
    if (detalleView) {
        detalleView.classList.remove('active');
        detalleView.innerHTML = ''; 
    }
    
    document.getElementById('cursos').classList.add('active');
    window.dispatchEvent(new CustomEvent('recargarCursos'));
};
window.marcarAsistencia = marcarAsistencia;
window.volverACursos = volverACursos;
window.entregarActividad = entregarActividad;