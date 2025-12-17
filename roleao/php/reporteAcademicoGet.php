<?php
include 'conexion.php';
header('Content-Type: application/json');

if (!isset($_GET['id_user'])) {
    echo json_encode(['success' => false, 'message' => 'Falta id_user']);
    exit;
}

$id_user = intval($_GET['id_user']);

$sql = "
    SELECT 
        ce.id_curso_estudiante,
        ce.estado AS estado_estudiante,
        ce.nota,
        ce.deskPoints,
        ce.rankingPoints,
        ce.id_estudiante,
        pc.id_periodo_curso,
        pc.id_maestro,
        pc.estado_periodo,
        pc.fecha_inicio,
        pc.fecha_fin,
        c.id_curso,
        c.id_categoria,
        c.titulo,
        u.nombre AS maestro_nombre,
        u.apellido AS maestro_apellido
    FROM CURSO_ESTUDIANTE ce
    INNER JOIN PERIODO_CURSO pc ON ce.id_periodo_curso = pc.id_periodo_curso
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    INNER JOIN USUARIO u ON pc.id_maestro = u.id_user
    WHERE ce.id_estudiante = $id_user
    ORDER BY pc.id_periodo_curso DESC
";

$result = $conexion->query($sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $conexion->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode(['success' => true, 'inscripciones' => $data]);

$conexion->close();
?>
