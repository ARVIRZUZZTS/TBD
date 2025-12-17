<?php
include 'conexion.php';

header('Content-Type: application/json');

$sql = "SELECT id_grado, nombre_grado FROM grado ORDER BY nombre_grado";
$result = $conexion->query($sql);

if ($result) {
    $grados = [];
    while ($row = $result->fetch_assoc()) {
        $grados[] = $row;
    }
    
    if (count($grados) > 0) {
        echo json_encode(['exito' => true, 'grados' => $grados]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontraron grados']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener los grados: ' . $conexion->error]);
}

$conexion->close();
?>