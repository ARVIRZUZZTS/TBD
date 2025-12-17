<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$nombreRol = trim($data["nombreRol"]);

if (!$nombreRol) {
    echo json_encode(["exito" => false, "mensaje" => "El nombre del rol está vacío"]);
    exit;
}

$sqlCheck = "SELECT 1 FROM ROL WHERE nombre_rol = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $nombreRol);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Ese rol ya existe"]);
    exit;
}

$sqlInsert = "INSERT INTO ROL (nombre_rol) VALUES (?)";
$stmt2 = $conexion->prepare($sqlInsert);
$stmt2->bind_param("s", $nombreRol);

if ($stmt2->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Rol agregado correctamente"]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al agregar el rol"]);
}

$conexion->close();
?>
