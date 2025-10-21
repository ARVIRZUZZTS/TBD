<?php
header("Content-Type: application/json");
include 'conexion.php';
$data = json_decode(file_get_contents("php://input"), true);

$campos = ['nombre','apellido','username','contrasenna','ci','telefono','correo','edad','titulo','sueldo','rol'];
foreach ($campos as $c) {
    if (!isset($data[$c]) || trim($data[$c]) === '') {
        echo json_encode(["exito" => false, "mensaje" => "Faltan datos."]);
        exit;
    }
}

$nombre = $data['nombre'];
$apellido = $data['apellido'];
$username = $data['username'];
$contrasenna = $data['contrasenna'];
$ci = $data['ci'];
$telefono = $data['telefono'];
$correo = $data['correo'];
$edad = $data['edad'];
$titulo = $data['titulo'];
$sueldo = $data['sueldo'];
$rolNombre = $data['rol'];

$conexion->begin_transaction();

try {
    $stmt = $conexion->prepare("INSERT INTO USUARIO (nombre, apellido, username, contrasenna, ci, telefono, correo, edad) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssi", $nombre, $apellido, $username, $contrasenna, $ci, $telefono, $correo, $edad);
    $stmt->execute();
    $id_user = $conexion->insert_id;
    $stmt->close();

    $stmt = $conexion->prepare("INSERT INTO DATOS_MAESTRO (id_user, titulo, sueldo) VALUES (?, ?, ?)");
    $stmt->bind_param("isd", $id_user, $titulo, $sueldo);
    $stmt->execute();
    $stmt->close();

    $stmt = $conexion->prepare("SELECT id_rol FROM ROL WHERE nombre_rol = ? AND nombre_rol <> 'Estudiante'");
    $stmt->bind_param("s", $rolNombre);
    $stmt->execute();
    $res = $stmt->get_result();
    $id_rol = $res->fetch_assoc()['id_rol'];
    $stmt->close();
    
    $stmt = $conexion->prepare("INSERT INTO ROL_USUARIO (id_user, id_rol) VALUES (?, ?)");
    $stmt->bind_param("ii", $id_user, $id_rol);
    $stmt->execute();
    $stmt->close();

    $conexion->commit();
    echo json_encode(["exito" => true, "mensaje" => "Maestro registrado exitosamente."]);

} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(["exito" => false, "mensaje" => "Error al registrar: " . $e->getMessage()]);
}

$conexion->close();
?>
