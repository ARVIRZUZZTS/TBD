export async function mostrarReporteGastos() {
    const modal = document.getElementById('modal-reporte-gastos');
    const tbody = document.getElementById('lista-gastos');
    const totalEl = document.getElementById('total-gastos');
    const idEstudiante = localStorage.getItem('id_user');

    if (!modal || !tbody || !totalEl) return;

    // Mostrar modal
    modal.style.display = 'block';

    // Loading state
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando gastos...</td></tr>';
    totalEl.textContent = '...';

    try {
        const response = await fetch(`php/reporteGastosGet.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();

        if (data.exito) {
            renderizarGastos(data.gastos, data.total, tbody, totalEl);
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="error">${data.mensaje || 'Error al cargar gastos'}</td></tr>`;
            totalEl.textContent = '0.00';
        }
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="error">Error de conexión</td></tr>';
        totalEl.textContent = '0.00';
    }
}

function renderizarGastos(gastos, total, tbody, totalEl) {
    if (gastos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay gastos registrados.</td></tr>';
        totalEl.textContent = '0.00';
        return;
    }

    tbody.innerHTML = gastos.map(gasto => {
        const descuentoTexto = gasto.descuento_porcentaje > 0
            ? `${gasto.descuento_porcentaje}% (-${gasto.monto_descontado})`
            : '-';

        return `
            <tr>
                <td>${gasto.curso}</td>
                <td>${gasto.fecha}</td>
                <td>$${gasto.costo_original}</td>
                <td>${descuentoTexto}</td>
                <td>$${gasto.costo_final}</td>
            </tr>
        `;
    }).join('');

    totalEl.textContent = `$${total}`;
}

export function inicializarReporteGastos() {
    const btnReporte = document.getElementById('btn-reporte-gastos');
    if (btnReporte) {
        btnReporte.addEventListener('click', mostrarReporteGastos);
    }
}
