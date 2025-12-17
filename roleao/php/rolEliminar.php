<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$idRol = $data["idRol"];

if (!$idRol) {
    echo json_encode(["exito" => false, "mensaje" => "ID de rol no proporcionado"]);
    exit;
}

$sql = "DELETE FROM ROL WHERE id_rol = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $idRol);

if ($stmt->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Rol eliminado correctamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al eliminar el rol"]);
}

$conexion->close();
?>
