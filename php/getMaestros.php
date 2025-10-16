<?php
header("Content-Type: application/json");
include 'conexion.php';


$sql = "
    SELECT u.id_user, u.nombre, u.apellido, u.username, u.contrasenna, 
           u.ci, u.telefono, u.correo, u.edad
    FROM usuario u
    INNER JOIN rol_usuario r ON u.id_user = r.id_user
    WHERE r.id_rol = 2
";

$result = $conexion->query($sql);

if ($result && $result->num_rows > 0) {
    $maestros = [];
    while ($row = $result->fetch_assoc()) {
        $maestros[] = $row;
    }
    echo json_encode(["exito" => true, "maestros" => $maestros]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "No se encontraron maestros."]);
}

$conexion->close();
?>
