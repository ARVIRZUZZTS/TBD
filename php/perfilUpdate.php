<?php
//nuevo
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id_user = isset($data['id_user']) ? (int)$data['id_user'] : 0;
$nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
$titulo = isset($data['titulo']) ? trim($data['titulo']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';

if (!$id_user || !$nombre || !$correo) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros requeridos']);
    exit;
}

// Actualizar tabla usuario
$sql = "UPDATE usuario SET nombre = ?, correo = ? WHERE id_user = ?";
if ($stmt = $conexion->prepare($sql)) {
    $stmt->bind_param('ssi', $nombre, $correo, $id_user);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error actualizando usuario: ' . $stmt->error]);
        exit;
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error preparando consulta usuario']);
    exit;
}

// Actualizar o insertar datos_maestro
// Verificar si hay registro existente
$sqlCheck = "SELECT id_dato FROM datos_maestro WHERE id_user = ? LIMIT 1";
if ($chk = $conexion->prepare($sqlCheck)) {
    $chk->bind_param('i', $id_user);
    $chk->execute();
    $res = $chk->get_result();
    if ($row = $res->fetch_assoc()) {
        $id_dato = $row['id_dato'];
        $upd = $conexion->prepare("UPDATE datos_maestro SET titulo = ? WHERE id_dato = ?");
        $upd->bind_param('si', $titulo, $id_dato);
        $upd->execute();
        $upd->close();
    } else {
        $ins = $conexion->prepare("INSERT INTO datos_maestro (id_user, titulo) VALUES (?, ?)");
        $ins->bind_param('is', $id_user, $titulo);
        $ins->execute();
        $ins->close();
    }
    $chk->close();
}

echo json_encode(['success' => true, 'message' => 'Perfil actualizado']);
exit;
?>