//de aca partimos al resto de weas
import { inicializarNavegacion } from './ui/navigation.js';
import { cargarDatosEstudiante } from './modules/auth.js';
import { inicializarEventosGlobales } from './modules/tienda.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");
    
    // Inicializar módulos
    inicializarNavegacion();
    cargarDatosEstudiante();
    inicializarEventosGlobales();
});

// Exportar funciones globales para HTML
window.cerrarSesion = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        window.location.href = "inicio.html";
    }
};
// main.js - AGREGAR AL FINAL
window.addEventListener('recargarCursos', () => {
    import('./modules/cursos.js').then(module => {
        module.cargarCursosEstudiante();
    });
});

window.addEventListener('recargarInscripciones', () => {
    import('./modules/inscripciones.js').then(module => {
        module.cargarInscripciones();
    });
});