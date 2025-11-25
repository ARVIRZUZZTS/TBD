//autenticacion de datos
import { obtenerIdEstudiante } from './utils.js';

export async function cargarDatosEstudiante() {
    try {
        const idEstudiante = obtenerIdEstudiante();
        
        if (!idEstudiante) {
            console.error('No se encontró ID de estudiante en el storage');
            mostrarDatosPorDefecto();
            return;
        }
        
        const response = await fetch(`php/estudianteGet.php?id_user=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.exito && data.estudiante) {
            actualizarUIEstudiante(data.estudiante);
        } else {
            mostrarDatosPorDefecto();
        }
    } catch (error) {
        console.error('Error al cargar datos del estudiante:', error);
        mostrarDatosPorDefecto();
    }
}

function actualizarUIEstudiante(estudiante) {
    document.getElementById('nombre-estudiante').textContent = 
        `${estudiante.nombre} ${estudiante.apellido}`;
    
    document.getElementById('nombre-perfil').textContent = `${estudiante.nombre} ${estudiante.apellido}`;
    document.getElementById('correo-perfil').textContent = estudiante.correo || 'No disponible';
    document.getElementById('rango-perfil').textContent = `Rango: ${estudiante.rango_actual}`;
    
    document.getElementById('saldo-actual').textContent = estudiante.saldo_actual;
    document.getElementById('puntos-totales').textContent = estudiante.puntos_totales;
    document.getElementById('puntos-gastados').textContent = estudiante.puntos_gastados;
    
    const iniciales = (estudiante.nombre.charAt(0) + estudiante.apellido.charAt(0)).toUpperCase();
    document.getElementById('avatar-iniciales').textContent = iniciales;
}

function mostrarDatosPorDefecto() {
    document.getElementById('nombre-estudiante').textContent = 'Estudiante';
    document.getElementById('nombre-perfil').textContent = 'Estudiante';
}