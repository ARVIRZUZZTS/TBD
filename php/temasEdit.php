<?php
//nuevo
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id_tema = isset($data['id_tema']) ? (int)$data['id_tema'] : 0;
$titulo = isset($data['titulo']) ? trim($data['titulo']) : '';

if (!$id_tema || !$titulo) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros']);
    exit;
}

// Actualizar título del tema
$sql = "UPDATE temas SET titulo = ? WHERE id_tema = ?";
if ($stmt = $conexion->prepare($sql)) {
    $stmt->bind_param('si', $titulo, $id_tema);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Tema actualizado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error actualizando tema: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error preparando la consulta']);
}
exit;
?>