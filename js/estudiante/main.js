//de aca partimos al resto de weas
import { inicializarNavegacion } from './ui/navigation.js';
import { cargarDatosEstudiante } from './modules/auth.js';
import { inicializarEventosGlobales } from './modules/tienda.js';
import { inicializarTema } from './modules/theme.js';
import { inicializarPerfil } from './modules/profile.js';
import { inicializarInsignias } from './modules/insignias.js';
import { inicializarReporteGastos } from './modules/reporteGastos.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente cargado");

    // Inicializar módulos
    inicializarNavegacion();
    cargarDatosEstudiante();
    inicializarEventosGlobales();
    inicializarTema();
    inicializarPerfil();
    inicializarInsignias();
    inicializarReporteGastos();
});

// Exportar funciones globales para HTML
window.cerrarSesion = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        const est = localStorage.getItem('id_user');
        inicioCierre("CIERRE", est);
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        window.location.href = "inicio.html";
    }
};
window.inicioCierre = function(accion, id_user) {
    const data = {
        accion: accion.toUpperCase(),
        id_user: id_user
    };

    fetch("php/bitUsuario.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.exito) {
            console.log("Bitácora registrada:", result.mensaje);
        } else {
            console.error("Error al registrar bitácora:", result.mensaje);
        }
    })
    .catch(error => {
        console.error("Error en la conexión con el servidor:", error);
    });
}

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
