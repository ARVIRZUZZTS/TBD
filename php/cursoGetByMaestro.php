<?php
header("Content-Type: application/json");
include 'conexion.php';


$sql = "
    SELECT u.id_user, u.nombre, u.apellido, u.username, u.contrasenna, 
           u.ci, u.telefono, u.correo, u.edad
    FROM usuario u
    INNER JOIN rol_usuario r ON u.id_user = r.id_user
    WHERE r.id_rol <> 1 and r.id_rol <> 3
";
?>