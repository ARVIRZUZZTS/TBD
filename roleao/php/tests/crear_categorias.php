<?php
header("Content-Type: application/json");
include '../conexion.php';

$categorias = [
    ['nombre_categoria' => 'Básico'],
    ['nombre_categoria' => 'Intermedio'],
    ['nombre_categoria' => 'Avanzado'],
    ['nombre_categoria' => 'Introductorio'],
    ['nombre_categoria' => 'Especializado'],
    ['nombre_categoria' => 'Intensivo'],
    ['nombre_categoria' => 'Extensivo']
];

try {
    $insertados = 0;
    foreach ($categorias as $categoria) {
        $sql = "INSERT INTO categoria (nombre_categoria) VALUES (?)";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "s", $categoria['nombre_categoria']);
        
        if (mysqli_stmt_execute($stmt)) {
            $insertados++;
        }
        mysqli_stmt_close($stmt);
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Se insertaron $insertados categorías correctamente"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al insertar categorías: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?>