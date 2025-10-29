<?php
header("Content-Type: application/json"); //corregir grado no da xd
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$nombre = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$username = trim($data['username'] ?? '');
$ci = trim($data['ci'] ?? '');
$telefono = trim($data['telefono'] ?? '');
$correo = trim($data['correo'] ?? '');
$edad = trim($data['edad'] ?? '');
$contrasenna = trim($data['contrasenna'] ?? '');
$contrasenna2 = trim($data['contrasenna2'] ?? '');

if (strlen($nombre) < 3 || strlen($apellido) < 3) {
    echo json_encode(["exito" => false, "mensaje" => "Nombre y apellido deben tener mínimo 3 letras"]);
    exit;
}

if (strlen($username) < 3) {
    echo json_encode(["exito" => false, "mensaje" => "El nombre de usuario es muy corto"]);
    exit;
}

if (!ctype_digit($ci) || strlen($ci) < 7) {
    echo json_encode(["exito" => false, "mensaje" => "CI inválido"]);
    exit;
}

if (!ctype_digit($telefono) || strlen($telefono) < 7) {
    echo json_encode(["exito" => false, "mensaje" => "Teléfono inválido"]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["exito" => false, "mensaje" => "Correo inválido"]);
    exit;
}

if (!ctype_digit($edad) || $edad < 1 || $edad > 120) {
    echo json_encode(["exito" => false, "mensaje" => "Edad inválida"]);
    exit;
}

if (strlen($contrasenna) < 6) {
    echo json_encode(["exito" => false, "mensaje" => "La contraseña debe tener mínimo 6 caracteres"]);
    exit;
}

if ($contrasenna !== $contrasenna2) {
    echo json_encode(["exito" => false, "mensaje" => "Las contraseñas no coinciden"]);
    exit;
}

$sqlCheck = "SELECT id_user FROM usuario WHERE ci = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $ci);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Ya hay un estudiante con el mismo CI"]);
    exit;
}
$stmt->close();

$sqlCheckUser = "SELECT id_user FROM usuario WHERE username = ?";
$stmtUser = $conexion->prepare($sqlCheckUser);
$stmtUser->bind_param("s", $username);
$stmtUser->execute();
$resUser = $stmtUser->get_result();

if ($resUser->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Username ya utilizado, escoja otro"]);
    exit;
}
$stmtUser->close();

$sqlInsert = "INSERT INTO usuario (nombre, apellido, username, contrasenna, ci, telefono, correo, edad) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt2 = $conexion->prepare($sqlInsert);
$stmt2->bind_param("ssssssss", $nombre, $apellido, $username, $contrasenna, $ci, $telefono, $correo, $edad);

if ($stmt2->execute()) {
    $id_user = $stmt2->insert_id;

    $sqlRol = "SELECT id_rol FROM ROL WHERE nombre_rol = 'Estudiante'";
    $resRol = $conexion->query($sqlRol);
    $rowRol = $resRol->fetch_assoc();
    $id_rol = $rowRol['id_rol'];

    $sqlRU = "INSERT INTO ROL_USUARIO (id_user, id_rol) VALUES (?, ?)";
    $stmtRU = $conexion->prepare($sqlRU);
    $stmtRU->bind_param("ii", $id_user, $id_rol);
    $stmtRU->execute();

    $sqlPuntos = "INSERT INTO PUNTOS (id_user, puntos_totales, puntos_gastados, saldo_actual, rankingPoints) VALUES (?, 0, 0, 0, 0)";
    $stmtP = $conexion->prepare($sqlPuntos);
    $stmtP->bind_param("i", $id_user);
    $stmtP->execute();

    echo json_encode(["exito" => true, "mensaje" => "Registro exitoso", "id_user" => $id_user]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al registrar el estudiante"]);
}

$conexion->close();
?>
