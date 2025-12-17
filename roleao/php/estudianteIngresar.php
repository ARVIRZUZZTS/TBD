<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data["username"] ?? '');
$password = trim($data["password"] ?? '');

if (!$username || !$password) {
    echo json_encode(["exito" => false, "mensaje" => "Usuario y contraseña requeridos"]);
    exit;
}

$sql = "SELECT u.id_user, u.contrasenna 
        FROM usuario u 
        INNER JOIN rol_usuario ru ON u.id_user = ru.id_user 
        WHERE u.username = ? AND ru.id_rol = 3";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
    exit;
}

$row = $res->fetch_assoc();

if ($row['contrasenna'] === $password) {
    echo json_encode(["exito" => true, "mensaje" => "Inicio de sesión exitoso", "id_user" => $row['id_user']]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Contraseña incorrecta"]);
}

$conexion->close();
?>
