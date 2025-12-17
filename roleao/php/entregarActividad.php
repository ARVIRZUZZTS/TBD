<?php
header("Content-Type: application/json");
include 'conexion.php';

// Debug: Log de entrada
error_log("DEBUG entregarActividad.php - POST: " . print_r($_POST, true));

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_publicacion = $_POST['id_publicacion'] ?? ''; // ← AHORA RECIBE EL ID FORMATEADO
$tipo_actividad = $_POST['tipo_actividad'] ?? '';

error_log("DEBUG - id_estudiante: $id_estudiante, id_publicacion: $id_publicacion, tipo_actividad: $tipo_actividad");

if (empty($id_estudiante) || empty($id_publicacion) || empty($tipo_actividad)) {
    error_log("DEBUG - Datos incompletos");
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

try {
    // 1. Verificar si ya fue entregada
    error_log("DEBUG - Verificando entrega existente...");
    $sql_verificar = "SELECT 1 FROM entregas WHERE id_user = ? AND id_publicacion = ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    $stmt_verificar->bind_param("is", $id_estudiante, $id_publicacion);
    $stmt_verificar->execute();
    $result_verificar = $stmt_verificar->get_result();

    if ($result_verificar->num_rows > 0) {
        error_log("DEBUG - Entrega duplicada detectada");
        echo json_encode(['exito' => false, 'mensaje' => 'Ya has entregado esta actividad']);
        exit;
    }

    // 2. Insertar en tabla de entregas
    error_log("DEBUG - Insertando nueva entrega...");
    $sql_entrega = "INSERT INTO entregas (id_publicacion, id_user, hora_entrega, fecha_entrega) 
                   VALUES (?, ?, CURTIME(), CURDATE())";
    $stmt_entrega = $conexion->prepare($sql_entrega);
    $stmt_entrega->bind_param("si", $id_publicacion, $id_estudiante);
    
    if ($stmt_entrega->execute()) {
        error_log("DEBUG - Entrega insertada exitosamente");
        $mensaje = $tipo_actividad === 'tarea' 
            ? 'Tarea entregada correctamente' 
            : 'Evaluación entregada correctamente';

        echo json_encode([
            'exito' => true,
            'mensaje' => $mensaje
        ]);
    } else {
        error_log("DEBUG - Error en execute: " . $stmt_entrega->error);
        throw new Exception('Error al registrar la entrega: ' . $stmt_entrega->error);
    }

} catch (Exception $e) {
    error_log("DEBUG - Exception: " . $e->getMessage());
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>