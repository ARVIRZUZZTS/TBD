
import { obtenerIdEstudiante } from './utils.js';
import { cargarDatosEstudiante } from './auth.js';

export function inicializarPerfil() {
    console.log("Inicializando módulo de perfil");
    
    configurarModalEditarPerfil();
    configurarModalCambiarPassword();
    configurarCierreModales();
}

function configurarModalEditarPerfil() {
    const btnEditar = document.getElementById('btn-editar-perfil');
    const modal = document.getElementById('modal-editar-perfil');
    const form = document.getElementById('form-editar-perfil');
    
    if (!btnEditar || !modal || !form) return;
    
    btnEditar.addEventListener('click', async () => {
        modal.style.display = 'block';
        
        // Cargar datos actuales
        try {
            const idUser = obtenerIdEstudiante();
            const response = await fetch(`php/estudianteGet.php?id_user=${idUser}`);
            const data = await response.json();
            
            if (data.exito && data.estudiante) {
                document.getElementById('edit-nombre').value = data.estudiante.nombre;
                document.getElementById('edit-apellido').value = data.estudiante.apellido;
            }
        } catch (error) {
            console.error("Error al cargar datos del perfil", error);
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idUser = obtenerIdEstudiante();
        const nombre = document.getElementById('edit-nombre').value;
        const apellido = document.getElementById('edit-apellido').value;
        
        try {
            const response = await fetch('php/updateProfile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_user: idUser,
                    nombre: nombre,
                    apellido: apellido
                })
            });
            
            const result = await response.json();
            
            if (result.exito) {
                alert(result.mensaje);
                modal.style.display = 'none';
                cargarDatosEstudiante(); // Recargar datos en la UI
            } else {
                alert('Error: ' + result.mensaje);
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar perfil');
        }
    });
}

function configurarModalCambiarPassword() {
    const btnPassword = document.getElementById('btn-cambiar-password');
    const modal = document.getElementById('modal-cambiar-password');
    const form = document.getElementById('form-cambiar-password');
    
    if (!btnPassword || !modal || !form) return;
    
    btnPassword.addEventListener('click', () => {
        modal.style.display = 'block';
        form.reset();
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const oldPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;
        
        if (newPass !== confirmPass) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }
        
        const idUser = obtenerIdEstudiante();
        
        try {
            const response = await fetch('php/changePassword.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_user: idUser,
                    old_password: oldPass,
                    new_password: newPass
                })
            });
            
            const result = await response.json();
            
            if (result.exito) {
                alert(result.mensaje);
                modal.style.display = 'none';
                form.reset();
            } else {
                alert('Error: ' + result.mensaje);
            }
        } catch (error) {
            console.error(error);
            alert('Error al cambiar contraseña');
        }
    });
}

function configurarCierreModales() {
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}
