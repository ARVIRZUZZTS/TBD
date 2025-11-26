//gestion de los modales
let cursoSeleccionadoParaInscripcion = null;

export function mostrarModalPago(curso) {
    
    cursoSeleccionadoParaInscripcion = curso;
    
    const tieneDescuento = curso.descuento_aplicado !== null;
    const precioFinal = curso.precio_final || curso.costo;
    const precioOriginal = curso.costo;
    
    let modal = document.getElementById('modal-pago');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-pago';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmar Inscripción y Pago</h2>
                    <span class="close-modal">X</span>
                </div>
                <div class="modal-body">
                    <div id="info-curso-modal">
                        <h3 id="modal-curso-nombre">${curso.nombre_curso}</h3>
                        <p><strong>Profesor:</strong> ${curso.nombre_profesor} ${curso.apellido_profesor}</p>
                        <p><strong>Duración:</strong> ${curso.duracion} horas</p>
                        <p><strong>Modalidad:</strong> ${curso.modalidad === 'P' ? 'Presencial' : 'Virtual'}</p>
                        <div class="costo-info">
                            ${tieneDescuento ? `
                                <div class="descuento-info">
                                    <h4>Precio con Descuento: <span class="precio-final">${parseFloat(precioFinal).toFixed(2)} Bs</span></h4>
                                    <p class="precio-original-tachado">Precio original: ${parseFloat(precioOriginal).toFixed(2)} Bs</p>
                                    <p class="ahorro-text">¡Ahorras ${(precioOriginal - precioFinal).toFixed(2)} Bs!</p>
                                </div>
                            ` : `
                                <h4>Costo: <span id="modal-curso-costo">${parseFloat(precioOriginal).toFixed(2)}</span> Bs</h4>
                            `}
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
                    <button class="shiny" id="confirmar-pago">
                        ${tieneDescuento ? 'Confirmar Pago con Descuento' : 'Confirmar Pago e Inscripción'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } else {
        document.getElementById('modal-curso-nombre').textContent = curso.nombre_curso;
        if (tieneDescuento) {
            document.querySelector('.precio-final').textContent = parseFloat(precioFinal).toFixed(2);
            document.querySelector('.precio-original-tachado').textContent = `Precio original: ${parseFloat(precioOriginal).toFixed(2)} Bs`;
            document.querySelector('.ahorro-text').textContent = `¡Ahorras ${(precioOriginal - precioFinal).toFixed(2)} Bs!`;
        } else {
            document.getElementById('modal-curso-costo').textContent = parseFloat(precioOriginal).toFixed(2);
        }
    }
    
    modal.style.display = 'block';
    
    // Agregar event listeners
    modal.querySelector('.close-modal').addEventListener('click', cerrarModalPago);
    modal.querySelector('#cancelar-pago').addEventListener('click', cerrarModalPago);
    modal.querySelector('#confirmar-pago').addEventListener('click', confirmarPago);
    
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModalPago();
        }
    });
    
}
export function cerrarModalPago() {
    const modal = document.getElementById('modal-pago');
    if (modal) {
        modal.style.display = 'none';
    }
}
export async function confirmarPago() {
    try {
        const confirmarBtn = document.getElementById('confirmar-pago');
        confirmarBtn.disabled = true;
        confirmarBtn.textContent = 'Inscribiendo...';
        
        const formData = new FormData();
        formData.append('id_estudiante', localStorage.getItem('id_user'));
        formData.append('id_periodo_curso', cursoSeleccionadoParaInscripcion.id_periodo_curso);
            
        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.exito) {
            alert('Inscripción exitosa');
            cerrarModalPago();
            // Recargar la página
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            alert('Error: ' + data.mensaje);
        }
        
    } catch (error) {
        alert('Error de conexión');
    } finally {
        const confirmarBtn = document.getElementById('confirmar-pago');
        if (confirmarBtn) {
            confirmarBtn.textContent = 'Confirmar Pago e Inscripción';
            confirmarBtn.disabled = false;
        }
    }
}

