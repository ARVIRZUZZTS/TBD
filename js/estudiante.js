document.addEventListener('DOMContentLoaded', function() {
    console.log(" DOM completamente cargado");
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            if (targetTab) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                this.classList.add('active');
                
                const targetElement = document.getElementById(targetTab);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
            } else {
                if (this.classList.contains('cerrar-sesion-btn')) {
                    cerrarSesion();
                }
            }
        });
    });
    
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    cargarDatosEstudiante();
    
});

async function cargarDatosEstudiante() {
    
    try {
        
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        if (!idEstudiante) {
            console.error(' No se encontró ID de estudiante en el storage');
            document.getElementById('nombre-estudiante').textContent = 'Estudiante';
            document.getElementById('nombre-perfil').textContent = 'Estudiante';
            return;
        }
        
        const response = await fetch(`php/estudianteGet.php?id_user=${idEstudiante}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.exito && data.estudiante) {
            const estudiante = data.estudiante;
            
            document.getElementById('nombre-estudiante').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            
            document.getElementById('nombre-perfil').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            document.getElementById('correo-perfil').textContent = estudiante.correo || 'No disponible';
            document.getElementById('rango-perfil').textContent = 
                `Rango: ${estudiante.rango_actual}`;
            
            const iniciales = (estudiante.nombre.charAt(0) + estudiante.apellido.charAt(0)).toUpperCase();
            document.getElementById('avatar-iniciales').textContent = iniciales;
            
        } else {
            document.getElementById('nombre-estudiante').textContent = 'Estudiante no encontrado';
            document.getElementById('nombre-perfil').textContent = 'Usuario no encontrado';
        }
    } catch (error) {
        document.getElementById('nombre-estudiante').textContent = 'Error de conexión';
        document.getElementById('nombre-perfil').textContent = 'Error al cargar datos';
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        window.location.href = "inicio.html";
    }
}
async function cargarCursosEstudiante() {
    try {
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        
        console.log("ID Estudiante desde storage:", idEstudiante);
        
        if (!idEstudiante) {
            console.error('No se encontró ID de estudiante en storage');
            mostrarCursosVacios();
            return;
        }
        
        const response = await fetch(`php/cursoEstudianteGet.php?id_estudiante=${idEstudiante}`);
        
        //console.log("manden ayuda xd"+"Respuesta del servidor:", response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Datos recibidos:", data);
        
        if (data.exito && data.cursos && data.cursos.length > 0) {
            console.log("Cursos encontrados:", data.cursos);
            mostrarCursos(data.cursos);
        } else {
            console.log("No hay cursos o respuesta vacía");
            mostrarCursosVacios(data.mensaje || "No tienes cursos asignados");
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarCursosVacios("Error al cargar los cursos");
    }
}

function mostrarCursos(cursos) {
    const cursosContainer = document.querySelector('#cursos .content-grid');
    cursosContainer.innerHTML = '';
    
    cursos.forEach(curso => {
        const cursoCard = document.createElement('div');
        cursoCard.className = 'content-card';
        cursoCard.innerHTML = `
            <h3>${curso.nombre_curso}</h3>
            <p><strong>Profesor:</strong> ${curso.nombre_profesor} ${curso.apellido_profesor}</p>
            <p><strong>Nota:</strong> ${curso.nota || 'N/A'}</p>
            <p><strong>Asistencia:</strong> ${curso.asistencia || 0}</p>
            <p><strong>Desk Points:</strong> ${curso.deskPoints || 0}</p>
            <p><strong>Ranking Points:</strong> ${curso.rankingPoints || 0}</p>
            <button class="shiny">Acceder al Curso</button>
        `;
        cursosContainer.appendChild(cursoCard);
    });
}

function mostrarCursosVacios(mensaje = "No tienes cursos asignados") {
    const cursosContainer = document.querySelector('#cursos .content-grid');
    cursosContainer.innerHTML = `
        <div class="content-card">
            <h3>${mensaje}</h3>
            <p>Contacta con administración para más información.</p>
        </div>
    `;
}
// Modificar el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            if (targetTab) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                this.classList.add('active');
                
                const targetElement = document.getElementById(targetTab);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
                
                // Cargar cursos cuando se hace clic en la pestaña de cursos
                if (targetTab === 'cursos') {
                    cargarCursosEstudiante();
                }
            }
        });
    });
    
    cargarDatosEstudiante();
});