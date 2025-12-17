<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$id_periodo_curso = trim($data["id_periodo_curso"] ?? '');

if (empty($id_periodo_curso)) {
    echo json_encode([
        'success' => false,
        'message' => 'ID del periodo_curso es obligatorio'
    ]);
    exit;
}

if (!is_numeric($id_periodo_curso)) {
    echo json_encode([
        'success' => false,
        'message' => 'ID del periodo_curso debe ser numérico'
    ]);
    exit;
}

$sql = "UPDATE periodo_curso SET estado_periodo = 'Rechazado' WHERE id_periodo_curso = ?";

$stmt = mysqli_prepare($conexion, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "i", $id_periodo_curso);
    
    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Curso rechazado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró el curso especificado'
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