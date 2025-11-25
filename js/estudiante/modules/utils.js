//cositas extra
export function obtenerIdEstudiante() {
    return localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
}

export function calcularProgresoCurso(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    if (isNaN(inicio) || isNaN(fin)) return 0;
    
    const duracionTotal = fin - inicio;
    const tiempoTranscurrido = hoy - inicio;
    
    if (duracionTotal <= 0) return 100;
    
    let porcentaje = (tiempoTranscurrido / duracionTotal) * 100;
    
    return Math.min(100, Math.max(0, Math.round(porcentaje)));
}

export function calcularDiasRestantes(fechaFin) {
    if (!fechaFin) return 'N/A';
    
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    if (isNaN(fin)) return 'N/A';
    
    const diferencia = fin - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'Finalizado';
    if (diasRestantes === 0) return 'Hoy';
    if (diasRestantes === 1) return '1 día';
    
    return `${diasRestantes} días`;
}

export function formatearFecha(fecha, hora) {
    if (!fecha) return 'No especificada';
    
    const fechaObj = new Date(fecha + 'T00:00:00');
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
    
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}

export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function manejarDescargaArchivo(archivoUrl, nombreArchivo) {
    if (!archivoUrl) {
        alert('No hay archivo disponible para descargar');
        return;
    }
    
    const urlDescarga = `php/descargar.php?archivo=${encodeURIComponent(archivoUrl)}`;

    const link = document.createElement('a');
    link.href = urlDescarga;
    link.download = nombreArchivo || 'archivo_descargado';
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}