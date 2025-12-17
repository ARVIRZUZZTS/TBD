<?php
//nuevo
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id_modulo = isset($data['id_modulo']) ? (int)$data['id_modulo'] : 0;
$titulo = isset($data['titulo']) ? trim($data['titulo']) : '';
$orden = isset($data['orden']) ? (int)$data['orden'] : 0;
$id_periodo_curso = isset($data['id_periodo_curso']) ? (int)$data['id_periodo_curso'] : 0;

if (!$id_modulo || !$titulo || !$orden || !$id_periodo_curso) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros o valores inválidos']);
    exit;
}

if ($orden <= 0) {
    echo json_encode(['success' => false, 'message' => 'El orden debe ser mayor que 0']);
    exit;
}

// Verificar que el orden no esté ocupado por otro módulo en el mismo periodo
$sqlCheck = "SELECT COUNT(*) AS cnt FROM modulo WHERE id_periodo_curso = ? AND orden = ? AND id_modulo <> ?";
if ($chk = $conexion->prepare($sqlCheck)) {
    $chk->bind_param('iii', $id_periodo_curso, $orden, $id_modulo);
    $chk->execute();
    $res = $chk->get_result();
    $row = $res->fetch_assoc();
    if ($row && intval($row['cnt']) > 0) {
        echo json_encode(['success' => false, 'message' => 'Ya existe otro módulo con ese orden']);
        exit;
    }
    $chk->close();
}

// Actualizar módulo
$sqlUpd = "UPDATE modulo SET titulo = ?, orden = ? WHERE id_modulo = ?";
if ($upd = $conexion->prepare($sqlUpd)) {
    $upd->bind_param('sii', $titulo, $orden, $id_modulo);
    if ($upd->execute()) {
        echo json_encode(['success' => true, 'message' => 'Módulo actualizado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error actualizando módulo: ' . $upd->error]);
    }
    $upd->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error preparando actualización']);
}
exit;
?>