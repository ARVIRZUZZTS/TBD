async function cargarEntregasMaestro() {
    const id_maestro = window.id_maestro;
    const entregasSection = document.getElementById('entregas');
    
    if (!entregasSection) {
        console.error('Sección de entregas no encontrada');
        return;
    }

    try {
        const response = await fetch(`php/obtenerEntregasByMaestro.php?id_maestro=${id_maestro}`);
        const data = await response.json();

        if (data.exito) {
            renderEntregasMaestro(data.entregas);
        } else {
            entregasSection.innerHTML = `<div class="error-message">Error: ${data.mensaje}</div>`;
        }
    } catch (error) {
        console.error('Error al cargar entregas:', error);
        entregasSection.innerHTML = '<div class="error-message">Error al conectar con el servidor</div>';
    }
}

function renderEntregasMaestro(entregas) {
    const entregasSection = document.getElementById('entregas');
    const container = entregasSection.querySelector('#entregas-maestro-container');
    
    if (!container) {
        console.error('Contenedor de entregas no encontrado');
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Agrupar entregas por curso
    const entregasPorCurso = {};
    entregas.forEach(entrega => {
        if (!entregasPorCurso[entrega.nombre_curso]) {
            entregasPorCurso[entrega.nombre_curso] = [];
        }
        entregasPorCurso[entrega.nombre_curso].push(entrega);
    });

    // Si no hay entregas
    if (Object.keys(entregasPorCurso).length === 0) {
        container.innerHTML = '<div class="no-data-message">No hay entregas registradas en tus cursos</div>';
        return;
    }

    // Crear filtros
    const filtrosDiv = document.createElement('div');
    filtrosDiv.className = 'filtros-entregas';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filtrar por Curso:';
    filtrosDiv.appendChild(filterLabel);

    const filterSelect = document.createElement('select');
    filterSelect.id = 'filtro-curso-entregas';
    
    const optionTodos = document.createElement('option');
    optionTodos.value = 'todos';
    optionTodos.textContent = 'Todos los cursos';
    filterSelect.appendChild(optionTodos);

    Object.keys(entregasPorCurso).sort().forEach(curso => {
        const option = document.createElement('option');
        option.value = curso;
        option.textContent = `${curso} (${entregasPorCurso[curso].length})`;
        filterSelect.appendChild(option);
    });

    filterSelect.addEventListener('change', () => filtrarEntregasMaestro());
    filtrosDiv.appendChild(filterSelect);
    
    container.appendChild(filtrosDiv);

    // Crear tabla de entregas
    const tablaDiv = document.createElement('div');
    tablaDiv.className = 'entregas-tabla-container';
    tablaDiv.id = 'entregas-tabla-container';

    const tabla = document.createElement('table');
    tabla.className = 'entregas-tabla';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Curso</th>
                <th>Estudiante</th>
                <th>ID Publicación</th>
                <th>Fecha Entrega</th>
                <th>Nota Actual</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
    `;

    entregas.forEach(entrega => {
        const fila = document.createElement('tr');
        fila.className = `entrega-fila ${entrega.nota ? 'calificada' : 'sin-calificar'}`;
        fila.dataset.curso = entrega.nombre_curso;

        const notaDisplay = entrega.nota ? `${parseFloat(entrega.nota).toFixed(2)}` : 'Sin calificar';
        
        fila.innerHTML = `
            <td>${entrega.nombre_curso}</td>
            <td>${entrega.nombre} ${entrega.apellido}</td>
            <td>${entrega.id_publicacion}</td>
            <td>${entrega.fecha_entrega} ${entrega.hora_entrega || ''}</td>
            <td><strong>${notaDisplay}</strong></td>
            <td>
                <button class="btn-calificar" data-id-entrega="${entrega.id_entrega}" data-id-user="${entrega.id_user}" data-nombre="${entrega.nombre}" data-apellido="${entrega.apellido}" data-id-publicacion="${entrega.id_publicacion}">
                    Calificar
                </button>
            </td>
        `;

        tabla.appendChild(fila);
    });

    tabla.innerHTML += '</tbody>';
    tablaDiv.appendChild(tabla);
    container.appendChild(tablaDiv);

    // Agregar event listeners a los botones de calificar
    document.querySelectorAll('.btn-calificar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idEntrega = e.target.dataset.idEntrega;
            const idUser = e.target.dataset.idUser;
            const nombre = e.target.dataset.nombre;
            const apellido = e.target.dataset.apellido;
            const idPublicacion = e.target.dataset.idPublicacion;
            
            abrirModalCalificacion(idEntrega, idUser, nombre, apellido, idPublicacion);
        });
    });
}

function filtrarEntregasMaestro() {
    const filtro = document.getElementById('filtro-curso-entregas').value;
    const filas = document.querySelectorAll('.entrega-fila');

    filas.forEach(fila => {
        if (filtro === 'todos' || fila.dataset.curso === filtro) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

function abrirModalCalificacion(idEntrega, idUser, nombre, apellido, idPublicacion) {
    // Crear modal si no existe
    let modal = document.getElementById('modal-calificacion');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-calificacion';
        modal.className = 'modal-calificacion';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h2>Asignar Calificación</h2>
                <button class="btn-cerrar" onclick="document.getElementById('modal-calificacion').remove();">&times;</button>
            </div>
            <div class="modal-body">
                <div class="info-estudiante">
                    <p><strong>Estudiante:</strong> ${nombre} ${apellido}</p>
                    <p><strong>Publicación ID:</strong> ${idPublicacion}</p>
                </div>
                <form id="form-calificacion">
                    <div class="form-group">
                        <label for="nota-input">Nota (0-100):</label>
                        <input 
                            type="number" 
                            id="nota-input" 
                            name="nota" 
                            min="0" 
                            max="100" 
                            step="0.01" 
                            required
                            placeholder="Ingresa la nota"
                        >
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancelar" onclick="document.getElementById('modal-calificacion').remove();">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-guardar">
                            Guardar Calificación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('form-calificacion').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nota = document.getElementById('nota-input').value;
        
        await guardarCalificacion(idEntrega, nota);
        modal.remove();
    });
}

async function guardarCalificacion(idEntrega, nota) {
    const id_maestro = window.id_maestro;

    try {
        const formData = new FormData();
        formData.append('id_entrega', idEntrega);
        formData.append('nota', nota);
        formData.append('id_maestro', id_maestro);

        const response = await fetch('php/asignarNota.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.exito) {
            alert('Calificación guardada correctamente');
            cargarEntregasMaestro(); // Recargar entregas
        } else {
            alert(`Error: ${data.mensaje}`);
        }
    } catch (error) {
        console.error('Error al guardar calificación:', error);
        alert('Error al guardar la calificación');
    }
}
