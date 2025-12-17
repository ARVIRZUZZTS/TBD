// nuevo
// Módulo de reportes para maestros

async function cargarReportesMaestro() {
    // nuevo
    const id_maestro = window.id_maestro;
    const reportesSection = document.getElementById('reportes');
    if (!reportesSection) return console.error('Sección reportes no encontrada');

    // Limpiar
    reportesSection.innerHTML = '';

    // UI básica
    const ui = document.createElement('div');
    ui.className = 'reportes-ui';
    ui.innerHTML = `
        <div class="reportes-controls">
            <label for="tipo-reporte">Tipo de Reporte:</label>
            <select id="tipo-reporte" class="styled-select">
                <option value="general">General</option>
                <option value="individual">Individual</option>
            </select>
        </div>
        <div id="reportes-dinamico"></div>
    `;

    reportesSection.appendChild(ui);

    document.getElementById('tipo-reporte').addEventListener('change', (e) => {
        const val = e.target.value;
        const dyn = document.getElementById('reportes-dinamico');
        dyn.innerHTML = '';
        if (val === 'general') {
            renderGeneralReport(id_maestro); // nuevo
        } else {
            renderIndividualSelector(id_maestro); // nuevo
        }
    });

    // Render por defecto
    renderGeneralReport(id_maestro); // nuevo
}

