<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_actividad = $_POST['id_actividad'] ?? '';
$tipo_actividad = $_POST['tipo_actividad'] ?? '';

if (empty($id_estudiante) || empty($id_actividad) || empty($tipo_actividad)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

try {
    // 1. Verificar si ya fue entregada (EVITA DUPLICADOS)
    $sql_verificar = "SELECT 1 FROM entregas WHERE id_user = ? AND id_publicacion = ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    $stmt_verificar->bind_param("is", $id_estudiante, $id_actividad);
    $stmt_verificar->execute();
    $result_verificar = $stmt_verificar->get_result();

    if ($result_verificar->num_rows > 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya has entregado esta actividad']);
        exit;
    }

    // 2. Insertar en tabla de entregas (SOLO GUARDAR, SIN PUNTOS)
    $sql_entrega = "INSERT INTO entregas (id_publicacion, id_user, hora_entrega, fecha_entrega) 
                   VALUES (?, ?, CURTIME(), CURDATE())";
    $stmt_entrega = $conexion->prepare($sql_entrega);
    $stmt_entrega->bind_param("si", $id_actividad, $id_estudiante);
    
    if ($stmt_entrega->execute()) {
        $mensaje = $tipo_actividad === 'tarea' 
            ? 'Tarea entregada correctamente' 
            : 'Evaluación entregada correctamente';

        echo json_encode([
            'exito' => true,
            'mensaje' => $mensaje
        ]);
    } else {
        throw new Exception('Error al registrar la entrega: ' . $stmt_entrega->error);
    }

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>