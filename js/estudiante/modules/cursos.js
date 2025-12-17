//como dice el nombre aca gestionamos todo lo relacionado a los cursos del estudiante
import { obtenerIdEstudiante } from './utils.js';
import { cargarDetalleCurso } from './detalleCurso.js';

export async function cargarCursosEstudiante() {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!idEstudiante) {
            mostrarCursosVacios();
            return;
        }
        
        const response = await fetch(`php/cursoEstudianteGet.php?id_estudiante=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.exito && data.cursos && data.cursos.length > 0) {
            mostrarCursos(data.cursos);
        } else {
            mostrarCursosVacios(data.mensaje || "No tienes cursos asignados");
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarCursosVacios("Error al cargar los cursos");
    }
}

export function mostrarCursos(cursos) {
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
                    <span class="info-value">${curso.asistencia || 0}</span>
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

export function mostrarCursosVacios(mensaje = "No tienes cursos asignados") {
    const cursosContainer = document.querySelector('#cursos .content-grid');
    cursosContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>Contacta con administración para más información.</p>
        </div>
    `;
}

// Exportar para uso global desde HTML
window.abrirDetalleCurso = (idPeriodoCurso) => {
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
};
// cursos.js - AGREGAR AL FINAL DEL ARCHIVO
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