<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['accion']) || !isset($data['id_user'])) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Faltan parámetros"
    ]);
    exit;
}

$accion  = strtoupper(trim($data['accion']));
$id_user = intval($data['id_user']);

if (!in_array($accion, ["INICIO", "CIERRE"])) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Acción no válida"
    ]);
    exit;
}

$stmt = $conexion->prepare("
    SELECT 
        u.id_user,
        u.nombre,
        u.apellido,
        u.username,
        GROUP_CONCAT(r.nombre_rol SEPARATOR ', ') as roles
    FROM usuario u
    LEFT JOIN rol_usuario ru ON u.id_user = ru.id_user
    LEFT JOIN rol r ON ru.id_rol = r.id_rol
    WHERE u.id_user = ?
    GROUP BY u.id_user
");

$stmt->bind_param("i", $id_user);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Usuario no encontrado"
    ]);
    exit;
}

$user = $res->fetch_assoc();

$descripcion = $user['id_user'] . ": " .
               $user['nombre'] . " " .
               $user['apellido'] . " - " .
               $user['username'] . " - " .
               "Rol: " . ($user['roles'] ?: 'Sin rol');

$stmtInsert = $conexion->prepare("
    INSERT INTO xb_inicio_cierre_usuario (accion, descripcion, fecha_Hora)
    VALUES (?, ?, NOW())
");

$stmtInsert->bind_param("ss", $accion, $descripcion);

if ($stmtInsert->execute()) {
    echo json_encode([
        "exito" => true,
        "mensaje" => "Bitácora registrada correctamente"
    ]);
} else {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al registrar bitácora"
    ]);
}

$stmt->close();
$stmtInsert->close();
$conexion->close();
?>