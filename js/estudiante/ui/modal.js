// modal.js - Gestión de modales y boucher
let cursoSeleccionadoParaInscripcion = null;
let modalBoucher = null;
let datosInscripcionConfirmada = null;

export function mostrarModalPago(curso) {
    console.log('Mostrando modal para curso:', curso);
    
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
                    <button class="close-modal">X</button>
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
                                    <p><small>Descuento aplicado: ${curso.descuento_aplicado}%</small></p>
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
                            <p><em>⚠️ Este es un pago simulado. No se realizará ningún cargo real.</em></p>
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
        
        // Agregar event listeners
        modal.querySelector('.close-modal').addEventListener('click', cerrarModalPago);
        modal.querySelector('#cancelar-pago').addEventListener('click', cerrarModalPago);
        modal.querySelector('#confirmar-pago').addEventListener('click', confirmarPago);
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                cerrarModalPago();
            }
        });
    } else {
        // Actualizar contenido si el modal ya existe
        document.getElementById('modal-curso-nombre').textContent = curso.nombre_curso;
        const costoInfo = modal.querySelector('.costo-info');
        
        if (tieneDescuento) {
            costoInfo.innerHTML = `
                <div class="descuento-info">
                    <h4>Precio con Descuento: <span class="precio-final">${parseFloat(precioFinal).toFixed(2)} Bs</span></h4>
                    <p class="precio-original-tachado">Precio original: ${parseFloat(precioOriginal).toFixed(2)} Bs</p>
                    <p class="ahorro-text">¡Ahorras ${(precioOriginal - precioFinal).toFixed(2)} Bs!</p>
                    <p><small>Descuento aplicado: ${curso.descuento_aplicado}%</small></p>
                </div>
            `;
        } else {
            costoInfo.innerHTML = `
                <h4>Costo: <span id="modal-curso-costo">${parseFloat(precioOriginal).toFixed(2)}</span> Bs</h4>
            `;
        }
        
        // Actualizar botón
        const confirmarBtn = modal.querySelector('#confirmar-pago');
        confirmarBtn.textContent = tieneDescuento ? 
            'Confirmar Pago con Descuento' : 
            'Confirmar Pago e Inscripción';
    }
    
    modal.style.display = 'block';
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

