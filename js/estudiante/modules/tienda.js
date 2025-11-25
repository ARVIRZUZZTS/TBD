// aca faltan cosas pero es la tienda
import { obtenerIdEstudiante, formatearFecha } from './utils.js';

export async function cargarTienda() {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!idEstudiante) {
            mostrarTiendaVacia("Debes iniciar sesión");
            return;
        }

        console.log("Cargando tienda para estudiante:", idEstudiante);

        const [descuentosResponse, becasResponse, puntosResponse] = await Promise.all([
            fetch(`php/tiendaGetDescuentos.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetBecas.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetPuntos.php?id_estudiante=${idEstudiante}`)
        ]);

        const descuentosText = await descuentosResponse.text();
        const becasText = await becasResponse.text();
        const puntosText = await puntosResponse.text();

        let descuentosData, becasData, puntosData;

        try {
            descuentosData = JSON.parse(descuentosText);
        } catch (e) {
            descuentosData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        try {
            becasData = JSON.parse(becasText);
        } catch (e) {
            becasData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        try {
            puntosData = JSON.parse(puntosText);
        } catch (e) {
            puntosData = { exito: false, mensaje: "Error parseando JSON: " + e.message };
        }

        if (descuentosData.exito && becasData.exito && puntosData.exito) {
            mostrarTienda(
                descuentosData.descuentos || [],
                becasData.becas || [],
                puntosData.puntos_estudiante || 0
            );
        } else {
            const errores = [];
            if (!descuentosData.exito) errores.push("Descuentos: " + (descuentosData.mensaje || "Error desconocido"));
            if (!becasData.exito) errores.push("Becas: " + (becasData.mensaje || "Error desconocido"));
            if (!puntosData.exito) errores.push("Puntos: " + (puntosData.mensaje || "Error desconocido"));
            
            throw new Error(errores.join("; "));
        }

    } catch (error) {
        console.error('Error completo al cargar tienda:', error);
        mostrarTiendaVacia("Error al cargar la tienda: " + error.message);
    }
}

function mostrarTienda(descuentos, becas, puntosEstudiante) {
    const tiendaContainer = document.querySelector('#tienda .content-grid');
    
    tiendaContainer.innerHTML = `
        <div class="content-card">
            <h3>Tus Puntos Disponibles</h3>
            <div class="puntos-disponibles">
                <span class="puntos-totales">${puntosEstudiante}</span>
                <span class="puntos-label">Desk Points</span>
            </div>
        </div>
    `;

    if (descuentos.length > 0) {
        const descuentosCard = document.createElement('div');
        descuentosCard.className = 'content-card';
        
        let descuentosHTML = `
            <h3>Descuentos Disponibles</h3>
            <div class="descuentos-lista">
        `;
        
        descuentos.forEach(descuento => {
            descuentosHTML += `
                <div class="descuento-item">
                    <div class="descuento-info">
                        <h4>${descuento.nombre_curso}</h4>
                        <p><strong>Descuento:</strong> ${descuento.porcentaje_descuento}%</p>
                        <p><strong>Profesor:</strong> ${descuento.nombre_profesor}</p>
                        <p><strong>Categoría:</strong> ${descuento.nombre_categoria}</p>
                        <p><strong>Área:</strong> ${descuento.nombre_area}</p>
                        <p><strong>Válido hasta:</strong> ${formatearFecha(descuento.fecha_fin)}</p>
                    </div>
                    <div class="descuento-precio">
                        <span class="costo-puntos">${descuento.costo_canje} Points</span>
                        <button class="shiny small canjear-descuento-btn" 
                                data-descuento-id="${descuento.id_descuento}" 
                                data-descuento-costo="${descuento.costo_canje}">
                            Canjear
                        </button>
                    </div>
                </div>
            `;
        });
        
        descuentosHTML += '</div>';
        descuentosCard.innerHTML = descuentosHTML;
        tiendaContainer.appendChild(descuentosCard);
    }

    if (becas.length > 0) {
        const becasCard = document.createElement('div');
        becasCard.className = 'content-card';
        
        let becasHTML = `
            <h3>Tus Becas</h3>
            <div class="becas-lista">
        `;
        
        becas.forEach(beca => {
            becasHTML += `
                <div class="beca-item">
                    <div class="beca-info">
                        <h4>Beca para ${beca.nombre_area}</h4>
                        <p><strong>Porcentaje:</strong> ${beca.porcentaje}%</p>
                        <p><strong>Estado:</strong> ${beca.estado_beca}</p>
                        <p><strong>Asignada por:</strong> ${beca.admin_nombre || 'Admin'} ${beca.admin_apellido || ''}</p>
                        <p><strong>Válida hasta:</strong> ${formatearFecha(beca.fecha_fin)}</p>
                    </div>
                    ${beca.estado_beca === 'Pendiente' ? `
                        <button class="shiny small aceptar-beca-btn" data-beca-id="${beca.id_beca}">
                            Aceptar Beca
                        </button>
                    ` : '<span class="estado-aceptada">✓ Aceptada</span>'}
                </div>
            `;
        });
        
        becasHTML += '</div>';
        becasCard.innerHTML = becasHTML;
        tiendaContainer.appendChild(becasCard);
    }

    if (descuentos.length === 0 && becas.length === 0) {
        const vacioCard = document.createElement('div');
        vacioCard.className = 'content-card';
        vacioCard.innerHTML = `
            <h3>No hay descuentos o becas disponibles</h3>
            <p>Vuelve más tarde para ver nuevas ofertas.</p>
        `;
        tiendaContainer.appendChild(vacioCard);
    }
}

function mostrarTiendaVacia(mensaje) {
    const tiendaContainer = document.querySelector('#tienda .content-grid');
    tiendaContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>No se pudieron cargar los descuentos y becas.</p>
        </div>
    `;
}

export function inicializarEventosGlobales() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('canjear-descuento-btn')) {
            const idDescuento = e.target.getAttribute('data-descuento-id');
            const costo = e.target.getAttribute('data-descuento-costo');
            canjearDescuento(idDescuento, parseInt(costo));
        }
                    
        if (e.target.classList.contains('aceptar-beca-btn')) {
            const idBeca = e.target.getAttribute('data-beca-id');
            aceptarBeca(parseInt(idBeca));
        }
    });
}

async function canjearDescuento(idDescuento, costo) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!confirm(`¿Canjear este descuento por ${costo} puntos?`)) {
            return;
        }

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_descuento', idDescuento);

        const response = await fetch('php/canjearDescuento.php', {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text();
        console.log("Respuesta del servidor:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Error parseando JSON:", e);
            alert('Error en la respuesta del servidor');
            return;
        }

        if (data.exito) {
            alert('Descuento canjeado exitosamente');
            cargarTienda();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al canjear descuento:', error);
        alert('Error de conexión');
    }
}

async function aceptarBeca(idBeca) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!confirm('¿Aceptar esta beca?')) {
            return;
        }

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_beca', idBeca);

        const response = await fetch('php/aceptarBeca.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.exito) {
            alert('Beca aceptada exitosamente');
            cargarTienda();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al aceptar beca:', error);
        alert('Error al aceptar la beca');
    }
}