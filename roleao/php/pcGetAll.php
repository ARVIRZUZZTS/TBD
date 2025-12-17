<?php
include 'conexion.php';
header('Content-Type: application/json');

$sql = "
    SELECT 
        pc.id_periodo_curso,
        pc.id_maestro,
        c.titulo,
        pc.cupos,
        pc.cupos_ocupados,
        pc.solicitudes_totales,
        pc.recaudado,
        pc.estado_periodo
    FROM PERIODO_CURSO pc
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    ORDER BY pc.id_periodo_curso DESC
";

$result = $conexion->query($sql);

if ($result) {
    $periodos = [];
    while ($row = $result->fetch_assoc()) {
        $periodos[] = $row;
    }

    if (count($periodos) > 0) {
        echo json_encode(['success' => true, 'periodos' => $periodos]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontraron cursos activos']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al obtener los datos: ' . $conexion->error]);
}

$conexion->close();
?>
