<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['usuario']) || !isset($data['pass'])) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan Datos."]);
    exit;
}

$usuario = trim($data['usuario']);
$pass = trim($data['pass']);

$stmt = $conexion->prepare("
    SELECT u.id_user, u.username, u.contrasenna 
    FROM usuario u 
    INNER JOIN ROL_USUARIO r ON u.id_user = r.id_user
    WHERE u.username = ? AND r.id_rol = 1
");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    $user = $res->fetch_assoc();
    if ($user['contrasenna'] === $pass) {
        echo json_encode([
            "exito" => true,
            "mensaje" => "Ingreso Exitoso",
            "id_user" => $user['id_user'],
            "usuario" => $user['username']
        ]);
    } else {
        echo json_encode(["exito" => false, "mensaje" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado o sin rol de administrador"]);
}

$stmt->close();
$conexion->close();
?>
