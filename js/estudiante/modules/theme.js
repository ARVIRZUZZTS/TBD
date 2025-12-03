import { obtenerIdEstudiante } from './utils.js';

export async function inicializarTema() {
    const idEstudiante = obtenerIdEstudiante();
    if (!idEstudiante) return;

    try {
        const response = await fetch(`php/getPaletaActiva.php?id_estudiante=${idEstudiante}`);
        const data = await response.json();

        if (data.exito && data.clase) {
            aplicarTema(data.clase);
        }
    } catch (error) {
        console.error('Error al cargar tema:', error);
    }
}

export function aplicarTema(claseTema) {
    // Remover todas las clases de tema existentes
    document.body.classList.remove('theme-dark', 'theme-ocean', 'theme-forest', 'theme-gold');
    
    // Agregar la nueva clase si existe
    if (claseTema) {
        document.body.classList.add(claseTema);
    }
}
