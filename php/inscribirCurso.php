<?php
// inscribirCurso.php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_periodo_curso = $_POST['id_periodo_curso'] ?? '';

if (empty($id_estudiante) || empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Verificar que el curso existe y tiene cupos
$sql_verificar = "
    SELECT cupos, cupos_ocupados 
    FROM periodo_curso 
    WHERE id_periodo_curso = ? 
    AND estado_periodo = 'Inscripciones'
    AND cupos_ocupados < cupos
";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param("i", $id_periodo_curso);
$stmt_verificar->execute();
$result_verificar = $stmt_verificar->get_result();

if ($result_verificar->num_rows === 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Curso no disponible o sin cupos']);
    exit;
}

// Verificar que no está ya inscrito
$sql_verificar_inscripcion = "
    SELECT 1 FROM curso_estudiante 
    WHERE id_estudiante = ? 
    AND id_periodo_curso = ?
";
$stmt_verificar_inscripcion = $conexion->prepare($sql_verificar_inscripcion);
$stmt_verificar_inscripcion->bind_param("ii", $id_estudiante, $id_periodo_curso);
$stmt_verificar_inscripcion->execute();
$result_verificar_inscripcion = $stmt_verificar_inscripcion->get_result();

if ($result_verificar_inscripcion->num_rows > 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Ya estás inscrito en este curso']);
    exit;
}

$sql_inscribir = "
    INSERT INTO curso_estudiante (id_estudiante, id_periodo_curso, estado, nota, asistencia, deskPoints, rankingPoints)
    VALUES (?, ?, 'Inscrito', 0, 0, 0, 0)
";
$stmt_inscribir = $conexion->prepare($sql_inscribir);
$stmt_inscribir->bind_param("ii", $id_estudiante, $id_periodo_curso);

if ($stmt_inscribir->execute()) {
    echo json_encode(['exito' => true, 'mensaje' => 'Inscripción exitosa']);
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al inscribirse']);
}

$stmt_verificar->close();
$stmt_verificar_inscripcion->close();
$stmt_inscribir->close();
$conexion->close();
?>