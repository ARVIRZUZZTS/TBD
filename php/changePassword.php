<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$id_user = $data["id_user"] ?? null;
$old_password = $data["old_password"] ?? '';
$new_password = $data["new_password"] ?? '';

if (!$id_user || !$old_password || !$new_password) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan datos requeridos"]);
    exit;
}

// Verify old password
$sql = "SELECT contrasenna FROM usuario WHERE id_user = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_user);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
    exit;
}

$user = $res->fetch_assoc();

if ($user['contrasenna'] !== $old_password) {
    echo json_encode(["exito" => false, "mensaje" => "La contraseña actual es incorrecta"]);
    exit;
}

// Update password
$sqlUpdate = "UPDATE usuario SET contrasenna = ? WHERE id_user = ?";
$stmtUpdate = $conexion->prepare($sqlUpdate);
$stmtUpdate->bind_param("si", $new_password, $id_user);

if ($stmtUpdate->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Contraseña actualizada correctamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al actualizar contraseña: " . $stmtUpdate->error]);
}

$stmt->close();
$stmtUpdate->close();
$conexion->close();
?>
