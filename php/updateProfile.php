<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$id_user = $data["id_user"] ?? null;
$nombre = trim($data["nombre"] ?? '');
$apellido = trim($data["apellido"] ?? '');

if (!$id_user || !$nombre || !$apellido) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan datos requeridos"]);
    exit;
}

// Update the user's name and lastname
$sql = "UPDATE usuario SET nombre = ?, apellido = ? WHERE id_user = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssi", $nombre, $apellido, $id_user);

if ($stmt->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Perfil actualizado correctamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al actualizar perfil: " . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
