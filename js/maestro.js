const params = new URLSearchParams(window.location.search);
let usuario = params.get("usuario");

function showSection(sectionId) {
    document.querySelectorAll('.content-area > div').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        if (sectionId === 'current-courses') {
            loadMyCourses();
        }
    }
}

async function loadMyCourses() {
    const loadingElement = document.getElementById('courses-loading');
    const coursesContainer = document.getElementById('courses-container');
    const errorElement = document.getElementById('courses-error');
    
    loadingElement.style.display = 'block';
    coursesContainer.innerHTML = '';
    errorElement.style.display = 'none';

    let idMaestro = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
    
    fetch("php/pcGetByMaestro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMaestro })
    })
    .then(res => res.json())
    .then(data => {
        loadingElement.style.display = 'none';
        if (data.success) {
            if(data.cursos.length > 0){
                displayCourses(data.cursos);
            } else {
                coursesContainer.innerHTML = `
                    <div class="no-courses-message">
                        <div class="placeholder-icon">📚</div>
                        <h3>No hay cursos disponibles</h3>
                        <p>No se le han asignado cursos por el momento.</p>
                    </div>
                `;
            }
        }
    })
    .catch(err => {
        console.error('Error al cargar cursos:', err);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    });
}

// async function loadAllCourses() {
//     const loadingElement = document.getElementById('courses-loading');
//     const coursesContainer = document.getElementById('courses-container');
//     const errorElement = document.getElementById('courses-error');
    
//     // Mostrar loading, ocultar otros elementos
//     loadingElement.style.display = 'block';
//     coursesContainer.innerHTML = '';
//     errorElement.style.display = 'none';
    
//     try {
//         const response = await fetch('php/cursoGetAll.php');
//         const data = await response.json();
        
//         // Ocultar loading
//         loadingElement.style.display = 'none';
        
//         if (data.success && data.cursos.length > 0) {
//             displayCourses(data.cursos);
//         } else {
//             coursesContainer.innerHTML = `
//                 <div class="no-courses-message">
//                     <div class="placeholder-icon">📚</div>
//                     <h3>No hay cursos disponibles</h3>
//                     <p>No se encontraron cursos en la base de datos.</p>
//                 </div>
//             `;
//         }
//     } catch (error) {
//         console.error('Error al cargar cursos:', error);
//         loadingElement.style.display = 'none';
//         errorElement.style.display = 'block';
//     }
// }

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
                <p class="course-info"><strong>Inscritos:</strong> ${escapeHTML(curso.inscritos)}</p>
            </div>
            <div class="action-buttons">
                <button class="shiny">Ver Detalles</button>
            </div>
        </div>
    `).join('');
    
    coursesContainer.innerHTML = coursesHTML;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    showSection('current-courses');
    
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
    
    document.getElementById('back-to-courses').addEventListener('click', function() {
        showSection('current-courses');
    });
    
    document.getElementById('retry-load-courses').addEventListener('click', function() {
        loadMyCourses();
    });
});

function cerrarSesion() {
    localStorage.removeItem('id_user');
    sessionStorage.removeItem('id_user');
    window.location.href = "inicio.html";
}