<?php
//nuevo
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Espera JSON con id_user
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$id_user = isset($data['id_user']) ? (int)$data['id_user'] : 0;
if (!$id_user) {
    echo json_encode(['success' => false, 'message' => 'Falta id_user']);
    exit;
}

// Obtener datos de usuario
$sql = "SELECT id_user, nombre, apellido, correo FROM usuario WHERE id_user = ? LIMIT 1";
if ($stmt = $conexion->prepare($sql)) {
    $stmt->bind_param('i', $id_user);
    $stmt->execute();
    $res = $stmt->get_result();
    $usuario = $res->fetch_assoc();
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error preparando consulta']);
    exit;
}

// Obtener datos_maestro si existe
$datos = null;
$sql2 = "SELECT id_dato, id_user, titulo, sueldo FROM datos_maestro WHERE id_user = ? LIMIT 1";
if ($stmt2 = $conexion->prepare($sql2)) {
    $stmt2->bind_param('i', $id_user);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    $datos = $res2->fetch_assoc();
    $stmt2->close();
}

echo json_encode(['success' => true, 'usuario' => $usuario, 'datos_maestro' => $datos]);
exit;
?>