<?php
include 'conexion.php';
header('Content-Type: application/json');

if (!isset($_GET['ranking'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el parámetro ranking']);
    exit;
}

$ranking = $conexion->real_escape_string($_GET['ranking']);

$sqlRango = "
    SELECT limite_inferior, limite_superior
    FROM RANKING
    WHERE ranking = '$ranking'
    LIMIT 1
";
$resRango = $conexion->query($sqlRango);

if (!$resRango || $resRango->num_rows === 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Rango no encontrado']);
    exit;
}

$rango = $resRango->fetch_assoc();
$min = $rango['limite_inferior'];
$max = $rango['limite_superior'];

$sql = "
    SELECT u.id_user, u.nombre, u.apellido, u.username, p.rankingPoints
    FROM USUARIO u
    INNER JOIN PUNTOS p ON u.id_user = p.id_user
    WHERE p.rankingPoints BETWEEN $min AND $max
    ORDER BY p.rankingPoints DESC
";

$result = $conexion->query($sql);

if ($result) {
    $estudiantes = [];
    while ($row = $result->fetch_assoc()) {
        $estudiantes[] = $row;
    }

    if (count($estudiantes) > 0) {
        echo json_encode(['exito' => true, 'estudiantes' => $estudiantes]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No hay estudiantes en este rango']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener los estudiantes: ' . $conexion->error]);
}

$conexion->close();
?>
