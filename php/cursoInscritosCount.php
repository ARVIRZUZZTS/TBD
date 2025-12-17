<?php
//nuevo
header('Content-Type: application/json');
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_periodo_curso = isset($data['id_periodo_curso']) ? (int)$data['id_periodo_curso'] : 0;

if (!$id_periodo_curso) {
    echo json_encode(['success' => false, 'message' => 'ID de periodo de curso no proporcionado']);
    exit;
}

try {
    $sql = "SELECT COUNT(*) as cnt FROM curso_estudiante WHERE id_periodo_curso = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id_periodo_curso);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $count = isset($row['cnt']) ? (int)$row['cnt'] : 0;

    echo json_encode(['success' => true, 'inscritos' => $count]);
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al contar inscritos: ' . $e->getMessage()]);
}

$conexion->close();

?>