// nuevo
async function renderGeneralReport(id_maestro) {
    const dyn = document.getElementById('reportes-dinamico');
    dyn.innerHTML = '<div class="loading-message"><div class="loading-spinner"></div> Cargando reportes generales...</div>';

    try {
        const res = await fetch(`php/reportes_cursos_maestro.php?id_maestro=${id_maestro}`);
        const data = await res.json();
        if (!data.exito) {
            dyn.innerHTML = `<div class="error-message">${data.mensaje}</div>`;
            return;
        }

        const cursos = data.cursos;
        // Controles de orden
        const controls = document.createElement('div');
        controls.className = 'reportes-general-controls';
        controls.innerHTML = `
            <label>Ordenar por:</label>
            <select id="orden-general" class="styled-select">
                <option value="inscritos">Número de alumnos</option>
                <option value="ganancia">Ganancia estimada</option>
                <option value="aprobados">Cursos con más aprobados</option>
            </select>
        `;
        dyn.innerHTML = '';
        dyn.appendChild(controls);

        const tableDiv = document.createElement('div');
        tableDiv.className = 'reportes-general-table';
        tableDiv.innerHTML = `
            <table class="entregas-tabla">
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Inscritos</th>
                        <th>Ganancia Estimada</th>
                        <th>Aprobados</th>
                    </tr>
                </thead>
                <tbody id="reportes-general-body"></tbody>
            </table>
        `;
        dyn.appendChild(tableDiv);

        function draw(sorted) {
            const body = document.getElementById('reportes-general-body');
            body.innerHTML = '';
            sorted.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHTML(c.titulo_curso)}</td>
                    <td>${c.inscritos}</td>
                    <td>${(parseFloat(c.ganancia_estimada)||0).toFixed(2)} Bs</td>
                    <td>${c.aprobados}</td>
                `;
                body.appendChild(tr);
            });
        }

        document.getElementById('orden-general').addEventListener('change', (e) => {
            const val = e.target.value;
            let sorted = cursos.slice();
            if (val === 'inscritos') sorted.sort((a,b) => b.inscritos - a.inscritos);
            if (val === 'ganancia') sorted.sort((a,b) => b.ganancia_estimada - a.ganancia_estimada);
            if (val === 'aprobados') sorted.sort((a,b) => b.aprobados - a.aprobados);
            draw(sorted);
        });

        // dibuja por defecto por inscritos
        document.getElementById('orden-general').value = 'inscritos';
        document.getElementById('orden-general').dispatchEvent(new Event('change'));

    } catch (err) {
        dyn.innerHTML = '<div class="error-message">Error al cargar reportes generales</div>';
        console.error(err);
    }
}

// nuevo
async function renderIndividualSelector(id_maestro) {
    const dyn = document.getElementById('reportes-dinamico');
    dyn.innerHTML = '<div class="loading-message"><div class="loading-spinner"></div> Cargando cursos...</div>';

    try {
        // Obtener cursos del maestro (usar pcGetByMaestro.php)
        const payload = { idMaestro: id_maestro };
        const res = await fetch('php/pcGetByMaestro.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        dyn.innerHTML = '';
        if (!data.success) return dyn.innerHTML = '<div class="error-message">Error al cargar cursos</div>';

        const cursos = data.cursos || [];
        const selector = document.createElement('div');
        selector.className = 'reportes-individual-select';
        selector.innerHTML = `
            <label for="select-curso-reporte">Selecciona una materia:</label>
            <select id="select-curso-reporte" class="styled-select">
                <option value="">-- Seleccionar curso --</option>
            </select>
            <label for="tipo-detalle">Mostrar:</label>
            <select id="tipo-detalle" class="styled-select">
                <option value="tabla">Tabla de notas y métricas</option>
                <option value="progreso">Barra de progreso por estudiante</option>
                <option value="mejores">Lista de mejores estudiantes</option>
            </select>
            <div style="margin-top:8px;"><button id="generar-reporte" class="shiny">Generar</button></div>
        `;
        dyn.appendChild(selector);

        const selectEl = selector.querySelector('#select-curso-reporte');
        cursos.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_periodo_curso;
            opt.textContent = `${c.titulo} (${c.periodo || ''})`;
            selectEl.appendChild(opt);
        });

        selector.querySelector('#generar-reporte').addEventListener('click', () => {
            const id_pc = selectEl.value;
            const tipo = selector.querySelector('#tipo-detalle').value;
            if (!id_pc) return alert('Selecciona un curso');
            generateIndividualReport(id_maestro, id_pc, tipo); // nuevo
        });

    } catch (err) {
        dyn.innerHTML = '<div class="error-message">Error al cargar cursos</div>';
        console.error(err);
    }
}

// nuevo
async function generateIndividualReport(id_maestro, id_periodo_curso, tipo) {
    const dyn = document.getElementById('reportes-dinamico');
    dyn.innerHTML = '<div class="loading-message"><div class="loading-spinner"></div> Generando reporte...</div>';

    try {
        const res = await fetch(`php/reporte_individual_por_curso.php?id_periodo_curso=${id_periodo_curso}&id_maestro=${id_maestro}`);
        const data = await res.json();
        if (!data.exito) return dyn.innerHTML = `<div class="error-message">${data.mensaje}</div>`;

        const students = data.students || [];
        const total_evaluaciones = data.total_evaluaciones || 0;

        // Añadir botón volver arriba del contenido generado
        dyn.innerHTML = '';
        (function addBackButton(container){
            const wrap = document.createElement('div');
            wrap.className = 'reportes-back-wrap';
            wrap.innerHTML = `<button id="btn-volver-reporte" class="shiny">&larr; Volver</button>`;
            container.appendChild(wrap);
            const btn = wrap.querySelector('button');
            btn.addEventListener('click', () => {
                // Regresa a la página principal de reportes
                cargarReportesMaestro();
            });
        })(dyn);

        if (tipo === 'tabla') {
            // render tabla
            const tableDiv = document.createElement('div');
            tableDiv.innerHTML = `
                <table class="entregas-tabla">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Tareas completadas</th>
                            <th>Evaluaciones completadas</th>
                            <th>Asistencias</th>
                            <th>Promedio (evaluaciones)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td>${escapeHTML(s.nombre)} ${escapeHTML(s.apellido)}</td>
                                <td>${s.tareas_completadas}</td>
                                <td>${s.evaluaciones_completadas}</td>
                                <td>${s.asistencia}</td>
                                <td>${s.promedio_evaluaciones !== null ? parseFloat(s.promedio_evaluaciones).toFixed(2) : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            dyn.appendChild(tableDiv);
        } else if (tipo === 'progreso') {
            // progress bars: evaluaciones completadas / total_evaluaciones
            const progContainer = document.createElement('div');
            progContainer.className = 'reportes-progreso-container';
            students.forEach(s => {
                const percent = total_evaluaciones > 0 ? Math.round((s.evaluaciones_completadas / total_evaluaciones) * 100) : 0;
                const wrap = document.createElement('div');
                wrap.className = 'progress-row';
                wrap.innerHTML = `
                    <div class="prog-label">${escapeHTML(s.nombre)} ${escapeHTML(s.apellido)} - ${percent}%</div>
                    <div class="prog-bar"><div class="prog-fill" style="width:${percent}%;"></div></div>
                `;
                progContainer.appendChild(wrap);
            });
            dyn.appendChild(progContainer);
        } else if (tipo === 'mejores') {
            const sorted = students.slice().filter(s => s.promedio_evaluaciones !== null).sort((a,b) => { return (b.promedio_evaluaciones||0) - (a.promedio_evaluaciones||0); });
            const list = document.createElement('div');
            list.className = 'reportes-mejores-list';
            list.innerHTML = `<h3>Mejores estudiantes</h3>`;
            const ul = document.createElement('ol');
            sorted.forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `${escapeHTML(s.nombre)} ${escapeHTML(s.apellido)} - Promedio: ${parseFloat(s.promedio_evaluaciones).toFixed(2)}`;
                ul.appendChild(li);
            });
            list.appendChild(ul);
            dyn.appendChild(list);
        }

    } catch (err) {
        dyn.innerHTML = '<div class="error-message">Error al generar reporte</div>';
        console.error(err);
    }
}

// nuevo: exportar para que maestro.js pueda invocar si es cargado como script
window.cargarReportesMaestro = cargarReportesMaestro;
