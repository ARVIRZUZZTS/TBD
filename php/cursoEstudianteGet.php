<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = isset($_GET['id_estudiante']) ? intval($_GET['id_estudiante']) : 0;

if ($id_estudiante <= 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no válido']);
    exit;
}

$sql = "SELECT c.titulo as nombre_curso,
            u.nombre as nombre_profesor,
            u.apellido as apellido_profesor,
            ce.nota, 
            ce.asistencia,
            ce.deskPoints, 
            ce.rankingPoints
        FROM curso_estudiante ce
        INNER JOIN periodo_curso pc ON ce.id_periodo_curso = pc.id_periodo_curso
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        INNER JOIN usuario u ON pc.id_maestro = u.id_user
        WHERE ce.id_estudiante = ?
    ";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['exito' => false, 'mensaje' => 'Error en la preparación: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
}

$stmt->close();
$conexion->close();

echo json_encode([
    'exito' => true,
    'cursos' => $cursos
]);
?>