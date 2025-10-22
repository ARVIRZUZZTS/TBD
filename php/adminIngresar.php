<?php
    header("Content-Type: application/json");
    include 'conexion.php';
    $data = json_decode(file_get_contents("php://input"), true);

    if(!isset($data['usuario']) || !isset($data['pass'])) {
        echo json_encode(["exito" => false, "mensaje" => "Faltan Datos."]);
        exit;
    }
    $usuario = trim($data['usuario']);
    $pass = trim($data['pass']);

    $stmt = $conexion->prepare("SELECT * FROM usuario WHERE username = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $res = $stmt->get_result();

    if($res->num_rows > 0) {
        $user = $res->fetch_assoc();
        if ($user['contrasenna'] === $pass) {
            echo json_encode(["exito" => true, "mensaje" => "Ingreso Exitoso"]);
        } else {
            echo json_encode(["exito" => false, "mensaje" => "Contraseña Incorrecta"]);
        }
    } else {
        echo json_encode(["exito" => false, "mensaje" => "Usuario no Encontrado"]);
    }
    $stmt->close();
    $conexion->close();
?>