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

// Exportar para uso global desde HTML
window.inscribirEnCurso = async (idPeriodoCurso) => {
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
                mostrarModalPago(curso);
                return;
            }
        }
        
        alert('Curso no encontrado');
        
    } catch (error) {
        console.error('Error al preparar inscripción:', error);
        alert('Error al cargar información del curso');
    }
};