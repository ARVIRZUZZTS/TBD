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
        ce.estado,
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
         WHERE m.id_periodo_curso = pc.id_periodo_curso) as total_evaluaciones,
        (SELECT COALESCE(AVG(e.nota), 0)
         FROM entregas e
         WHERE e.id_user = ce.id_estudiante AND (
            e.id_publicacion IN (
                SELECT CONCAT('TA-', t.id_tarea) FROM tarea t 
                INNER JOIN modulo m ON t.id_modulo = m.id_modulo 
                WHERE m.id_periodo_curso = pc.id_periodo_curso
            )
            OR
            e.id_publicacion IN (
                SELECT CONCAT('EV-', e.id_evaluacion) FROM evaluacion e 
                INNER JOIN modulo m ON e.id_modulo = m.id_modulo 
                WHERE m.id_periodo_curso = pc.id_periodo_curso
            )
         )
        ) as promedio_real
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