//navegacion entre secciones
import { cargarCursosEstudiante } from '../modules/cursos.js';
import { cargarInscripciones } from '../modules/inscripciones.js';
import { cargarTienda } from '../modules/tienda.js';
import { cargarHorarios } from '../modules/horarios.js';

export function inicializarNavegacion() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            if (targetTab) {
                limpiarVistaDetalle();
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                this.classList.add('active');
                
                const targetElement = document.getElementById(targetTab);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
                
                // Cargar contenido específico de cada pestaña
                cargarContenidoPestana(targetTab);
            }
        });
    });
}

function limpiarVistaDetalle() {
    const detalleView = document.getElementById('curso-detalle');
    if (detalleView) {
        detalleView.remove(); 
    }
}

function cargarContenidoPestana(targetTab) {
    switch(targetTab) {
        case 'cursos':
            cargarCursosEstudiante();
            break;
        case 'inscripcion':
            cargarInscripciones();
            break;
        case 'horarios':
            cargarHorarios();
            break;
        case 'tienda':
            cargarTienda();
            break;
        // 'inicio' y 'calificaciones' se cargan por defecto
    }
}