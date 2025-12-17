<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$idRol = $data["idRol"];
$nombreNuevo = trim($data["nombreNuevo"]);

if (!$idRol || !$nombreNuevo) {
    echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
    exit;
}

$sqlVerificar = "SELECT * FROM ROL WHERE nombre_rol = ? AND id_rol != ?";
$stmt = $conexion->prepare($sqlVerificar);
$stmt->bind_param("si", $nombreNuevo, $idRol);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Ese nombre de rol ya existe"]);
    exit;
}

$sqlUpdate = "UPDATE ROL SET nombre_rol = ? WHERE id_rol = ?";
$stmt2 = $conexion->prepare($sqlUpdate);
$stmt2->bind_param("si", $nombreNuevo, $idRol);

if ($stmt2->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Rol actualizado correctamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al actualizar el rol"]);
}

$conexion->close();
?>