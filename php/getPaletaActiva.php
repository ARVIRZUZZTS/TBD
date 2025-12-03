<?php
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? null;

if (!$id_estudiante) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID requerido']);
    exit;
}

$sql = "SELECT u.id_paleta_activa, c.valor 
        FROM usuario u 
        LEFT JOIN cosmetico c ON u.id_paleta_activa = c.id_cosmetico 
        WHERE u.id_user = $id_estudiante";

$result = $conexion->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['exito' => true, 'clase' => $row['valor']]);
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Usuario no encontrado']);
}
?>
