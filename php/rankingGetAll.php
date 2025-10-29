<?php
include 'conexion.php';
header('Content-Type: application/json');

$sql = "
    SELECT 
        r.ranking,
        r.limite_inferior,
        r.limite_superior,
        (
            SELECT COUNT(*) 
            FROM PUNTOS p
            WHERE p.rankingPoints BETWEEN r.limite_inferior AND r.limite_superior
        ) AS total_estudiantes
    FROM RANKING r
    ORDER BY r.limite_inferior ASC
";

$result = $conexion->query($sql);

if ($result) {
    $rankings = [];
    while ($row = $result->fetch_assoc()) {
        $rankings[] = $row;
    }

    if (count($rankings) > 0) {
        echo json_encode(['exito' => true, 'rankings' => $rankings]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontraron rangos']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener los rangos: ' . $conexion->error]);
}

$conexion->close();
?>
