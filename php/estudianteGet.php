<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_user = $_GET["id_user"] ?? null;

if (!$id_user) {
    echo json_encode(["exito" => false, "mensaje" => "Falta el parámetro id_user"]);
    exit;
}

// Obtener los datos principales del estudiante
$sql = "
    SELECT 
        u.id_user,
        u.nombre,
        u.apellido,
        u.username,
        u.ci,
        u.telefono,
        u.correo,
        u.edad,
        u.grado, 
        COALESCE(p.saldo_actual, 0) AS saldo_actual,
        COALESCE(p.puntos_totales, 0) AS puntos_totales,
        COALESCE(p.puntos_gastados, 0) AS puntos_gastados,
        COALESCE(p.rankingPoints, 0) AS rankingPoints,
        COALESCE(AVG(c.nota), 0) AS promedio,
        'Activo' AS estado
    FROM USUARIO u
    INNER JOIN ROL_USUARIO ru ON u.id_user = ru.id_user
    LEFT JOIN PUNTOS p ON u.id_user = p.id_user
    LEFT JOIN CURSO_ESTUDIANTE c ON u.id_user = c.id_estudiante
    WHERE ru.id_rol = 3 AND u.id_user = ?
    GROUP BY u.id_user
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_user);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["exito" => false, "mensaje" => "Estudiante no encontrado"]);
    exit;
}

$est = $res->fetch_assoc();

// Buscar el rango actual según los puntos de ranking
$sqlRango = "
    SELECT ranking
    FROM RANKING
    WHERE ? BETWEEN limite_inferior AND limite_superior
    LIMIT 1
";

$stmtRango = $conexion->prepare($sqlRango);
$stmtRango->bind_param("d", $est["rankingPoints"]);
$stmtRango->execute();
$resRango = $stmtRango->get_result();

if ($resRango->num_rows > 0) {
    $rango = $resRango->fetch_assoc()["ranking"];
} else {
    $rango = "Sin rango";
}

$est["rango_actual"] = $rango;

echo json_encode([
    "exito" => true,
    "estudiante" => $est
]);

$conexion->close();
?>