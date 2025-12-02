// main.js - punto de entrada para el portal de maestro
import { inicializarNavegacion } from './ui/navigation.js';
import { cargarMisCursos } from './modules/cursos.js';

document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacion();
    // mostrar sección inicial
    const initial = document.getElementById('current-courses');
    if (initial) {
        initial.style.display = 'block';
        cargarMisCursos();
    }
});

// Exponer cerrarSesion globalmente
window.cerrarSesion = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'inicio.html';
    }
};
