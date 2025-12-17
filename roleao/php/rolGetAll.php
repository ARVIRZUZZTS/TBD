<?php
header("Content-Type: application/json");
include 'conexion.php';

$sql = "SELECT id_rol, nombre_rol FROM ROL";
$res = $conexion->query($sql);

if ($res && $res->num_rows > 0) {
    $roles = [];
    while ($row = $res->fetch_assoc()) {
        $roles[] = $row;
    }
    echo json_encode(["exito" => true, "roles" => $roles]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "No se encontraron roles"]);
}
$conexion->close();
?>
