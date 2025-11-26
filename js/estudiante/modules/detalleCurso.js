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

// ===== SISTEMA DE ENTREGAS ===== //

function configurarEntregas() {
    console.log("🔍 Configurando event listeners para entregas...");
    
    const botones = document.querySelectorAll('.entregar-actividad-btn');
    console.log("🔍 Botones encontrados:", botones.length);
    
    botones.forEach((button, index) => {
        console.log(`🔍 Configurando botón ${index}:`, button);
        
        button.addEventListener('click', function() {
            console.log("🔍 CLICK en botón de entrega");
            const idActividad = this.getAttribute('data-id');
            const tipoActividad = this.getAttribute('data-tipo');
            
            console.log("🔍 Datos:", { idActividad, tipoActividad });
            entregarActividad(idActividad, tipoActividad);
        });
    });
}

async function entregarActividad(idActividad, tipoActividad) {
    try {
        console.log("🔍 entregarActividad EJECUTADA");
        console.log("🔍 ID:", idActividad, "Tipo:", tipoActividad);

        const idEstudiante = localStorage.getItem('id_user');
        console.log("🔍 ID Estudiante:", idEstudiante);
        
        if (!idEstudiante) {
            alert('Debes iniciar sesión para entregar actividades');
            return;
        }

        // Confirmación
        const mensaje = tipoActividad === 'tarea' 
            ? '¿Entregar esta tarea?' 
            : '¿Comenzar esta evaluación?';
            
        if (!confirm(mensaje)) return;

        // Enviar al PHP
        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_actividad', idActividad);
        formData.append('tipo_actividad', tipoActividad);

        console.log("🔍 Enviando a PHP...");
        const response = await fetch('php/entregarActividad.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log("🔍 Respuesta PHP:", data);

        if (data.exito) {
            alert('✅ ' + data.mensaje);
            actualizarUIEntrega(idActividad, tipoActividad);
        } else {
            alert('❌ ' + data.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function actualizarUIEntrega(idActividad, tipoActividad) {
    // Actualizar estado en la UI
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
        boton.style.background = '#27ae60';
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
            console.log("🔍 Entregas encontradas:", data.entregas);
            
            // Marcar como entregadas todas las actividades que están en la lista
            data.entregas.forEach(idPublicacion => {
                console.log("🔍 Verificando entrega para:", idPublicacion);
                
                // Buscar si existe una actividad con este ID en el DOM
                const actividadElement = document.querySelector(`[data-id="${idPublicacion}"]`);
                if (actividadElement) {
                    const tipoActividad = actividadElement.getAttribute('data-tipo');
                    console.log("🔍 Actualizando UI para:", idPublicacion, tipoActividad);
                    actualizarUIEntrega(idPublicacion, tipoActividad);
                }
            });
        }
    } catch (error) {
        console.error('Error al verificar entregas:', error);
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