export function cerrarModalPago() {
    const modal = document.getElementById('modal-pago');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

export async function confirmarPago() {
    try {
        const confirmarBtn = document.getElementById('confirmar-pago');
        if (!confirmarBtn) return;
        
        confirmarBtn.disabled = true;
        confirmarBtn.textContent = 'Procesando...';
        
        // Verificar si hay descuento aplicado
        const tieneDescuento = cursoSeleccionadoParaInscripcion.descuento_aplicado !== null;
        const idDescuento = cursoSeleccionadoParaInscripcion.id_descuento;
        
        const formData = new FormData();
        formData.append('id_estudiante', localStorage.getItem('id_user'));
        formData.append('id_periodo_curso', cursoSeleccionadoParaInscripcion.id_periodo_curso);
        
        // Agregar descuento si existe
        if (tieneDescuento && idDescuento) {
            formData.append('id_descuento', idDescuento);
        }
        
        console.log('Enviando inscripción con datos:', {
            id_estudiante: localStorage.getItem('id_user'),
            id_periodo_curso: cursoSeleccionadoParaInscripcion.id_periodo_curso,
            id_descuento: tieneDescuento ? idDescuento : 'ninguno'
        });
        
        const response = await fetch('php/inscribirCurso.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.exito) {
            // Cerrar modal de pago
            cerrarModalPago();
            
            // Mostrar boucher de confirmación
            setTimeout(() => {
                mostrarBoucherConfirmacion(cursoSeleccionadoParaInscripcion, {
                    idInscripcion: data.id_inscripcion,
                    fechaConfirmacion: new Date().toISOString()
                });
            }, 300);
            
        } else {
            alert('Error: ' + data.mensaje);
            confirmarBtn.textContent = 'Confirmar Pago e Inscripción';
            confirmarBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error en confirmarPago:', error);
        alert('Error de conexión: ' + error.message);
        const confirmarBtn = document.getElementById('confirmar-pago');
        if (confirmarBtn) {
            confirmarBtn.textContent = 'Confirmar Pago e Inscripción';
            confirmarBtn.disabled = false;
        }
    }
}

export function mostrarBoucherConfirmacion(curso, datosPago = {}) {
    // Crear datos de pago simulados
    const fechaPago = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const numeroTransaccion = 'TRX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const metodoPagoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked');
    const metodoPago = metodoPagoSeleccionado ? metodoPagoSeleccionado.value : 'tarjeta';
    
    const metodosPagoNombres = {
        'tarjeta': 'Tarjeta de Crédito/Débito',
        'transferencia': 'Transferencia Bancaria',
        'efectivo': 'Pago en Efectivo'
    };
    
    const tieneDescuento = curso.descuento_aplicado !== null;
    const precioFinal = curso.precio_final || curso.costo;
    const precioOriginal = curso.costo;
    const idEstudiante = localStorage.getItem('id_user');
    const nombreEstudiante = localStorage.getItem('nombre_usuario') || 'Estudiante';
    
    datosInscripcionConfirmada = {
        curso,
        fechaPago,
        numeroTransaccion,
        metodoPago,
        idEstudiante,
        nombreEstudiante,
        datosPago
    };
    
    // Crear o actualizar el modal de boucher
    if (!modalBoucher) {
        modalBoucher = document.createElement('div');
        modalBoucher.id = 'modal-boucher';
        modalBoucher.className = 'modal';
        modalBoucher.style.zIndex = '1001';
        
        document.body.appendChild(modalBoucher);
    }
    
    modalBoucher.innerHTML = `
        <div class="modal-content boucher-content">
            <div class="boucher-header">
                <div class="boucher-logo">
                    <h2>OnDesk</h2>
                    <h1 class="subtitulo">Comprobante de Inscripción</h1>
                </div>
                <div class="boucher-metadata">
                    <div class="metadata-item">
                        <span class="label">Nº Transacción:</span>
                        <span class="value transaccion-numero">${numeroTransaccion}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="label">Fecha y Hora:</span>
                        <span class="value">${fechaPago}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="label">Estado:</span>
                        <span class="value estado-confirmado">✓ Confirmado</span>
                    </div>
                </div>
            </div>
            
            <div class="boucher-body">
                <div class="seccion-info">
                    <h3 class="seccion-titulo">Información del Estudiante</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">ID Estudiante:</span>
                            <span class="info-value">${idEstudiante}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">${nombreEstudiante}</span>
                        </div>
                    </div>
                </div>
                
                <div class="seccion-info">
                    <h3 class="seccion-titulo">Detalles del Curso</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Curso:</span>
                            <span class="info-value">${curso.nombre_curso}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Código Curso:</span>
                            <span class="info-value">CUR-${curso.id_periodo_curso}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Profesor:</span>
                            <span class="info-value">${curso.nombre_profesor} ${curso.apellido_profesor}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Duración:</span>
                            <span class="info-value">${curso.duracion} horas</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Modalidad:</span>
                            <span class="info-value">${curso.modalidad === 'P' ? 'Presencial' : 'Virtual'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Inicio:</span>
                            <span class="info-value">${new Date(curso.fecha_inicio).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fin:</span>
                            <span class="info-value">${new Date(curso.fecha_fin).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="seccion-info">
                    <h3 class="seccion-titulo">Detalles del Pago</h3>
                    <div class="resumen-pago">
                        <div class="linea-pago">
                            <span>Subtotal:</span>
                            <span>${parseFloat(precioOriginal).toFixed(2)} Bs</span>
                        </div>
                        ${tieneDescuento ? `
                            <div class="linea-pago descuento">
                                <span>Descuento (${curso.descuento_aplicado}%):</span>
                                <span>-${(precioOriginal - precioFinal).toFixed(2)} Bs</span>
                            </div>
                        ` : ''}
                        <div class="linea-pago total">
                            <span><strong>TOTAL:</strong></span>
                            <span><strong>${parseFloat(precioFinal).toFixed(2)} Bs</strong></span>
                        </div>
                        <div class="linea-pago metodo">
                            <span>Método de Pago:</span>
                            <span>${metodosPagoNombres[metodoPago] || metodoPago}</span>
                        </div>
                    </div>
                </div>
                
                <div class="notas-boucher">
                    <h4>Notas Importantes:</h4>
                    <ul>
                        <li>Este comprobante es válido como confirmación de inscripción.</li>
                        <li>Guarde este número de transacción para futuras referencias: <strong>${numeroTransaccion}</strong></li>
                        <li>El acceso al curso estará disponible desde la fecha de inicio.</li>
                        ${tieneDescuento ? '<li>El descuento aplicado es válido únicamente para esta inscripción.</li>' : ''}
                        <li>Para consultas o soporte, contacte a administración.</li>
                    </ul>
                </div>
                
                <div class="firma-digital">
                    <p>______________________________</p>
                    <p>Firma Digital del Sistema OnDesk</p>
                    <p class="timestamp">Generado: ${new Date().toISOString()}</p>
                </div>
            </div>
            
            <div class="boucher-footer">
                <button class="back" id="imprimir-boucher">
                    <span class="icon-print">🖨️</span> Imprimir
                </button>
                <button class="secondary" id="descargar-boucher">
                    <span class="icon-download">⬇️</span> Descargar
                </button>
                <button class="shiny" id="cerrar-boucher">
                    <span class="icon-ok">✓</span> Aceptar
                </button>
            </div>
            
            <div class="watermark">
                <span>COMPROBANTE VÁLIDO</span>
            </div>
        </div>
    `;
    
    modalBoucher.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Agregar event listeners
    modalBoucher.querySelector('#cerrar-boucher').addEventListener('click', cerrarBoucher);
    modalBoucher.querySelector('#imprimir-boucher').addEventListener('click', imprimirBoucher);
    modalBoucher.querySelector('#descargar-boucher').addEventListener('click', descargarBoucher);
    
    // Cerrar al hacer clic fuera del contenido
    modalBoucher.addEventListener('click', function(event) {
        if (event.target === modalBoucher) {
            cerrarBoucher();
        }
    });
}

function cerrarBoucher() {
    if (modalBoucher) {
        modalBoucher.style.display = 'none';
        modalBoucher = null;
    }
    
    document.body.style.overflow = 'auto';
    
    // Recargar la página después de un breve delay
    setTimeout(() => {
        // Obtener la pestaña activa y recargar su contenido
        const tabActiva = document.querySelector('.tab-button.active');
        if (tabActiva && tabActiva.dataset.tab === 'cursos') {
            // Recargar solo la sección de cursos
            window.location.reload();
        } else {
            // Si está en otra pestaña, cambiar a cursos y recargar
            document.querySelector('[data-tab="cursos"]').click();
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, 1000);
}

function imprimirBoucher() {
    const contenidoOriginal = document.body.innerHTML;
    const contenidoBoucher = document.querySelector('.boucher-content').outerHTML;
    
    document.body.innerHTML = contenidoBoucher;
    window.print();
    document.body.innerHTML = contenidoOriginal;
    
    // Restaurar el modal después de imprimir
    mostrarBoucherConfirmacion(
        datosInscripcionConfirmada.curso, 
        datosInscripcionConfirmada.datosPago
    );
}

function descargarBoucher() {
    // Crear un blob con el contenido HTML del boucher
    const boucherHTML = document.querySelector('.boucher-content').outerHTML;
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Comprobante de Inscripción</title>
            <style>
                ${document.querySelector('#estilos-boucher')?.innerHTML || ''}
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                .boucher-content {
                    width: 100%;
                    box-shadow: none;
                    border: 1px solid #ccc;
                }
                .boucher-footer {
                    display: none;
                }
            </style>
        </head>
        <body>${boucherHTML}</body>
        </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-${datosInscripcionConfirmada.numeroTransaccion}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Comprobante descargado como HTML. Puede abrirlo en cualquier navegador.');
}

// Inicializar estilos del boucher si no existen
export function inicializarEstilosBoucher() {
    if (!document.querySelector('#estilos-boucher')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-boucher';
        estilos.textContent = `
            /* Estilos adicionales para impresión y boucher */
            @media print {
                .boucher-footer,
                .watermark {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(estilos);
    }
}

// Inicializar al cargar el módulo
inicializarEstilosBoucher();