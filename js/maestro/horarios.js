// horarios para maestro - carga, muestra, filtra y elimina horarios

window.cargarHorariosMaestro = async function() { // 51 Mae: Reporte de Horarios 0
    try {
        const idMaestro = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        const container = document.getElementById('horarios-maestro-container');
        if (!container) return;

        if (!idMaestro) {
            container.innerHTML = `<div class="content-card"><h3>Debes iniciar sesión</h3></div>`;
            return;
        }


        container.innerHTML = `<div class="loading-message"><div class="loading-spinner"></div><p>Cargando horarios...</p></div>`;

        const res = await fetch(`php/consultarHorarioByMaestro.php?id_maestro=${idMaestro}`);
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        const data = await res.json();

        if (!data.exito) {
            container.innerHTML = `<div class="content-card"><h3>Error: ${data.mensaje}</h3></div>`;
            return;
        }

        const cursos = data.cursos || [];
        renderHorariosMaestro(cursos);

    } catch (err) {
        console.error('Error cargarHorariosMaestro:', err);
        const container = document.getElementById('horarios-maestro-container');
        if (container) container.innerHTML = `<div class="content-card"><h3>Error al cargar horarios</h3></div>`;
    }
}

function renderHorariosMaestro(cursos) {
    const horariosSection = document.getElementById('horarios-maestro-section');
    const container = document.getElementById('horarios-maestro-container');
    if (!container || !horariosSection) return;

    container.innerHTML = '';

    // Remover filtros existentes
    const filtrosExistentes = horariosSection.querySelector('.filtros-horarios');
    if (filtrosExistentes) {
        filtrosExistentes.remove();
    }

    // Crear filtros
    const filtrosDiv = document.createElement('div');
    filtrosDiv.className = 'filtros-horarios';
    filtrosDiv.innerHTML = `
        <h3>Filtrar por Curso:</h3>
        <div class="filtro-buttons">
            <button class="filtro-btn filtro-btn-todos active" onclick="filtrarHorariosMaestro('todos')">Ver Todos</button>
        </div>
    `;

    cursos.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'filtro-btn';
        btn.textContent = c.nombre_curso || `Curso ${c.id_periodo_curso}`;
        btn.setAttribute('data-curso-id', c.id_periodo_curso);
        btn.addEventListener('click', () => filtrarHorariosMaestro(c.id_periodo_curso));
        filtrosDiv.querySelector('.filtro-buttons').appendChild(btn);
    });

    horariosSection.insertBefore(filtrosDiv, container);

    // Mostrar cada curso y sus horarios (o mensaje si no configurado)
    cursos.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'horario-card';
        card.setAttribute('data-curso-id', curso.id_periodo_curso);

        let inner = `
            <div class="horario-header">
                <div class="horario-curso-info">
                    <h3 class="horario-curso-title">${escapeHTML(curso.nombre_curso || 'Sin nombre')}</h3>
                    <p class="horario-fechas">${formatDate(curso.fecha_inicio)} al ${formatDate(curso.fecha_fin)}</p>
                </div>
                <div class="horario-actions">
        `;

        if (!curso.horarios || curso.horarios.length === 0) {
            inner += `
                <div class="no-horario">
                    <p><strong>Horario no configurado</strong></p>
                    <button class="shiny" onclick="showConfigHorarioModal(${curso.id_periodo_curso}, '${escapeJS(curso.nombre_curso)}')">Configurar Horario</button>
                </div>
            `;
        } else {
            inner += `
                <button class="back" onclick="confirmEliminarHorario(${curso.id_periodo_curso}, '${escapeJS(curso.nombre_curso)}')">Eliminar Horario</button>
                <button class="shiny" onclick="showConfigHorarioModal(${curso.id_periodo_curso}, '${escapeJS(curso.nombre_curso)}')">Editar Horario</button>
            `;
        }

        inner += `</div></div>`;

        if (curso.horarios && curso.horarios.length > 0) {
            inner += `
                <div class="horario-contenido">
                    <div class="horario-table-container">
                        <table class="horario-table">
                            <thead>
                                <tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Aula</th><th>Capacidad</th></tr>
                            </thead>
                            <tbody>
            `;

            const diasOrden = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
            diasOrden.forEach(dia => {
                curso.horarios.filter(h => h.dia === dia).forEach(horario => {
                    inner += `<tr><td>${dia}</td><td>${formatTime(horario.hora_inicio)}</td><td>${formatTime(horario.hora_fin)}</td><td>${horario.id_aula? 'Aula ' + horario.id_aula : 'N/A'}</td><td>${horario.capacidad || 'N/A'}</td></tr>`;
                });
            });

            inner += `</tbody></table></div></div>`;
        }

        card.innerHTML = inner;
        container.appendChild(card);
    });
}

window.confirmEliminarHorario = function(idPeriodo, nombreCurso) {
    if (!confirm(`¿Eliminar el horario completo para el curso: ${nombreCurso} ? Esta acción es irreversible.`)) return;
    eliminarHorarioPorCurso(idPeriodo);
}

async function eliminarHorarioPorCurso(idPeriodo) {
    try {
        const res = await fetch('php/eliminarHorarioByCUrso.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_periodo_curso: idPeriodo })
        });
        const data = await res.json();
        if (data.success) {
            alert('Horario eliminado correctamente');
            window.cargarHorariosMaestro();
        } else {
            alert('Error al eliminar horario: ' + (data.message || ''));
        }
    } catch (err) {
        console.error('Error eliminarHorarioPorCurso:', err);
        alert('Error al eliminar horario');
    }
}

window.filtrarHorariosMaestro = function(idCurso) {
    const cards = document.querySelectorAll('#horarios-maestro-container .horario-card');
    const botones = document.querySelectorAll('.filtros-horarios .filtro-btn');
    botones.forEach(b => b.classList.remove('active'));
    if (idCurso === 'todos') {
        document.querySelector('.filtro-btn-todos').classList.add('active');
    } else {
        const btn = document.querySelector(`.filtros-horarios .filtro-btn[data-curso-id="${idCurso}"]`);
        if (btn) btn.classList.add('active');
    }

    cards.forEach(c => {
        if (idCurso === 'todos') c.style.display = 'block';
        else c.style.display = c.getAttribute('data-curso-id') === idCurso.toString() ? 'block' : 'none';
    });
}

function formatTime(hora) {
    if (!hora) return 'N/A';
    const p = hora.split(':');
    return p.length >= 2 ? `${p[0]}:${p[1]}` : hora;
}

function formatDate(d) {
    if (!d) return 'N/A';
    try { const dt = new Date(d); return dt.toLocaleDateString('es-ES'); } catch(e) { return d; }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function escapeJS(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}
