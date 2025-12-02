// es bueno la inscripcion a los cursos 
import { obtenerIdEstudiante, formatearFecha } from './utils.js';
import { mostrarModalPago } from '../ui/modal.js';

export async function cargarInscripciones() {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
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
    
    cursos.forEach((curso) => {
        const cuposDisponibles = curso.cupos - curso.cupos_ocupados;
        const fechaInicio = formatearFecha(curso.fecha_inicio);
        const fechaFin = formatearFecha(curso.fecha_fin);
        
        const tieneDescuento = curso.descuento_aplicado !== null;
        const precioOriginal = parseFloat(curso.costo) || 0;
        const precioFinal = parseFloat(curso.precio_final) || precioOriginal;
        const ahorro = precioOriginal - precioFinal;
        
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
            
            <div class="course-pricing">
                ${tieneDescuento ? `
                    <div class="descuento-aplicado">
                        <span class="descuento-badge">${curso.descuento_aplicado}% OFF</span>
                        <div class="precios-comparacion">
                            <span class="precio-original tachado">${precioOriginal.toFixed(2)} Bs</span>
                            <span class="precio-final">${precioFinal.toFixed(2)} Bs</span>
                        </div>
                        <div class="ahorro-info">Ahorras: ${ahorro.toFixed(2)} Bs</div>
                    </div>
                ` : `
                    <div class="precio-normal">
                        <span class="precio-final">${precioFinal.toFixed(2)} Bs</span>
                    </div>
                `}
                <div class="cupos-info">
                    <span class="point-value">${cuposDisponibles}</span>
                    <span class="point-label">Cupos Disponibles</span>
                </div>
            </div>
            
            <button class="shiny course-button" data-curso-id="${curso.id_periodo_curso}">
                ${tieneDescuento ? 'Inscribirse con Descuento' : 'Inscribirse'}
            </button>
        `;
        inscripcionesContainer.appendChild(cursoCard);
    });
    
    // Agregar event listeners después de crear los botones
    agregarEventListenersInscripcion();
}

function agregarEventListenersInscripcion() {
    const botones = document.querySelectorAll('.course-button[data-curso-id]');
    
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            const idCurso = this.getAttribute('data-curso-id');
            inscribirEnCurso(parseInt(idCurso));
        });
    });
}


async function inscribirEnCurso(idPeriodoCurso) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!idEstudiante) {
            alert('Debes iniciar sesión para inscribirte');
            return;
        }
        
        const response = await fetch(`php/inscripcionesGet.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();
        
        if (data.exito && data.cursos) {
            const curso = data.cursos.find(c => c.id_periodo_curso === idPeriodoCurso);
            
            if (curso) {
                // PASAR LA INFORMACIÓN DEL DESCUENTO AL MODAL
                mostrarModalPago(curso);
                return;
            }
        }
        
        alert('Curso no encontrado');
        
    } catch (error) {
        alert('Error al cargar información del curso');
    }
}

async function procesarInscripcionConDescuento(idPeriodoCurso, idDescuento = null) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_periodo_curso', idPeriodoCurso);
        
        if (idDescuento) {
            formData.append('id_descuento', idDescuento);
        }

        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.exito) {
            alert('Inscripción exitosa');
            // Recargar la vista de cursos
            cargarInscripciones();
            // Opcional: cambiar a la pestaña de cursos
            document.querySelector('[data-tab="cursos"]').click();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        alert('Error de conexión');
    }
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