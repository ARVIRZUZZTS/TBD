// Funcionalidad para la vista de estudiante
document.addEventListener('DOMContentLoaded', function() {
    // Navegación entre pestañas
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remover clase activa de todos los botones y contenidos
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Agregar clase activa al botón y contenido seleccionados
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Efectos hover para tarjetas
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    console.log('Vista de estudiante cargada correctamente');
});