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
    SELECT u.id_user, u.username, u.contrasenna, ro.nombre_rol
    FROM usuario u 
    INNER JOIN ROL_USUARIO r ON u.id_user = r.id_user
    INNER JOIN ROL ro ON ro.id_rol = r.id_rol
    WHERE u.username = ? 
      AND r.id_rol <> 2
      AND r.id_rol <> 3
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
            "usuario" => $user['username'],
            "rol" => $user['nombre_rol']
        ]);
    } else {
        echo json_encode(["exito" => false, "mensaje" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado o sin permisos de trabajador o administrador"]);
}

$stmt->close();
$conexion->close();
?>
