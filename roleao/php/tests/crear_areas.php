<?php
header("Content-Type: application/json");
include '../conexion.php';

$areas = [
    ['nombre_area' => 'Ciencias Exactas'],
    ['nombre_area' => 'Ciencias Sociales'],
    ['nombre_area' => 'Humanidades'],
    ['nombre_area' => 'Arte y Cultura'],
    ['nombre_area' => 'Tecnología'],
    ['nombre_area' => 'Salud'],
    ['nombre_area' => 'Deportes']
];

try {
    $insertados = 0;
    foreach ($areas as $area) {
        $sql = "INSERT INTO area (nombre_area) VALUES (?)";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "s", $area['nombre_area']);
        
        if (mysqli_stmt_execute($stmt)) {
            $insertados++;
        }
        mysqli_stmt_close($stmt);
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Se insertaron $insertados áreas correctamente"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al insertar áreas: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?>