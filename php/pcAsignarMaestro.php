<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$idCurso = $data['idCurso'] ?? null;
$idMaestro = $data['idMaestro'] ?? null;

if (!$idCurso || !$idMaestro) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan datos para asignar el maestro."]);
    exit;
}

try {
    $sql = "INSERT INTO PERIODO_CURSO 
            (id_curso, id_maestro, fecha_inicio, fecha_fin, cupos, cupos_ocupados, solicitudes_totales, costo, recaudado, estado_periodo)
            VALUES (?, ?, '0000-00-00', '0000-00-00', 0, 0, 0, 0, 0, 'Pendiente')";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        echo json_encode(["exito" => false, "mensaje" => "Error al preparar la consulta: " . $conexion->error]);
        exit;
    }

    $stmt->bind_param("ii", $idCurso, $idMaestro);

    if ($stmt->execute()) {
        echo json_encode(["exito" => true, "mensaje" => "Maestro asignado correctamente."]);
    } else {
        echo json_encode(["exito" => false, "mensaje" => "Error al asignar el maestro: " . $stmt->error]);
    }

    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    echo json_encode(["exito" => false, "mensaje" => "Error: " . $e->getMessage()]);
}
?>
