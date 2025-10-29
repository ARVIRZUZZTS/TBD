<?php
include 'conexion.php';
header('Content-Type: application/json');

$sql = "
    SELECT 
        b.id_beca,
        b.id_estudiante,
        u.nombre,
        u.apellido,
        a.nombre_area,
        b.porcentaje,
        b.estado_beca,
        b.fecha_inicio,
        b.fecha_fin
    FROM BECA b
    INNER JOIN USUARIO u ON b.id_estudiante = u.id_user
    INNER JOIN AREA a ON b.id_area = a.id_area
    ORDER BY u.nombre ASC
";

$result = $conexion->query($sql);

if ($result) {
    $becas = [];
    while ($row = $result->fetch_assoc()) {
        $becas[] = $row;
    }

    if (count($becas) > 0) {
        echo json_encode(['exito' => true, 'becas' => $becas]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se emitió ninguna Beca']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener las becas: ' . $conexion->error]);
}

$conexion->close();
?>
