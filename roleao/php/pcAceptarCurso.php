<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$id_periodo_curso = trim($data["id_periodo_curso"] ?? '');
$fecha_inicio = trim($data["fecha_inicio"] ?? '');
$fecha_fin = trim($data["fecha_fin"] ?? '');
$cupos = trim($data["cupos"] ?? '');

if (empty($id_periodo_curso) || empty($fecha_inicio) || empty($fecha_fin) || empty($cupos)) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios: id_periodo_curso, fecha_inicio, fecha_fin, cupos'
    ]);
    exit;
}

if (!strtotime($fecha_inicio) || !strtotime($fecha_fin)) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato de fecha inválido'
    ]);
    exit;
}

if (strtotime($fecha_fin) <= strtotime($fecha_inicio)) {
    echo json_encode([
        'success' => false,
        'message' => 'La fecha de fin debe ser posterior a la fecha de inicio'
    ]);
    exit;
}

if (!is_numeric($cupos) || $cupos <= 0 || $cupos > 500) {
    echo json_encode([
        'success' => false,
        'message' => 'Los cupos deben ser un número entre 1 y 500'
    ]);
    exit;
}

$sql = "UPDATE periodo_curso SET 
        fecha_inicio = ?,
        fecha_fin = ?,
        cupos = ?,
        estado_periodo = 'Inscripciones'
        WHERE id_periodo_curso = ?";

$stmt = mysqli_prepare($conexion, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "ssii", $fecha_inicio, $fecha_fin, $cupos, $id_periodo_curso);
    
    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Curso actualizado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró el curso o no se realizaron cambios'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al ejecutar la consulta: ' . mysqli_error($conexion)
        ]);
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar la consulta: ' . mysqli_error($conexion)
    ]);
}

mysqli_close($conexion);
?>