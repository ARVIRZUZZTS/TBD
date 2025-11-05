<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

$sql = "
    SELECT 
        c.titulo as nombre_curso,
        u.nombre as nombre_profesor,
        u.apellido as apellido_profesor,
        ce.nota, 
        ce.asistencia,
        COALESCE(ce.deskPoints, 0) as deskPoints,  -- Usar COALESCE para evitar NULL
        COALESCE(ce.rankingPoints, 0) as rankingPoints,  -- Usar COALESCE para evitar NULL
        pc.fecha_inicio,
        pc.fecha_fin,
        pc.id_periodo_curso,
        (SELECT COUNT(*) FROM modulo m 
         INNER JOIN tarea t ON m.id_modulo = t.id_modulo 
         WHERE m.id_periodo_curso = pc.id_periodo_curso) as total_tareas,
        (SELECT COUNT(*) FROM modulo m 
         INNER JOIN evaluacion e ON m.id_modulo = e.id_modulo 
         WHERE m.id_periodo_curso = pc.id_periodo_curso) as total_evaluaciones
    FROM curso_estudiante ce
    INNER JOIN periodo_curso pc ON ce.id_periodo_curso = pc.id_periodo_curso
    INNER JOIN curso c ON pc.id_curso = c.id_curso
    INNER JOIN usuario u ON pc.id_maestro = u.id_user
    WHERE ce.id_estudiante = ?
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
}

echo json_encode([
    'exito' => true,
    'cursos' => $cursos
]);

$stmt->close();
$conexion->close();
?>