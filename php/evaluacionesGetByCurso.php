<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_periodo_curso = $_GET['id_periodo_curso'] ?? '';

if (empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de periodo curso no proporcionado']);
    exit;
}

$sql = "
    SELECT 
        e.*,
        m.titulo as modulo_titulo,
        COALESCE(e.deskPoints, 0) as deskpoints,
        aa.id_archivo, 
        aa.titulo as archivo_nombre, 
        aa.tipo as archivo_tipo, 
        aa.ruta_archivo as archivo_url
    FROM evaluacion e
    INNER JOIN modulo m ON e.id_modulo = m.id_modulo
    LEFT JOIN archivos_publicacion ap ON e.id_evaluacion = ap.id_publicacion
    LEFT JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo
    WHERE m.id_periodo_curso = ?
    ORDER BY e.fecha_entrega ASC, e.hora_entrega ASC
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_periodo_curso);
$stmt->execute();
$result = $stmt->get_result();

$evaluaciones = [];
while ($row = $result->fetch_assoc()) {
    $evaluaciones[] = $row;
}

$stmt->close();
$conexion->close();

echo json_encode([
    'exito' => true,
    'evaluaciones' => $evaluaciones
]);
?>