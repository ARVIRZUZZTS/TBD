<?php
include 'conexion.php';

header('Content-Type: application/json');

$sql = "SELECT id_categoria, nombre_categoria FROM categoria ORDER BY nombre_categoria";
$result = $conexion->query($sql);

if ($result) {
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }
    
    if (count($categorias) > 0) {
        echo json_encode(['exito' => true, 'categorias' => $categorias]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontraron categorías']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener las categorías: ' . $conexion->error]);
}

$conexion->close();
?>