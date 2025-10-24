document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM completamente cargado");
    
    // Navegación entre pestañas
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
                // Si no tiene data-tab, es el botón de cerrar sesión
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
    
    // ✅✅✅ ESTA LÍNEA FALTA - LLAMAR A LA FUNCIÓN
    cargarDatosEstudiante();
    
    console.log('Vista de estudiante cargada correctamente');
});

// Función para cargar datos del estudiante
async function cargarDatosEstudiante() {
    console.log("🚀 cargarDatosEstudiante() EJECUTÁNDOSE");
    
    try {
        console.log("=== INICIANDO CARGA DE DATOS ===");
        
        // Obtener el ID del estudiante
        let idEstudiante = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        console.log("ID encontrado en storage:", idEstudiante);
        
        if (!idEstudiante) {
            console.error('❌ No se encontró ID de estudiante en el storage');
            document.getElementById('nombre-estudiante').textContent = 'Estudiante';
            document.getElementById('nombre-perfil').textContent = 'Estudiante';
            return;
        }

        console.log("🔍 Haciendo fetch a:", `estudianteGet.php?id_user=${idEstudiante}`);
        
        const response = await fetch(`php/estudianteGet.php?id_user=${idEstudiante}`);
        console.log("📡 Response status:", response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Datos recibidos del PHP:", data);

        if (data.exito && data.estudiante) {
            const estudiante = data.estudiante;
            console.log("✅ Estudiante encontrado:", estudiante);
            
            // Actualizar el nombre en el header
            document.getElementById('nombre-estudiante').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            
            // Actualizar el perfil
            document.getElementById('nombre-perfil').textContent = 
                `${estudiante.nombre} ${estudiante.apellido}`;
            document.getElementById('correo-perfil').textContent = estudiante.correo || 'No disponible';
            document.getElementById('rango-perfil').textContent = 
                `Rango: ${estudiante.rango_actual}`;
            
            // Actualizar avatar con iniciales
            const iniciales = (estudiante.nombre.charAt(0) + estudiante.apellido.charAt(0)).toUpperCase();
            document.getElementById('avatar-iniciales').textContent = iniciales;
            
            console.log("✅ Datos actualizados en la página");
            
        } else {
            console.error('❌ Error en la respuesta:', data.mensaje);
            document.getElementById('nombre-estudiante').textContent = 'Estudiante no encontrado';
            document.getElementById('nombre-perfil').textContent = 'Usuario no encontrado';
        }
    } catch (error) {
        console.error('❌ Error al cargar datos del estudiante:', error);
        document.getElementById('nombre-estudiante').textContent = 'Error de conexión';
        document.getElementById('nombre-perfil').textContent = 'Error al cargar datos';
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar almacenamiento local
        localStorage.removeItem('id_user');
        sessionStorage.removeItem('id_user');
        // Redirigir al login
        window.location.href = "inicio.html";
    }
}