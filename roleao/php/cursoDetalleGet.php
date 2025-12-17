<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_periodo_curso = $_GET['id_periodo_curso'] ?? '';

if (empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de periodo curso no proporcionado']);
    exit;
}

// Obtener información del curso
$sql_curso = "
    SELECT 
        c.titulo as nombre_curso,
        u.nombre as nombre_profesor,
        u.apellido as apellido_profesor,
        pc.fecha_inicio,
        pc.fecha_fin
    FROM periodo_curso pc
    INNER JOIN curso c ON pc.id_curso = c.id_curso
    INNER JOIN usuario u ON pc.id_maestro = u.id_user
    WHERE pc.id_periodo_curso = ?
";

$stmt_curso = $conexion->prepare($sql_curso);
$stmt_curso->bind_param("i", $id_periodo_curso);
$stmt_curso->execute();
$result_curso = $stmt_curso->get_result();
$curso = $result_curso->fetch_assoc();
$stmt_curso->close();

// Obtener módulos
$sql_modulos = "
    SELECT id_modulo, titulo, orden 
    FROM modulo 
    WHERE id_periodo_curso = ? 
    ORDER BY orden ASC
";
$stmt_modulos = $conexion->prepare($sql_modulos);
$stmt_modulos->bind_param("i", $id_periodo_curso);
$stmt_modulos->execute();
$result_modulos = $stmt_modulos->get_result();

$modulos = [];
while ($modulo = $result_modulos->fetch_assoc()) {
    $modulos[] = $modulo;
}
$stmt_modulos->close();

$conexion->close();

echo json_encode([
    'exito' => true,
    'curso' => $curso,
    'modulos' => $modulos
]);
?>