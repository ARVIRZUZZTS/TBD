<?php
// php/descargar.php
session_start();

$archivo = $_GET['archivo'] ?? '';

// Validar que el archivo sea seguro
if (empty($archivo) || strpos($archivo, '..') !== false) {
    http_response_code(400);
    die('Solicitud inválida');
}

$rutaCompleta = '../uploads/' . $archivo;

// Verificar que el archivo exista y sea seguro
if (file_exists($rutaCompleta) && is_file($rutaCompleta)) {
    $extension = strtolower(pathinfo($rutaCompleta, PATHINFO_EXTENSION));
    $allowedExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
    
    if (!in_array($extension, $allowedExtensions)) {
        http_response_code(403);
        die('Tipo de archivo no permitido');
    }
    
    // Headers para forzar descarga
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($rutaCompleta) . '"');
    header('Content-Length: ' . filesize($rutaCompleta));
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    
    readfile($rutaCompleta);
    exit;
} else {
    http_response_code(404);
    echo 'Archivo no encontrado';
}
?>