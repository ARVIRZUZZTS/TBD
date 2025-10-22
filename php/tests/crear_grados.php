<?php
header("Content-Type: application/json");
include '../conexion.php';

$grados = [
    ['nombre_grado' => 'Primaria'],
    ['nombre_grado' => 'Secundaria'],
    ['nombre_grado' => 'Bachillerato'],
    ['nombre_grado' => 'Técnico'],
    ['nombre_grado' => 'Universitario'],
    ['nombre_grado' => 'Maestría'],
    ['nombre_grado' => 'Doctorado']
];

try {
    $insertados = 0;
    foreach ($grados as $grado) {
        $sql = "INSERT INTO grado (nombre_grado) VALUES (?)";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "s", $grado['nombre_grado']);
        
        if (mysqli_stmt_execute($stmt)) {
            $insertados++;
        }
        mysqli_stmt_close($stmt);
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Se insertaron $insertados grados correctamente"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al insertar grados: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?>