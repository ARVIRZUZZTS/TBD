export async function mostrarInsignias() {
    const modal = document.getElementById('modal-insignias');
    const container = document.getElementById('insignias-grid');
    const idEstudiante = localStorage.getItem('id_user');

    if (!modal || !container) return;

    // Mostrar modal
    modal.style.display = 'block';

    // Loading state
    container.innerHTML = '<div class="loading">Cargando insignias...</div>';

    try {
        const response = await fetch(`php/insigniasGet.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();

        if (data.exito) {
            renderizarInsignias(data.insignias, container);
        } else {
            container.innerHTML = `<div class="error">${data.mensaje || 'Error al cargar insignias'}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error">Error de conexión</div>';
    }
}

function renderizarInsignias(insignias, container) {
    if (insignias.length === 0) {
        container.innerHTML = '<p class="no-badges">No hay insignias disponibles.</p>';
        return;
    }

    container.innerHTML = insignias.map(insignia => {
        // Generar un icono/color basado en si la tiene o no
        const isOwned = insignia.posee;
        const cardClass = isOwned ? 'insignia-card owned' : 'insignia-card locked';
        const icon = isOwned ? '🏆' : '🔒';
        const statusText = isOwned ? '¡Conseguido!' : 'Bloqueado';

        return `
            <div class="${cardClass}">
                <div class="insignia-icon">${icon}</div>
                <div class="insignia-info">
                    <h3 class="insignia-name">${insignia.nombre}</h3>
                    <p class="insignia-desc">${insignia.descripcion || 'Sin descripción'}</p>
                    <div class="insignia-points">💎 ${insignia.puntos || 0} Puntos</div>
                    <div class="insignia-status">${statusText}</div>
                </div>
            </div>
        `;
    }).join('');
}

export function inicializarInsignias() {
    const btnInsignias = document.getElementById('btn-insignias');
    if (btnInsignias) {
        btnInsignias.addEventListener('click', mostrarInsignias);
    }
}
