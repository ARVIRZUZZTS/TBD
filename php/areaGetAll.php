<?php
include 'conexion.php';

header('Content-Type: application/json');

$sql = "SELECT id_area, nombre_area FROM area ORDER BY nombre_area";
$result = $conexion->query($sql);

if ($result) {
    $areas = [];
    while ($row = $result->fetch_assoc()) {
        $areas[] = $row;
    }
    
    if (count($areas) > 0) {
        echo json_encode(['exito' => true, 'areas' => $areas]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontraron áreas']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener las áreas: ' . $conexion->error]);
}

$conexion->close();
?>