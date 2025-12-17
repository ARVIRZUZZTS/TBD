<?php
header("Content-Type: application/json");
error_reporting(0);
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_beca = $_POST['id_beca'] ?? null;

if (!$id_estudiante || !$id_beca) {
    echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
    exit;
}

$sql_verificar = "
    SELECT estado_beca 
    FROM beca 
    WHERE id_beca = ? AND id_estudiante = ? AND fecha_fin >= CURDATE()
";

$stmt = $conexion->prepare($sql_verificar);
$stmt->bind_param("ii", $id_beca, $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["exito" => false, "mensaje" => "Beca no encontrada"]);
    exit;
}

$beca = $result->fetch_assoc();

if ($beca['estado_beca'] !== 'Pendiente') {
    echo json_encode(["exito" => false, "mensaje" => "La beca ya fue procesada"]);
    exit;
}

$sql_actualizar = "UPDATE beca SET estado_beca = 'Aceptada' WHERE id_beca = ?";
$stmt = $conexion->prepare($sql_actualizar);
$stmt->bind_param("i", $id_beca);

if ($stmt->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Beca aceptada exitosamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al aceptar la beca"]);
}

$conexion->close();
?>