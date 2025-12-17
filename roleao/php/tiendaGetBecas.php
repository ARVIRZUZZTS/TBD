<?php
header("Content-Type: application/json");
error_reporting(0);
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? null;

if (!$id_estudiante) {
    echo json_encode(["exito" => false, "mensaje" => "Falta id_estudiante"]);
    exit;
}

$sql = "
    SELECT 
        b.id_beca,
        b.id_area,
        b.porcentaje,
        b.estado_beca,
        b.fecha_inicio,
        b.fecha_fin,
        a.nombre_area,
        u.nombre as admin_nombre,
        u.apellido as admin_apellido
    FROM beca b
    INNER JOIN area a ON b.id_area = a.id_area
    LEFT JOIN usuario u ON b.id_admin = u.id_user
    WHERE b.id_estudiante = ? 
    AND b.fecha_fin >= CURDATE()
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

$becas = [];
while ($row = $result->fetch_assoc()) {
    $becas[] = $row;
}

echo json_encode([
    "exito" => true,
    "becas" => $becas
]);

$conexion->close();
?>