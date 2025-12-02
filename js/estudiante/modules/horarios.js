// horarios.js - Módulo para gestionar los horarios de clases del estudiante
import { obtenerIdEstudiante, formatearFecha } from './utils.js';

export async function cargarHorarios() {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!idEstudiante) {
            mostrarHorariosVacios("Debes iniciar sesión");
            return;
        }
        
        const response = await fetch(`php/consultarHorarioByEstudiante.php?id_estudiante=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.exito && data.cursos && data.cursos.length > 0) {
            mostrarHorarios(data.cursos);
        } else {
            mostrarHorariosVacios(data.mensaje || "No tienes horarios disponibles");
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        mostrarHorariosVacios("Error al cargar los horarios");
    }
}

export function mostrarHorarios(cursos) {
    const horariosContainer = document.querySelector('#horarios .content-grid');
    horariosContainer.innerHTML = '';
    
    // Crear botones de filtro para cada curso
    const filtrosContainer = document.createElement('div');
    filtrosContainer.className = 'filtros-horarios';
    filtrosContainer.innerHTML = `
        <h3>Filtrar por Curso:</h3>
        <div class="filtro-buttons">
            <button class="filtro-btn filtro-btn-todos active" onclick="filtrarPorCurso('todos')">
                Ver Todos
            </button>
    `;
    
    cursos.forEach((curso, index) => {
        const btn = document.createElement('button');
        btn.className = 'filtro-btn';
        btn.textContent = curso.nombre_curso;
        btn.setAttribute('data-curso-id', curso.id_periodo_curso);
        btn.setAttribute('onclick', `filtrarPorCurso('${curso.id_periodo_curso}')`);
        filtrosContainer.querySelector('.filtro-buttons').appendChild(btn);
    });
    
    filtrosContainer.querySelector('.filtro-buttons').innerHTML += '</div>';
    horariosContainer.parentElement.insertBefore(filtrosContainer, horariosContainer);
    
    // Mostrar todos los horarios inicialmente
    cursos.forEach(curso => {
        mostrarHorariosCurso(curso, horariosContainer);
    });
}

function mostrarHorariosCurso(curso, container) {
    if (!curso.horarios || curso.horarios.length === 0) {
        return; // No mostrar cursos sin horarios
    }
    
    const horarioCard = document.createElement('div');
    horarioCard.className = 'horario-card';
    horarioCard.setAttribute('data-curso-id', curso.id_periodo_curso);
    
    // Agrupar horarios por día
    const horariosPorDia = agruparHorariosPorDia(curso.horarios);
    
    let horariosHTML = `
        <div class="horario-header">
            <div class="horario-curso-info">
                <h3 class="horario-curso-title">${curso.nombre_curso}</h3>
                <p class="horario-profesor">
                    Profesor: ${curso.nombre_profesor} ${curso.apellido_profesor}
                </p>
                <p class="horario-fechas">
                    ${formatearFecha(curso.fecha_inicio)} al ${formatearFecha(curso.fecha_fin)}
                </p>
            </div>
        </div>
        <div class="horario-contenido">
            <div class="horario-table-container">
                <table class="horario-table">
                    <thead>
                        <tr>
                            <th>Día</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Aula</th>
                            <th>Capacidad</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    diasOrden.forEach(dia => {
        if (horariosPorDia[dia]) {
            horariosPorDia[dia].forEach(horario => {
                const horaInicio = formatearHora(horario.hora_inicio);
                const horaFin = formatearHora(horario.hora_fin);
                const nombreAula = horario.id_aula ? `Aula ${horario.id_aula}` : 'N/A';
                const capacidad = horario.capacidad || 'N/A';
                
                horariosHTML += `
                    <tr>
                        <td class="dia-cell">${dia}</td>
                        <td class="hora-cell">${horaInicio}</td>
                        <td class="hora-cell">${horaFin}</td>
                        <td class="aula-cell">${nombreAula}</td>
                        <td class="capacidad-cell">${capacidad}</td>
                    </tr>
                `;
            });
        }
    });
    
    horariosHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    horarioCard.innerHTML = horariosHTML;
    container.appendChild(horarioCard);
}

function agruparHorariosPorDia(horarios) {
    const agrupado = {};
    
    horarios.forEach(horario => {
        const dia = horario.dia;
        if (!agrupado[dia]) {
            agrupado[dia] = [];
        }
        agrupado[dia].push(horario);
    });
    
    return agrupado;
}

export function mostrarHorariosVacios(mensaje = "No tienes horarios disponibles") {
    const horariosContainer = document.querySelector('#horarios .content-grid');
    horariosContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>Una vez que te inscribas en cursos, verás tus horarios de clases aquí.</p>
        </div>
    `;
    
    // Remover filtros si existen
    const filtrosExistentes = document.querySelector('.filtros-horarios');
    if (filtrosExistentes) {
        filtrosExistentes.remove();
    }
}

// Exportar para uso global desde HTML
window.filtrarPorCurso = (idCurso) => {
    const horarioCards = document.querySelectorAll('.horario-card');
    const filtrosBtn = document.querySelectorAll('.filtro-btn');
    
    // Actualizar estado de botones
    filtrosBtn.forEach(btn => {
        btn.classList.remove('active');
        if (idCurso === 'todos' && btn.classList.contains('filtro-btn-todos')) {
            btn.classList.add('active');
        } else if (btn.getAttribute('data-curso-id') === idCurso.toString()) {
            btn.classList.add('active');
        }
    });
    
    // Mostrar/ocultar tarjetas
    horarioCards.forEach(card => {
        if (idCurso === 'todos') {
            card.style.display = 'block';
        } else {
            const cursoId = card.getAttribute('data-curso-id');
            card.style.display = cursoId === idCurso.toString() ? 'block' : 'none';
        }
    });
};

function formatearHora(hora) {
    if (!hora) return 'N/A';
    // La hora viene en formato HH:MM:SS
    const partes = hora.split(':');
    if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`;
    }
    return hora;
}
