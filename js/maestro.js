// Funcionalidad básica para cambiar entre secciones
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Si es la sección de cursos disponibles, cargar los cursos
        if (sectionId === 'all-courses') {
            loadAllCourses();
        }
    }
}

// Función para cargar todos los cursos desde la API
async function loadAllCourses() {
    const loadingElement = document.getElementById('courses-loading');
    const coursesContainer = document.getElementById('courses-container');
    const errorElement = document.getElementById('courses-error');
    
    // Mostrar loading, ocultar otros elementos
    loadingElement.style.display = 'block';
    coursesContainer.innerHTML = '';
    errorElement.style.display = 'none';
    
    try {
        const response = await fetch('php/cursoGetAll.php');
        const data = await response.json();
        
        // Ocultar loading
        loadingElement.style.display = 'none';
        
        if (data.success && data.cursos.length > 0) {
            displayCourses(data.cursos);
        } else {
            coursesContainer.innerHTML = `
                <div class="no-courses-message">
                    <div class="placeholder-icon">📚</div>
                    <h3>No hay cursos disponibles</h3>
                    <p>No se encontraron cursos en la base de datos.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    }
}

// Función para mostrar los cursos en la interfaz
function displayCourses(cursos) {
    const coursesContainer = document.getElementById('courses-container');
    
    if (cursos.length === 0) {
        coursesContainer.innerHTML = `
            <div class="no-courses-message">
                <div class="placeholder-icon">📚</div>
                <h3>No hay cursos disponibles</h3>
                <p>No se encontraron cursos en la base de datos.</p>
            </div>
        `;
        return;
    }
    
    const coursesHTML = cursos.map(curso => `
        <div class="course-card available-course">
            <h3 class="course-title">${escapeHTML(curso.titulo)}</h3>
            <div class="course-details">
                <p class="course-info"><strong>Duración:</strong> ${curso.duracion}</p>
                <p class="course-info"><strong>Modalidad:</strong> ${escapeHTML(curso.modalidad)}</p>
                <p class="course-info"><strong>Categoría:</strong> ${escapeHTML(curso.categoria)}</p>
                <p class="course-info"><strong>Área:</strong> ${escapeHTML(curso.area)}</p>
                <p class="course-info"><strong>Grado:</strong> ${escapeHTML(curso.grado)}</p>
                <p class="course-info"><strong>Periodo:</strong> ${escapeHTML(curso.periodo)}</p>
            </div>
            <div class="action-buttons">
                <button class="shiny">Solicitar Impartir</button>
                <button class="back">Ver Detalles</button>
            </div>
        </div>
    `).join('');
    
    coursesContainer.innerHTML = coursesHTML;
}

// Función auxiliar para escapar HTML (seguridad)
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar cursos actuales por defecto
    showSection('current-courses');
    
    // Configurar eventos para los botones del menú
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Configurar evento para el botón "Volver a Mis Cursos"
    document.getElementById('back-to-courses').addEventListener('click', function() {
        showSection('current-courses');
    });
    
    // Configurar evento para reintentar carga de cursos
    document.getElementById('retry-load-courses').addEventListener('click', function() {
        loadAllCourses();
    });
});

function cerrarSesion() {
    window.location = "inicio.html";
}