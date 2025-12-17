<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['id_estudiante']) || 
    !isset($data['id_admin']) || 
    !isset($data['id_area']) ||
    !isset($data['porcentaje']) ||
    !isset($data['fecha_inicio']) ||
    !isset($data['fecha_fin'])
) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Faltan datos obligatorios para registrar la beca.'
    ]);
    exit;
}

$id_estudiante = $data['id_estudiante'];
$id_admin = $data['id_admin'];
$id_area = $data['id_area'];
$porcentaje = $data['porcentaje'];
$estado_beca = "Pendiente";
$fecha_inicio = $data['fecha_inicio'];
$fecha_fin = $data['fecha_fin'];

try {
    $sql = "INSERT INTO BECA (id_estudiante, id_admin, id_area, porcentaje, estado_beca, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iiissss", $id_estudiante, $id_admin, $id_area, $porcentaje, $estado_beca, $fecha_inicio, $fecha_fin);

    if ($stmt->execute()) {
        echo json_encode([
            'exito' => true,
            'mensaje' => 'Beca registrada correctamente.'
        ]);
    } else {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Error al registrar la beca: ' . $stmt->error
        ]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Excepción: ' . $e->getMessage()
    ]);
}

$conexion->close();
?>
