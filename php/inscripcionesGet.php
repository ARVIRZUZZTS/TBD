<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

$sql_grado = "SELECT grado FROM usuario WHERE id_user = ?";
$stmt_grado = $conexion->prepare($sql_grado);
$stmt_grado->bind_param("i", $id_estudiante);
$stmt_grado->execute();
$result_grado = $stmt_grado->get_result();

if ($result_grado->num_rows === 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Estudiante no encontrado']);
    exit;
}

$estudiante = $result_grado->fetch_assoc();
$grado_estudiante = intval($estudiante['grado']); // Convertir a int

// Ahora obtenemos los cursos disponibles para ese grado
$sql = "
    SELECT 
        pc.id_periodo_curso,
        c.titulo as nombre_curso,
        c.duracion,
        c.modalidad,
        u.nombre as nombre_profesor,
        u.apellido as apellido_profesor,
        pc.fecha_inicio,
        pc.fecha_fin,
        pc.cupos,
        pc.cupos_ocupados,
        pc.costo,
        g.nombre_grado,
        cat.nombre_categoria
    FROM periodo_curso pc
    INNER JOIN curso c ON pc.id_curso = c.id_curso
    INNER JOIN usuario u ON pc.id_maestro = u.id_user
    INNER JOIN grado g ON c.id_grado = g.id_grado
    INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
    WHERE c.id_grado = ? 
    AND pc.estado_periodo = 'Inscripciones'
    AND pc.cupos_ocupados < pc.cupos
    AND NOT EXISTS (
        SELECT 1 FROM curso_estudiante ce 
        WHERE ce.id_estudiante = ? 
        AND ce.id_periodo_curso = pc.id_periodo_curso
    )
    ORDER BY pc.fecha_inicio
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ii", $grado_estudiante, $id_estudiante);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
}

echo json_encode([
    'exito' => true,
    'grado_estudiante' => $grado_estudiante,
    'cursos' => $cursos
]);

$stmt->close();
$stmt_grado->close();
$conexion->close();
?>