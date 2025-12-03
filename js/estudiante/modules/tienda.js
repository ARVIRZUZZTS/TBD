// aca faltan cosas pero es la tienda
import { obtenerIdEstudiante, formatearFecha } from './utils.js';
import { aplicarTema } from './theme.js';

export async function cargarTienda() {
    try {
        const idEstudiante = obtenerIdEstudiante();

        if (!idEstudiante) {
            mostrarTiendaVacia("Debes iniciar sesión");
            return;
        }

        console.log("Cargando tienda para estudiante:", idEstudiante);

        const [descuentosResponse, becasResponse, puntosResponse, paletasResponse] = await Promise.all([
            fetch(`php/tiendaGetDescuentos.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetBecas.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetPuntos.php?id_estudiante=${idEstudiante}`),
            fetch(`php/tiendaGetPaletas.php?id_estudiante=${idEstudiante}`)
        ]);

        const descuentosText = await descuentosResponse.text();
        const becasText = await becasResponse.text();
        const puntosText = await puntosResponse.text();
        const paletasText = await paletasResponse.text();

        let descuentosData, becasData, puntosData, paletasData;

        try { descuentosData = JSON.parse(descuentosText); } catch (e) { descuentosData = { exito: false, mensaje: e.message }; }
        try { becasData = JSON.parse(becasText); } catch (e) { becasData = { exito: false, mensaje: e.message }; }
        try { puntosData = JSON.parse(puntosText); } catch (e) { puntosData = { exito: false, mensaje: e.message }; }
        try { paletasData = JSON.parse(paletasText); } catch (e) { paletasData = { exito: false, mensaje: e.message }; }

        if (descuentosData.exito && becasData.exito && puntosData.exito && paletasData.exito) {
            mostrarTienda(
                descuentosData.descuentos || [],
                becasData.becas || [],
                puntosData.puntos_estudiante || 0,
                paletasData.paletas || [],
                paletasData.paleta_activa
            );
        } else {
            console.error("Error cargando datos tienda", { descuentosData, becasData, puntosData, paletasData });
            mostrarTiendaVacia("Error al cargar algunos datos de la tienda.");
        }

    } catch (error) {
        console.error('Error completo al cargar tienda:', error);
        mostrarTiendaVacia("Error al cargar la tienda: " + error.message);
    }
}

function mostrarTienda(descuentos, becas, puntosEstudiante, paletas, paletaActivaId) {
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

    // Sección de Paletas
    if (paletas.length > 0) {
        const paletasCard = document.createElement('div');
        paletasCard.className = 'content-card';

        let paletasHTML = `
            <h3>Paletas de Colores</h3>
            <div class="paletas-lista" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
        `;

        // Opción Default
        const isDefaultActive = !paletaActivaId;
        paletasHTML += `
            <div class="paleta-item" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px; text-align: center;">
                <h4>Original</h4>
                <p>Tema por defecto</p>
                ${isDefaultActive ?
                '<button class="shiny small" disabled>Activa</button>' :
                `<button class="shiny small activar-paleta-btn" data-paleta-id="0">Activar</button>`
            }
            </div>
        `;

        paletas.forEach(paleta => {
            const isActive = paletaActivaId == paleta.id_cosmetico;
            const isOwned = paleta.comprado;

            let actionButton;
            if (isActive) {
                actionButton = '<button class="shiny small" disabled>Activa</button>';
            } else if (isOwned) {
                actionButton = `<button class="shiny small activar-paleta-btn" data-paleta-id="${paleta.id_cosmetico}">Activar</button>`;
            } else {
                actionButton = `<button class="shiny small comprar-paleta-btn" 
                                    data-paleta-id="${paleta.id_cosmetico}" 
                                    data-costo="${paleta.costo_canje}">
                                    Comprar (${paleta.costo_canje} pts)
                                </button>`;
            }

            paletasHTML += `
                <div class="paleta-item" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px; text-align: center;">
                    <h4>${paleta.nombre}</h4>
                    <p>${paleta.descripcion || ''}</p>
                    ${actionButton}
                </div>
            `;
        });

        paletasHTML += '</div>';
        paletasCard.innerHTML = paletasHTML;
        tiendaContainer.appendChild(paletasCard);
    }

    // Sección Descuentos
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

    // Sección Becas
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
}

function mostrarTiendaVacia(mensaje) {
    const tiendaContainer = document.querySelector('#tienda .content-grid');
    tiendaContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>No se pudieron cargar los datos de la tienda.</p>
        </div>
    `;
}

export function inicializarEventosGlobales() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('canjear-descuento-btn')) {
            const idDescuento = e.target.getAttribute('data-descuento-id');
            const costo = e.target.getAttribute('data-descuento-costo');
            canjearDescuento(idDescuento, parseInt(costo));
        }

        if (e.target.classList.contains('aceptar-beca-btn')) {
            const idBeca = e.target.getAttribute('data-beca-id');
            aceptarBeca(parseInt(idBeca));
        }

        if (e.target.classList.contains('comprar-paleta-btn')) {
            const idPaleta = e.target.getAttribute('data-paleta-id');
            const costo = e.target.getAttribute('data-costo');
            comprarPaleta(idPaleta, costo);
        }

        if (e.target.classList.contains('activar-paleta-btn')) {
            const idPaleta = e.target.getAttribute('data-paleta-id');
            activarPaleta(idPaleta);
        }
    });
}

async function canjearDescuento(idDescuento, costo) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        if (!confirm(`¿Canjear este descuento por ${costo} puntos?`)) return;

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_descuento', idDescuento);

        const response = await fetch('php/canjearDescuento.php', { method: 'POST', body: formData });
        const data = await response.json();

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
        if (!confirm('¿Aceptar esta beca?')) return;

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_beca', idBeca);

        const response = await fetch('php/aceptarBeca.php', { method: 'POST', body: formData });
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

async function comprarPaleta(idPaleta, costo) {
    try {
        const idEstudiante = obtenerIdEstudiante();
        if (!confirm(`¿Comprar esta paleta por ${costo} puntos?`)) return;

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_cosmetico', idPaleta);

        const response = await fetch('php/canjearPaleta.php', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.exito) {
            alert('Paleta comprada exitosamente');
            cargarTienda();
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al comprar paleta:', error);
        alert('Error de conexión');
    }
}

async function activarPaleta(idPaleta) {
    try {
        const idEstudiante = obtenerIdEstudiante();

        const formData = new FormData();
        formData.append('id_estudiante', idEstudiante);
        formData.append('id_cosmetico', idPaleta);

        const response = await fetch('php/activarPaleta.php', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.exito) {
            aplicarTema(data.clase);
            cargarTienda(); // Recargar para actualizar botones
        } else {
            alert('Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error al activar paleta:', error);
        alert('Error de conexión');
    }
}