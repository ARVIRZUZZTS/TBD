// ui/navigation.js - Manejo de navegación en el portal de maestro
import { cargarMisCursos } from '../modules/cursos.js';

export function inicializarNavegacion() {
    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    // botón regresar en placeholder
    const backBtn = document.getElementById('back-to-courses');
    if (backBtn) backBtn.addEventListener('click', () => showSection('current-courses'));
}

export function showSection(sectionId) {
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        if (sectionId === 'current-courses') {
            cargarMisCursos();
        }
    }
}

// Exponer globalmente por compatibilidad con modales que usen showSection
window.showSection = showSection;
