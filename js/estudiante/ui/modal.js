//gestion de los modales
let cursoSeleccionadoParaInscripcion = null;

export function mostrarModalPago(curso) {
    cursoSeleccionadoParaInscripcion = curso;
    
    let modal = document.getElementById('modal-pago');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-pago';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmar Inscripción y Pago</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="info-curso-modal">
                        <h3 id="modal-curso-nombre">${curso.nombre_curso}</h3>
                        <p><strong>Profesor:</strong> ${curso.nombre_profesor} ${curso.apellido_profesor}</p>
                        <p><strong>Duración:</strong> ${curso.duracion} horas</p>
                        <p><strong>Modalidad:</strong> ${curso.modalidad === 'P' ? 'Presencial' : 'Virtual'}</p>
                        <div class="costo-info">
                            <h4>Costo: <span id="modal-curso-costo">${curso.costo || 0}</span> Bs</h4>
                        </div>
                    </div>
                    <div class="metodo-pago">
                        <h4>Método de Pago (Simulado)</h4>
                        <div class="opciones-pago">
                            <label>
                                <input type="radio" name="metodo-pago" value="tarjeta" checked>
                                Tarjeta de Crédito/Débito
                            </label>
                            <label>
                                <input type="radio" name="metodo-pago" value="transferencia">
                                Transferencia Bancaria
                            </label>
                            <label>
                                <input type="radio" name="metodo-pago" value="efectivo">
                                Pago en Efectivo
                            </label>
                        </div>
                        <div class="info-pago-simulado">
                            <p><em>Este es un pago simulado. No se realizará ningún cargo real.</em></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="back" id="cancelar-pago">Cancelar</button>
                    <button class="shiny" id="confirmar-pago">Confirmar Pago e Inscripción</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', cerrarModalPago);
        modal.querySelector('#cancelar-pago').addEventListener('click', cerrarModalPago);
        modal.querySelector('#confirmar-pago').addEventListener('click', confirmarPago);
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalPago();
            }
        });
    } else {
        document.getElementById('modal-curso-nombre').textContent = curso.nombre_curso;
        document.getElementById('modal-curso-costo').textContent = curso.costo || 0;
    }
    
    modal.style.display = 'block';
}

export function cerrarModalPago() {
    const modal = document.getElementById('modal-pago');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function confirmarPago() {
    try {
        const confirmarBtn = document.getElementById('confirmar-pago');
        const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
        
        confirmarBtn.textContent = 'Procesando pago...';
        confirmarBtn.disabled = true;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const formData = new FormData();
        formData.append('id_estudiante', localStorage.getItem('id_user') || sessionStorage.getItem('id_user'));
        formData.append('id_periodo_curso', cursoSeleccionadoParaInscripcion.id_periodo_curso);
        
        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        cerrarModalPago();
        
        if (data.exito) {
            alert('Inscripción exitosa. Pago procesado correctamente.');
            // Disparar evento para recargar inscripciones
            window.dispatchEvent(new CustomEvent('recargarInscripciones'));
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error en pago:', error);
        alert('Error al procesar el pago');
    } finally {
        const confirmarBtn = document.getElementById('confirmar-pago');
        if (confirmarBtn) {
            confirmarBtn.textContent = 'Confirmar Pago e Inscripción';
            confirmarBtn.disabled = false;
        }
    }
}